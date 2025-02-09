<template>
    <Teleport to="body">
      <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          <div class="modal-actions">
            <button @click="$emit('close')" class="cancel-btn">
              {{ cancelText }}
            </button>
            <button 
              @click="$emit('confirm')" 
              class="confirm-btn"
              :disabled="loading"
            >
              {{ loading ? loadingText : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  defineProps({
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Ya'
    },
    cancelText: {
      type: String,
      default: 'Tidak' 
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Memproses...'
    }
  })
  
  defineEmits(['close', 'confirm'])
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
  }
  
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: modalFadeIn 0.3s ease;
  }
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .modal-content {
      width: 85%;
      padding: 1.5rem;
      margin: 0 1rem;
    }
  }
  
  .modal-content h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-family: 'Montserrat', sans-serif;
  }
  
  .modal-content p {
    color: #666;
    margin-bottom: 1.5rem;
    font-family: 'Montserrat', sans-serif;
  }
  
  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .modal-actions button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Montserrat', sans-serif;
  }
  
  .modal-actions button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .cancel-btn {
    background-color: #e0e0e0;
    color: #666;
  }
  
  .confirm-btn {
    background-color: #f44336;
    color: white;
  }
  
  .cancel-btn:hover:not(:disabled) {
    background-color: #d5d5d5;
  }
  
  .confirm-btn:hover:not(:disabled) {
    background-color: #d32f2f;
  }
  </style>