const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT')
const lobbyController = require('../../controllers/lobbyController')

router.get('/', verifyJWT, lobbyController.getLobbies);
router.post('/', verifyJWT, lobbyController.createLobby);

module.exports = router;