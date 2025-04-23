<template>
  <div class="profile-view">
    <h2 class="section-title">Pengaturan Profil</h2>

    <div class="profile-content">
      <!-- Left Side - Photo Section -->
      <div class="profile-photo-section">
        <div class="photo-container">
          <div
            class="profile-photo"
            :style="{
              backgroundImage: `url(${previewPhoto || userProfile.profilePhoto || defaultAvatarImage})`,
            }"
          ></div>
          <div class="photo-overlay" @click="triggerFileInput">
            <i class="fas fa-camera"></i>
            <span>Ubah Foto</span>
          </div>
        </div>
        <input
          type="file"
          ref="fileInput"
          @change="handlePhotoChange"
          accept="image/*"
          style="display: none"
        />
        <div class="photo-info">
          <p>Format foto: JPG, JPEG, PNG</p>
          <p>Ukuran file maksimal 2MB</p>
        </div>
      </div>

      <!-- Right Side - Form Section -->
      <div class="profile-form">
        <div class="form-group">
          <label for="name">Nama Lengkap</label>
          <input
            type="text"
            id="name"
            v-model="userProfile.name"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="userProfile.email"
            placeholder="Email"
            readonly
            class="readonly-field"
          />
        </div>

        <div class="form-group">
          <label for="phone">No. Telepon</label>
          <input
            type="tel"
            id="phone"
            v-model="userProfile.phone"
            placeholder="Masukkan nomor telepon"
            @input="validatePhone"
            maxlength="13"
            inputmode="numeric"
          />
        </div>

        <div class="form-group">
          <label for="gender">Jenis Kelamin</label>
          <div class="custom-dropdown" :class="{ active: isGenderDropdownOpen }">
            <div class="selected-option" @click="toggleGenderDropdown">
              <span>{{ userProfile.gender || 'Pilih jenis kelamin' }}</span>
              <i
                class="fas fa-chevron-down dropdown-icon"
                :class="{ rotate: isGenderDropdownOpen }"
              ></i>
            </div>
            <div class="dropdown-menu">
              <div
                v-for="option in genderOptions"
                :key="option.value"
                class="dropdown-item"
                @click="selectGender(option.value)"
                :class="{ selected: userProfile.gender === option.value }"
              >
                <i class="fas fa-check check-icon" v-if="userProfile.gender === option.value"></i>
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Tanggal Lahir</label>
          <div class="custom-date-picker">
            <div class="date-input-group">
              <div class="date-input">
                <select v-model="dateComponents.day" @change="updateDate">
                  <option value="" disabled>DD</option>
                  <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
                </select>
                <div class="date-input-overlay">
                  <span class="date-value">{{ dateComponents.day || 'DD' }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
              <div class="date-separator">/</div>
              <div class="date-input">
                <select v-model="dateComponents.month" @change="updateDate">
                  <option value="" disabled>MM</option>
                  <option v-for="(month, index) in months" :key="index" :value="index + 1">
                    {{ month }}
                  </option>
                </select>
                <div class="date-input-overlay">
                  <span class="date-value">{{
                    dateComponents.month ? months[dateComponents.month - 1].substring(0, 3) : 'MM'
                  }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
              <div class="date-separator">/</div>
              <div class="date-input">
                <select v-model="dateComponents.year" @change="updateDate">
                  <option value="" disabled>YYYY</option>
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
                <div class="date-input-overlay">
                  <span class="date-value">{{ dateComponents.year || 'YYYY' }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="save-btn" @click="saveProfile" :disabled="isSaving">
            <span v-if="isSaving"> <i class="fas fa-spinner fa-spin"></i> Menyimpan... </span>
            <span v-else>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import defaultAvatarImage from '@/assets/default-avatar-wm14gXiP.png'

const authStore = useAuthStore()
const toast = useToast()
const fileInput = ref(null)
const isSaving = ref(false)
const previewPhoto = ref(null)
const isGenderDropdownOpen = ref(false)

const userProfile = ref({
  name: authStore.currentUser?.name || '',
  email: authStore.currentUser?.email || '',
  phone: authStore.currentUser?.phone || '',
  gender: authStore.currentUser?.gender || '',
  birthdate: authStore.currentUser?.birthdate || '',
  profilePhoto: authStore.currentUser?.profilePhoto || null,
})

const genderOptions = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
  { value: 'Lainnya', label: 'Lainnya' },
]

// const today = computed(() => {
//   const date = new Date()
//   return date.toISOString().split('T')[0]
// })

const triggerFileInput = () => {
  fileInput.value.click()
}

const handlePhotoChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type and size
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.type)) {
    toast.error('Format foto tidak valid. Gunakan JPG, JPEG atau PNG')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    // 2MB limit
    toast.error('Ukuran foto maksimal 2MB')
    return
  }

  // Convert to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    previewPhoto.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const validatePhone = () => {
  // Clean up non-digit characters
  userProfile.value.phone = userProfile.value.phone.replace(/\D/g, '')

  // Limit to 13 characters
  if (userProfile.value.phone.length > 13) {
    userProfile.value.phone = userProfile.value.phone.slice(0, 13)
  }

  // Ensure it starts with proper prefix
  if (
    userProfile.value.phone &&
    !userProfile.value.phone.startsWith('0') &&
    !userProfile.value.phone.startsWith('62')
  ) {
    userProfile.value.phone = '0' + userProfile.value.phone

    // Check length again after adding prefix
    if (userProfile.value.phone.length > 13) {
      userProfile.value.phone = userProfile.value.phone.slice(0, 13)
    }
  }
}

