import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura'

import authFetch from './utils/api'
import store from './store'
import Home from './pages/Home.vue'
import Lobby from './pages/Lobby.vue'
import DebugPage from './pages/DebugPage.vue'
import Login from './pages/Login.vue'
import Account from './pages/Account.vue'
import LobbyCopy from './pages/LobbyCopy.vue'

// Do refresh token check
try {
  await authFetch('http://localhost:3000/debug/me') // API call to check login status
} catch (err) {
  console.error("AN ERROR THAT SHOULDN'T HAPPEN OCCURED!!!")
}

// Create all routes
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    { 
      path: '/lobby/:id',
      name: 'lobby', 
      component: LobbyCopy,
      meta: { requiresAuth: true }
    },
    {
      path: '/lobbytest',
      name: 'lobbytest',
      component: LobbyCopy,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    { 
      path: '/debug', 
      component: DebugPage 
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
      meta: { requiresAuth: true }
    }
  ]
})

// Handle route redirection logic
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth); // Check for auth
  const isAuth = !!store.state.accessToken // Check if we have an access token 

  // Redirection logic
  if (to.name === 'login' && isAuth) {
    next({ name: 'home' });
  } else if (requiresAuth && !isAuth) {
    next({ name: 'login' });
  } else {
    next();
  }
})

import './assets/main.css';

const vuePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    }
  }
})

createApp(App)
  .use(store)
  .use(router)
  // .use(PrimeVue, {
  //   theme: {
  //     preset: Aura,
  //   }
  // })
  .mount('#app')
