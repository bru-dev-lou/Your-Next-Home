import express from 'express';
import db from "../../database/database.js";

import cloudinary from '../../config/cloudinaryConfig.js';
import upload from "../../config/multerConfig.js";


type PropertyData = {
    id: number;
    type: string;
    city: string;
    price: number;
    no_bedrooms: number;
    no_bathrooms: number;
    size: number;
    furniture: string;
    summary: string;
    owner_id: number;
    date_listed: string;
    detail: string;
};

type CloudinaryResult = {
    secure_url: string;
};

const router = express.Router();

router.route("/:propID")

.get((req, res) => {
    const propID = req.params.propID;
    const ownerID = req.user?.id;

    try {
        const SQLShow = db.prepare(`SELECT * FROM property_list WHERE owner_id = ? AND id = ?`).get(ownerID, propID) as PropertyData;
        
        if (!SQLShow) {
            return res.status(404).json({ errorProp: "Property not found." });
        }

        const SQLPhotos = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
        
        if (SQLPhotos.length === 0) {
            return res.status(200).json({ property: SQLShow, photos: SQLPhotos, errorPhotos: "No photos found for this property." });
        }

        res.status(200).json({ property: SQLShow, photos: SQLPhotos});
    }

    catch (error) {
        console.error("Error while retrieving property in edit page: ", error);
        return res.status(500).json({ error: "Server Error: The team has been notified." });
    }
})

.patch ((req, res) => {
    const propID = req.params.propID;
    const ownerID = req.user?.id;
    const {type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, detail} = req.body;
    
    try {
        const fieldCheck = [
            { field: city, error: "Please state where your property is located." },
            { field: type, error: "Please choose a property type." },
            { field: price, error: "Please state the property's monthly rental rate." },
            { field: no_bedrooms, error: "Please state how many bedrooms your property has." },
            { field: no_bathrooms, error: "Please state how many bathrooms your property has." },
            { field: size, error: "Please state the size of your property in m²." },
            { field: furniture, error: "Please choose your property's type of furnishing." },
            { field: summary, error: "Please provide a summary of your property." },
            { field: detail, error: "Please provide a detailed description of your property." } 
        ];
        
        for (const {field, error} of fieldCheck) {
            if (!field) {
                return res.status(400).json({error});
            }
        }
        
        if (summary.split(/\s+/).filter(Boolean).length > 50) {
            return res.status(400).json({ error: "Summary cannot exceed 50 words." });
        }

        if (detail.split(/\s+/).filter(Boolean).length > 250) {
            return res.status(400).json({ error: "Detailed description cannot exceed 250 words." });
        }

        db.prepare(`UPDATE property_list SET type = ?, city = ?, price = ?, no_bedrooms = ?, no_bathrooms = ?, size = ?, furniture = ?, summary = ?, detail = ? WHERE id = ? AND owner_id = ?`)
        .run(type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, detail, propID, ownerID);
        
        return res.status(200).json({ message: "Property updated successfully!" });
    }
    
    catch (error) {
        console.error("Error while updating property's details: ", error);
        return res.status(500).json({ error: "Server Error: The team has been notified." });
    }
})

.post (upload.array('photos', 10), async (req, res) => {
    const propID  = req.params.propID;
    const files = req.files as Express.Multer.File[]; 

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No photos have been selected." });
        }

        const SQLAddPhoto = db.prepare(`INSERT INTO property_photos (property_id, photo_path) VALUES (?, ?)`);
        
        for (const file of files) {
            const result = await new Promise<CloudinaryResult>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: 'new_property_photos' }, (error, result) => {
                    if (error || !result) reject(error);
                    else resolve(result);
                }).end(file.buffer);
            });   
            SQLAddPhoto.run(propID, result.secure_url);
        }

        db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(propID);

        if (files.length === 1) {
            const SQLPhotosUpdated = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
            return res.status(201).json({ message: "Photo added successfully!", newPhotos: SQLPhotosUpdated });
        }

        else if (files.length > 1 && files.length <=10) {
            const SQLPhotosUpdated = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
            return res.status(201).json({ message: "Photos added successfully!", newPhotos: SQLPhotosUpdated });
        }

        else {
            return res.status(400).json({ error: "Failed to add photos." });
        }
    }

    catch (error) {
        console.error("Error while adding property photos: ", error);
        return res.status(500).json({ error: "Server Error: The team has been notified." });
    }

})

.delete((req, res) => {
    const propID = req.params.propID;
    const {photoID, photo_path} = req.body;
    
    try {
        const SQLDeletePhotos = db.prepare(`DELETE FROM property_photos WHERE id = ? AND property_id = ? AND photo_path = ?`).run(photoID, propID, photo_path);

        if (SQLDeletePhotos.changes > 0) {
            db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(propID);
            return res.status(204).send();
        }

        else {
            return res.status(400).json({error:  "Failed to delete photo. Please try again."});
        }
    }
    
    catch (error) {
        console.error("Error while deleting property's photos: ", error);
        return res.status(500).json({ error: "Server Error: The team has been notified." });
    }
})



export default router;