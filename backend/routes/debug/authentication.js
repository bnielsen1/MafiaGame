const express = require('express');
const router = express.Router();
const debugAuth = require('../../controllers/debug/debugAuth')

const verifyJWT = require('../../middleware/verifyJWT')

router.get('/me', verifyJWT, debugAuth.getMe)
router.get('/public', debugAuth.getPublicContent)
router.get('/private', verifyJWT, debugAuth.getPrivateContent)

module.exports = router;