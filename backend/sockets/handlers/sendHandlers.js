const modelMapper = require('../../states/mappers/modelMapper')

exports.transmitUserJoin = (otherClients, ws) => {
  const username = modelMapper.getUser(ws);

  const newUserPacket = {
    type: "newUser",
    username: username
  };

  otherClients.forEach((client) => {
    if (ws.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(newUserPacket));
    }
  })
}

exports.transmitNewPhase = (gamestate) => {
    gamestate.players.forEach((player) => { // player is a Player object found in lobby model
      const ws = modelMapper.getSocket(player.username)

      const newPhase = gamestate.phases[gamestate.phases.length - 1] // Grab the latest phase object
      const phaseJSON = {
        number: newPhase.number,
        dayTime: newPhase.dayTime,
        timer: (1000 * 10)
      }
      
      // create data to trasmit about player to all other players
      const playersJSON = Array.from(gamestate.players.values()).map((otherPlayer) => {
        if (otherPlayer.username === player.username) {
          return otherPlayer.serializeMainPlayer(otherPlayer);
        } else {
          return otherPlayer.serializeOtherPlayer(otherPlayer, player);
        }
      })
      
      const packet = {
        type: "newPhase",
        phase: phaseJSON,
        players: playersJSON
      }

      if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(packet));
      }
    })
}

exports.transmitStartGame = (gamestate) => {
    gamestate.players.forEach((player) => { // player is a Player object found in lobby model
      const ws = modelMapper.getSocket(player.username)

      const phase = gamestate.phases[0]; // Only one phase object at the beginning of the game
      const phaseJSON = {
        number: phase.number,
        dayTime: phase.dayTime,
        timer: (1000 * 10)
      }
      
      // create data to trasmit about player to all other players
      const playersJSON = Array.from(gamestate.players.values()).map((otherPlayer) => {
        if (otherPlayer.username === player.username) {
          return otherPlayer.serializeMainPlayer(otherPlayer);
        } else {
          return otherPlayer.serializeOtherPlayer(otherPlayer, player);
        }
      })
      
      const packet = {
        type: "startGame",
        phase: phaseJSON,
        players: playersJSON
      }
      
      if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(packet));
      }
    })
}

exports.transmitNewMessage = (username, message, clients) => {
    const messagePacket = {
      type: "newMessage",
      username: username,
      message: message,
    }

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messagePacket));
        }
    })
}

exports.transmitActionUpdate = (gamestate, username, actionType, target) => {
  const phase = gamestate.phases[gamestate.phases.length - 1] // latest phase
  const group = phase.players.get(username) // group that the user who updated the action is in

  const actionUpdatePacket = {
    type: "actionUpdate",
    username: username,
    action: actionType,
    target: target
  }

  console.log("Attempting to transmit packet data for action update")
  group.players.forEach((playerUsername) => {
    console.log(`Transmitting to user ${playerUsername}`)
    const client = modelMapper.getSocket(playerUsername);
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(actionUpdatePacket))
    }
  })
}