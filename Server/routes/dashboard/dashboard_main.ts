import express from "express";
import db from "../../database/database.js";
import cloudinary from "../../config/cloudinaryConfig.ts";

type CloudinaryPhotoInformation = {
    cloudinary_id: string; 
}

const router = express.Router();

router.route("/")

.get((req, res) => {
    const ownerID = req.user?.id;

   try {    
        const user = db.prepare("SELECT name FROM property_owners WHERE id =?").get(ownerID); 

        const properties = db.prepare(`SELECT 
            property_list.id,
            property_list.type,
            property_list.city,
            property_list.price,
            property_list.no_bedrooms,
            property_list.no_bathrooms,
            property_list.summary, 
            property_list.date_listed,
            property_photos.photo_path
            FROM property_list
            LEFT JOIN property_photos 
            ON property_photos.property_id = property_list.id 
            AND property_photos.is_main = 1
            WHERE owner_id = ?
            ORDER BY date_listed DESC;
            `)
            .all(ownerID);

        if (properties.length === 0) {
            return res.status(200).json({ user, properties:[], message: "You don't have any properties listed." });
        }
        
        res.status(200).json({ user, properties });
    }

    catch(error) {
        console.log("Error retrieving user's properties: ", error); 
        res.status(500).json({error: "Server Error: The team has been notified."});
    }

})

.delete(async(req, res) => {
    const ownerID = req.user?.id;
    const propID = req.body.propID;
    
    try {

        /* Cloudinary photo deletion V1 code. 
        V2 will put failed deleted photos into a table based on cloudinary_id */

        const propertyPhotosID = db.prepare(`
            SELECT property_photos.cloudinary_id 
            FROM property_photos
            JOIN property_list
            ON property_photos.property_id = property_list.id
            WHERE property_list.id = ? AND property_list.owner_id = ?`).all(propID, ownerID) as CloudinaryPhotoInformation[];
        ;

        const deletePhotos = propertyPhotosID.map((photo => {
            return cloudinary.uploader.destroy(photo.cloudinary_id);
        }))

        const deletionResults = await Promise.allSettled(deletePhotos);

        console.log(deletionResults);
        

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