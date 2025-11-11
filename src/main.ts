import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { setupStore } from './stores'
import './globals.css'

const app = createApp(App)

app.use(setupStore)
app.use(router)

app.mount('#app')
