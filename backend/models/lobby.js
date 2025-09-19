const modelMapper = require('../states/mappers/modelMapper')
const sendHandlers = require('../sockets/handlers/sendHandlers')
const { Player, generatePlayers } = require('./roles')

const LobbyStatus = Object.freeze({
    PREGAME: 'pregame',
    INGAME: 'ingame',
    POSTGAME: 'postgame'
});

class Group {
  constructor(players) {
    this.chat = [];
    this.players = players; // Stores player usernames in the group
    this.votes = [];
  }
}

class Phase {
  constructor(number, dayTime, players, groups) {
    this.groups = groups;
    this.number = number;
    this.dayTime = dayTime;
    this.players = players; // Stores alive player usernames -> group map
  }
}

class Gamestate {
  constructor(settings, players, phases) {
    this.phases = phases; // Treat as stack
    this.players = players; // Stores a map from username -> Player object
    this.settings = settings;
    this.timer = null; // stores the actual timer object
    this.startTime = null; // stores a date time to transmit in progress time data to users
  }
}

class Lobby {
  constructor(owner, title, lobbyId) {
    this.owner = owner;
    this.title = title;
    this.status = LobbyStatus.PREGAME;
    this.lobbyId = lobbyId;
    this.clients = new Set();
    this.settings = null;
    this.chat = [];

    this.gamestate = null;
  }

  /*
  BEGIN LOBBY FUNCTIONS
    Lobby functions are usually called from a sockets/handlers/receiveHandler
    The sending of any data via sockets should be handled in a sockets/handlers/sendHandler
  */
  userJoin(ws) {
    // get list of sockets that doesnt include the new user
    const oldClients = Array.from(this.clients)

    this.clients.add(ws) // add the socket to the clients list

    // send new client info to all users
    sendHandlers.transmitUserJoin(oldClients, ws)
  }
  startGame() {
    // console.log(`Status before ${this.status}`)
    this.status = LobbyStatus.INGAME;
    // console.log(`Status should now be ${this.status}`)
    // console.log("in startGame() function from lobby class")

    // Now generate the game based on settings variable
    // Since no settings yet, a basic game is generated here. CHANGE LATER

    // Create player objects (This selects roles as well)
    const players = generatePlayers(Array.from(this.clients));

    // Create the group and a map of usernames -> group
    let group = new Group(Array.from(players.keys()));
    const playerGroupMap = new Map();
    players.keys().forEach((player) => {
      playerGroupMap.set(player, group)
    })
    
    // Generate starting phase
    let phase = new Phase(1, true, playerGroupMap, [group]);

    // Generate gamestate
    this.gamestate = new Gamestate(null, players, [phase]);

    // Refresh action selection options for each player
    Array.from(this.gamestate.players.values()).forEach((player) => {
      player.role.refreshActions(this.gamestate, player.username)
    })

    // Send this updated state to the users
    sendHandlers.transmitStartGame(this.gamestate)

    // Start the timer to begin new phases
    setTimeout(() => {
      this.nextPhase()
    }, 1000 * 10)
  }
  nextPhase() {
    console.log("next phase function ran")

    const currentPhase = this.gamestate.phases[this.gamestate.phases.length - 1];
    // Handle vote data IMPLEMENT LATER
    // We are assuming the case of no vote every time until voting implemented
    // Update all the player objects located in gamestate.players based off the vote

    // Generate groups
    const isDay = !currentPhase.dayTime; // if the new phase should be day or night
    const newGroups = [];
    const livingPlayers = new Map();
    console.log("Are we day?")
    console.log(isDay)
    if (isDay) {
      const globalGroup = new Group([]);
      Array.from(this.gamestate.players.values()).forEach((playerObject) => {
        if (!playerObject.alive) {
          return;
        }
        else {
          livingPlayers.set(playerObject.username, globalGroup);
        }
      })
      globalGroup.players = Array.from(livingPlayers.keys());
      newGroups.push(globalGroup);
      console.log(`Player list from daytime`)
      console.log(newGroups[0].players)
    } else {
      const mafiaPlayers = [];
      Array.from(this.gamestate.players.values()).forEach((playerObject) => {
        if (!playerObject.alive) {
          return;
        }

        if (playerObject.role.title === "mafia") { // Update once new role system is in place!
          mafiaPlayers.push(playerObject.username);
        } else {
          const singleGroup = new Group([playerObject.username])
          newGroups.push(singleGroup);
          livingPlayers.set(playerObject.username, singleGroup);
        }
      })
      const mafiaGroup = new Group(mafiaPlayers);
      newGroups.push(mafiaGroup);
      mafiaPlayers.forEach((username) => {
        livingPlayers.set(username, mafiaGroup);
      })
    }

    // Generate new phase off previous phase and new group data
    let newPhase = null;
    if (isDay) {
      newPhase = new Phase(currentPhase.number + 1, true, livingPlayers, newGroups);
    } else {
      newPhase = new Phase(currentPhase.number, false, livingPlayers, newGroups);
    }

    // insert the phase into the gamestate
    this.gamestate.phases.push(newPhase);

    // Refresh action selection options for each player
    Array.from(this.gamestate.players.values()).forEach((player) => {
      player.role.refreshActions(this.gamestate, player.username)
    })

    // Start a new timer
    setTimeout(() => {
      this.nextPhase()
    }, 1000 * 10)

    // Transmit the new info to users
    sendHandlers.transmitNewPhase(this.gamestate)
  }
  getSockets() {
    return this.clients // array form of client list
  }
  messageSent(username, message) {
    if (this.status === LobbyStatus.PREGAME) {
      // console.log(`Pregame message sent! username: ${username} contents: ${message}`)
      // Send messages to lobby chat
      this.chat.push({
        username,
        message
      })

      // Broadcast to all since pregame is public to all users
      sendHandlers.transmitNewMessage(username, message, this.clients)

    } else if (this.status = LobbyStatus.INGAME) {
      // Send message to group linked to player
      const latestPhase = this.gamestate.phases[this.gamestate.phases.length - 1]; // Get latest phase
      const group = latestPhase.players.get(username) // Find group corresponding to username
      group.chat.push(message) // Insert the message into that group

      // Broadcast to only those on the group
      const groupClients = group.players.map((player) => {
        console.log(`Grabbing socket of username ${player}`)
        return modelMapper.getSocket(player);
      })
      console.log("Group clients")
      console.log(groupClients)
      sendHandlers.transmitNewMessage(username, message, groupClients)
    } else {
      console.log("Got to incomplete state")
    }
  }
  actionChange(username, actionTitle, target) {
    const playerObject = this.gamestate.players.get(username);
    const action = playerObject.role.actions.find((action) => action.title === actionTitle);
    action.selectTarget(target); // update the users selected target

    sendHandlers.transmitActionUpdate(this.gamestate, username, action.title, action.target);
  }
  getHistory() {
    return this.chat;
  }
}

module.exports = {
  Lobby,
  LobbyStatus
}