<template>
  <div class="create-voucher-container" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <h1>{{ isEditing ? 'Edit Voucher' : 'Tambah Voucher Baru' }}</h1>

    <form @submit.prevent="handleSubmit" class="voucher-form">
      <div class="form-group">
        <label for="code">Kode Voucher</label>
        <input
          type="text"
          id="code"
          v-model="formData.code"
          required
          placeholder="Contoh: SUMMER2023"
          :disabled="isCodeDisabled"
          class="form-input"
        />
        <span class="error-message" v-if="errors.code">{{ errors.code }}</span>
      </div>

      <div class="form-group">
        <label>Tipe Diskon</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              v-model="formData.discountType"
              value="percentage"
              name="discountType"
            />
            <span>Persentase (%)</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="formData.discountType"
              value="fixed"
              name="discountType"
            />
            <span>Nominal (Rp)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="discountValue">Nilai Diskon</label>
        <div class="input-group">
          <input
            type="number"
            id="discountValue"
            v-model="formData.discountValue"
            required
            :min="0"
            :max="formData.discountType === 'percentage' ? 100 : null"
            class="form-input"
          />
          <span class="input-suffix">{{ formData.discountType === 'percentage' ? '%' : 'Rp' }}</span>
        </div>
        <span class="error-message" v-if="errors.discountValue">{{ errors.discountValue }}</span>
      </div>

      <div class="form-group">
        <label for="validUntil">Berlaku Sampai</label>
        <input
          type="date"
          id="validUntil"
          v-model="formData.validUntil"
          required
          :min="minDate"
          class="form-input"
        />
        <span class="error-message" v-if="errors.validUntil">{{ errors.validUntil }}</span>
      </div>

      <div class="form-group">
        <label for="maxUses">Maksimal Penggunaan</label>
        <input
          type="number"
          id="maxUses"
          v-model="formData.maxUses"
          required
          min="1"
          class="form-input"
        />
        <span class="error-message" v-if="errors.maxUses">{{ errors.maxUses }}</span>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">
           Batal
        </button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Voucher' : 'Tambah Voucher' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useToast } from 'vue-toastification'

// Add props definition
defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true
  }
})

// Add minDate computed property
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const router = useRouter()
const route = useRoute()
const voucherStore = useVoucherStore()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const isSubmitting = ref(false)
const errors = ref({})

const formData = ref({
  code: '',
  discountType: 'percentage',
  discountValue: '',
  validUntil: '',
  maxUses: 100
})

// Add this computed for disabling code field when editing
const isCodeDisabled = computed(() => isEditing.value)

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.code.trim()) {
    errors.value.code = 'Kode voucher harus diisi'
    isValid = false
  }

  if (!formData.value.discountValue || formData.value.discountValue <= 0) {
    errors.value.discountValue = 'Nilai diskon harus lebih dari 0'
    isValid = false
  }

  if (formData.value.discountType === 'percentage' && formData.value.discountValue > 100) {
    errors.value.discountValue = 'Persentase diskon tidak boleh lebih dari 100%'
    isValid = false
  }

  if (!formData.value.validUntil) {
    errors.value.validUntil = 'Tanggal berlaku harus diisi'
    isValid = false
  }

  if (!formData.value.maxUses || formData.value.maxUses < 1) {
    errors.value.maxUses = 'Maksimal penggunaan harus minimal 1'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    let result

    if (isEditing.value) {
      result = await voucherStore.updateVoucher(route.params.id, formData.value)
    } else {
      result = await voucherStore.addVoucher(formData.value)
    }
    
    if (result.success) {
      toast.success(isEditing.value ? 'Voucher berhasil diperbarui' : 'Voucher berhasil ditambahkan')
      router.push('/admin/voucher')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    toast.error('Gagal menyimpan voucher: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

const loadVoucherData = () => {
  const voucher = voucherStore.voucherItems.find(v => v.id === route.params.id)
  if (voucher) {
    formData.value = {
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      validUntil: new Date(voucher.validUntil).toISOString().split('T')[0],
      maxUses: voucher.maxUses
    }
  }
}

onMounted(() => {
  if (isEditing.value) {
    loadVoucherData()
  }
})

const goBack = () => {
  router.push('/admin/voucher')
}
</script>

<style scoped>
.create-voucher-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  transition: margin-left 0.3s;
}

.create-voucher-container h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.voucher-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #02163b;
  outline: none;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 10px;
  color: #666;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.submit-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.submit-btn {
  background-color: #02163b;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .create-voucher-container {
    padding: 15px;
  }

  .voucher-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>