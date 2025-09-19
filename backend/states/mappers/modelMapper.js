
/*
Lobby related maps, getters, and setters
*/

const wsToUsername = new Map();
const usernameToWs = new Map();
const usernameToLobbyId = new Map();
const lobbyIdToLobby = new Map();

const getLobbies = () => {
    return lobbyIdToLobby.values();
}

const getLobbyIds = () => {
    return lobbyIdToLobby.keys();
}

const getSocket = (username) => {
    const ws = usernameToWs.get(username)
    if (!ws) {
        return null
    } else {
        return ws;
    }
}

const getUser = (ws) => {
    const username = wsToUsername.get(ws)
    if (!username) {
        return null
    } else {
        return username;
    }
}

const getLobbyId = (username) => {
    const lobbyId = usernameToLobbyId.get(username)
    if (lobbyId == null) {
        return null
    } else {
        return lobbyId;
    }
}

const getLobby = (lobbyId) => {
    const lobby = lobbyIdToLobby.get(Number(lobbyId))
    if (lobby != null) {
        return lobby
    } else {
        return null
    }
}

const getLobbyFromUser = (username) => {
    try {
        const lobbyId = getLobbyId(username);
        const lobby = lobbyIdToLobby.get(lobbyId);
        if (lobby != null) {
            return lobby
        } else {
            return null
        }
    } catch (err) {
        return null
    }
}

const insertLobbyEntry = (lobbyId, lobby) => {
    lobbyIdToLobby.set(lobbyId, lobby);
}

const deleteLobbyEntry = (lobbyId) => {
    lobbyIdToLobby.delete(lobbyId);
}

const insertUserToSocket = (username, socket) => {
    usernameToWs.set(username, socket)
}

const deleteUserToSocket = (username) => {
    usernameToWs.delete(username)
}

const insertUserToLobbyId = (username, lobbyId) => {
    usernameToLobbyId.set(username, lobbyId)
}

const deleteUserToLobbyId = (username) => {
    usernameToLobbyId.delete(username)
}

const insertSocketToUser = (socket, username) => {
    wsToUsername.set(socket, username)
}

const deleteSocketToUser = (socket) => {
    wsToUsername.delete(socket)
}

module.exports = {
    getLobbies,
    getLobbyIds,
    getSocket,
    getUser,
    getLobbyId,
    getLobbyFromUser,
    getLobby,
    insertLobbyEntry,
    deleteLobbyEntry,
    insertUserToSocket,
    deleteUserToSocket,
    insertUserToLobbyId,
    deleteUserToLobbyId,
    insertSocketToUser,
    deleteSocketToUser
}