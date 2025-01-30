<!-- components/ModalProfile.vue -->
<template>
  <div class="modal-profile" @click.self="closeModal">
    <div class="modal-content">
      <h2>Profil Saya</h2>
      
      <div class="profile-photo-section">
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileUpload" 
          accept="image/*" 
          style="display: none;"
        >
        <div class="profile-photo-container" @click="triggerFileInput">
          <img 
            :src="displayedPhoto" 
            alt="Profile Photo" 
            class="profile-photo"
            @error="handleImageError" 
          />
          <div class="overlay">
            <span>Ubah Foto</span>
          </div>
        </div>
      </div>

      <div class="profile-details">
        <div class="form-group">
          <label>Nama</label>
          <div class="info-field">{{ authStore.currentUser?.name }}</div>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <div class="info-field">{{ authStore.currentUser?.email }}</div>
        </div>

        <div class="actions">
          <button @click="closeModal" class="close-btn">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { doc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/AuthStore'
import defaultAvatarImage from '../assets/default-avatar-wm14gXiP.png' // Import the default avatar

const authStore = useAuthStore()
const emit = defineEmits(['close'])
const toast = useToast()

const fileInput = ref(null)
const profilePhoto = ref(null)

// Update displayedPhoto computed property to use the imported default avatar
const displayedPhoto = computed(() => {
  return profilePhoto.value || authStore.currentUser?.profilePhoto || defaultAvatarImage
})

const closeModal = () => {
  emit('close')
}

const triggerFileInput = () => {
  fileInput.value.click()
}

// Add error handler for image loading
const handleImageError = (e) => {
  e.target.src = defaultAvatarImage
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maks 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Image = e.target.result
      
      const user = auth.currentUser
      if (user) {
        const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid))
        const querySnapshot = await getDocs(userQuery)
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]
          await updateDoc(doc(db, 'users', userDoc.id), {
            profilePhoto: base64Image
          })

          profilePhoto.value = base64Image
          if (authStore.currentUser) {
            authStore.currentUser.profilePhoto = base64Image
          }

          toast.success('Foto profil berhasil diperbarui')
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          toast.error('User document not found')
        }
      }
    }
    
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error uploading photo:', error)
    toast.error('Gagal mengunggah foto')
  }
}

onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid))
    const querySnapshot = await getDocs(userQuery)
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data()
      profilePhoto.value = userData.profilePhoto || null
    }
  }
})
</script>

<style scoped>
.modal-profile {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.profile-photo-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
  cursor: pointer;
}

.profile-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.profile-photo-container:hover .overlay {
  opacity: 1;
}

.overlay span {
  color: white;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.info-field {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  color: #333;
  font-size: 1rem;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.close-btn {
  padding: 0.75rem 2rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
  }

  .profile-photo-container {
    width: 120px;
    height: 120px;
  }
}
</style>