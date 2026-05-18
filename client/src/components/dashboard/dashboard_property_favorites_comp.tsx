import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type properties = {
    id: number;
    type: string;
    city: string;
    price: number;
    no_bedrooms: number;
    no_bathrooms: number;
    size: number;
    furniture: string;
    summary: string;
    detail: string
    photo_path: string;
};

const DashboardFavoriteProperties = () => {
    const navigate = useNavigate();

    const [favoriteProps, setFavoriteProps] = useState<properties[]>([]); 
    const [removeIDConfirmation, setRemoveIDConfirmation] = useState<number | null>(); 

    //  Error Messages →  FP = Favorite Properties

    const [errorMessageFP, setErrorMessageFP] = useState("");

    useEffect(() => {
        async function fetchFavProperties() {
            try {
                const res = await fetch(`/api/dashboard/property/favorites`);
                const result = await res.json(); 
                if (!res.ok) {
                    setErrorMessageFP(result.error);
                }
                else {
                    setFavoriteProps(result);
                }
            }
            
            catch (error) {
                setErrorMessageFP("Something went wrong while fetching properties. Please check your internet and refresh the page.")
            }
        }
        fetchFavProperties();
    }, []);


    async function deleteFavProperty(propID : number) {
        await fetch (`/api/dashboard/property/favorites/${propID}`, {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({propID})
        });

        const refreshRes = await fetch (`/api/dashboard/property/favorites`);
        const refreshResult = await refreshRes.json(); 
        setFavoriteProps(refreshResult); 
    }

    if (favoriteProps.length === 0) {
        return (
           <div>
                <h3>{errorMessageFP}</h3>
            </div>
        )
    }

    return (
        <div>
            <h3>Favorite Properties</h3>
            {favoriteProps.map((property) => {
                return (
                    <div key = {property.id}>
                        {property.type === "Detached" || property.type === "Semi-Detached" || property.type === "Terraced" ?
                            <h4>{property.type} property in {property.city}</h4>
                        : 
                            <h4>{property.type} in {property.city}</h4>
                        }
                        <img src={property.photo_path} onClick = {() => navigate(`/property/${property.id}`)} style={{cursor: "pointer", width: "300px", height: "200px"}} />`
                        <p>{property.summary}</p>
                        <p>Price: £{property.price} PCM</p>
                        <p>Bedrooms: {property.no_bedrooms}</p>
                        <p>Bathrooms: {property.no_bathrooms}</p>
                        <button onClick= {() => setRemoveIDConfirmation(property.id)}>Remove from Favorites</button>
                        {removeIDConfirmation === property.id ? (
                            <div>
                                <p> Are you sure? </p>
                                <button onClick={() => deleteFavProperty(property.id)}> Confirm </button>
                                <button onClick={() => {setRemoveIDConfirmation(null);}}> Cancel </button>
                            </div>                        
                            ) : null 
                        }
                    </div>                        
                )
            })}
        </div>
    )
}

export default DashboardFavoriteProperties;