const toggleGenderDropdown = () => {
  isGenderDropdownOpen.value = !isGenderDropdownOpen.value
}

const selectGender = (value) => {
  userProfile.value.gender = value
  isGenderDropdownOpen.value = false
}

const saveProfile = async () => {
  try {
    isSaving.value = true

    if (!userProfile.value.name) {
      toast.error('Nama tidak boleh kosong')
      return
    }

    // Check if currentUser exists and has an id property
    if (!authStore.currentUser || !authStore.currentUser.id) {
      toast.error('Error: User data not available')
      return
    }

    const userQuery = query(collection(db, 'users'), where('uid', '==', authStore.currentUser.id))
    const querySnapshot = await getDocs(userQuery)

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]

      const updateData = {
        name: userProfile.value.name,
        phone: userProfile.value.phone,
        gender: userProfile.value.gender,
        birthdate: userProfile.value.birthdate,
      }

      // Only update photo if changed
      if (previewPhoto.value) {
        updateData.profilePhoto = previewPhoto.value
      }

      await updateDoc(doc(db, 'users', userDoc.id), updateData)

      // Update local auth store
      authStore.currentUser = {
        ...authStore.currentUser,
        ...updateData,
      }

      toast.success('Profil berhasil diperbarui')
      previewPhoto.value = null
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error('Gagal memperbarui profil')
  } finally {
    isSaving.value = false
  }
}

// const resetForm = () => {
//   userProfile.value = {
//     name: authStore.currentUser?.name || '',
//     email: authStore.currentUser?.email || '',
//     phone: authStore.currentUser?.phone || '',
//     gender: authStore.currentUser?.gender || '',
//     birthdate: authStore.currentUser?.birthdate || '',
//     profilePhoto: authStore.currentUser?.profilePhoto || null,
//   }
//   previewPhoto.value = null
// }

const days = computed(() => {
  if (!dateComponents.value.month || !dateComponents.value.year)
    return Array.from({ length: 31 }, (_, i) => i + 1)

  const daysInMonth = new Date(dateComponents.value.year, dateComponents.value.month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
})

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= currentYear - 100; year--) {
    years.push(year)
  }
  return years
})

const dateComponents = ref({
  day: '',
  month: '',
  year: '',
})

const updateDate = () => {
  const { day, month, year } = dateComponents.value
  if (day && month && year) {
    userProfile.value.birthdate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.custom-dropdown')) {
    isGenderDropdownOpen.value = false
  }
}

