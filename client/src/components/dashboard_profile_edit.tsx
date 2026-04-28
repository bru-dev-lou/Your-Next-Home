import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

type UserPublicData = {
    name: string;
    address: string;
    phone_number: number;
    email: string;
}

type UserPrivateData = {
    password: string;
    newPassword: string; 
}

function DashboardProfileEdit () {
    const { username, ownerID } = useParams();
    const navigate = useNavigate();

    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ successMessage, setSuccessMessage ] = useState("");
    
    const [ userPublicDetails, setUserPublicDetails ] = useState<UserPublicData>(); 
    const [ userPrivateDetails, setUserPrivateDetails ] = useState<UserPrivateData>();


    useEffect(() => {
        async function fetchData () {
            const res = await fetch (`/api/dashboard/profile/edit/${username}/${ownerID}`);
            const result = await res.json();

            setUserPublicDetails(result.user); 
        }

        fetchData();
    }, [username, ownerID]);

    if (!userPublicDetails) {
        return <h3>Failed to retrieve data, please <Link to = "/contact"> contact</Link> our team.</h3>;
    }

    async function updateUserPublicDetails (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        try {
            const res = await fetch(`/api/dashboard/profile/edit/${username}/${ownerID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({userPublicDetails})
            });

            const newUserPublicDetails = await res.json(); 
        
            if (res.ok) {
                setErrorMessage("");
                setSuccessMessage(newUserPublicDetails.message);
            }

            else {
                setSuccessMessage("");
                setErrorMessage(newUserPublicDetails.error);
            }
        }

        catch (error) {
            console.error("Error updating user's details:", error)
        };
    }

    async function updateUserPrivateDetails (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault(); 
        
        try {
            const res = await fetch(`/api/dashboard/profile/edit/${username}/${ownerID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({userPrivateDetails})
            });

            const newUserPrivateDetails = await res.json(); 
        
            if (res.ok) {
                setErrorMessage("");
                setSuccessMessage(newUserPrivateDetails.message);
            }

            else {
                setSuccessMessage("");
                setErrorMessage(newUserPrivateDetails.error);
            }
        }
            
        catch (error) {
        console.error("Error updating user's password:", error)
        }
    }

    return (
        <div>
            <h3>My Profile</h3>
            <h4>(Edit your details, change your password or delete your account altogether)</h4>
        </div>
    )
}

export default DashboardProfileEdit;