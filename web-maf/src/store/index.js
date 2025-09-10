import { createStore } from 'vuex'

// Create a new store instance to use for authentication
const store = createStore({
    state() {
        return {
            accessToken: null, // Use null accessToken as a (logged out) state check for now
            username: null,
            email: null,
        }
    },
    mutations: {
        setAccessToken(state, jwt) {
            // console.log(`Setting our access token to value: ${jwt}`)
            state.accessToken = jwt;
        },
        setUserInfo(state, { username, email }) {
          state.username = username;
          state.email = email;
        },
        clearUserInfo(state) {
          state.username = null;
          state.email = null;
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
            const userInfo = {
              username: data.username,
              email: data.email
            }
            commit("setAccessToken", data.accessToken)
            console.log(`Should be setting email to ${data.email}`)
            commit("setUserInfo", userInfo)
            console.log(`Email set to ${this.state.email}`)
            console.log("Successfully logged in!")
          }
          return res;
        },
        async logout({ commit }) {
            commit("clearAccessToken");
            commit("clearUserInfo");
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
            const userInfo = {
              username: data.username,
              email: data.email
            }
            commit("setAccessToken", data.accessToken);
            commit("setUserInfo", userInfo)
          } else {
            if (this.state.accessToken) {
              dispatch("logout")
            } // Otherwise we don't really need to logout cause we aren't logged in!
            throw new Error("Refresh failed")
          }
        }
    }
})

export default store;