import express from "express";
import db from "../../database/database.js";

type UserData = {
    id: number;
};

const router = express.Router();

router.route("/:username/:id")

.get((req, res) => {
    const { username, id } = req.params;

    const user = db.prepare(`SELECT id, username, name FROM property_owners WHERE id = ? AND username = ?`).get(id, username);

    if (!user) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }

    const properties = db.prepare(`
        SELECT property_list.*, property_photos.photo_path
        FROM property_list
        LEFT JOIN property_photos 
        ON property_photos.property_id = property_list.id 
        AND property_photos.is_main = 1
        WHERE owner_id = ?
        ORDER BY date_listed DESC;
        `)
        .all(id);

    if (properties.length === 0) {
        return res.status(404).json({ error: "You don't have any properties listed." });
    }

    res.status(200).json({ user, properties });
})

.delete((req, res) => {
    const { username, id } = req.params;    
    const propID = req.body.propID;
    
    const user = db.prepare(`SELECT id FROM property_owners WHERE id = ? AND username = ?`).get(id, username) as UserData;

    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }

    const deleteProperty = db.prepare(`DELETE FROM property_list WHERE id = ? AND owner_id = ?`);
    const result = deleteProperty.run(propID, user.id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Property not found or you do not have permission to delete this property." });
    }
    res.status(200).json({ message: "Property deleted successfully." });
});

export default router;