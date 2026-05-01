import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

type UserPublicData = {
    name: string;
    address: string;
    phone_number: number;
    email: string;
    password: string;
}

type UserPrivateData = {
    password: string;
    newPassword: string; 
    passwordConfirmation: string;
}

type UserAccountDeleteData = {
    password: string;
}

function DashboardProfileEdit () {
    const { username, ownerID } = useParams();
    const navigate = useNavigate();

    const [ userPublicDetails, setUserPublicDetails ] = useState<UserPublicData>({name: "", address: "", phone_number: 0, email: "", password: ""}); 
    const [ userPrivateDetails, setUserPrivateDetails ] = useState<UserPrivateData>({password: "", newPassword: "", passwordConfirmation: ""});
    const [ userAccountDeleteDetails, setUserAccountDeleteDetails ] = useState<UserAccountDeleteData>({password: ""});
    
    const [ errorMessageMP, setErrorMessageMP ] = useState(""); 
    const [ successMessageMP, setSuccessMessageMP ] = useState("");
    const [ errorMessageAM, setErrorMessageAM ] = useState(""); 
    const [ successMessageAM, setSuccessMessageAM ] = useState("");
    const [ errorMessageDA, setErrorMessageDA ] = useState(""); 

    const [ changeRequest, setChangeRequest ] = useState<boolean>(false);
    const [ showCurrentPasswordMP, setShowCurrentPasswordMP ] = useState<boolean>(false);
    const [ showCurrentPasswordAM, setShowCurrentPasswordAM ] = useState<boolean>(false);
    const [ showCurrentPasswordDA, setShowCurrentPasswordDA ] = useState<boolean>(false);

    const [ showNewPassword, setShowNewPassword ] = useState<boolean>(false);
    const [ showConfirmPassword, setShowConfirmPassword ] = useState<boolean>(false);
    
    const [ accountDeleteRequest, setAccountDeleteRequest ] = useState<boolean>(false);
    const [ accountDeleted, setAccountDeleted ] = useState<boolean>(false); 


    useEffect(() => {
        async function fetchData () {
            const res = await fetch (`/api/dashboard/profile/edit/${username}/${ownerID}`);
            const result = await res.json();

            setUserPublicDetails(result.userData); 
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
                setErrorMessageMP("");
                setSuccessMessageMP(newUserPublicDetails.message);
                setUserPublicDetails({...userPublicDetails, password: ""})
            }

            else {
                setSuccessMessageMP("");
                setErrorMessageMP(newUserPublicDetails.error);
                setUserPublicDetails({...userPublicDetails, password: ""})            
            }
        }

        catch (error) {
            console.error("Error updating user's details:", error)
        };
    }

    async function updateUserPrivateDetails (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault(); 
        
        try {
            const res = await fetch(`/api/dashboard/profile/edit/${username}/${ownerID}/password_change`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({userPrivateDetails})
            });

            const newUserPrivateDetails = await res.json(); 
        
            if (res.ok) {
                setErrorMessageAM("");
                setSuccessMessageAM(newUserPrivateDetails.message);
                setUserPrivateDetails({...userPrivateDetails, password: "", newPassword: "", passwordConfirmation: ""});
            }

            else {
                setSuccessMessageAM("");
                setErrorMessageAM(newUserPrivateDetails.error);
            }
        }
            
        catch (error) {
        console.error("Error updating user's password:", error)
        }
    }

    async function deleteAccount (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        const res = await fetch (`/api/dashboard/profile/edit/${username}/${ownerID}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userAccountDeleteDetails})
        });


        if (res.ok) {
            setAccountDeleted(true); 
            setTimeout (() => {
                navigate("/");
            }, 7000);
        }

        else {
            const result = await res.json();
            setErrorMessageDA(result.error);
            setUserAccountDeleteDetails({...userAccountDeleteDetails, password: ""});
        }
    }


    return (
        <div>
            {!accountDeleted ?
                <div>
                    <div>
                        <h3>My Profile</h3>
                        <h5>Profile Information - This is what other users can see.</h5>
                    </div>
                    <div>
                        <label>
                            Name: 
                            <input onChange={(e) => [
                                setErrorMessageMP(""), 
                                setSuccessMessageMP(""), 
                                setChangeRequest(false),
                                setUserPublicDetails({...userPublicDetails, name: e.target.value})]} 
                                value= {userPublicDetails.name}>
                            </input>
                        </label>
                        <br />
                        <label>
                            Address:
                            <input onChange={(e) => [
                                setErrorMessageMP(""), 
                                setSuccessMessageMP(""), 
                                setChangeRequest(false),
                                setUserPublicDetails({...userPublicDetails, address: e.target.value})]} 
                                value= {userPublicDetails.address}>
                            </input>
                        </label>
                        <br />
                        <label>
                            Phone Number: 
                            <input onChange={(e) => [
                                setErrorMessageMP(""), 
                                setSuccessMessageMP(""), 
                                setChangeRequest(false),
                                setUserPublicDetails({...userPublicDetails, phone_number: Number(e.target.value)})]} 
                                value= {userPublicDetails.phone_number}>
                            </input>
                        </label>
                        <br /> 
                        <label>
                            Email: 
                            <input onChange={(e) => [
                                setErrorMessageMP(""), 
                                setSuccessMessageMP(""), 
                                setChangeRequest(false),
                                setUserPublicDetails({...userPublicDetails, email: e.target.value})]} 
                                value= {userPublicDetails.email}>
                            </input>
                        </label>
                        <br />
                        {!changeRequest ? 
                            <button onClick={() => setChangeRequest(true)}>Save Changes</button>
                            :
                            <label>
                                Please provide your password:
                            <input type= {showCurrentPasswordMP ? "text" : "password"} 
                                onChange= {(e) => [
                                setErrorMessageMP(""), 
                                setSuccessMessageMP(""), 
                                setUserPublicDetails({...userPublicDetails, password: e.target.value})]}
                                value = {userPublicDetails.password}>
                            </input>
                            <button 
                                type="button"
                                onClick= {() => setShowCurrentPasswordMP(!showCurrentPasswordMP)}>
                                {showCurrentPasswordMP ? "Hide" : "Show"}
                            </button>   
                            <br />
                            <button onClick= {updateUserPublicDetails}>Confirm Changes</button>
                            </label> 
                        }
                        {errorMessageMP && <h3>{errorMessageMP}</h3>}
                        {successMessageMP && <h3>{successMessageMP}</h3>}       
                    </div>


                    <h3>Account Management</h3>
                    <h5>Password Change</h5>
                    <div>
                        <label>
                            Current password:
                            <input 
                                type= {showCurrentPasswordAM ? "text" : "password"}
                                onChange= {(e) => [
                                    setErrorMessageAM(""),
                                    setSuccessMessageAM(""),
                                    setUserPrivateDetails({...userPrivateDetails, password: e.target.value})]}
                                    value={userPrivateDetails.password}>
                            </input>
                            <button 
                                type="button"
                                onClick= {() => setShowCurrentPasswordAM(!showCurrentPasswordAM,)}>
                                {showCurrentPasswordAM ? "Hide" : "Show"}
                            </button>  
                        </label>
                        <br />
                        <label>
                            New password:
                            <input 
                                type= {showNewPassword ? "text" : "password"}
                                onChange= {(e) => [
                                    setErrorMessageAM(""),
                                    setSuccessMessageAM(""),
                                    setUserPrivateDetails({...userPrivateDetails, newPassword: e.target.value})]}
                                    value={userPrivateDetails.newPassword}>
                            </input>
                            <button 
                                type="button"
                                onClick= {() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? "Hide" : "Show"}
                            </button>  
                        </label>
                        <br />
                        <label>
                            Confirm new password:
                            <input 
                                type= {showConfirmPassword ? "text" : "password"}
                                onChange= {(e) => [
                                    setErrorMessageAM(""),
                                    setSuccessMessageAM(""),                                    
                                    setUserPrivateDetails({...userPrivateDetails, passwordConfirmation: e.target.value})]}
                                    value={userPrivateDetails.passwordConfirmation}>
                            </input>
                            <button 
                                type="button"
                                onClick= {() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? "Hide" : "Show"}
                            </button>  
                        </label>
                        <br />
                        <br />
                        <button onClick= {updateUserPrivateDetails}>Change Password</button>
                        <br />                            
                        {errorMessageAM && <h3>{errorMessageAM}</h3>}
                        {successMessageAM && <h3>{successMessageAM}</h3>}


                        <h5>Delete your account</h5>
                        {!accountDeleteRequest ? 
                            <button onClick={() => setAccountDeleteRequest(true)}>Delete Account</button>
                            :
                            <label>
                                Please provide your password:
                                <input 
                                    type= {showCurrentPasswordDA ? "text" : "password"} 
                                    onChange= {(e) => [
                                        setErrorMessageDA(""),
                                        setUserAccountDeleteDetails({...userAccountDeleteDetails, password: e.target.value})]}
                                        value={userAccountDeleteDetails.password}>
                                </input>
                                <button 
                                    type="button"
                                    onClick= {() => setShowCurrentPasswordDA(!showCurrentPasswordDA)}>
                                    {showCurrentPasswordDA ? "Hide" : "Show"}
                                </button>   
                                <br />
                                <button onClick= {deleteAccount}> Confirm Changes</button>
                            </label> 
                        }
                        {errorMessageDA && <h3>{errorMessageDA}</h3>}
                    </div>
                </div>
            :
                <div>
                    <h4> Your account is being deleted.</h4>
                    <h5> Please wait until you're redirected to our homepage.</h5>
                </div>
            }        
        </div>
    )   
}

export default DashboardProfileEdit;