
// Basic imports for the backend
const express = require('express')
const cors = require('cors')
const webSocket = require('ws')
const connectDB = require('./config/db.js')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials.js')
const initWebSocket = require('./sockets/index.js')

// Create the express app and web socket server
const app = express()
app.use(express.json());

// Create an express server object
const server = require('http').createServer(app)

// Create a web socket server for Vue clients to hook in to
initWebSocket(server);

// Instantiate the database middleware
connectDB();

// add credentials to all headers when CORS are valid
// needed for fetch to work on the frontend
app.use(credentials)

// Setup cors
app.use(cors({
	origin: "http://localhost:5173",
	credentials: true
}));

// middleware for cookies
app.use(cookieParser());

// Begin route definitions
app.use('/api/auth', require('./routes/api/auth.js'))
app.use('/debug', require('./routes/debug/authentication.js'))

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