onMounted(async () => {
  try {
    // Check if currentUser exists and has an id property
    if (!authStore.currentUser || !authStore.currentUser.id) {
      console.error('User not logged in or missing ID')
      return
    }

    const userQuery = query(collection(db, 'users'), where('uid', '==', authStore.currentUser.id))
    const querySnapshot = await getDocs(userQuery)

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data()
      userProfile.value = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthdate: userData.birthdate || '',
        profilePhoto: userData.profilePhoto || null,
      }

      if (userData.birthdate) {
        const [year, month, day] = userData.birthdate.split('-')
        dateComponents.value = {
          day: parseInt(day, 10),
          month: parseInt(month, 10),
          year: parseInt(year, 10),
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }

  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.profile-view {
  width: 100%;
  padding: 1rem;
}

.section-title {
  margin: 0 0 1.5rem;
  color: #02163b;
  font-weight: 600;
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* New flex container for side-by-side layout */
.profile-content {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.profile-photo-section {
  flex: 0 0 250px; /* Fixed width for photo section */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-form {
  flex: 1; /* Take remaining space */
  min-width: 300px; /* Minimum width for form */
  max-width: 600px; /* Maximum width for form */
  width: 100%; /* Ensure the form takes full available width */
  box-sizing: border-box; /* Include padding and border in the width calculation */
}

.photo-container {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 1rem;
  overflow: hidden;
}

.profile-photo {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border: 3px solid #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.photo-overlay:hover {
  opacity: 1;
}

.photo-overlay i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.photo-info {
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.photo-info p {
  margin: 0.25rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%; /* Make sure form groups take full width */
  box-sizing: border-box; /* Include padding and border in the width calculation */
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
}

.form-group input,
.form-group select {
  width: 100%; /* Ensure all inputs have the same width */
  box-sizing: border-box; /* Include padding and border in the width calculation */
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #e8ba38;
  outline: none;
  box-shadow: 0 0 0 2px rgba(232, 186, 56, 0.1);
}

.readonly-field {
  background-color: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

/* Custom Dropdown Styles */
.custom-dropdown {
  position: relative;
  width: 100%;
}

.selected-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s ease;
}

.selected-option:hover {
  border-color: #e8ba38;
}

.custom-dropdown.active .selected-option {
  border-color: #e8ba38;
  box-shadow: 0 0 0 2px rgba(232, 186, 56, 0.1);
}

.dropdown-icon {
  transition: transform 0.3s ease;
  color: #02163b;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s ease;
}

.custom-dropdown.active .dropdown-menu {
  max-height: 300px;
  opacity: 1;
}

.dropdown-item {
  padding: 0.75rem;
  cursor: pointer;
  position: relative;
  padding-left: 2.5rem;
}

.dropdown-item:hover {
  background-color: rgba(232, 186, 56, 0.1);
}

.dropdown-item.selected {
  background-color: rgba(232, 186, 56, 0.2);
  font-weight: 500;
}

.check-icon {
  position: absolute;
  left: 0.75rem;
  color: #e8ba38;
}

/* Custom Date Picker Styles */
.custom-date-picker {
  width: 100%;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
  position: relative;
}

.date-input select {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.date-input-overlay {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease;
}

.date-input select:focus + .date-input-overlay {
  border-color: #e8ba38;
  box-shadow: 0 0 0 2px rgba(232, 186, 56, 0.1);
}

.date-value {
  font-weight: 500;
  color: #333;
}

.date-input-overlay .fas {
  color: #02163b;
  font-size: 0.8rem;
}

.date-separator {
  font-size: 1.2rem;
  font-weight: 500;
  color: #666;
}

.date-input:hover .date-input-overlay {
  border-color: #e8ba38;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%; /* Make the save button take full width */
  background-color: #e8ba38;
  color: #02163b;
}

.save-btn:hover:not(:disabled) {
  background-color: #d5a832;
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-btn i {
  margin-right: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }

  .profile-photo-section {
    margin: 0 auto 2rem;
  }

  .photo-container {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .photo-container {
    width: 120px;
    height: 120px;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
