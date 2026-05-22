import express from "express";
import db from "../../database/database.js";


const router = express.Router();

router.route("/")

.get((req, res) => {
    const ownerID = req.user?.id;

   try {
        const user = db.prepare("SELECT name FROM property_owners WHERE id =?").get(ownerID); 

        const properties = db.prepare(`
            SELECT property_list.*, property_photos.photo_path
            FROM property_list
            LEFT JOIN property_photos 
            ON property_photos.property_id = property_list.id 
            AND property_photos.is_main = 1
            WHERE owner_id = ?
            ORDER BY date_listed DESC;
            `)
            .all(ownerID);

        if (properties.length === 0) {
            return res.status(200).json({ user, message: "You don't have any properties listed." });
        }
        
        res.status(200).json({ user, properties });
    }

    catch(error) {
        console.log("Error retrieving user's properties: ", error); 
        res.status(500).json({error: "Server Error: The team has been notified."});
    }

})

.delete((req, res) => {
    const ownerID = req.user?.id;
    const propID = req.body.propID;
    
    try {
        const deleteProperty = db.prepare(`DELETE FROM property_list WHERE id = ? AND owner_id = ?`);
        const result = deleteProperty.run(propID, ownerID);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Property not found." });
        }
        
        res.status(200).json({ message: "Property deleted successfully." });
    }

    catch(error) {
        console.log("Error deleting user's property: ", error); 
        res.status(500).json({error: "Server Error: The team has been notified."});        
    }

});

export default router;