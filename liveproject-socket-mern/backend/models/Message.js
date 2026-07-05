const mongoose = require("mongoose");

const messageschema = new mongoose.Schema(
    {
        sender: String,
        receiver: String,
        text: String
        
    },
    { timestamps: true }
);
module.exports = mongoose.model("Message", messageschema);