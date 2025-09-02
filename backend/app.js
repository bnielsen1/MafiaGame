
// Basic imports for the backend
const express = require('express')
const cors = require('cors')
const webSocket = require('ws')
const connectDB = require('./config/db.js')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials.js')

// Create the express app and web socket server
const app = express()
app.use(express.json());

// Create an express server object
const server = require('http').createServer(app)

// Create a web socket server for Vue clients to hook in to
const wss = new webSocket.WebSocketServer({ server });

// Instantiate the database
connectDB();

// add credentials to all headers when CORS are valid
// needed for fetch to work on the frontend
app.use(credentials)

// Setup cors
app.use(cors());

// middleware for cookies
app.use(cookieParser());



// Begin route definitions
app.use('/api/auth', require('./routes/api/auth.js'))

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


// ERROR HANDLING MIDDLEWARE
// ENSURE IT IS AT END OF ALL ROUTES
app.use((err, req, res, next) => {
  console.error(err); // log it
  res.status(500).json({ success: false, message: err.message });
});


const port = 3000;

server.listen(port, () => {
	console.log("Listening on port: " + port);
});
