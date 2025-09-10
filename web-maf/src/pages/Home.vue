<script>
import { mapState } from 'vuex'
import authFetch from '@/utils/api'

export default {
  data() {
    return {
      lobbies: [],
      lobbyTitle: ""
    }
  },
  created() {
    this.updateLobbyList()
  },
  methods: {
    async updateLobbyList() {
      try {
        const res = await authFetch('http://localhost:3000/api/lobby')
        if (res.ok) {
          const data = await res.json();
          this.lobbies = data.lobbies;
        } else {
          console.log("Can't grab lobby data. Probably not authenticated")
        }
      } catch (err) {
        console.log("Shouldn't reach this error!")
      }
    },
    async createLobby() {
      try {
        const lobbyInfo = { title: this.lobbyTitle };
        const res = await authFetch('http://localhost:3000/api/lobby', {
          method: 'POST',
          body: JSON.stringify(lobbyInfo),
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json()
          this.$router.push(`/lobby/${data.lobbyId}`)
        } else {
          console.log("THIS SHOULDN'T HAPPEN!");
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<template>
  <div class="center-box">
    <div class="lobby-box">
      Lobbies
      <li v-for="lobby in lobbies">
        <div>
          Owner: {{ lobby.owner }}
          Title: {{ lobby.title }}
          <button @click="$router.push(`/lobby/${lobby.lobbyId}`)">Join</button>
        </div>
        
      </li>
    </div>
    <div class="create-box">
      <form @submit.prevent="createLobby">
        <input v-model="lobbyTitle" placeholder="Lobby title">
        <button type="submit">Create lobby!</button>
      </form>
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

</style>