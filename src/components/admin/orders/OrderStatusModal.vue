<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Update Status Pesanan</h3>
          <button class="close-modal" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body">
          <div class="order-info">
            <div class="info-item">
              <span class="label">Order ID:</span>
              <span class="value">{{ order?.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status Saat Ini:</span>
              <span class="value status-badge" :class="order?.status">
                {{ getStatusLabel(order?.status) }}
              </span>
            </div>
          </div>

          <!-- Only show status buttons for pending and process statuses -->
          <div v-if="['pending', 'process'].includes(order?.status)" class="status-buttons">
            <button
              v-for="status in getAvailableStatusesForCurrentStatus(order?.status)"
              :key="status"
              :class="['status-action-btn', status]"
              @click="$emit('status-selected', status)"
            >
              <i :class="getStatusIcon(status)"></i>
              {{ getStatusLabel(status) }}
            </button>
          </div>
          <!-- Message for delivery status -->
          <div v-else-if="order?.status === 'delivery'" class="delivery-message">
            <i class="fas fa-info-circle"></i>
            <p>Pesanan sedang dalam pengiriman. Menunggu konfirmasi penerimaan dari pelanggan.</p>
          </div>

          <div v-if="selectedStatus === 'cancelled'" class="cancellation-form">
            <label for="cancelReason">Alasan Pembatalan:</label>
            <textarea
              id="cancelReason"
              :value="cancelReason"
              @input="$emit('update:cancelReason', $event.target.value)"
              rows="3"
              placeholder="Berikan alasan pembatalan pesanan..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')">Tutup</button>
          <button
            v-if="selectedStatus && ['pending', 'process'].includes(order?.status)"
            class="btn-primary"
            :class="selectedStatus"
            @click="$emit('update-status')"
            :disabled="selectedStatus === 'cancelled' && !cancelReason"
          >
            Konfirmasi {{ getStatusLabel(selectedStatus) }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Object,
    default: null,
  },
  selectedStatus: {
    type: String,
    default: '',
  },
  cancelReason: {
    type: String,
    default: '',
  },
})

defineEmits(['close', 'status-selected', 'update-status', 'update:cancelReason'])

// Determine available statuses based on current order status
const getAvailableStatusesForCurrentStatus = (currentStatus) => {
  switch (currentStatus) {
    case 'pending':
      return ['process', 'cancelled']
    case 'process':
      return ['delivery', 'cancelled']
    default:
      return []
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Menunggu Konfirmasi',
    process: 'Proses Pesanan',
    delivery: 'Kirim Pesanan',
    complete: 'Pesanan Selesai',
    cancelled: 'Batalkan Pesanan',
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    process: 'fas fa-cog',
    delivery: 'fas fa-truck',
    complete: 'fas fa-check-circle',
    cancelled: 'fas fa-times-circle',
  }
  return icons[status] || 'fas fa-circle'
}
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
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  color: #1f2937;
  margin: 0;
  font-size: 1.25rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 1.5rem;
}

.order-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-item .label {
  color: #6b7280;
}

.status-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.status-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.status-action-btn.process {
  background: #3b82f6;
  color: white;
}

.status-action-btn.delivery {
  background: #10b981;
  color: white;
}

.status-action-btn.cancelled {
  background: #ef4444;
  color: white;
}

.delivery-message {
  background: #e0f2fe;
  border-radius: 8px;
  padding: 1rem;
  color: #0369a1;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.delivery-message i {
  margin-top: 3px;
}

.cancellation-form {
  margin-top: 1rem;
}

.cancellation-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
}

.cancellation-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #9ca3af;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: white;
}

.btn-primary.process {
  background: #3b82f6;
}

.btn-primary.delivery {
  background: #10b981;
}

.btn-primary.cancelled {
  background: #ef4444;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status badge styles */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.process {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.delivery {
  background-color: #e9d5ff;
  color: #6b21a8;
}

.status-badge.complete {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #842029;
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
