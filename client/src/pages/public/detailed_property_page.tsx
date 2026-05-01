import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type PropertyDetail = {
    propID: number;
    city: string;
    price: number;
    summary: string;
    date_listed: string;
    photos: string[]; 
    detail: string;
}

function DetailedPropertyPage () {
    const {propID} = useParams(); 

    const [property, setProperty] = useState<PropertyDetail | null>(null);

useEffect (() => {
    const fetchProperty = async () => {
        const res = await fetch(`/api/property/${propID}`);
        const data = await res.json(); 
        setProperty(data);
    };

    fetchProperty();
}, [propID]); 

return (
    <div>
        {property && (
            <div key ={property.propID}>
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

export default DetailedPropertyPage;