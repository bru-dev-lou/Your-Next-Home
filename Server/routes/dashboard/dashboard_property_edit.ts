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
        const SQLPropertyData = db.prepare(`SELECT * FROM property_list WHERE owner_id = ? AND id = ?`).get(ownerID, propID) as PropertyData;

        if (!SQLPropertyData) {
            return res.status(404).json({ errorProperty: "Property not found." });
        }

        const SQLPropertyPhotos = db.prepare(`SELECT 
            property_photos.id,
            property_photos.property_id,
            property_photos.photo_path
            FROM property_photos 
            WHERE property_id = ?`).all(propID)
        ;

        if (SQLPropertyPhotos.length === 0) {
            return res.status(200).json({ property: SQLPropertyData, photos: SQLPropertyPhotos, errorPhotos: "No photos found for this property." });
        }

        res.status(200).json({ property: SQLPropertyData, photos: SQLPropertyPhotos});
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

    // Empty field checks
    
    const fieldCheck = [
        { field: city, name: "city", error: "Please state where your property is located." },
        { field: type, name: "type", error: "Please choose a property type." },
        { field: price, name: "price", error: "Please state the property's monthly rental rate." },
        { field: no_bedrooms, name: "bedrooms", error: "Please state how many bedrooms your property has." },
        { field: no_bathrooms, name: "bathrooms", error: "Please state how many bathrooms your property has." },
        { field: size, name: "size", error: "Please state the size of your property in m²." },
        { field: furniture, name: "furniture", error: "Please choose your property's type of furnishing." },
        { field: summary, name: "summary", error: "Please provide a summary of your property." },
        { field: detail, name: "description", error: "Please provide a description of your property." } 
    ];
    
    for (const {field, name, error} of fieldCheck) {
        if (!field) {
            return res.status(400).json({name, error});
        }
    }
    
    // City validation 

    const validCity = /^[a-zA-Z\-]+$/.test(city); 

    if (!validCity) {
        return res.status(400).json({ error: "City name must only include letters and hyphens."})
    }
    
    //  Property summary & description validations

    if (summary.split(/\s+/).filter(Boolean).length > 50) {
        return res.status(400).json({ error: "Property summary cannot exceed 50 words." });
    }

    if (detail.split(/\s+/).filter(Boolean).length > 250) {
        return res.status(400).json({ error: "Property description cannot exceed 250 words." });
    }   

    try {
        db.prepare(`UPDATE property_list SET type = ?, city = ?, price = ?, no_bedrooms = ?, no_bathrooms = ?, size = ?, furniture = ?, summary = ?, detail = ? WHERE id = ? AND owner_id = ?`)
        .run(type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, detail, propID, ownerID);
        
        return res.status(200).json({ message: "*** Listing Updated ***" });
    }
    
    catch (error) {
        console.error("Error while updating property's details: ", error);
        return res.status(500).json({ error: "Server Error: The team has been notified." });
    }
})

.post (upload.array('photos', 10), async (req, res) => {
    const propID  = req.params.propID;
    const photos = req.files as Express.Multer.File[]; 
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ noFilesError: "No photos have been selected." });
    }

    try {
        const SQLPhotosLengthCheck = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
        const remainingPhotoLength = 10 - SQLPhotosLengthCheck.length; 

        if (photos.length > remainingPhotoLength) {
            return res.status(400).json({ excessiveFiles: "You may upload up to 10 photos in total."})
        }

        const SQLAddPhoto = db.prepare(`INSERT INTO property_photos (property_id, photo_path) VALUES (?, ?)`);

        for (const photo of photos) {
            const result = await new Promise<CloudinaryResult>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: 'new_property_photos' }, (error, result) => {
                    if (error || !result) reject(error);
                    else resolve(result);
                }).end(photo.buffer);
            });   
            SQLAddPhoto.run(propID, result.secure_url);
        }

        db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(propID);

        if (photos.length >= 1 && photos.length <= 10) {
            const SQLPhotosUpdated = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
            return res.status(201).json({ message: photos.length === 1 ? "Photo added successfully!" : "Photos added successfully!", newPhotos: SQLPhotosUpdated });
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
        const SQLPhotoCheck = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);

        if (SQLPhotoCheck.length <= 5) {
            return res.status(400).json({minPhotosError: "Each property must have at least 5 photos." })
        }

        const SQLDeletePhotos = db.prepare(`DELETE FROM property_photos WHERE id = ? AND property_id = ? AND photo_path = ?`).run(photoID, propID, photo_path);

        if (SQLDeletePhotos.changes > 0) {
            db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(propID);
            return res.status(204).send();
        }

        else {
            return res.status(400).json({error:  "Failed to delete photos. Please try again."});
        }
    }
    
    catch (error) {
        console.error("Error while deleting property's photos: ", error);
        return res.status(500).json({ error: "Server Error: The team has been notified." });
    }
})


export default router;