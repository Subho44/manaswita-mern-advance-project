const mongoose = require("mongoose");

const postschema = new mongoose.Schema(
    {
        title: String,
        likes: Number,
        shares: Number,
        comments: [
            { text: String }
        ]
    },
    { timestamps: true }
);
module.exports = mongoose.model("Post", postschema);