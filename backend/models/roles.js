const modelMapper = require('../states/mappers/modelMapper')

const roleList = new Map();

roleList.set("villager", "town");
roleList.set("mafia", "mafia");

class Player {
  constructor(username) {
    this.username = username;
    this.alive = true;
    this.role = null;
  }

  serializeMainPlayer(player) {
    // Create json data for actions
    var actionsJSON = [];
    player.role.actions.forEach((action) => {
        actionsJSON.push({
            title: action.title,
            target: null,
            targets: action.targets
        })
    })

    // Create role json data
    const roleJSON = {
        title: player.role.title,
        actions: actionsJSON
    }

    return {
        username: player.username,
        alive: player.alive,
        role: roleJSON,
    }
  }

  serializeOtherPlayer(player, mainPlayer) {
    console.log(`Serializing player: ${player.username} from perspective ${mainPlayer.username}`)

    // Create json data for actions
    var actionsJSON = [];
    var justVoteJSON = [];
    player.role.actions.forEach((action) => {
        console.log(`Processing action: ${action.title}`)
        actionsJSON.push({
            title: action.title,
            target: action.target,
            targets: null
        })
        if (action.title === "vote") {
            justVoteJSON.push({
                title: action.title,
                target: action.target,
                targets: null,
            })
        }
    })

    console.log("Logging actions json after finished!")
    console.log(actionsJSON)
    console.log(justVoteJSON)

    // Instantiate role info
    var roleJSON;

    // check if the players role should be revealed
    const sameAlignment = roleList.get(player.role.title) === roleList.get(mainPlayer.role.title)
    const isMaf = roleList.get(player.role.title) === "mafia"
    if (sameAlignment && isMaf) {
      roleJSON = {
        title: player.role.title,
        actions: actionsJSON
      }
    } else { // LATER HANDLE CASE WHERE USER IS DEAD AND MIGHT NEED RR
      roleJSON = {
        title: null, // keep role information hidden
        actions: justVoteJSON // just send vote data 
      }
    }

    console.log("Logging role json")
    console.log(roleJSON);

    return {
        username: player.username,
        alive: player.alive,
        role: roleJSON
    }
  }
}

class Action {
  constructor(title) {
    this.title = title;
    this.target = null;
    this.targets = [];
  }

  execute(gamestate) {
    console.log("Called execute on an action that doesn't support an execute!!!")
  }

  selectTarget(target) {
    if (this.targets.at(target)) {
      this.target = target;
    } else {
      this.target = null;
    }
  }

  deselectTarget() {
    this.target = null;
  }

  getTargets() {
    return this.targets;
  }
}

class ActionVote extends Action {
  constructor(gamestate) {
    super("vote")
    
    // update target list
    Array.from(gamestate.players.keys()).forEach((player) => {
      this.targets.push(player);
    })
  }
}

class ActionMafiaKill extends Action {
  constructor(gamestate, actor) {
    super("mafiaKill")

    Array.from(gamestate.players.values()).forEach((playerObject) => {
      if (actor === playerObject.username) {
        return;
      } else if (playerObject.role.faction === "mafia") {
        return;
      } else {
        this.targets.push(playerObject.username);
      }
    })
  }
}

class Role {
  constructor(title) {
    this.title = title;
    this.actions = []; // stores an array of action objects that are currently accessible to the player
  }

  refreshActions(gamestate, username) {
    this.actions = [];
    console.log(`Updating actions for user ${username}`)
   
    const phase = gamestate.phases[gamestate.phases.length - 1] // current phase
    console.log(`state at time: ${phase.dayTime} number: ${phase.number}`)
    if (phase.dayTime) {
      console.log("Added vote action and logging actions")
      this.actions.push(new ActionVote(gamestate))
      console.log(this.actions)
    } else { // Night
      if (roleList.get(this.title) === "mafia") { // get faction of role
        console.log("added kill action and logging actions")
        this.actions.push(new ActionMafiaKill(gamestate, username))
        console.log(this.actions)
      }
    }
  }
}

const generatePlayers = (clients) => { // future iterations should pass a settings variable
    const players = new Map();
    // const playerCount = clients.length;
    clients.forEach((client, index) => {
        const username = modelMapper.getUser(client)
        let player = new Player(username)
        if (((index + 2) % 3) === 0) { // Second player to join is mafia. every 3rd player after that
          player.role = new Role("mafia")
        } else {
          player.role = new Role("villager")
        }
        players.set(username, player);
    })

    return players;
}

module.exports = {
    Player,
    generatePlayers
}