const webSocket = require('ws')
const socketHandlers = require('./handlers');
const { lobbyManager, clientMap, getUserInfo } = require('./gamestate')

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
                let { username, lobby } = getUserInfo(ws);
                console.log(`User: ${username} disconnected. Removing them from their lobby!`)
                lobby.clients.delete(ws)
                clientMap.delete(ws)
            } catch (err) { // ws wasn't found
                console.log("Disconnected unauthenticated user!")
            }
        }
    })
}

module.exports = initWebSocket;