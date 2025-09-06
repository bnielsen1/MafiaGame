const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "Unauthorized request" })
    
    console.log(authHeader) // Bearer token
    const token = authHeader.split(' ')[1] // split string based on spaces and take second element (the token)
    jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'received some sort of invalid token data' })
            req.username = decoded.username; // pass username to request so future middleware can use it
            next();
        }
    )
}

module.exports = verifyJWT;