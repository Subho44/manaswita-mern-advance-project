const mongoose = require("mongoose");

const mettingschema = new mongoose.Schema(
    {
        title: String,
        roomName: String,
        roomUrl: String
        
    },
    { timestamps: true }
);
module.exports = mongoose.model("Meeting", mettingschema);