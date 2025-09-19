const { Lobby } = require("../models/lobby");
const modelMapper = require("./mappers/modelMapper")

// Used to keep track of lobby IDs
let idTracker = 0;

// Creates a lobby and appends it to lobbies with username as the lobby owner
// returns the lobby id to the lobby created
const createLobby = (username, title) => {
    const lobbyId = idTracker
    modelMapper.insertLobbyEntry(lobbyId, new Lobby(username, title, idTracker));
    idTracker += 1; // Increase the id tracker for the next lobby creation
    return lobbyId;
}

const deleteLobby = (lobbyId) => {
    modelMapper.deleteLobbyEntry(lobbyId);
}

const handleUserJoin = (ws, username, lobbyId) => {
    lobbyId = Number(lobbyId)
    modelMapper.insertSocketToUser(ws, username)
    modelMapper.insertUserToSocket(username, ws)
    modelMapper.insertUserToLobbyId(username, lobbyId);
    const lobby = modelMapper.getLobby(lobbyId);

    lobby.userJoin(ws);
}

const handleUserLeave = (ws) => {
    const username = modelMapper.getUser(ws)
    if (username) { // Only remove the user from variables if they existed to begin with
        const lobby = modelMapper.getLobbyFromUser(username)
        console.log(lobby)
        lobby.clients.delete(ws);

        modelMapper.deleteSocketToUser(ws, username)
        modelMapper.deleteUserToSocket(username, ws)
        modelMapper.deleteUserToLobbyId(username, lobby.lobbyId);
    }
}

module.exports = {
    handleUserJoin,
    handleUserLeave,
    createLobby,
    deleteLobby
}