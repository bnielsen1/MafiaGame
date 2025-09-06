import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import store from './store'
import Home from './pages/Home.vue'
import Lobby from './pages/Lobby.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/lobby/:id', component: Lobby }
  ]
})

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
