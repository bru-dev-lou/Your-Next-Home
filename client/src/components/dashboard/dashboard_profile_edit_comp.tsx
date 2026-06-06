import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";

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
    const { setUser } = useUser();

    const [ originalUserPublicDetails, setOriginalUserPublicDetails] = useState<UserPublicData>({name: "", address: "", phone_number: "", email: "", password: ""}); 
    const [ userPublicDetails, setUserPublicDetails ] = useState<UserPublicData>({name: "", address: "", phone_number: "", email: "", password: ""}); 

    const [ userPrivateDetails, setUserPrivateDetails ] = useState<UserPrivateData>({password: "", newPassword: "", passwordConfirmation: ""});
    const [ userAccountDeleteDetails, setUserAccountDeleteDetails ] = useState<UserAccountDeleteData>({password: ""});
    
    // Error Messages - MP = My Profile / AM = Account Management / DA = Delete Account 

    const [ errorGeneralMessage, setErrorGeneralMessage ] = useState("");
    const [ errorMessageMP, setErrorMessageMP ] = useState(""); 
    const [ successMessageMP, setSuccessMessageMP ] = useState("");
    const [ errorMessageAM, setErrorMessageAM ] = useState(""); 
    const [ successMessageAM, setSuccessMessageAM ] = useState("");
    const [ errorMessageDA, setErrorMessageDA ] = useState(""); 

    // Show / Hide password button states.

    const [ showCurrentPasswordMP, setShowCurrentPasswordMP ] = useState(false);
    const [ showCurrentPasswordAM, setShowCurrentPasswordAM ] = useState(false);
    const [ showCurrentPasswordDA, setShowCurrentPasswordDA ] = useState(false);
    const [ showNewPassword, setShowNewPassword ] = useState(false);
    const [ showConfirmPassword, setShowConfirmPassword ] = useState(false);
    
    // States to trigger password request upon being true.

    const [ changeRequest, setChangeRequest ] = useState(false);
    const [ accountDeleteRequest, setAccountDeleteRequest ] = useState(false);

    // States for informative messages upon being true.

    const [ accountDeleted, setAccountDeleted ] = useState(false); 
    const [ dataLoading, setDataLoading ] = useState(true);

    // States for WAI ARIA invalid triggers - MP = My Profile / AM = Account Management / DA = Delete Account 

    const [ missingField, setMissingField ] = useState("");
    const [ passErrorCodeMP, setPassErrorCodeMP ] = useState(""); 
    const [ passErrorCodeAM, setPassErrorCodeAM] = useState(""); 
    const [ passErrorCodeDA, setPassErrorCodeDA ] = useState(""); 
    

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

    async function updateUserPublicDetails (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        try {
            const {password: p1, ...detailsToCompare} = userPublicDetails;
            const {password: p2, ...originalDetails} = originalUserPublicDetails;

            if (JSON.stringify(detailsToCompare) === JSON.stringify(originalDetails)) {
                setErrorMessageMP("Please update at least one field.");
                setSuccessMessageMP("");
                setChangeRequest(false);
                setUserPublicDetails({...userPublicDetails, password: ""});     
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
                setMissingField("");
                setPassErrorCodeMP("");
                setSuccessMessageMP(result.message);
                setOriginalUserPublicDetails({...userPublicDetails, password: ""});
                setUserPublicDetails({...userPublicDetails, password: ""});
            }

            else if (result.passwordError) {
                setErrorMessageMP(result.passwordError);
                setPassErrorCodeMP(result.name); 
                setSuccessMessageMP("");
                setChangeRequest(true);
                setUserPublicDetails({...userPublicDetails, password: ""});            
            }

            else {
                setSuccessMessageMP("");
                setErrorMessageMP(result.error);
                setMissingField(result.name);
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
                setPassErrorCodeAM(result.name); 
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
                setUser(null);
                setTimeout (() => {
                    navigate("/");
                }, 7000);
            }

            else {
                const result = await res.json();
                setErrorMessageDA(result.error);
                setPassErrorCodeDA(result.name);
                setUserAccountDeleteDetails({...userAccountDeleteDetails, password: ""});
            }
        }

        catch(error) {
            setErrorMessageDA("Failed to delete user's account. Please check your internet and try again.")
        }
    }

    if (dataLoading) {
        return <h3 role="status">Retrieving Data</h3>;
    };

    if (errorGeneralMessage){
        return <h3 role="alert">{errorGeneralMessage}</h3>
    };

    return (
        <div>
            {!accountDeleted ?
                <div>
                    <div>
                        <h3>Edit Profile</h3>
                        <h5>Profile Information - This is what other users can see about you.</h5>
                    </div>
                    <div>
                        <label htmlFor="name"> Name: </label> 
                            <input 
                                id="name"
                                type="text"
                                value= {userPublicDetails.name}
                                onChange={(e) => {
                                    setErrorMessageMP(""); 
                                    setSuccessMessageMP("");
                                    setMissingField("");
                                    setChangeRequest(false);
                                    setUserPublicDetails({...userPublicDetails, name: e.target.value});
                                }} 
                                required
                                aria-invalid={missingField === "name"}
                            />
                        <br />
                        <label htmlFor="address"> Address: </label>
                            <input 
                                id="address"
                                type="text"
                                value= {userPublicDetails.address}
                                onChange={(e) => {
                                    setErrorMessageMP("");
                                    setSuccessMessageMP("");
                                    setMissingField("");
                                    setChangeRequest(false);
                                    setUserPublicDetails({...userPublicDetails, address: e.target.value});
                                }} 
                                required
                                aria-invalid={missingField === "address"}
                            />
                        <br />
                        <label htmlFor="phone_number"> Phone Number: </label> 
                            <input 
                                id="phone_number"
                                type="tel"
                                value= {userPublicDetails.phone_number}
                                onChange={(e) => {
                                    setErrorMessageMP(""); 
                                    setSuccessMessageMP(""); 
                                    setMissingField("");
                                    setChangeRequest(false);
                                    setUserPublicDetails({...userPublicDetails, phone_number: e.target.value});
                                }} 
                                required
                                aria-invalid={missingField === "number"}
                            />
                        <br /> 
                        <label htmlFor="email"> Email: </label> 
                            <input 
                                id="email"
                                type="email"
                                value= {userPublicDetails.email}
                                onChange={(e) => {
                                    setErrorMessageMP(""); 
                                    setSuccessMessageMP(""); 
                                    setMissingField("");
                                    setChangeRequest(false);
                                    setUserPublicDetails({...userPublicDetails, email: e.target.value});
                                }} 
                                required
                                aria-invalid={missingField === "email"}
                            />
                        <br />
                        {!changeRequest ?
                            <button onClick={() => setChangeRequest(true)}>Save Changes</button>
                            :
                            <div>
                                <label htmlFor="password_request1"> Please provide your password: </label>
                                <input 
                                    id="password_request1"
                                    type= {showCurrentPasswordMP ? "text" : "password"} 
                                    value = {userPublicDetails.password}
                                    onChange= {(e) => {
                                        setErrorMessageMP(""); 
                                        setSuccessMessageMP(""); 
                                        setPassErrorCodeMP("");
                                        setUserPublicDetails({...userPublicDetails, password: e.target.value});
                                    }}
                                    required
                                    aria-invalid={passErrorCodeMP === "missing_password" || passErrorCodeMP === "incorrect_password"}
                                />
                                <button 
                                    type="button"
                                    onClick= {() => setShowCurrentPasswordMP(!showCurrentPasswordMP)}
                                    aria-describedby="button_hint1"
                                    aria-pressed={showCurrentPasswordMP}
                                >
                                    {showCurrentPasswordMP ? "Hide" : "Show"}
                                </button>   
                                <span id="button_hint1" className="hidden-content">Clicking this button allows your screen reader to read the password you have inserted</span>
                                <br />
                                <button onClick= {updateUserPublicDetails}>Confirm Changes</button>
                            </div>
                        }
                        {errorMessageMP && <h3 role="alert">{errorMessageMP}</h3>}
                        {successMessageMP && <h3 role="status">{successMessageMP}</h3>}       
                    </div>
                    <div>
                        <h3>Account Management</h3>
                        <h5>Password Change</h5>
                    </div>
                    <div>
                        <label htmlFor="current_password"> Current password: </label>
                            <input 
                                id="current_password"
                                type= {showCurrentPasswordAM ? "text" : "password"}
                                value={userPrivateDetails.password}
                                onChange= {(e) => {
                                    setErrorMessageAM("");
                                    setSuccessMessageAM("");
                                    setPassErrorCodeAM("");
                                    setUserPrivateDetails({...userPrivateDetails, password: e.target.value})
                                }}
                                required
                                aria-invalid={passErrorCodeAM === "missing_current_pass" || passErrorCodeAM === "incorrect_current_pass"}
                            />
                            <button 
                                type="button"
                                onClick= {() => setShowCurrentPasswordAM(!showCurrentPasswordAM)}
                                aria-describedby="button_hint2"
                                aria-pressed={showCurrentPasswordAM}
                            >
                                {showCurrentPasswordAM ? "Hide" : "Show"}
                            </button>  
                            <span id="button_hint2" className="hidden-content">Clicking this button allows your screen reader to read the password you have inserted</span>
                        <br />
                        <label htmlFor="new_password"> New password: </label>
                            <input 
                                id="new_password"
                                type= {showNewPassword ? "text" : "password"}
                                value={userPrivateDetails.newPassword}
                                onChange= {(e) => {
                                    setErrorMessageAM("");
                                    setSuccessMessageAM("");
                                    setPassErrorCodeAM("");
                                    setUserPrivateDetails({...userPrivateDetails, newPassword: e.target.value});
                                }}
                                required
                                aria-invalid={
                                    passErrorCodeAM === "missing_new_pass" ||
                                    passErrorCodeAM === "new_pass_wrong_format" ||
                                    passErrorCodeAM === "no_match_passwords"    ||
                                    passErrorCodeAM === "new_pass_same_old_pass"
                                }
                            />
                            <button 
                                type="button"
                                onClick= {() => setShowNewPassword(!showNewPassword)}
                                aria-describedby="button_hint3"
                                aria-pressed={showNewPassword}
                            >
                                {showNewPassword ? "Hide" : "Show"}
                            </button>
                            <span id="button_hint3" className="hidden-content">Clicking this button allows your screen reader to read the password you have inserted</span>
                        <br />
                        <label htmlFor="password_confirmation"> Confirm new password: </label>
                            <input 
                                id="password_confirmation"
                                type= {showConfirmPassword ? "text" : "password"}
                                value={userPrivateDetails.passwordConfirmation}
                                onChange= {(e) => {
                                    setErrorMessageAM("");
                                    setSuccessMessageAM("");
                                    setPassErrorCodeAM("");                                    
                                    setUserPrivateDetails({...userPrivateDetails, passwordConfirmation: e.target.value});
                                }}
                                required
                                aria-invalid={passErrorCodeAM === "no_match_passwords"}
                            />
                            <button 
                                type="button"
                                onClick= {() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-describedby="button_hint4"
                                aria-pressed={showConfirmPassword}
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button> 
                            <span id="button_hint4" className="hidden-content">Clicking this button allows your screen reader to read the password you have inserted</span>
                        <br />
                        <br />
                        <button onClick= {updateUserPrivateDetails}>Change Password</button>
                        <br />                            
                        {errorMessageAM && <h4 role="alert">{errorMessageAM}</h4>}
                        {successMessageAM && <h4 role="status">{successMessageAM}</h4>}
                    </div>
                    <div>
                        <h5>Delete your account</h5>
                    </div>
                    <div>
                        {!accountDeleteRequest ? 
                            <button onClick={() => setAccountDeleteRequest(true)}>Delete Account</button>
                            :
                            <div>
                                <label htmlFor="password_request2"> Please provide your password: </label>
                                <input
                                    id="password_request2" 
                                    type= {showCurrentPasswordDA ? "text" : "password"} 
                                    value={userAccountDeleteDetails.password}
                                    onChange= {(e) => {
                                        setErrorMessageDA(""),
                                        setPassErrorCodeDA("");
                                        setUserAccountDeleteDetails({...userAccountDeleteDetails, password: e.target.value})
                                    }}
                                    required
                                    aria-invalid={passErrorCodeDA === "missing_password" || passErrorCodeDA === "incorrect_password"}
                                />
                                <button 
                                    type="button"
                                    onClick= {() => setShowCurrentPasswordDA(!showCurrentPasswordDA)}
                                    aria-describedby="button_hint5"
                                    aria-pressed={showCurrentPasswordDA}
                                    >
                                    {showCurrentPasswordDA ? "Hide" : "Show"}
                                </button>   
                                <span id="button_hint5" className="hidden-content">Clicking this button allows your screen reader to read the password you have inserted</span>
                                <br />
                                <button onClick= {deleteAccount}> Confirm Account Deletion</button>
                            </div>
                        }
                        {errorMessageDA && <h3 role="alert">{errorMessageDA}</h3>}
                    </div>
                </div>
            :
                <div role="alert">
                    <h4> Your account is being deleted.</h4>
                    <h5> Please wait until you're redirected to our homepage.</h5>
                </div>
            }        
        </div>
    )   
}

export default DashboardProfileEdit;