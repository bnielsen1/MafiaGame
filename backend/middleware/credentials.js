

const credentials = (req, res, next) => {
    // FOR FUTURE MAKE SURE THE USER IS ON CORS WHITELIST BEFORE SETTING HEADER
    res.header('Access-Control-Allow-Credentials', true)
    next();
}

module.exports = credentials;