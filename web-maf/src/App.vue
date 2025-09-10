<script>
import TopBar from './components/TopBar.vue'

export default {
  components: {
    TopBar
  }
}
</script>

<template>
    <TopBar />
	  <router-view></router-view>
</template>

<style>

html, body {
  margin: 0;
  padding: 0;
}

</style>
