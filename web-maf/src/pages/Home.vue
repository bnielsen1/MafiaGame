<script>
import { mapState } from 'vuex'
import authFetch from '@/utils/api'

export default {
  data() {
    return {
      email: "",
      password: "",
    }
  },
  created() {
    this.updateLoginStatus()
  },
  computed: {
		...mapState({
			isLoggedIn(state) {
			  return !!state.accessToken // return true if we have a token a non-null token
			}
		})
	},
  methods: {
    async updateLoginStatus() {
      try {
        authFetch('http://localhost:3000/debug/me')
      } catch (err) {
        console.error("Error when updating login status: ", err);
      }
    },
    async submitLogin() {
      const loginData = {
        email: this.email,
        password: this.password
      }

      try {
				await this.$store.dispatch("login", loginData)
			} catch (err) {
				console.error("Login failed", err)
			}
    },
    async submitLogout() {
      try {
				await this.$store.dispatch("logout")
			} catch (err) {
				console.error("Logout failed", err)
			}
    }
  }
}
</script>

<template>
  <div class="center-box">
    <div class="lobby-box">
      Lobbies
    </div>
    <div class="login-box">
      Login
      <div>
        Sign-in information
        <input v-model="email" placeholder="email"/>
        <input v-model="password" placeholder="password"/>
        <button @click="submitLogin">Submit</button>
      </div>
      <div>
        Login Status
        <p v-if="isLoggedIn">logged in!</p>
        <p v-else>logged out :O</p>
      </div>
      <div>
        <button @click="submitLogout">Logout</button>
      </div>
    </div>
  </div>
</template>

<style>

.center-box {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}

.lobby-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.login-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

</style>