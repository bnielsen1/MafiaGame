const express = require('express')
const webSocket = require('ws')

const app = express()
const server = require('http').createServer(app)
const wss = new webSocket.WebSocketServer({ server });

var MSG_ID = 0;

function handleMessage(msg) {
	const message_packet = {
		type: "message",
		id: MSG_ID,
		user: msg.user,
		contents: msg.contents
	}

	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(message_packet));
		}
	})
}

wss.on('connection', function connection(ws) {
	ws.on('error', console.error);

	ws.onmessage = (event) => {
		const msg = JSON.parse(event.data)

		switch (msg.type) {
			case "message": handleMessage(msg)
		}
	}
})

app.get('/', (req, res) => {
	res.send("Hello world!")
})

const port = 3000;

server.listen(port, () => {
	console.log("Listening on port: " + port);
});
