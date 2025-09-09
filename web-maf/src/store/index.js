import { createStore } from 'vuex'

// Create a new store instance to use for authentication
const store = createStore({
    state() {
        return {
            accessToken: null // Use null accessToken as a (logged out) state check for now
        }
    },
    mutations: {
        setAccessToken(state, jwt) {
            // console.log(`Setting our access token to value: ${jwt}`)
            state.accessToken = jwt;
        },
        clearAccessToken(state) {
            state.accessToken = null;
        }
    },
    actions: {
        async login({ commit }, loginInfo) {
          // loginInfo should be in the format { email, password }
          const res = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            body: JSON.stringify(loginInfo),
            headers: { "Content-Type": "application/json" },
            credentials: "include", // so refresh cookie is set (what the video said to do lol)
          })
          if (res.ok) {
            const data = await res.json()
            commit("setAccessToken", data.accessToken)
            console.log("Successfully logged in!")
          } else {
            throw new Error("Failed to login")
          }
          
        },
        async logout({ commit }) {
            commit("clearAccessToken")
            const res = await fetch("http://localhost:3000/api/auth/logout", {
              method: "GET",
              credentials: "include"
            })
            if (res.ok) {
              console.log("Successfully logged out!")
            }
        },
        async refresh({ commit, dispatch }) {
          const res = await fetch("http://localhost:3000/api/auth/refresh", {
            method: "GET",
            credentials: "include"
          });
          if (res.ok) {
            // console.log("Successful refresh!")
            const data = await res.json()
            commit("setAccessToken", data.accessToken);
          } else {
            dispatch("logout")
            throw new Error("Refresh failed")
          }
        }
    }
})

export default store;