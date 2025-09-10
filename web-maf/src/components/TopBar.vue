<script>
import { mapState } from 'vuex';


export default {
  computed: {
    ...mapState({
      isLoggedIn(state) {
        return !!state.accessToken;
      },
      getUsername(state) {
        return state.username;
      }
    })
  }
}

</script>


<template>

<div class="top-box">
  <div class="home-button">
    <button @click="$router.push('/')">Home Page</button>
  </div>
  <div v-if="isLoggedIn" class="account-button">
    <button @click="$router.push('/account')">{{ getUsername }}</button>
  </div>
</div>

</template>


<style>

.top-box {
  display: flex;
  height: 70px;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: grey;
}

</style>