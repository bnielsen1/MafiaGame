<script>
import { mapState } from 'vuex'
import Phase from '@/models/Phase'
import Player from '@/models/Player'
import authFetch from '@/utils/api'

export default {
	data() {
		return {
			connection: null,
			phases: [new Phase(0, true, -1)],
			players: [],
			clients: [],
			messages: [],
			actions: [],
			timerObject: null,
			startTime: null, // Stores the date/time when the timer started
			timeRemaining: 0, // Display value of the time remaining 
			typed_message: "",
			authenticated: false,
		}
  	},
	computed: {
		...mapState({
			getAccessToken(state) {
				return state.accessToken
			},
			getUsername(state) {
				return state.username;
			},
		})
	},
	created() {
		this.initLobby()
	},
	methods: {
		async initLobby() {
			// Get old data
			const res = authFetch()
			// Instantiate socket
			try {
				// console.log("Starting connection to web socket server")
				this.connection = new WebSocket("ws://localhost:3000")
				
				this.connection.onopen = (event) => {
					const handshakePacket = {
						type: "handshake",
						accessToken: this.getAccessToken,
						lobbyId: this.$route.params.id,
					}

					this.connection.send(JSON.stringify(handshakePacket));
					console.log("Websocket connected! Checking authentication")
				}
				this.connection.onmessage = (event) => {
					const data = JSON.parse(event.data)

					switch (data.type) {
						case "newMessage": {
							this.handleNewMessage(data)
							break
						}
						case "handshakeSuccess": {
							this.handleHandshakeSuccess(data)
							break;
						}
						case "startGame": {
							this.handleStartGame(data)
							break;
						}
						case "newUser": {
							this.handleNewUser(data)
							break;
						}
						case "newPhase": {
							this.handleNewPhase(data)
							break;
						}
						case "actionUpdate": {
							this.handleActionUpdate(data)
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
		sendStartGame() {
			const packet = {
				type: "startGame"
			}

			console.log("Attempting to start the game")

			this.connection.send(JSON.stringify(packet))
		},
		sendActionUpdate(actionType, target) {
			var finalTarget = target;
			const prevTarget = this.actions.find((action) => action.title === actionType).target;
			if (target === prevTarget) {
				finalTarget = null;
			}

			var packet = {
				type: "actionUpdate",
				action: actionType,
				target: finalTarget
			}

			console.log("Attempting to send action update")

			this.connection.send(JSON.stringify(packet))
		},
		handleDefault(data) {
			if (data.type && data.message) {
			  console.log(`Received message - type: ${data.type} - message ${data.message}`)
			} else {
			  console.log(data)
			}
		},
		handleNewPhase(data) {
		  console.log(data)

		  // update player list
		  this.players = [];
		  data.players.forEach((player) => {
			this.players.push(new Player(player.username, player.role));

			// if we are the user populate voting buttons
			// console.log(`Checking is our username ${this.getUsername} matches ${player.username}`)
			if (player.username === this.getUsername) {
				this.actions = []; // clear current actions
				player.role.actions.forEach((playerAction) => {
					const actionObjet = {
						title: playerAction.title,
						target: playerAction.target,
						targets: playerAction.targets
					}
					this.actions.push(actionObjet);
				})
			} 
		  });

		  const phase = data.phase;
		  this.phases.push(new Phase(phase.number, phase.dayTime, phase.timer))

		  this.resetTimer(phase.timer)
		},
		handleNewMessage(data) {
			console.log("Got new message")
			// this.messages.push(data)
			this.phases[this.phases.length - 1].messages.push(data)
		},
		handleStartGame(data) {
		  console.log(data)

		  // update player list
		  data.players.forEach((player) => {
			this.players.push(new Player(player.username, player.role));

			// if we are the user populate voting buttons
			if (player.username === this.getUsername) {
				this.actions = []; // clear current actions
				player.role.actions.forEach((playerAction) => {
					const actionObjet = {
						title: playerAction.title,
						target: playerAction.target,
						targets: playerAction.targets
					}
					this.actions.push(actionObjet);
				})
			}
		  });

		  console.log("listing all actions in state")
		  console.log(this.actions)

		  const phase = data.phase;
		  this.phases.push(new Phase(phase.number, phase.dayTime, phase.timer))

		  this.resetTimer(phase.timer)
		},
		handleActionUpdate(data) {
		  console.log(data)

		  // Update "global" player list of actions
		  const actorPlayer = this.players.find((player) => player.username === data.username);
		  const actionObject = actorPlayer.role.actions.find((action) => action.title === data.action);

		  // Update checkbox area of actions
		  if (actorPlayer.username === this.getUsername) {
			const selectorAction = this.actions.find((action) => action.title === data.action)
			selectorAction.target = data.target
		  }

		  actionObject.target = data.target;
		  console.log(this.actions);
		},
		handleNewUser(data) {
		  const newUsername = data.username;
		  
		  this.clients.push(newUsername);
		},
		handleHandshakeSuccess(data) {
			this.phases[0].messages = data.messages;
			this.clients = data.oldUsernames; // Push all old users to client list
			this.clients.push(this.getUsername) // Push self onto client list
		},
		resetTimer(newTimer) {
		  if (this.timerObject !== null) {
			clearInterval(this.timerObject);
		  }
		  this.startTime = Date.now();
		  const totalTime = Math.floor(newTimer) / 1000;
		  this.timeRemaining = totalTime;
		  this.timerObject = setInterval(() => {
			const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
			this.timeRemaining = totalTime - elapsed;

			if (this.timeRemaining < 0) {
			  clearInterval(this.timerObject);
			  this.timerObject = null;
			  this.timeRemaining = 0;
			}
		  }, 250);
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
	},
	beforeUnmount() {
		if (this.connection) {
			this.connection.close()
			this.connection = null
		}
	},
}

</script>

<template>
  <h1>Welcome to the lobby!</h1>
  
  <div class="main_boxes">
	<div class="chat_stuff">
		<div v-for="phase in phases" class="message_log">
			Day: {{ phase.dayTime }} {{ phase.number }}
			<li v-for="value in phase.messages">
				{{ value.username }}: {{ value.message }}
			</li>
		</div>
	  	<div>
			<input v-model="typed_message" />
			<button @click="sendMessage">
				Send
			</button>
			<button  @click="sendStartGame">Start game!</button>
		</div>
	</div>
	<div class="clients">
		<p v-for="client in clients">{{ client }}</p>
	</div>
	<div class="players">
		<p v-for="player in players">{{ player.username }} | {{ player.role }}</p>
	</div>
	<div class="timer">
		{{ this.timeRemaining }}
	</div>
	<div class="vote_box">
		<div v-for="action in actions">
		  <p>{{ action.title }}</p>
		  <div v-for="target in action.targets">
			<button @click="sendActionUpdate(action.title, target)">
			  <p v-if="target === action.target">{{ target }} X</p>
			  <p v-else>{{ target }}</p>
			</button>
		  </div>
		</div>
	</div>
  </div>




</template>

<style>

.main_boxes {
  display: flex;
  flex-direction: row;
}

.message_log {
  display: flex;
  flex-direction: column;
}

.clients {
  display: flex;
  flex-direction: column;
}

</style>
