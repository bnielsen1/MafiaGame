<script>

export default {
  data() {
    return {
      email: "",
      password: "",
      error: null,
    }
  },
  methods: {
    async submitLogin() {
      const loginData = {
        email: this.email,
        password: this.password
      }

      try {
        const res = await this.$store.dispatch("login", loginData)
        if (res.ok) {
          this.$router.push('/')
        }
        else if (res.status === 400) {
          this.error = "email and password fields are both required..."
        }
        else if (res.status === 401) {
          this.error = "email or password is incorrect..."
        } else {

        }
      } catch (err) {
        console.error("Login failed", err)
        this.error = "something went wrong. check if backend server is running?"
      }
    },
  }
}
</script>

<template>

<div>
    <div class="login-box">
      Login
      <div>
        Sign-in information
        <form @submit.prevent="submitLogin">
          <input v-model="email" placeholder="email"/>
          <input v-model="password" type="password" placeholder="password"/>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
</div>

</template>

<style>

.lobby-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

</style>