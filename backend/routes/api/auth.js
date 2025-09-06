const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController')
const refreshTokenController = require('../../controllers/refreshTokenController')
const verifyJWT = require('../../middleware/verifyJWT')

// Begin registering routes for /api/auth
router.get("/getUsers", verifyJWT, userController.getUsers);
router.post("/register", userController.registerUser);
router.post("/login", userController.handleLogin);
router.get("/refresh", refreshTokenController.handleRefreshToken)
router.get("/logout", refreshTokenController.handleLogout)

module.exports = router;