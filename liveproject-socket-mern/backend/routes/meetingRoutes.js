const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting");
const axios = require("axios");
//create meeting

router.post("/create", async (req, res) => {
    try {
        const { title } = req.body;
        const roomName = "metting-" + Date.now();
        const dailyres = await axios.post(
            "https://api.daily.co/v1/rooms",
            {
                name: roomName,
                privacy: "public",
                properties: {
                    enable_chat: true,
                    start_video_off: false,
                    start_audio_off: false
                }
            },

            {
                headers: {
                    Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const meeting = await Meeting.create({
            title,
            roomName: dailyres.data.name,
            roomUrl: dailyres.data.url
        });
        res.json(meeting);
    } catch (err) {
        console.error(err);
    }
});

// view meeting
router.get("/", async (req, res) => {
    const meetings = await Meeting.find();
    res.json(meetings);
});

module.exports = router;