const mongoose = require("mongoose");

const locationschema = new mongoose.Schema(
    {
        userName: {
            type: String,
            default:"Guest User"
        },
        latitude: {
            type: Number,
            required:true
        },
        longitude: {
            type: Number,
            required:true
        },
        accuracy: {
            type: Number,
            default:0,
        },
        
    },
    { timestamps: true }
);
module.exports = mongoose.model("Location", locationschema);