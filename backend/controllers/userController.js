const users = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.getUsers = async (req, res) => {
    try {
        const userData = await users.find()
        console.log(userData)
        res.status(200).json(userData)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }	
}

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "username, email, and password are required" })

    // check for dupliacte entries in the database
    const duplicateUser = await users.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (duplicateUser) return res.status(409).json({ message: 'Username or email already exists!'})
    try {
        // encrypt our password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // store the new user
        const newUser = new users({
            username: username,
            email: email,
            password: hashedPassword
        })
        newUser.save()
        console.log(newUser)
        res.status(201).json({ message: `New user ${username} created!`})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

exports.handleLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" })

    // Check if we have any users registered with the given email
    const foundUser = await users.findOne({
        email: email
    })
    if (!foundUser) return res.status(401).json({ message: 'Email does not exist under a registered user...' })

    // evaluate password
    const match = await bcrypt.compare(password, foundUser.password)
    if (match) {
        // Create JWTs
        const accessToken = jwt.sign(
            { "username": foundUser.username },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            config.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Save refresh token with user
        foundUser.refreshToken = refreshToken;
        foundUser.save() // maybe add await here if things are breaking

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 }) // lives 1d
        res.json({ 
            message: `User ${foundUser.username} | ${foundUser.email} is now logged in!`,
            accessToken
        });
    } else {
        res.status(401).json({ message: 'Password is incorrect. Please try again.'});
    }
}