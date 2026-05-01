import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type properties ={
        id: number;
        type: string;
        city: string;
        price: number;
        no_bedrooms: number;
        no_bathrooms: number;
        summary: string;
        date_listed: string;
        photo_path: string;
};
    
type user = {
        id: number;
        username: string;
        name: string;
        properties: properties[];
};

type dashboardData = {
        user: user;
        properties: properties[];
    };

function DashboardMain() {
    const [ data, setData ] = useState<dashboardData | null>(null);
    const [ deleteIDConfirmed, setDeleteIDConfirmed ] = useState(""); 
    const { username, ownerID } = useParams();    
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
        const res = await fetch(`/api/dashboard/${username}/${ownerID}`);
        const result = await res.json();
        console.log(result);
        setData(result);
        }
        fetchData();
    } , [username, ownerID]);

    async function propertyDelete (propID: string) {
        const res = await fetch(`/api/dashboard/${username}/${ownerID}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ propID })
        });

        const result = await res.json();
        console.log(result);

        const refreshRes = await fetch(`/api/dashboard/${username}/${ownerID}`);
        const refreshResult = await refreshRes.json();
        setData(refreshResult);
    }

    if (!data) {
        return <div>Loading...</div>;
    };
    if (data)
        return (
                <div>
                    <h2> Welcome back {data.user.name}! </h2>
                    <h3> My Properties </h3>
                    <button onClick= {() => navigate(`/dashboard/property/add/${username}/${ownerID}`)}>+ Add a new property</button>
                    <br />
                    <br />
                    {data.properties.length > 0 ? (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {data.properties.map((property: any) => (
                                <li key={property.id}>
                                    <img src={property.photo_path} alt="Property Main Image" style={{ width: "800px", height: "550px" }}/>
                                    <p><strong>Summary</strong></p>
                                    <p>{property.summary}</p>
                                    <p> <strong>Price:</strong> £{property.price} per month </p>
                                    <p> <strong>Bedrooms:</strong> {property.no_bedrooms} </p>
                                    <p> <strong>Bathrooms:</strong> {property.no_bathrooms} </p>
                                    <p> <strong>Size:</strong> {property.size} m²</p>
                                    <button onClick = {() => navigate(`/dashboard/property/edit/${data.user.username}/${ownerID}/${property.id}`)}> Edit Property </button>
                                    <button onClick = {() => setDeleteIDConfirmed(property.id)}> Delete Property </button>
                                   {deleteIDConfirmed === property.id ? (
                                        <div>
                                            <p> Are you sure you want to delete this property? </p>
                                            <button onClick={() => propertyDelete(property.id)}> Confirm </button>
                                            <button onClick={() => {
                                            setDeleteIDConfirmed("");
                                            }}> Cancel </button>
                                        </div>
                                        ) : null} 
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You don't have any properties listed.</p>
                    )}
                </div>
        );
}


export default DashboardMain;
