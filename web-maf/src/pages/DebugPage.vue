<script>
import { mapState } from 'vuex'
import authFetch from '@/utils/api'

export default {
	data() {
		return {
			connection: null,
			name: "",
			messages: [],
			typed_message: "",
			authenticated: false,
		}
  	},
	computed: {
		...mapState({
			isLoggedIn(state) {
			  return !!state.accessToken // return true if we have a token a non-null token
			}
		})
	},
	created() {
		console.log("Starting connection to web socket server")
		this.connection = new WebSocket("ws://localhost:3000")
		
		this.connection.onopen = (event) => {
			console.log("Successfully connected!")
		}
		this.connection.onmessage = (event) => {
			console.log("preparing to parse below")
			console.log(event.data)
			const msg = JSON.parse(event.data)

			switch (msg.type) {
				case "message": this.handleMessage(msg)
			}
		}
	},
	methods: {
		sendMessage() {
			const msg_packet = {
				type: "message",
				user: this.name,
				contents: this.typed_message
			}

			this.connection.send(JSON.stringify(msg_packet));
			this.typed_message = "";
		},
		handleMessage(msg) {
			this.messages.push(msg)
		},
		async logIn() {
			const loginData = {
				email: "kylie@gmail.com",
				password: "password"
			}

			try {
				await this.$store.dispatch("login", loginData)
				console.log("I think we logged in successfully?")
			} catch (err) {
				console.error("Login failed", err)
			}
		}
	}
}

</script>

<template>
  <h1>Welcome to the chatroom!</h1>
  
  <div class="message_log">
	<li v-for="message in messages" :key="message.id">
		{{ message.user }}: {{ message.contents }}
	</li>
  </div>

  <div>
	<input v-model="typed_message" />
	<button @click="sendMessage">
		Send
	</button>
  </div>

  <br/>
  Yo username bucko <input v-model="name" />

  <div>
	<p v-if="isLoggedIn">LOGGED IN YAY!!!</p>
	<p v-else>NOT LOGGED IN :O</p>
	<button @click="register">
		Register
	</button>
	<button @click="logIn">
		Log In
	</button>
	<button @click="testAuth">
		Test Authentication
	</button>
  </div>
</template>

<style>

.message_log {
  display: flex;
  flex-direction: column;
}

</style>
