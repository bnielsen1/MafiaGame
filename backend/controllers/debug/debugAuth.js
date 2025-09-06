

exports.getPrivateContent = (req, res) => {
    return res.json({ message: "This content is only for logged in users ;)" })
}

exports.getPublicContent = (req, res) => {
    return res.json({ message: "This content is for anyone! :O" })
}

// Authenticated route, only get here if logged in
exports.getMe = (req, res) => {
    return res.status(200).json({ message: "you're logged in!" })
}