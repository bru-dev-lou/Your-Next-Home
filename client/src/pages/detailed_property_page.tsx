import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type PropertyDetail = {
    id: number;
    city: string;
    price: number;
    summary: string;
    date_listed: string;
    photos: string[]; 
    detail: string;
}

function Property () {
    const {id} = useParams(); 

    const [property, setProperty] = useState<PropertyDetail | null>(null);

useEffect (() => {
    const fetchProperty = async () => {
        const res = await fetch(`/api/property/${id}`);
        const data = await res.json(); 
        setProperty(data);
    };

    fetchProperty();
}, [id]); 

return (
    <div>
        {property && (
            <div key ={property.id}>
                {property.photos.map((photo, index) => (
                <img key={index} src={photo} />
                ))}
                <p>{property.city}</p>
                <p>£{property.price}</p>
                <p>{property.detail}</p>
                <p>{property.date_listed}</p>
            </div>
        )}
        </div>
        )};

export default Property;