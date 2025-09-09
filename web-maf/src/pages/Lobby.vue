<script>
import { mapState } from 'vuex'
import authFetch from '@/utils/api'

export default {
	data() {
		return {
			connection: null,
			messages: [],
			typed_message: "",
			authenticated: false,
		}
  	},
	computed: {
		...mapState({
			isLoggedIn(state) {
			  return !!state.accessToken // return true if we have a token a non-null token
			},
			getAccessToken(state) {
				return state.accessToken
			}
		})
	},
	created() {
		this.initLobby()
	},
	methods: {
		async initLobby() {
			try {
				await authFetch('http://localhost:3000/debug/me')

				// console.log("Starting connection to web socket server")
				this.connection = new WebSocket("ws://localhost:3000")
				
				this.connection.onopen = (event) => {
					// console.log(`Attempting to send accessToken: ${this.getAccessToken}`)
					const handshakePacket = {
						type: "handshake",
						accessToken: this.getAccessToken,
						lobbyId: 0,
					}

					this.connection.send(JSON.stringify(handshakePacket));
					console.log("Websocket connected! Checking authentication")
				}
				this.connection.onmessage = (event) => {
					const data = JSON.parse(event.data)

					// const packetHandler = {
					// 	newMessage: (data) => this.handleNewMessage(data),
					// 	default: (data) => this.handleDefault(data)
					// }

					// (packetHandler[data.type] || packetHandler.default)(data);

					switch (data.type) {
						case "newMessage": {
							this.handleNewMessage(data)
							break
						}
						case "handshakeSuccess": {
							console.log("Websocket authenticated")
							break;
						}
						default: {
							this.handleDefault(data)
							break;
						}
					}
				}
				this.connection.onclose = (event) => {
					console.log("Closing socket connection")
				}
			} catch (err) {
				console.error("Error when updating login status: ", err);
			}
      	},
		sendMessage() {
			const msg_packet = {
				type: "sendMessage",
				message: this.typed_message
			}

			console.log("Sending packet with contents")
			console.log(msg_packet)

			this.connection.send(JSON.stringify(msg_packet));
			this.typed_message = "";
		},
		handleDefault(data) {
			if (data.type && data.message) {
			  console.log(`Received message - type: ${data.type} - message ${data.message}`)
			} else {
			  console.log(data)
			}
		},
		handleNewMessage(data) {
			console.log("Got new message")
			this.messages.push(data)
		},
		async logIn() {
			const loginData = {
				email: "kylie@gmail.com",
				password: "password"
			}

			try {
				await this.$store.dispatch("login", loginData)
			} catch (err) {
				console.error("Login failed", err)
			}
		}
	}
}

</script>

<template>
  <h1>Welcome to the lobby!</h1>
  
  <div class="message_log">
	<li v-for="value in messages">
		{{ value.username }}: {{ value.message }}
	</li>
  </div>

  <div>
	<input v-model="typed_message" />
	<button @click="sendMessage">
		Send
	</button>
  </div>

  <div>
	<p v-if="isLoggedIn">LOGGED IN YAY!!!</p>
	<p v-else>NOT LOGGED IN :O</p>
  </div>
</template>

<style>

.message_log {
  display: flex;
  flex-direction: column;
}

</style>
