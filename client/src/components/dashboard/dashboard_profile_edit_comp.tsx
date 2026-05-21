import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserPublicData = {
    name: string;
    address: string;
    phone_number: string;
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
    const navigate = useNavigate();

    const [ originalUserPublicDetails, setOriginalUserPublicDetails] = useState<UserPublicData>({name: "", address: "", phone_number: "", email: "", password: ""}); 
    const [ userPublicDetails, setUserPublicDetails ] = useState<UserPublicData>({name: "", address: "", phone_number: "", email: "", password: ""}); 

    const [ userPrivateDetails, setUserPrivateDetails ] = useState<UserPrivateData>({password: "", newPassword: "", passwordConfirmation: ""});
    const [ userAccountDeleteDetails, setUserAccountDeleteDetails ] = useState<UserAccountDeleteData>({password: ""});
    
    // MP = My Profile / AM = Account Management / DA = Delete Account 

    const [ errorGeneralMessage, setErrorGeneralMessage ] = useState("");
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

    const [ dataLoading, setDataLoading ] = useState<boolean>(true);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch (`/api/dashboard/profile/edit/`);
                const result = await res.json();

                if (!res.ok) {
                setErrorGeneralMessage(result.error);
                }

                else {
                    setUserPublicDetails({...result.userData, phone_number: String(result.userData.phone_number,), password: ""});
                    setOriginalUserPublicDetails({...result.userData, phone_number: String(result.userData.phone_number,), password: ""})
                }
            }

            catch(error) {
                setErrorGeneralMessage("Failed to fetch user's data. Please check your internet and refresh the page.");
            }

            finally{
                setDataLoading(false);
            }
        }
        fetchData();

    }, []);
    
    
    if (dataLoading) {
        return <h3>Retrieving Data</h3>;
    };

    if (errorGeneralMessage){
        return <h3>{errorGeneralMessage}</h3>
    };



    async function updateUserPublicDetails (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        try {
            const {password: p1, ...detailsToCompare} = userPublicDetails;
            const {password: p2, ...originalDetails} = originalUserPublicDetails;

            if (JSON.stringify(detailsToCompare) === JSON.stringify(originalDetails)) {
            setErrorMessageMP("Please update at least one field.");
            setSuccessMessageMP("");
            setChangeRequest(false);
            return;
            }

            const res = await fetch(`/api/dashboard/profile/edit`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({ userPublicDetails: { ...userPublicDetails, number: Number(userPublicDetails.phone_number)}})
            });

            const result = await res.json(); 
        
            if (res.ok) {
                setErrorMessageMP("");
                setSuccessMessageMP(result.message);
                setOriginalUserPublicDetails({...userPublicDetails, password: ""});
                setUserPublicDetails({...userPublicDetails, password: ""});
            }

            else if (result.passwordError) {
                setErrorMessageMP(result.passwordError);
                setSuccessMessageMP("");
                setChangeRequest(true);
                setUserPublicDetails({...userPublicDetails, password: ""});            
            }

            else {
                setSuccessMessageMP("");
                setErrorMessageMP(result.error);
                setChangeRequest(false);
                setUserPublicDetails({...userPublicDetails, password: ""});            
            }
        }

        catch (error) {
            setErrorMessageMP("Failed to update user's profile. Please check your internet and try again.")
        };
    }

    async function updateUserPrivateDetails (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault(); 
        
        try {
            const res = await fetch(`/api/dashboard/profile/edit/password_change`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({userPrivateDetails})
            });

            const result = await res.json(); 
        
            if (res.ok) {
                setErrorMessageAM("");
                setSuccessMessageAM(result.message);
                setUserPrivateDetails({...userPrivateDetails, password: "", newPassword: "", passwordConfirmation: ""});
            }

            else {
                setSuccessMessageAM("");
                setErrorMessageAM(result.error);
            }
        }
            
        catch (error) {
            setErrorMessageAM("Failed to update user's password. Please check your internet and try again.")
        }
    }

    async function deleteAccount (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        try {
            const res = await fetch (`/api/dashboard/profile/edit/`, {
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

        catch(error) {
            setErrorMessageDA("Failed to delete user's account. Please check your internet and try again.")
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
                                setUserPublicDetails({...userPublicDetails, phone_number: e.target.value})]} 
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
                        {errorMessageAM && <h4>{errorMessageAM}</h4>}
                        {successMessageAM && <h4>{successMessageAM}</h4>}


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
                                <button onClick= {deleteAccount}> Confirm Account Deletion</button>
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