<template>
  <div class="address-view">
    <h2 class="section-title">Alamat Saya</h2>

    <!-- Loading state -->
    <LoadComponent v-if="loading" />

    <!-- Empty state -->
    <div v-else-if="!hasAddresses && !loading" class="empty-state">
      <div class="empty-card">
        <i class="fas fa-map-marker-alt empty-icon"></i>
        <h3>Belum ada alamat tersimpan</h3>
        <p>Tambahkan alamat pengiriman untuk memudahkan proses checkout</p>
        <button @click="openAddressModal" class="add-btn">
          <i class="fas fa-plus"></i> Buat Alamat
        </button>
      </div>
    </div>

    <!-- Address list -->
    <div v-else class="address-grid">
      <div v-for="address in addresses" :key="address.id" class="address-card">
        <div class="address-label">
          <i :class="getLabelIcon(address.label)"></i>
          <span>{{ getLabelName(address.label) }}</span>
          <span v-if="address.isPrimary" class="primary-badge">Utama</span>
        </div>
        <div class="address-details">
          <p class="recipient">{{ address.name }}</p>
          <p class="phone">{{ address.phone }}</p>
          <p class="full-address">
            {{ address.address }}, {{ address.city }}, {{ address.province }}, {{ address.zip }}
          </p>
        </div>
        <div class="address-actions">
          <button @click="editAddress(address)" class="edit-btn">
            <i class="fas fa-pen"></i>
            <span>Edit</span>
          </button>
          <button
            v-if="!address.isPrimary"
            @click="setPrimaryAddress(address.id)"
            class="primary-btn"
          >
            <i class="fas fa-star"></i>
            <span>Jadikan Utama</span>
          </button>
          <button
            v-if="addresses.length > 1"
            @click="confirmDeleteAddress(address)"
            class="delete-btn"
          >
            <i class="fas fa-trash"></i>
            <span>Hapus</span>
          </button>
        </div>
      </div>

      <!-- Add Address Card -->
      <div class="address-card add-card" @click="openAddressModal">
        <div class="add-card-content">
          <i class="fas fa-plus-circle"></i>
          <p>Tambah Alamat Baru</p>
        </div>
      </div>
    </div>

    <!-- Floating action button (for mobile) -->
    <button @click="openAddressModal" class="floating-add-btn">
      <i class="fas fa-plus"></i>
    </button>

    <!-- Address Modal -->
    <div v-if="showAddressModal" class="modal-overlay" @click="closeAddressModal">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ isEditingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru' }}</h2>

        <form @submit.prevent="saveAddress" class="address-form">
          <!-- Name -->
          <div class="form-group">
            <label for="address-name">Nama Penerima</label>
            <input
              type="text"
              id="address-name"
              v-model="addressForm.name"
              required
              placeholder="Nama Penerima"
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="address-email">Email</label>
            <input
              type="email"
              id="address-email"
              v-model="addressForm.email"
              required
              placeholder="Email"
            />
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label for="address-phone">No. Telepon</label>
            <input
              type="text"
              id="address-phone"
              v-model="addressForm.phone"
              required
              placeholder="No. Telepon"
              maxlength="13"
              @input="validateAddressPhone"
              class="no-spinner"
            />
          </div>

          <!-- Label -->
          <div class="form-group">
            <label>Label Alamat</label>
            <div class="address-labels">
              <label
                v-for="option in addressLabelOptions"
                :key="option.value"
                :class="['label-option', { active: addressForm.label === option.value }]"
              >
                <input type="radio" :value="option.value" v-model="addressForm.label" hidden />
                <i :class="option.icon"></i>
                <span>{{ option.name }}</span>
              </label>
            </div>
          </div>

          <!-- Province -->
          <div class="form-group">
            <label for="address-province">Provinsi</label>
            <select
              id="address-province"
              v-model="addressForm.province"
              @change="loadCities(addressForm.province)"
              :disabled="isLoadingProvinces"
              required
            >
              <option value="">
                {{ isLoadingProvinces ? 'Loading provinsi...' : 'Pilih Provinsi' }}
              </option>
              <option
                v-for="province in provinces"
                :key="province.province_id"
                :value="province.province"
              >
                {{ province.province }}
              </option>
            </select>
          </div>

          <!-- City -->
          <div class="form-group">
            <label for="address-city">Kota/Kabupaten</label>
            <select
              id="address-city"
              v-model="addressForm.city"
              :disabled="!addressForm.province || isLoadingCities"
              required
            >
              <option value="">
                {{
                  isLoadingCities
                    ? 'Loading kota...'
                    : !addressForm.province
                      ? 'Pilih provinsi terlebih dahulu'
                      : 'Pilih Kota'
                }}
              </option>
              <option
                v-for="city in cities"
                :key="city.city_id"
                :value="`${city.type} ${city.city_name}`"
              >
                {{ city.type }} {{ city.city_name }}
              </option>
            </select>
          </div>

          <!-- Full Address -->
          <div class="form-group">
            <label for="address-full">Alamat Lengkap</label>
            <textarea
              id="address-full"
              v-model="addressForm.address"
              rows="3"
              required
              placeholder="Alamat Lengkap (Jalan, RT/RW, Kelurahan, Kecamatan)"
            ></textarea>
          </div>

          <!-- ZIP Code -->
          <div class="form-group">
            <label for="address-zip">Kode Pos</label>
            <input
              type="text"
              id="address-zip"
              v-model="addressForm.zip"
              required
              placeholder="Kode Pos"
              maxlength="5"
              inputmode="numeric"
              @input="validateZipCode"
            />
          </div>

          <!-- Primary Address Checkbox -->
          <div class="form-group checkbox-group">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="addressForm.isPrimary" />
              <span class="checkmark"></span>
              <span class="checkbox-text">Jadikan sebagai alamat utama</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeAddressModal">Batal</button>
            <button type="submit" class="submit-btn" :disabled="isSavingAddress">
              {{ isSavingAddress ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div
      v-if="showConfirmDeleteModal"
      class="modal-overlay"
      @click="showConfirmDeleteModal = false"
    >
      <div class="modal-content confirm-modal" @click.stop>
        <h2 class="modal-title">Hapus Alamat</h2>
        <p>Apakah Anda yakin ingin menghapus alamat ini?</p>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="showConfirmDeleteModal = false">
            Batal
          </button>
          <button type="button" class="delete-btn" @click="deleteAddress()" :disabled="isDeleting">
            {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAddressStore } from '@/stores/AddressStore'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import rajaOngkir from '@/api/RajaOngkir'
import LoadComponent from '@/components/LoadComponent.vue'

const addressStore = useAddressStore()
const authStore = useAuthStore()
const toast = useToast()

// States
const loading = ref(true)
const showAddressModal = ref(false)
const isEditingAddress = ref(false)
const isSavingAddress = ref(false)
const isDeleting = ref(false)
const provinces = ref([])
const cities = ref([])
const isLoadingProvinces = ref(false)
const isLoadingCities = ref(false)
const addressToDelete = ref(null)
const showConfirmDeleteModal = ref(false)

// Computed
const addresses = computed(() => addressStore.addresses)
const hasAddresses = computed(() => addresses.value && addresses.value.length > 0)

// Form data
const addressForm = ref({
  id: '',
  name: '',
  email: '',
  phone: '',
  label: 'home',
  province: '',
  city: '',
  address: '',
  zip: '',
  isPrimary: false,
})

// Address label options
const addressLabelOptions = [
  { value: 'home', name: 'Rumah', icon: 'fas fa-home' },
  { value: 'office', name: 'Kantor', icon: 'fas fa-building' },
  { value: 'school', name: 'Sekolah', icon: 'fas fa-school' },
  { value: 'apartment', name: 'Apartemen', icon: 'fas fa-city' },
  { value: 'other', name: 'Lainnya', icon: 'fas fa-map-marker-alt' },
]

// Get icon based on address label
const getLabelIcon = (label) => {
  const option = addressLabelOptions.find((opt) => opt.value === label)
  return option ? option.icon : 'fas fa-map-marker-alt'
}

// Get label name based on value
const getLabelName = (label) => {
  const option = addressLabelOptions.find((opt) => opt.value === label)
  return option ? option.name : 'Lainnya'
}

// Load data
onMounted(async () => {
  loading.value = true
  let timeoutId = null

  try {
    // Fetch user addresses
    await addressStore.fetchUserAddresses()
    await loadProvinces()

    // If we have addresses, hide loading immediately
    if (addressStore.addresses.length > 0) {
      loading.value = false
    } else {
      // If no addresses are found, show loading for 5 seconds
      // before displaying the empty state
      timeoutId = setTimeout(() => {
        loading.value = false
      }, 5000)
    }
  } catch (error) {
    console.error('Error loading addresses:', error)
    toast.error('Gagal memuat alamat')
    loading.value = false

    // Clear timeout if there was an error
    if (timeoutId) clearTimeout(timeoutId)
  }
})

// Address Modal Functions
const openAddressModal = () => {
  isEditingAddress.value = false
  addressForm.value = {
    name: authStore.currentUser?.name || '',
    email: authStore.currentUser?.email || '',
    phone: authStore.currentUser?.phone || '',
    label: 'home',
    province: '',
    city: '',
    address: '',
    zip: '',
    isPrimary: !hasAddresses.value, // Make primary if first address
  }
  showAddressModal.value = true
}

const closeAddressModal = () => {
  showAddressModal.value = false
}

const editAddress = (address) => {
  isEditingAddress.value = true
  addressForm.value = { ...address }
  showAddressModal.value = true

  // Load cities for the selected province
  if (address.province) {
    loadCities(address.province)
  }
}

const saveAddress = async () => {
  try {
    isSavingAddress.value = true

    const addressData = { ...addressForm.value }

    // Validate phone
    if (!/^(62|0)\d{9,12}$/.test(addressData.phone)) {
      toast.error('Format nomor telepon tidak valid')
      return
    }

    // Validate zip code
    if (!/^\d{5}$/.test(addressData.zip)) {
      toast.error('Kode pos harus 5 digit')
      return
    }

    let result

    if (isEditingAddress.value) {
      result = await addressStore.updateAddress(addressForm.value.id, addressData)
    } else {
      result = await addressStore.addAddress(addressData)
    }

    if (result.success) {
      closeAddressModal()
      toast.success(
        isEditingAddress.value ? 'Alamat berhasil diperbarui' : 'Alamat berhasil ditambahkan',
      )
    }
  } catch (error) {
    console.error('Error saving address:', error)
    toast.error('Gagal menyimpan alamat')
  } finally {
    isSavingAddress.value = false
  }
}

// Load provinces and cities
const loadProvinces = async () => {
  try {
    isLoadingProvinces.value = true
    provinces.value = await rajaOngkir.getProvinces()
  } catch (error) {
    console.error('Error loading provinces:', error)
    toast.error('Gagal memuat daftar provinsi')
  } finally {
    isLoadingProvinces.value = false
  }
}

const loadCities = async (provinceName) => {
  if (!provinceName) return

  try {
    isLoadingCities.value = true
    const province = provinces.value.find((p) => p.province === provinceName)

    if (province) {
      cities.value = await rajaOngkir.getCities(province.province_id)
    }
  } catch (error) {
    console.error('Error loading cities:', error)
    toast.error('Gagal memuat data kota')
  } finally {
    isLoadingCities.value = false
  }
}

// Set primary address
// const setPrimaryAddress = async (addressId) => {
//   try {
//     const address = addresses.value.find((addr) => addr.id === addressId)
//     if (address) {
//       const result = await addressStore.updateAddress(addressId, {
//         ...address,
//         isPrimary: true,
//       })
//     }
//   } catch (error) {
//     console.error('Error setting primary address:', error)
//     toast.error('Gagal mengatur alamat utama')
//   }
// }

// Delete address functions
const confirmDeleteAddress = (address) => {
  addressToDelete.value = address
  showConfirmDeleteModal.value = true
}

const deleteAddress = async () => {
  if (!addressToDelete.value) return

  try {
    isDeleting.value = true
    const result = await addressStore.deleteAddress(addressToDelete.value.id)

    if (result.success) {
      toast.success('Alamat berhasil dihapus')
      showConfirmDeleteModal.value = false
    }
  } catch (error) {
    console.error('Error deleting address:', error)
    toast.error('Gagal menghapus alamat')
  } finally {
    isDeleting.value = false
  }
}

// Form validation
const validateAddressPhone = (event) => {
  // Allow only digits
  addressForm.value.phone = event.target.value.replace(/\D/g, '')
}

const validateZipCode = (event) => {
  // Allow only digits
  addressForm.value.zip = event.target.value.replace(/\D/g, '')
}
</script>

<style scoped>
.address-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  min-height: 400px;
}

.section-title {
  margin: 0 0 1.5rem;
  color: #02163b;
  font-weight: 600;
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* Empty state styling */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.empty-card {
  background-color: #f9f9f9;
  border: 1px dashed #ddd;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 450px;
  width: 100%;
}

.empty-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-card h3 {
  margin: 0 0 0.5rem;
  color: #02163b;
  font-size: 1.25rem;
}

.empty-card p {
  margin-bottom: 1.5rem;
  color: #666;
}

.add-btn {
  background-color: #e8ba38;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.add-btn:hover {
  background-color: #d5a832;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Address grid styling */
.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.address-card {
  position: relative;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.address-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-color: #e8ba38;
}

.address-label {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #02163b;
}

.address-label i {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f8ff;
  border-radius: 50%;
  margin-right: 0.5rem;
  color: #0066cc;
}

.primary-badge {
  background-color: #e8ba38;
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  margin-left: auto;
}

.address-details {
  flex-grow: 1;
}

.recipient {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.phone {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.full-address {
  line-height: 1.6;
  color: #444;
  border-left: 2px solid rgba(232, 186, 56, 0.3);
  padding-left: 0.5rem;
  margin-bottom: 1.25rem;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.edit-btn,
.primary-btn,
.delete-btn {
  font-family: 'Montserrat', sans-serif;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  transition: all 0.2s;
  flex: 1;
  min-width: 80px;
}

.edit-btn {
  background-color: #f0f8ff;
  color: #0066cc;
}

.primary-btn {
  background-color: #fff8e0;
  color: #e8ba38;
}

.delete-btn {
  background-color: #fff0f0;
  color: #dc3545;
}

.edit-btn:hover,
.primary-btn:hover,
.delete-btn:hover {
  filter: brightness(0.95);
}

/* Add card styling */
.add-card {
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f9f9f9;
  min-height: 180px;
}

.add-card:hover {
  border-color: #e8ba38;
  background-color: #fffbf0;
}

.add-card-content {
  text-align: center;
  color: #888;
}

.add-card-content i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  color: #ccc;
}

.add-card:hover .add-card-content i {
  color: #e8ba38;
}

/* Floating add button for mobile */
.floating-add-btn {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #e8ba38;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(232, 186, 56, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 100;
  display: none;
}

.floating-add-btn:hover {
  background-color: #d5a832;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(232, 186, 56, 0.5);
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  color: #02163b;
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

/* Address form styling */
.address-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #02163b;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #e8ba38;
  outline: none;
  box-shadow: 0 0 0 2px rgba(232, 186, 56, 0.2);
}

.address-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.label-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 100px;
  justify-content: center;
}

.label-option.active {
  border-color: #e8ba38;
  background-color: rgba(232, 186, 56, 0.1);
  color: #e8ba38;
  font-weight: 500;
}

/* Checkbox styling */
.checkbox-group {
  margin-top: 0.5rem;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.custom-checkbox:hover input ~ .checkmark {
  border-color: #ccc;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #e8ba38;
  border-color: #e8ba38;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.custom-checkbox .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-weight: normal;
  margin-left: 0.5rem;
}

/* Modal buttons */
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.submit-btn,
.delete-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.submit-btn {
  background-color: #e8ba38;
  color: white;
  border: none;
}

.cancel-btn:hover {
  background-color: #eee;
}

.submit-btn:hover {
  background-color: #d5a832;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
}

.delete-btn:hover {
  background-color: #c82333;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirm-modal {
  max-width: 400px;
  text-align: center;
}

.confirm-modal p {
  margin: 1rem 0 1.5rem;
  color: #555;
}

/* Responsive styling */
@media (max-width: 768px) {
  .address-grid {
    grid-template-columns: 1fr;
  }

  .floating-add-btn {
    display: flex;
  }

  .add-card {
    display: none;
  }

  .address-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .address-labels {
    flex-direction: column;
  }

  .label-option {
    justify-content: flex-start;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .address-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .address-view {
    padding: 0;
  }
}

.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
