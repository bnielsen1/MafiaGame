
const { LobbyManager, Lobby } = require('../models/lobby')
const lobbyState = require('../states/lobbyState')
const modelMapper = require('../states/mappers/modelMapper')

exports.getLobbies = (req, res) => {
    const lobbies = Array.from(modelMapper.getLobbies()) // Returns lobby objects
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