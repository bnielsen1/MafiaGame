<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      getEmail(state) {
        return state.email;
      },
      getUsername(state) {
        return state.username;
      },
      
    })
  },
  methods: {
    async handleLogout() {
      await this.$store.dispatch("logout")
      this.$router.push('/login')
    }
  }
}

</script>


<template>
<div>
  <div>
    Username: {{ getUsername }}
    Email: {{ getEmail }}
  </div>
  <div>
    <button @click="handleLogout">Logout</button>
  </div>
</div>
</template>