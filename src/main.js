import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import "./assets/main.css"
import 'leaflet/dist/leaflet.css'
import router from './router'
import Toast from 'vue-toastification'
import { useAuthStore } from './stores/AuthStore'
import "vue-toastification/dist/index.css";

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Initialize auth before mounting
const authStore = useAuthStore()

// Wait for auth to initialize before mounting
authStore.initializeAuthState().then(() => {
  app.use(router)
  app.use(Toast, {
    position: "top-right",
    timeout: 3000,
    maxToasts: 5,
    closeOnClick: true,
    pauseOnHover: false
  })
  app.mount('#app')
})
