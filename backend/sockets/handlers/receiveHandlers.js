const modelMapper = require('../../states/mappers/modelMapper')
const lobbyState = require('../../states/lobbyState')
const { LobbyStatus } = require('../../models/lobby')
const jwt = require('jsonwebtoken');
const config = require('../../config')

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

        if (modelMapper.getSocket(username) !== null) { // if the found username already has a socket instance
            ws.send(JSON.stringify({ type: 'handshakeError', message: 'You are already connected.' }));
            console.log(`connected user: ${username} tried to connect again! Denying...`)
            ws.close();
            return;
        }
        
        // Insert the user into the lobby!
        // This also SENDS ALL CONNECTED CLIENTS THE NEW CLIENTS INFO
        lobbyState.handleUserJoin(ws, username, data.lobbyId)
        const lobby = modelMapper.getLobbyFromUser(username);

        // get a list of old usernames to send to the new user
        const oldUsernames = Array.from(lobby.clients).map((client) => {
          if (client != ws) {
            return modelMapper.getUser(client)
          }
        });

        console.log("User successfully authenticated. Websocket connection instantiated")
        ws.send(JSON.stringify({ 
          type: 'handshakeSuccess', 
          messages: modelMapper.getLobby(data.lobbyId).chat,
          oldUsernames: oldUsernames
        }))
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
      const username = modelMapper.getUser(ws);
      const lobbyId = modelMapper.getLobbyId(username)
      const lobby = modelMapper.getLobby(lobbyId);

      // Create a message to send to all clients
      const messagePacket = {
        type: "newMessage",
        username: username,
        message: data.message,
      }

      // Save the message to memory
      lobby.messageSent(username, data.message)
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Some error occured when receiving send message' }));
      console.error("Some error when receiving a message from a client!", err)
      ws.close();
      return;
    }
}

exports.handleStartGame = (ws) => {
  try {
    console.log("got to startGame message handler")
    const username = modelMapper.getUser(ws);
    const lobby = modelMapper.getLobbyFromUser(username);

    // Ensure lobby starter is owner
    if (lobby.owner !== username) {
      console.log("A non owner tried to close a lobby. Denying")
      return
    } else if (lobby.status !== LobbyStatus.PREGAME) {
      console.log("Someone tried to start an already started game")
      return      
    }

    console.log(lobby.status)

    lobby.startGame()
  } catch (err) {
    console.error("Some error occured when trying to start a game", err);
  }
}

exports.handleActionUpdate = (ws, data) => {
  try {
    console.log("got action update on message handler")
    console.log(`target = ${data.target}`)
    const username = modelMapper.getUser(ws);
    const lobby = modelMapper.getLobbyFromUser(username);

    const actionTitle = data.action;
    const target = data.target;

    lobby.actionChange(username, actionTitle, target);
  } catch (err) {
    console.error("Some error occured when receiving action update", err);
  }
}