const users = require('../models/users')
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: "cookie or jwt not found!" })

    const refreshToken = cookies.jwt;

    // Check if we have any users registered with the given email
    const foundUser = await users.findOne({
        refreshToken: refreshToken
    })
    if (!foundUser) return res.status(403).json({ message: 'Refresh token does match a registered user...' })
    console.log('cookie token corresponds to: ' + foundUser.username);
    
    // evaluate jwt
    jwt.verify(
        refreshToken,
        config.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username) return res.status(403).json({ message: "err/username didnt align" })
                const accessToken = jwt.sign(
                    { "username": decoded.username },
                    config.ACCESS_TOKEN_SECRET,
                    { expiresIn: '30s' }
                )
                res.json({ accessToken })
        }
    )
}

exports.handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(204).json({ message: "Already logged out cause no cookies :O" })
    const refreshToken = cookies.jwt;

    // Check if we have any users registered with the given email
    const foundUser = await users.findOne({
        refreshToken: refreshToken
    })
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.status(204).json({ message: 'Invalid jwt so  deleting it' })
    }

    // Delete refreshToken from database
    foundUser.refreshToken = null // remove it from the database
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }) // clear it for the user
    res.status(204).json({ message: 'successfully logged out!!!'})
}