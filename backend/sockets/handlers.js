const { LobbyManager, Setting, Lobby, GameState, Player, Chat, Phase, LobbyStatus, GameTime, StartTime } = require('../models/lobby');
const { lobbyManager, clientMap, getUserInfo } = require('./gamestate')
const jwt = require('jsonwebtoken');
const config = require('../config')

// Helper functions
isUserConnected = (username) => {
    if (clientMap.size === 0) {
      return null;
    }
    for (const value of clientMap.values()) {
        if (value[0] === username) {
            return value[1];
        }
    }
    
    return null;
}

// Exported functions
exports.handleHandshake = (ws, data) => {
    try {
      // console.log("Beginning to verify JWT")
      // console.log(`Received access token: ${data.accessToken}`)
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

        if (isUserConnected(username) !== null) {
            ws.send(JSON.stringify({ type: 'handshakeError', message: 'You are already connected.' }));
            console.log(`connected user: ${username} tried to connect again! Denying...`)
            ws.close();
            return;
        }

        
        // Insert the user into the lobby!
        clientMap.set(ws, [username, data.lobbyId])
        // console.log("Inserted user into client map")
        lobbyManager.lobbies.get(data.lobbyId).clients.add(ws);
        // console.log("Inserted user into lobby")

        console.log("User successfully authenticated. Websocket connection instantiated")
        ws.send(JSON.stringify({ type: 'handshakeSuccess', message: 'Successfully logged in!'}))
      })
    } catch (err) {
      ws.send(JSON.stringify({ type: 'handshakeError', message: 'Some error occured when handshaking' }));
      console.error("Some error when handshaking a client! SHOULDN'T HAPPEN", err)
      ws.close();
      return;
    }
}

exports.handleSendMessage = (ws, data) => {
    console.log("handle send message was called")
    try {
      // Get required references to gamestate and user
      const { username, lobby } = getUserInfo(ws);

      // Create a message to send to all clients
      const messageData = {
        username: username,
        message: data.message
      }

      // Save the message to memory
      lobby.chat.push(messageData)

      // Send message to all clients connected to the lobby
      lobby.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const newMessagePacket = { ...messageData, type: "newMessage" }
          console.log("Sending packet with contents")
          console.log(newMessagePacket)
          client.send(JSON.stringify(newMessagePacket));
        }
      })
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Some error occured when receiving send message' }));
      console.error("Some error when receiving a message from a client!", err)
      ws.close();
      return;
    }
}