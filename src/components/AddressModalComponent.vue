<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">{{ isEditing ? 'Edit Alamat' : 'Tambah Alamat Baru' }}</h2>

      <form @submit.prevent="handleSave" class="address-form">
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
          <label class="custom-checkbox" :class="{ disabled: isFirstAddress }">
            <input type="checkbox" v-model="addressForm.isPrimary" :disabled="isFirstAddress" />
            <span class="checkmark"></span>
            <span class="checkbox-text">Jadikan sebagai alamat utama</span>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="closeModal">Batal</button>
          <button type="submit" class="submit-btn" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import rajaOngkir from '@/api/RajaOngkir'

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  isFirstAddress: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'error'])

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
  isPrimary: props.isFirstAddress,
})

// Address label options
const addressLabelOptions = [
  { value: 'home', name: 'Rumah', icon: 'fas fa-home' },
  { value: 'office', name: 'Kantor', icon: 'fas fa-building' },
  { value: 'school', name: 'Sekolah', icon: 'fas fa-school' },
  { value: 'apartment', name: 'Apartemen', icon: 'fas fa-city' },
  { value: 'other', name: 'Lainnya', icon: 'fas fa-map-marker-alt' },
]

// States
const provinces = ref([])
const cities = ref([])
const isLoadingProvinces = ref(false)
const isLoadingCities = ref(false)
const isSaving = ref(false)

// Watch for changes to initialData
watch(() => props.initialData, (newValue) => {
  if (newValue && Object.keys(newValue).length > 0) {
    addressForm.value = { ...newValue }
  }
}, { immediate: true, deep: true })

// Load provinces
const loadProvinces = async () => {
  try {
    isLoadingProvinces.value = true
    provinces.value = await rajaOngkir.getProvinces()
  } catch (error) {
    console.error('Error loading provinces:', error)
    emit('error', 'Gagal memuat daftar provinsi')
  } finally {
    isLoadingProvinces.value = false
  }
}

// Load cities based on selected province
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
    emit('error', 'Gagal memuat data kota')
  } finally {
    isLoadingCities.value = false
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

const handleSave = async () => {
  try {
    isSaving.value = true

    // Validate phone
    if (!/^(62|0)\d{9,12}$/.test(addressForm.value.phone)) {
      emit('error', 'Format nomor telepon tidak valid')
      return
    }

    // Validate zip code
    if (!/^\d{5}$/.test(addressForm.value.zip)) {
      emit('error', 'Kode pos harus 5 digit')
      return
    }

    emit('save', { ...addressForm.value })
  } catch (error) {
    console.error('Error saving address:', error)
    emit('error', 'Gagal menyimpan alamat')
  } finally {
    isSaving.value = false
  }
}

const closeModal = () => {
  emit('close')
}

onMounted(async () => {
  await loadProvinces()
  
  if (props.isEditing && addressForm.value.province) {
    await loadCities(addressForm.value.province)
  }
})
</script>

<style scoped>
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
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
  user-select: none;
  cursor: pointer;
  font-weight: normal;
}

.custom-checkbox.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  cursor: pointer;
  margin-right: 8px;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #e8ba38;
  border-color: #e8ba38;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
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
.submit-btn {
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

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive styling */
@media (max-width: 768px) {
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

.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>