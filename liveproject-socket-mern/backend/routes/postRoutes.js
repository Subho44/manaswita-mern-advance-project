const express = require("express");
const router = express.Router();

const Post = require("../models/Post");

//create
router.post("/create", async (req, res) => {
    try {
        const post = await Post.create({
            title: req.body.title
        });
        res.json(post);
    } catch (err) {
        console.log(err);
    }
})

//view
router.get("/", async (req, res) => {
    try {
        const post = await Post.find();
        res.json(post);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;