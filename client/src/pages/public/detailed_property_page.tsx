import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type PropertyDetails = {
    id: number;
    city: string;
    price: number;
    summary: string;
    date_listed: string;
    photos: string[]; 
    detail: string;
}

type OwnerDetails = {
    name: string; 
    address: string;
    phone_number: number;
}

function DetailedPropertyPage () {
    const {propID} = useParams();

    const [ property, setProperty ] = useState<PropertyDetails | null>(null);
    const [ owner, setOwner ] = useState<OwnerDetails | null>(null);

    const [ propFavorite, setPropFavorite ] = useState<Set<number>>(new Set());

    const [ errorMessageFP,  setErrorMessageFP] = useState(""); 
    const [ errorMessageFavorites, setErrorMessageFavorites ] = useState("");

    useEffect (() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/property/${propID}`);
                const result = await res.json(); 

                if (!res.ok) {
                    setErrorMessageFP(result.error)
                }

                else {
                    setProperty(result.propertyData);
                    setOwner(result.ownerData);
                }
            }

            catch(error) {
                setErrorMessageFP("Failed to fetch this property. Please check your internet and refresh the page.")
            }
        }
        
        fetchData();

    }, [propID]); 

    useEffect (() => {
        const fetchFavorites = async () => {
            const updateSet = new Set(propFavorite);
            
            try {
                const res = await fetch ("/api/search/favorites");
                const results = await res.json(); 
                
                if (res.ok) {
                    for (const result of results) {
                        updateSet.add(result.property_id);
                    }
                    setPropFavorite(updateSet);
                }

                else {
                    return;
                }
            }

            catch(error) {
            }
        }
        fetchFavorites();
    }, []);

    async function addToFavorites (propID : number) {
        const updateSet = new Set(propFavorite);

        try {            
            const res = await fetch (`/api/search/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({propID})
            });

            const result = await res.json(); 

            if (res.ok) {
                setErrorMessageFavorites("");
                updateSet.add(propID);
                setPropFavorite(updateSet); 
            }

            else {
                setErrorMessageFavorites(result.error);
            }
        }

        catch (error) {
            setErrorMessageFavorites("Failed to add to favorites. Please check your internet and try again.");
        }
    }         

    async function removeFromFavorites (propID : number) {
        const updateSet = new Set(propFavorite); 
    
        try {
            const res = await fetch (`/api/search/favorites`, {
                method: "DELETE",
                headers: {
                    "Content-Type" : "application/json"
            },
                body: JSON.stringify({propID})
            });

            if (!res.ok) {
                const result = await res.json(); 
                setErrorMessageFavorites(result.error)
            }  

            else {
                setErrorMessageFavorites("");
                updateSet.delete(propID);
                setPropFavorite(updateSet);
            }
        }

        catch (error) {
            setErrorMessageFavorites("Failed to remove from favorites. Please check your internet and try again.")
        }
    }

    if (errorMessageFP) {
        return (
            <div>
                <h3>{errorMessageFP}</h3>
            </div>
        )
    }

    return (
        <div>
            {property && (
                <div key ={property.id}>
                    {property.photos.map((photo, index) => (
                    <img key={index} src={photo} />
                    ))}
                    {propFavorite.has(property.id) ?
                        <button onClick={ () => removeFromFavorites(property.id)}> Remove from favorites </button>
                    :
                        <button onClick={ () => addToFavorites(property.id)}> Add to favorites </button>
                    }                       
                    {errorMessageFavorites && <h4>{errorMessageFavorites}</h4>}
                    <p>{property.city}</p>
                    <p>£{property.price}</p>
                    <p>{property.detail}</p>
                    <p>{property.date_listed}</p>
                </div>
            )}
            <br />
            {owner && (
                <div>
                    <p>{owner!.name}</p>
                    <p>{owner!.address}</p>
                    <p>{owner!.phone_number}</p>
                </div>
            )}        
        </div>
    )
};

export default DetailedPropertyPage;