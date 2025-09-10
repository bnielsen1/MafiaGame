const { Lobby } = require("../models/lobby");

// Generate a lobby instance on server start
let lobbies = new Map();
let idTracker = 0;

// Used to dereference different values
const wsToUsername = new Map();
const usernameToWs = new Map();
const usernameToLobby = new Map();

// Creates a lobby and appends it to lobbies with username as the lobby owner
// returns the lobby id to the lobby created
createLobby = (username, title) => {
    const lobbyId = idTracker
    lobbies.set(lobbyId, new Lobby(username, title, idTracker));
    idTracker += 1; // Increase the id tracker for the next lobby creation
    return lobbyId;
}

deleteLobby = (lobbyId) => {
    lobbies.delete(lobbyId)
}

getSocket = (username) => {
    const ws = usernameToWs.get(username)
    if (!ws) {
        return null
    } else {
        return ws;
    }
}

getUser = (ws) => {
    const username = wsToUsername.get(ws)
    if (!username) {
        return null
    } else {
        return username;
    }
}

getLobbyId = (username) => {
    const lobbyId = usernameToLobby.get(username)
    if (lobbyId == null) {
        return null
    } else {
        return lobbyId;
    }
}

getLobby = (username) => {
    try {
        const lobby = lobbies.get(getLobbyId(username))
        if (lobby != null) {
            return lobby
        } else {
            return null
        }
    } catch (err) {
        return null
    }
}

handleUserJoin = (ws, username, lobbyId) => {
    lobbyId = Number(lobbyId)
    wsToUsername.set(ws, username);
    usernameToWs.set(username, ws);
    usernameToLobby.set(username, lobbyId)

    const lobby = lobbies.get(lobbyId);

    lobby.clients.add(ws)
}

handleUserLeave = (ws) => {
    const username = getUser(ws);
    if (username) { // Only remove the user from variables if they existed to begin with
        const lobbyId = getLobbyId(username);

        wsToUsername.delete(ws)
        usernameToWs.delete(username)
        usernameToLobby.delete(username)

        lobbies.get(lobbyId).clients.delete(ws);
    }
}

module.exports = {
    lobbies,
    getSocket,
    getUser,
    getLobby,
    getLobbyId,
    usernameToLobby, // remove
    handleUserJoin,
    handleUserLeave,
    createLobby,
    deleteLobby
}