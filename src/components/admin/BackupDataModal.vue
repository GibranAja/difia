<!-- src/components/admin/BackupDataModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Backup Data</h2>
      <p class="modal-subtitle">Pilih data yang ingin di-backup:</p>

      <div class="backup-options">
        <div 
          v-for="option in backupOptions" 
          :key="option.value" 
          class="backup-option"
        >
          <input 
            type="checkbox" 
            :id="option.value" 
            v-model="selectedOptions"
            :value="option.value"
          />
          <label :for="option.value">
            <span class="option-icon"><i :class="option.icon"></i></span>
            <span class="option-details">
              <span class="option-title">{{ option.title }}</span>
              <span class="option-description">{{ option.description }}</span>
            </span>
          </label>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="cancel-btn" @click="$emit('close')">
          Batal
        </button>
        <button 
          type="button" 
          class="backup-btn" 
          :disabled="isLoading || !selectedOptions.length"
          @click="startBackup"
        >
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i> Sedang Memproses...
          </span>
          <span v-else>
            <i class="fas fa-download"></i> Download Backup
          </span>
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBackupData } from '@/composables/useBackupData';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['close', 'backup-complete']);
const toast = useToast();
const { isLoading, error, backupSelectedData } = useBackupData();
const selectedOptions = ref([]);

// Available backup options
const backupOptions = [
  {
    title: 'Katalog',
    value: 'katalog',
    icon: 'fas fa-th',
    description: 'Data produk, harga, dan detail'
  },
  {
    title: 'Pesanan',
    value: 'orders',
    icon: 'fas fa-shopping-cart',
    description: 'Data pesanan pelanggan'
  },
  {
    title: 'Artikel Blog',
    value: 'blogs',
    icon: 'fas fa-newspaper',
    description: 'Konten artikel dan blog'
  },
  {
    title: 'Partner',
    value: 'partners',
    icon: 'fas fa-handshake',
    description: 'Data mitra bisnis'
  },
  {
    title: 'Staff',
    value: 'staff',
    icon: 'fas fa-users',
    description: 'Data pengguna admin dan staff'
  },
  {
    title: 'Voucher',
    value: 'vouchers',
    icon: 'fas fa-tags',
    description: 'Data voucher dan diskon'
  }
];

// Start the backup process
const startBackup = async () => {
  if (!selectedOptions.value.length) {
    toast.warning('Pilih minimal satu jenis data untuk di-backup');
    return;
  }

  try {
    const result = await backupSelectedData(selectedOptions.value);
    
    if (result) {
      toast.success('Backup berhasil diunduh');
      emit('backup-complete');
      emit('close');
    } else {
      toast.error('Gagal melakukan backup: ' + error.value);
    }
  } catch (err) {
    toast.error('Error: ' + err.message);
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-subtitle {
  color: #666;
  margin-bottom: 20px;
}

.backup-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.backup-option {
  display: flex;
  align-items: center;
}

.backup-option input[type="checkbox"] {
  display: none;
}

.backup-option label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.backup-option input[type="checkbox"]:checked + label {
  border-color: #02163b;
  background-color: rgba(2, 22, 59, 0.05);
}

.option-icon {
  background-color: #f8f9fa;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #02163b;
}

.option-details {
  display: flex;
  flex-direction: column;
}

.option-title {
  font-weight: 500;
  font-size: 16px;
}

.option-description {
  font-size: 13px;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn, .backup-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #333;
}

.backup-btn {
  background-color: #02163b;
  color: white;
}

.backup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
}
</style>