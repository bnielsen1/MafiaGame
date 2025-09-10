import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import authFetch from './utils/api'
import store from './store'
import Home from './pages/Home.vue'
import Lobby from './pages/Lobby.vue'
import DebugPage from './pages/DebugPage.vue'
import Login from './pages/Login.vue'
import Account from './pages/Account.vue'

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
      component: Lobby,
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

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
