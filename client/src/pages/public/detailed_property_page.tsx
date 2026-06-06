import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type PropertyDetails = {
    id: number;
    type: string;
    city: string;
    price: number;
    no_bedrooms: number;
    no_bathrooms: number;
    size: number;
    furniture: string;
    date_listed: string;
    detail: string;
    photos: string[]; 
};

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
                <h3 role="alert">{errorMessageFP}</h3>
            </div>
        )
    }

    return (
        <div>
            {property && (
                <div key ={property.id}>
                    <span className="hidden-content">Address</span>
                    <p>{property.city}</p>
                    <span className="hidden-content">Monthly rental rate</span>
                    <p>£{property.price.toLocaleString()} pcm</p>
                    <p>Date Listed: {new Date(property.date_listed).toLocaleDateString("en-GB")}</p>
                    <div role="group" aria-label="Property photos">
                        {property.photos.map((photo, index) => (
                            <img 
                                key={index} 
                                src={photo}
                                alt={`Photos number ${index + 1} of property number ${property.id}`} 
                            />
                        ))}
                    </div>
                    {propFavorite.has(property.id) ?
                        <button 
                            onClick={ () => removeFromFavorites(property.id)}
                            aria-describedby="button_hint"> 
                             Remove from favorites 
                            </button>
                        :
                        <button 
                            onClick={ () => addToFavorites(property.id)}
                            aria-describedby="button_hint">
                             Add to favorites 
                        </button>
                    }                      
                    <span id="button_hint" className="hidden-content">If button shows 'remove', it means the property is currently in your favorite properties' list. Clicking the button will remove it from this list.</span> 
                    {errorMessageFavorites && 
                        <div role="alert">
                            <h4>{errorMessageFavorites}</h4>
                        </div>
                    }
                    <p>Property Type: {property.type}</p>
                    <p>Bedrooms: {property.no_bedrooms}</p>
                    <p>Bathrooms: {property.no_bathrooms}</p>
                    <p>Size: {property.size} m²</p>
                    <span>Description: </span>
                    <p>{property.detail}</p>
                </div>
            )}
            <br />
            {owner && (
                <div>
                    <span className="hidden-content">Property owner's name.</span>
                    <p aria-describedby="owner_name_hint">{owner!.name}</p>
                    <span className="hidden-content">Address where the property's owner is located</span>
                    <p aria-describedby="owner_address_hint"> {owner!.address}</p>
                    <span className="hidden-content">Property owner's phone number</span>
                    <p aria-describedby="owner_phone_number_hint">{owner!.phone_number}</p>
                </div>
            )}        
            <span id="owner_name_hint" className="hidden-content">This could be an individual's name or a company's name, depending on who is letting the property.</span>
            <span id="owner_address_hint" className="hidden-content">This could be an individual's address or a company's address, depending on who is letting the property.</span>
            <span id="owner_phone_number_hint" className="hidden-content">This could be an individual's phone number or a company's phone number, depending on who is letting the property.</span>
        </div>
    )
};

export default DetailedPropertyPage;