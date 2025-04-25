<template>
  <Transition name="modal">
    <div v-if="show" class="image-modal-overlay" @click="$emit('close')">
      <div class="image-modal-container" @click.stop>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
        <div class="image-container">
          <img :src="imageSrc" :alt="altText || 'Preview'" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  imageSrc: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    default: 'Image preview',
  },
})

defineEmits(['close'])
</script>

<style scoped>
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.image-modal-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -15px;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  max-height: 90vh;
  max-width: 90vw;
}

.image-container img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

/* Animation */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>