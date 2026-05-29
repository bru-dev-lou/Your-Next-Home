import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserProperties ={
        id: number;
        type: string;
        city: string;
        price: number;
        no_bedrooms: number;
        no_bathrooms: number;
        size: string;
        furniture: string;
        summary: string;
        date_listed: string;
        photo_path: string;
};
    
type UserDetails = {
        name: string;
};

type DashboardData = {
        user: UserDetails;
        properties: UserProperties[];
    };

function DashboardMain() {
    const navigate = useNavigate();

    const [ data, setData ] = useState<DashboardData | null>(null);
    const [ deleteIDConfirmed, setDeleteIDConfirmed ] = useState<number | null>(null); 

    const [ fetchPropertyMessage, setFetchPropertyMessage ] = useState(""); 
    const [ deletePropertyMessage, setDeletePropertyMessage ] = useState("");

    function messageReset () {
        setTimeout (function () {
            setDeletePropertyMessage("");
        }, 5000);
    }

    
    useEffect(() => {
        const fetchPropertyData = async () => {
            try {
                const res = await fetch(`/api/dashboard`);
                const result = await res.json();

                if (!res.ok) {
                    setFetchPropertyMessage(result.error); 
                }

                else if (result.message) {
                    setFetchPropertyMessage(result.message); 
                }

                else {
                    setFetchPropertyMessage(""); 
                    setData(result);
                }
            }
            
            catch (error) {
                setFetchPropertyMessage("Failed to fetch your properties. Please check your internet and refresh the page.")
            }
        }
        
        fetchPropertyData();

    } , []);


    async function propertyDelete (propID: number) {
        
        try {
            const res = await fetch(`/api/dashboard`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ propID })
            });

            const result = await res.json();


            if (!res.ok) {
                setDeletePropertyMessage(result.error);
            }
                    
            else {
                setDeletePropertyMessage(result.message); 
                messageReset();

                const refreshPropertyPage = await fetch(`/api/dashboard`);
                const refreshResult = await refreshPropertyPage.json();
                
                if (!refreshPropertyPage.ok) {
                    setData(null);
                    setFetchPropertyMessage(refreshResult.error);
                }

                else if (refreshResult.message) {
                    setData(null);
                    setFetchPropertyMessage(refreshResult.message);
                }

                else {
                    setData(refreshResult);  
                }
            }
        }

        catch(error) {
            setDeletePropertyMessage("Failed to delete property. Please check your internet and try again.");
        }
    }
    
    if (!data) {
        return (
            <div>
                {fetchPropertyMessage ? 
                <div>
                    <br />
                    <button onClick= {() => navigate(`/dashboard/property/add`)}>+ Add a new property</button>
                    <h3>{fetchPropertyMessage}</h3>
                </div>
                : 
                <h3>Loading...</h3>}
            </div>
        );
    }

    if (data)
        return (
                <div>
                    <h2> Welcome back {data.user.name}! </h2>
                    <h3> My Properties </h3>
                    <button onClick= {() => navigate(`/dashboard/property/add`)}>+ Add a new property</button>
                    <br />
                    <br />
                    {deletePropertyMessage && <h3>{deletePropertyMessage}</h3>}
                    {data.properties.length > 0 ? (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {data.properties.map((property: UserProperties) => (
                                <li key={property.id}>
                                    <img src={property.photo_path} 
                                        alt="Property Main Image" 
                                        style={{ width: "800px", height: "550px" }}
                                        onClick={ () => navigate(`/property/${property.id}`)}/>
                                    <p><strong>Summary</strong></p>
                                    <p>{property.summary}</p>
                                    <p> <strong>Price:</strong> £{property.price} per month </p>
                                    <p> <strong>Bedrooms:</strong> {property.no_bedrooms} </p>
                                    <p> <strong>Bathrooms:</strong> {property.no_bathrooms} </p>
                                    <p> <strong>Size:</strong> {property.size} m²</p>
                                    <button onClick = {() => navigate(`/dashboard/property/edit/${property.id}`)}> Edit Property </button>
                                    <button onClick = {() => setDeleteIDConfirmed(property.id)}> Delete Property </button>
                                   {deleteIDConfirmed === property.id ? (
                                        <div>
                                            <p> Are you sure ? </p>
                                            <button onClick={() => propertyDelete(property.id)}> Confirm </button>
                                            <button onClick={() => {
                                            setDeleteIDConfirmed(null);
                                            }}> Cancel </button>
                                        </div>
                                        ) : null} 
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <h3>{fetchPropertyMessage}</h3>
                    )}
                </div>
        );
}


export default DashboardMain;
