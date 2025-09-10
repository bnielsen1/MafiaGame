
const { LobbyManager, Lobby } = require('../models/lobby')
const lobbyState = require('../sockets/lobbyState')

exports.getLobbies = (req, res) => {
    const lobbies = Array.from(lobbyState.lobbies.values()) // Returns lobby objects
    let lobbyResponse = []
    lobbies.forEach((lobby) => {
        lobbyResponse.push({
            owner: lobby.owner,
            title: lobby.title,
            lobbyId: lobby.lobbyId
        })
    })

    res.json({ lobbies: lobbyResponse })
}

exports.createLobby = (req, res) => {
    const { title } = req.body;

    const lobbyId = lobbyState.createLobby(req.username, title)
    res.json({ lobbyId: lobbyId })
}