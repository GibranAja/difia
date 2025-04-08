<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="image-preview-content" @click.stop>
        <img :src="imageSrc" :alt="altText" />
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  imageSrc: {
    type: String,
    required: true
  },
  altText: {
    type: String,
    default: 'Image preview'
  }
});

defineEmits(['close']);
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

.image-preview-content {
  position: relative;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
}

.image-preview-content img {
  max-width: 100%;
  max-height: calc(90vh - 32px);
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #02163b;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #0a1f3b;
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