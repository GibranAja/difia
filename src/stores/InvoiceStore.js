import { defineStore } from 'pinia'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import html2pdf from 'html2pdf.js'
import InvoiceTemplate from '@/components/InvoiceTemplate.vue'
import { createApp, h } from 'vue'

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    currentOrder: null,
  }),

  actions: {
    async generateInvoicePDF(order) {
      try {
        // Create a new div to mount the invoice template
        const container = document.createElement('div')
        document.body.appendChild(container)

        // Create and mount the invoice component
        const app = createApp({
          render() {
            return h(InvoiceTemplate, { order })
          },
        })

        app.mount(container)

        // Wait for next tick to ensure component is rendered
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Generate PDF
        const element = container.firstElementChild
        if (!element) {
          throw new Error('Invoice template element not found')
        }

        const options = {
          margin: 1,
          filename: `invoice-${order.id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        }

        await html2pdf().set(options).from(element).save()

        // Cleanup
        app.unmount()
        document.body.removeChild(container)

        return { success: true }
      } catch (error) {
        console.error('Failed to generate PDF:', error)
        return { success: false, error: error.message }
      }
    },

    async downloadInvoice(orderId) {
      try {
        // Fetch order data
        const orderDoc = await getDoc(doc(db, 'orders', orderId))
        if (!orderDoc.exists()) {
          throw new Error('Order not found')
        }

        const orderData = {
          id: orderDoc.id,
          ...orderDoc.data(),
        }

        // Generate and download PDF
        const result = await this.generateInvoicePDF(orderData)
        if (!result.success) {
          throw new Error(result.error)
        }

        return { success: true }
      } catch (error) {
        console.error('Failed to download invoice:', error)
        return { success: false, error: error.message }
      }
    },
  },
})
