<script>
import { mapState } from 'vuex'
import Phase from '@/models/Phase'
import Player from '@/models/Player'
import authFetch from '@/utils/api'
import Clock from '../components/lobby/Clock.vue'
import Chat from '@/components/lobby/Chat.vue'
import OtherActions from '@/components/lobby/OtherActions.vue'
import CircleViewer from '@/components/lobby/CircleViewer.vue'
import PhaseInfo from '@/components/lobby/PhaseInfo.vue'

import sampleData from '@/sampleData/data.json'

export default {
	components: {
	  Clock,
	  OtherActions,
	  Chat,
	  CircleViewer,
	  PhaseInfo
	},
	data() {
		return {
			connection: null,
			phases: [new Phase(0, true, -1)],
			phaseIndex: 0,
			players: [],
			clients: [],
			messages: [],
			actions: [],
			typed_message: "",
			timerDuration: 0,
			timerReset: false,
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
		console.log(sampleData.samplePhases)
		console.log(this.phases)
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

		  this.timerDuration = phase.timer;
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

		  this.timerDuration = phase.timer;
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
		},
		setClockTimer(value) {
		  this.timerReset = !this.timerReset;
		  this.timerDuration = value;
		},
		updatePhaseIndex(amount) {
		  const newIndex = this.phaseIndex + amount;
		  if (newIndex >= 0 && newIndex < this.phases.length) {
			this.phaseIndex = newIndex;
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
  <div class="main-container">
	<div class="left-bar">
	  <OtherActions :unstructuredPlayers="players"/>
	</div>
	
	<div class="left-primary">
	  <CircleViewer :unstructuredPlayers="players"/>
	  <div class="notes-object">
		<button @click="sendStartGame()">Start Game</button>
	  </div>
	</div>

	<div class="right-primary">
	  <div class="above-chat">
		<Clock :timerDuration="timerDuration" :timerReset="timerReset"/>
		<PhaseInfo :phases="phases" :phaseIndex="phaseIndex" :updatePhaseIndex="updatePhaseIndex"/>
		<div class="above-chat-filler"></div>
	  </div>
	  <Chat :phases="phases" :phaseIndex="phaseIndex"/>
	</div>
	
	
  </div>




</template>

<style>

.above-chat-filler {
  width: 100%;
  background-color: var(--background-2);
}

.above-chat {
  display: flex;
  flex-direction: row;
  border-bottom: var(--background-5) solid 2px;
}

.other-info {
  display: flex;
  flex-direction: row;
  background-color: var(--background-2);
  color: var(--text-primary);
  flex-grow: 1;
}

.notes-object {
  flex-grow: 1;
  background-color: yellow;
}

.main-container {
  display: flex;
  flex-direction: row;

  height: calc(100vh - 70px);
  width: 100vw;
  overflow-x: hidden;
}

.left-primary {
  display: flex;
  flex-direction: column;
  width: 800px;

  background-color: blue;
}

.right-primary {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: calc(100vw - 800px - 300px);

  background-color: green;
}


</style>
