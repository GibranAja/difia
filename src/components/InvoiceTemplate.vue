<script setup>
defineProps({
  order: {
    type: Object,
    required: true,
  },
})

// Format currency to IDR - with NaN check
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date with null check
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="invoice-container">
    <!-- Header -->
    <header class="invoice-header">
      <div class="logo-container">
        <img src="../assets/Logo Difia Haki.png" alt="Difia Logo" class="logo" />
      </div>
      <div class="company-details">
        <h1>INVOICE</h1>
        <p>Difia Company</p>
        <p>Bogor, Indonesia</p>
        <p>Instagram : @difiasouvenir</p>
      </div>
    </header>

    <!-- Invoice Info -->
    <div class="invoice-info">
      <div class="invoice-to">
        <div class="invoice-to-header">
          <h3>Invoice To:</h3>
          <span v-if="order?.shippingDetails" class="customer-name">
            {{ order.shippingDetails.name }}
          </span>
        </div>
        <div v-if="order?.shippingDetails" class="shipping-details">
          <p>{{ order.shippingDetails.email }}</p>
          <p>{{ order.shippingDetails.phone }}</p>
          <p>{{ order.shippingDetails.address }}</p>
          <p>
            {{ order.shippingDetails.city }}, {{ order.shippingDetails.province }}
            {{ order.shippingDetails.zip }}
          </p>
        </div>
      </div>
      <div class="invoice-details">
        <div class="detail-row">
          <span>Invoice Date:</span>
          <span>{{ formatDate(order?.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <span>Order ID:</span>
          <span class="order-id">#{{ order?.id }}</span>
        </div>
        <div class="detail-row">
          <span>Status:</span>
          <span class="status" :class="order?.status">{{ order?.status }}</span>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="order-items">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Details</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="order">
            <td class="product-name">{{ order.productName }}</td>
            <td>
              <div class="item-details">
                <p>Type: {{ order.customOptions?.purchaseType }}</p>
                <p>Price Type: {{ order.customOptions?.priceType }}</p>
                <p>Outer Material: {{ order.customOptions?.bahanLuar }}</p>
                <p>Inner Material: {{ order.customOptions?.bahanDalam }}</p>
                <p>Accessories: {{ order.customOptions?.aksesoris?.join(', ') }}</p>
                <p v-if="order.customOptions?.note" class="item-note">
                  Note: {{ order.customOptions.note }}
                </p>
              </div>
            </td>
            <td class="text-center">{{ order.quantity }}</td>
            <td class="text-right">{{ formatCurrency(order.price) }}</td>
            <td class="text-right">{{ formatCurrency(order.price * order.quantity) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <div class="invoice-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>{{ formatCurrency(order?.price * order?.quantity) }}</span>
      </div>
      <div class="summary-row">
        <span>Shipping Cost:</span>
        <span>{{ formatCurrency(order?.shippingCost) }}</span>
      </div>
      <div class="summary-row discount" v-if="order?.discountAmount">
        <span>Discount:</span>
        <span>-{{ formatCurrency(order.discountAmount) }}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>{{ formatCurrency(order?.totalAmount) }}</span>
      </div>
    </div>

    <!-- Footer -->
    <footer class="invoice-footer">
      <p class="thank-you">Thank you for your business!</p>
      <div class="payment-proof" v-if="order?.paymentProof">
        <h4>Payment Proof</h4>
        <img :src="order.paymentProof" alt="Payment Proof" class="payment-image" />
      </div>
    </footer>
  </div>
</template>

<style scoped>
.invoice-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 3rem;
  background: white;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  color: #2c3e50;
  font-family: 'Montserrat', system-ui, sans-serif;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.logo-container {
  flex: 0 0 200px;
}

.logo {
  max-width: 180px;
  height: auto;
  object-fit: contain;
}

.company-details {
  text-align: right;
}

.company-details h1 {
  color: #02163b;
  margin: 0 0 1.25rem;
  font-size: 2.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.company-details p {
  margin: 0.35rem 0;
  color: #4a5568;
  font-size: 0.95rem;
}

.invoice-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3.5rem;
  gap: 3rem;
}

.invoice-to,
.invoice-details {
  flex: 1;
}

.invoice-to-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.invoice-to h3 {
  color: #02163b;
  font-size: 1.25rem;
  margin: 0; /* Remove margin bottom */
}

.shipping-details p {
  margin: 0.5rem 0;
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.5;
}

.customer-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #02163b;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.status {
  padding: 0.35rem 1rem;
  border-radius: 6px;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 0.9rem;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.completed {
  background: #d4edda;
  color: #155724;
}

.order-items {
  margin-bottom: 3.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1.25rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #02163b;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.item-details p {
  margin: 0.5rem 0;
  color: #4a5568;
  line-height: 1.5;
}

.item-note {
  margin-top: 0.75rem;
  color: #666;
  font-style: italic;
}

.invoice-summary {
  margin-left: auto;
  width: 350px;
  margin-bottom: 3.5rem;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
}

.summary-row.discount {
  color: #e53e3e;
}

.summary-row.total {
  border-top: 2px solid #02163b;
  border-bottom: none;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  color: #02163b;
}

.invoice-footer {
  text-align: center;
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 2px solid #f0f0f0;
}

.thank-you {
  font-size: 1.1rem;
  color: #02163b;
  font-weight: 500;
}

.payment-proof {
  margin-top: 2.5rem;
}

.payment-proof h4 {
  color: #02163b;
  margin-bottom: 1rem;
}

.payment-image {
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media print {
  .invoice-container {
    box-shadow: none;
    margin: 0;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .invoice-container {
    padding: 1.5rem;
    margin: 1rem;
  }

  .invoice-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .company-details {
    text-align: center;
    margin-top: 1.5rem;
  }

  .invoice-info {
    flex-direction: column;
    gap: 2rem;
  }

  .invoice-summary {
    width: 100%;
  }

  th,
  td {
    padding: 1rem 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
