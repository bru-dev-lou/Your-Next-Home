import express from "express";
import db from "../../database/database.ts";

const router =  express.Router(); 

router.route("/:username/:ownerID")

.get((req, res) => {
    const { username, ownerID } = req.params;

    const user = db.prepare("SELECT id, username FROM property_owners WHERE username = ? AND id = ?").get(username, ownerID);

    if (!user) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }

    const favProperties = db.prepare (`
        SELECT property_favorites.*, property_photos.photo_path
        FROM property_list
        ON property_list.id `)

})