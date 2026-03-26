import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { initRate } from './services/currencyService'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Fetch exchange rate on startup (fire-and-forget — works with fallback if slow)
initRate()
