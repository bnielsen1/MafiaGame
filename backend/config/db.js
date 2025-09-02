const mongoose = require("mongoose")
const config = require('../config.js')

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@mafia.4v1by91.mongodb.net/?retryWrites=true&w=majority&appName=Mafia`,
            { dbName: "mafiadb" }
        );
        console.log('Connected to mafiadb via mongoose')
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDB;