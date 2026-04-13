import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function DashboardMain() {
    const { username, id } = useParams();    
    const navigate = useNavigate();

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

    const [ data, setData ] = useState<dashboardData | null>(null);


    useEffect(() => {
        async function fetchData() {
        const res = await fetch(`/api/dashboard/${username}/${id}`);
        const result = await res.json();
        console.log(result);
        setData(result);
        }
        fetchData();
    } , [username, id]);

    if (!data) {
        return <div>Loading...</div>;
    };
    if (data)
        return (
                <div>
                    <h2> Welcome back {data.user.name}! </h2>
                    <h3> My Properties </h3>
                    {data.properties.length > 0 ? (
                        <ul>
                            {data.properties.map((property: any) => (
                                <li key={property.id}>
                                    <img src={property.photo_path} alt="Property Main Image" />
                                    <h3>Summary</h3>
                                    <h4>{property.summary}</h4>
                                    <h3> Price </h3>
                                    <h4>${property.price} per month</h4>
                                    <h3> Bedrooms </h3>
                                    <h4>{property.no_bedrooms} </h4>
                                    <h3> Bathrooms </h3>
                                    <h4>{property.no_bathrooms} </h4>
                                    <h3> Size </h3>
                                    <h4>{property.size} m²</h4>
                                    <button onClick = {() => navigate(`/dashboard/property/edit/${data.user.username}/${property.id}`)}> Edit Property </button>
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
