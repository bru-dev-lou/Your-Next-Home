import express from "express";
import db from "../../database/database.js";

const router= express.Router();

router.post("/", (req, res) => {
    const ownerID = req.user?.id;
    const propID = req.body.propID;

    try {
        const SQL = "INSERT INTO property_favorites (owner_id, property_id) VALUES (?, ?)";
        const addFavProperty = db.prepare(SQL).run(ownerID, propID); 

        if(addFavProperty.changes === 0) {
            console.log("Insert returned 0 changes", {ownerID, propID});
            return res.status(500).json({error: "Server Error: The team has been notified."});
        }
        
        else {
            return res.status(201).json({message: "Property added to favorites."});
        }
    }

    catch(error) {
        console.log(error)
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

router.delete("/", (req, res) => {
    const ownerID = req.user?.id;
    const propID = req.body.propID;

    try {
        const SQL = "DELETE FROM property_favorites WHERE owner_id = ? AND property_id = ?";
        const removeFavProperty = db.prepare(SQL).run(ownerID, propID);

        if (removeFavProperty.changes === 0) {
            console.log("Delete returned 0 changes", {ownerID, propID});
            return res.status(500).json({error: "Server Error: The team has been notified."});
        }

        else {
            return res.status(204).send();
        }
    }

    catch (error) {
        console.log(error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

export default router; 