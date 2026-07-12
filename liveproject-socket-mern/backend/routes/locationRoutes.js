const express = require("express");
const router = express.Router();

const Location = require("../models/Location");

//create

router.post("/save", async (req, res) => {
    try {
        const { userName, latitude, longitude, accuracy } = req.body;
        const location = await Location.create({
            userName,
            latitude,
            longitude,
            accuracy,
        });
        res.json({
            location,
        });

    } catch (err) {
        console.error(err);
    }
})


router.get("/all", async (req, res) => {
    try {
        
        const location = await Location.find();
        res.json( location);

    } catch (err) {
        console.error(err);
    }
})


router.get("/latest", async (req, res) => {
    try {
        
        const location = await Location.findOne();
        res.json(location);

    } catch (err) {
        console.error(err);
    }
});

module.exports = router;