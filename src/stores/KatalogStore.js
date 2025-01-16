import { defineStore } from 'pinia'
import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from 'firebase/firestore'

export const useKatalogStore = defineStore('katalog', {
  state: () => ({
    katalogItems: [],
    loading: false,
    error: null,
    lastDoc: null,
    hasMore: true,
  }),

  actions: {
    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    },

    async convertFilesToBase64(files) {
      const promises = files.map((file) => this.fileToBase64(file))
      return Promise.all(promises)
    },

    async addKatalog(katalogData) {
      try {
        this.loading = true

        if (!katalogData.images || katalogData.images.length === 0) {
          throw new Error('At least one image is required')
        }

        const base64Images = await this.convertFilesToBase64(katalogData.images)

        const newKatalog = {
          nomor: Date.now().toString(),
          nama: katalogData.nama,
          harga: {
            standar: Number(katalogData.harga.standar),
            premium: Number(katalogData.harga.premium),
            budgetting: 'By Request'
          },
          detail: {
            ukuran: {
              panjang: katalogData.detail.ukuran.panjang,
              tinggi: katalogData.detail.ukuran.tinggi,
              lebar: katalogData.detail.ukuran.lebar
            },
            bahanLuar: katalogData.detail.bahanLuar,
            bahanDalam: katalogData.detail.bahanDalam,
            aksesoris: katalogData.detail.aksesoris,
            warna: katalogData.detail.warna
          },
          waktuPengerjaan: Number(katalogData.waktuPengerjaan || 1),
          images: base64Images,
          createdAt: new Date(),
        }

        const docRef = await addDoc(collection(db, 'katalog'), newKatalog)

        this.katalogItems.unshift({ id: docRef.id, ...newKatalog })

        return { success: true, id: docRef.id }
      } catch (error) {
        console.error('Error in addKatalog:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updateKatalog(id, updateData) {
      try {
        this.loading = true

        let finalImages = updateData.existingImages || []

        if (updateData.images && updateData.images.length > 0) {
          const newBase64Images = await this.convertFilesToBase64(updateData.images)
          finalImages = [...finalImages, ...newBase64Images]
        }

        const katalogRef = doc(db, 'katalog', id)
        const updatePayload = {
          nama: updateData.nama,
          harga: {
            standar: Number(updateData.harga.standar),
            premium: Number(updateData.harga.premium),
            budgetting: 'By Request'
          },
          detail: {
            ukuran: {
              panjang: updateData.detail.ukuran.panjang,
              tinggi: updateData.detail.ukuran.tinggi,
              lebar: updateData.detail.ukuran.lebar
            },
            bahanLuar: updateData.detail.bahanLuar,
            bahanDalam: updateData.detail.bahanDalam,
            aksesoris: updateData.detail.aksesoris,
            warna: updateData.detail.warna
          },
          waktuPengerjaan: Number(updateData.waktuPengerjaan || 1),
          updatedAt: new Date(),
        }

        if (finalImages.length > 0) {
          updatePayload.images = finalImages
        }

        await updateDoc(katalogRef, updatePayload)

        const index = this.katalogItems.findIndex((item) => item.id === id)
        if (index !== -1) {
          this.katalogItems[index] = {
            ...this.katalogItems[index],
            ...updatePayload,
            images: finalImages.length > 0 ? finalImages : this.katalogItems[index].images,
          }
        }

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Rest of the store remains unchanged
    async fetchKatalog(pageSize = 10) {
      try {
        this.loading = true

        const q = query(
          collection(db, 'katalog'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        )

        const querySnapshot = await getDocs(q)

        this.katalogItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        this.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        this.hasMore = querySnapshot.docs.length === pageSize

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async loadMore(pageSize = 10) {
      if (!this.hasMore || !this.lastDoc) return

      try {
        this.loading = true

        const q = query(
          collection(db, 'katalog'),
          orderBy('createdAt', 'desc'),
          startAfter(this.lastDoc),
          limit(pageSize)
        )

        const querySnapshot = await getDocs(q)

        const newItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        this.katalogItems.push(...newItems)
        this.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        this.hasMore = querySnapshot.docs.length === pageSize

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async deleteKatalog(id) {
      try {
        this.loading = true

        this.katalogItems = this.katalogItems.filter((item) => item.id !== id)

        await deleteDoc(doc(db, 'katalog', id))

        return { success: true }
      } catch (error) {
        await this.fetchKatalog()
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async searchKatalog(searchTerm) {
      try {
        this.loading = true

        const q = query(
          collection(db, 'katalog'),
          where('nama', '>=', searchTerm),
          where('nama', '<=', searchTerm + '\uf8ff'),
          limit(10)
        )

        const querySnapshot = await getDocs(q)

        this.katalogItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    clearStore() {
      this.katalogItems = []
      this.loading = false
      this.error = null
      this.lastDoc = null
      this.hasMore = true
    },
  },
})