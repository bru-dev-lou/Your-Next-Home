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
    const {propID, ownerID} = useParams();

    const [property, setProperty] = useState<PropertyDetail | null>(null);
    const [propFavorite, setPropFavorite] = useState<Set<number>>(new Set());

    const [errorMessageFP, setErrorMessageFP] = useState(""); 

    useEffect (() => {
        const fetchProperty = async () => {
            const res = await fetch(`/api/property/${propID}`);
            const data = await res.json(); 
            setProperty(data);
        };

        fetchProperty();
    }, [propID]); 

    async function addToFavorites (propID : number) {
        const updateSet = new Set(propFavorite);

        try {
            const res = await fetch (`/api/search/${propID}/${ownerID}`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                }
            });

            const result = await res.json(); 
            console.log(result); 

            // need to add button style change when res.ok

            if (res.ok) {
                setErrorMessageFP("");
                updateSet.add(propID);
                setPropFavorite(updateSet); 
            }

            else {
                setErrorMessageFP(result.error);
            }
        }

        // Will return error until ownerID param is added properly via users signing in and receiving a token

        catch (error) {
            console.log(error);
        }
    }         

    async function removeFromFavorites (propID : number) {
        const updateSet = new Set(propFavorite); 
    
        try {
            const res = await fetch (`/api/search/${propID}/${ownerID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type" : "application/json"
            },
                body: JSON.stringify({propID})
            });
      
            const result = await res.json(); 

            if (!res.ok) {
                setErrorMessageFP(result.error)
            }  

            else {
            updateSet.delete(propID);
            setPropFavorite(updateSet);
            }
        }

        catch (error) {
            console.log(error);
        }
    }



    return (
        <div>
            {property && (
                <div key ={property.propID}>
                    {property.photos.map((photo, index) => (
                    <img key={index} src={photo} />
                    ))}
                    {propFavorite.has(property.propID) ?
                        <button onClick={ () => removeFromFavorites(property.propID)}> Remove from favorites </button>
                    :
                        <button onClick={ () => addToFavorites(property.propID)}> Add to favorites </button>
                    }                       
                    {errorMessageFP && <h4>{errorMessageFP}</h4>}
                    <p>{property.city}</p>
                    <p>£{property.price}</p>
                    <p>{property.detail}</p>
                    <p>{property.date_listed}</p>
                </div>
            )}
        </div>
    )
};

export default DetailedPropertyPage;