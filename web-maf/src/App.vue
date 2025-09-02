<script>

export default {
	data() {
		return {
			connection: null,
			name: "",
			messages: [],
			typed_message: "",
			auth_msg: "",
		}
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
		async testAuth() {
			fetch('http://localhost:3000/')
			  .then((res) => res.json())
			  .then((data) => {
				this.auth_msg = data.message
			  })
			  .catch((err) => {
				console.error("Error occured when testing auth: ", err);
			  })
		},
		async register() {
			const userData = {
			  displayName: "briyoda4",
			  email: "briyoda4@gmail.com",
			  password: "password"
			}

			fetch('http://localhost:3000/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			})
			  .then((res) => {
				if (!res.ok) {
					console.log("Failed to register!!!")
					return res.json()
				} else {
					return res.json()
				}
			  })
			  .then((data) => {
				console.log(data)
			  })
			  .catch((err) => {
				console.error("An error registering occured", err)
			  })
		},
		async logIn() {
			const userData = {
			  displayName: "briyoda4",
			  email: "briyoda4@gmail.com",
			  password: "password"
			}

			fetch('http://localhost:3000/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			})
			  .then((res) => {
				if (!res.ok) {
					console.log("Failed to login!")
				}
				return res.json()
			  })
			  .then((data) => {
				console.log(data)
			  })
			  .catch((err) => {
				console.error("An error logging in occured", err)
			  })
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
	Auth Message: {{ auth_msg }}
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
