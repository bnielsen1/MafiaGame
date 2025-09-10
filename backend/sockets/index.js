const webSocket = require('ws')
const socketHandlers = require('./handlers');
const lobbyState = require('./lobbyState')

const initWebSocket = (server) => {
    const wss = new webSocket.WebSocketServer({ server });

    wss.on('connection', function connection(ws, req) {
        const ip = req.socket.remoteAddress
        console.log(`a client connected: ${ip}`)

        ws.on('error', console.error);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(`RECEIVED ${data.type} PACKET FROM CLIENT: ${ip}`)
            
            switch (data.type) {
                case "handshake": 
                    socketHandlers.handleHandshake(ws, data);
                    break;
                case "sendMessage": 
                    socketHandlers.handleSendMessage(ws, data)
                    break;
            }
        }

        ws.onclose = () => {
            // Remove the client entirely from the database
            try {
                const username = lobbyState.getUser(ws)
                console.log(`User: ${username} disconnected. Removing them from their lobby!`)
                lobbyState.handleUserLeave(ws)
            } catch (err) { // ws wasn't found
                console.error("Disconnected incomplete user!", err)
            }
        }
    })
}

module.exports = initWebSocket;