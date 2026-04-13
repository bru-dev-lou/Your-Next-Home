import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PropertyEdit() {
    const navigate = useNavigate();

    type proeprty = {
        type: string;
        city: string;
        price: number;
        bedrooms: number;
        bathrooms: number;
        size: number;
        furnitured: string;
        summary: string;
        details: string
    };

    type photo = {
        id: number;
        property_id: number;
        photo_path: string;
    }

    type data ={
        property: proeprty;
        photos: photo[];
    }

    const [ data, setData ] = useState<data | null>(null);

// finish backend with property details and photos, then implement frontend form to edit property details and add/remove photos.


}