const { LobbyManager, Lobby } = require("../models/lobby");

const lobbyManager = new LobbyManager();
lobbyManager.lobbies.set(0, new Lobby())
const clientMap = new Map();

// Get username and lobbyId from websocket
getUserInfo = (ws) => {
    const pair = clientMap.get(ws);
    if (!pair) throw new Error("User not found in database!")
    const lobby = lobbyManager.lobbies.get(pair[1]);
    return { username: pair[0], lobby: lobby };
}

module.exports = {
    lobbyManager,
    clientMap,
    getUserInfo,
}