import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
    const {username, ownerID} = useParams(); 
    const navigate = useNavigate();

    const [favoriteProps, setFavoriteProps] = useState<properties[]>([]); 
    const [noPropertiesMessage, setNoPropertiesMessage] = useState("");

    useEffect(() => {
        async function fetchFavProperties() {
            const res = await fetch(`/api/dashboard/property/favorites/${username}/${ownerID}`);
            const result = await res.json(); 
            if (!res.ok) {
                setNoPropertiesMessage(result.error);
            }
            else {
                setFavoriteProps(result);
            }
        }
        fetchFavProperties();
    }, [username, ownerID]);


    async function deleteFavProperty(propID : number) {
        await fetch (`/api/dashboard/property/favorites/${username}/${ownerID}/${propID}`, {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({propID})
        });

        const refreshRes = await fetch (`/api/dashboard/property/favorites/${username}/${ownerID}`);
        const refreshResult = await refreshRes.json(); 
        setFavoriteProps(refreshResult); 
    }

     if (favoriteProps.length === 0) {
        return (
            <div>
                <h3>{noPropertiesMessage}</h3>
            </div>
        );
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
                        <button onClick= { () => deleteFavProperty(property.id) }> Remove from Favorites </button>
                    </div>                        
                )
            })}
        </div>
    )
}

export default DashboardFavoriteProperties;