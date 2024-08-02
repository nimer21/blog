const mongoose = require("mongoose");

module.exports = async (req, res, next) => {
    try {
        await mongoose.connect(process.env.MONGO_CLOUD_URI); //MONGO_URI
        console.log("Connected to MongoDB ^_^");

    } catch (error) {
        console.log("Connection Failed To MongoDB!"+error);
    }
}