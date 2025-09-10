const lobbyState = require('./lobbyState')
const jwt = require('jsonwebtoken');
const config = require('../config')

// Handlers for websockets

// Exported functions
exports.handleHandshake = (ws, data) => {
    try {
      jwt.verify(data.accessToken, config.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          ws.send(JSON.stringify({ type: 'handshakeError', message: 'Authentication failed.' }));
          console.log("Unauthenticated websocket connection attempt... Disconnecting")
          ws.close();
          return;
        }
        // If no error
        
        const { username } = decoded;
        console.log(`grabbed username from jwt: ${username}`)

        if (lobbyState.getSocket(username) !== null) { // if the found username already has a socket instance
            ws.send(JSON.stringify({ type: 'handshakeError', message: 'You are already connected.' }));
            console.log(`connected user: ${username} tried to connect again! Denying...`)
            ws.close();
            return;
        }
        
        // Insert the user into the lobby!
        lobbyState.handleUserJoin(ws, username, data.lobbyId)

        console.log("User successfully authenticated. Websocket connection instantiated")
        ws.send(JSON.stringify({ type: 'handshakeSuccess', messages: lobbyState.getLobby(username).chat}))
      })
    } catch (err) {
      ws.send(JSON.stringify({ type: 'handshakeError', message: 'Some error occured when handshaking' }));
      console.error("Some error when handshaking a client! SHOULDN'T HAPPEN", err)
      ws.close();
      return;
    }
}

exports.handleSendMessage = (ws, data) => {
    try {
      // Get required references to gamestate and user
      const username = lobbyState.getUser(ws);
      const lobby = lobbyState.getLobby(username);

      // Create a message to send to all clients
      const messagePacket = {
        type: "newMessage",
        username: username,
        message: data.message,
      }

      // Save the message to memory
      lobby.messageSent(username, data.message)

      // Send message to all clients connected to the lobby
      console.log(`User ${username} sent sent message: ${data.message} on lobby: ${lobbyState.getLobbyId(username)}`)
      lobby.getSockets().forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messagePacket));
        }
      })
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Some error occured when receiving send message' }));
      console.error("Some error when receiving a message from a client!", err)
      ws.close();
      return;
    }
}