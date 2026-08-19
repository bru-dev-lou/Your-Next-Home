import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";

import styles from "../dashboard/dashboard_profile_edit_comp.module.css"; 
import serverErrorImage from "../../assets/server_error_photo.png";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { BsWifiOff } from "react-icons/bs";



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
    const [ errorMessageServer, setErrorMessageServer ] = useState("");
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

                if (result.noUserError) {
                    setErrorGeneralMessage(result.noUserError); 
                }

                else if (!res.ok) {
                    setErrorMessageServer(result.error);
                }

                else {
                    setUserPublicDetails({...result.userData, phone_number: String(result.userData.phone_number,), password: ""});
                    setOriginalUserPublicDetails({...result.userData, phone_number: String(result.userData.phone_number,), password: ""})
                }
            }

            catch(error) {
                setErrorGeneralMessage("Failed to fetch user's data. Please check your internet and refresh the page.");
            }

            finally {
                setDataLoading(false)
            }

        }
        fetchData();

    }, []);

    async function updateUserPublicDetails (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        // Name validation 

        if (userPublicDetails.name.length < 5 || userPublicDetails.name.length >= 50) {
            setErrorMessageMP("Name must be between 5 and 50 characters.");
            return;
        }

        const nameHasLetters = /\p{L}/u.test(userPublicDetails.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(userPublicDetails.name);

        if (!nameHasLetters || !nameIsValidFormat) {
            setErrorMessageMP("Please include a name with no numbers.");
            return;
        }

        // Address validation 

        if (userPublicDetails.address.split(/\s+/).filter(Boolean).length < 5) {
            setErrorMessageMP("Address must be longer than 5 words.");
            return;
        }

        // Phone number validation 

        const validNumber = /^[0-9]{10,}$/.test(userPublicDetails.phone_number);
        
        if (!validNumber) {
            setErrorMessageMP("Please ensure your phone number is at least 10 digits long with no spaces or symbols.");
            return;
        }

        // Email validation 

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userPublicDetails.email);

        if (!isValidEmail) {
            setErrorMessageMP("Please include a valid email address.");
            return;
        }

        // Password check

        if (!userPublicDetails.password) {
            setErrorMessageMP("Please provide your password to confirm these changes.");
            return;
        }        

        try {
            const {password: _password1, ...detailsToCompare} = userPublicDetails;
            const {password: _password2, ...originalDetails} = originalUserPublicDetails;

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
                body: JSON.stringify({ userPublicDetails})
            });

            const result = await res.json(); 
        
            if (res.ok) {
                setMissingField("");
                setErrorMessageMP("");                
                setPassErrorCodeMP("");

                setSuccessMessageMP(result.message);
                setChangeRequest(false);

                setOriginalUserPublicDetails({...userPublicDetails, password: ""});
                setUserPublicDetails({...userPublicDetails, password: ""});

                setTimeout(() => {
                    setSuccessMessageMP("");
                }, 10000)
            }

            else if (result.passwordError) {
                setErrorMessageMP(result.passwordError);
                setPassErrorCodeMP(result.name); 

                setSuccessMessageMP("");
                setChangeRequest(true);

                setUserPublicDetails({...userPublicDetails, password: ""});            
            }

            else {
                setErrorMessageMP(result.error);
                setMissingField(result.name);

                setSuccessMessageMP("");
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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

        // Current password check

        if (!userPrivateDetails.password) {
            setErrorMessageAM("Please start by providing your password.");
            return;
        }

        // New password check & validation 

        if(!userPrivateDetails.newPassword) {
            setErrorMessageAM("Please choose a new password.");
            return;
        }

        if (userPrivateDetails.newPassword !== userPrivateDetails.passwordConfirmation) {
            setErrorMessageAM("Passwords do not match.");
            return;
        }                

        if (!passwordRegex.test(userPrivateDetails.newPassword)) {
            setErrorMessageAM("Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*].");
            return;
        }

        if (userPrivateDetails.newPassword === userPrivateDetails.password) {
            setErrorMessageAM("New password cannot be the same as old password.");
            return;
        }
        
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

        //  Password check 

        if (!userAccountDeleteDetails.password) {
            setErrorMessageDA("Please provide your password before deleting your account.");
            return; 
        }
        
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
                    setUser(null);                
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

    const publicDetailsUIreset = () => {
        setErrorMessageMP(""); 
        setSuccessMessageMP("");
        setMissingField("");
        setChangeRequest(false);
    }    

    const privateDetailsUIreset = () => {
        setErrorMessageAM("");
        setSuccessMessageAM("");
        setPassErrorCodeAM("");        
    }

    if (dataLoading) {
        return (
            <div className={styles.main_container}>
                <div className={styles.main_title}>
                    <h2 className={`${styles.h2_font} ${styles.main_title_format}`}>
                        My Profile
                    </h2>
                </div>
                <h3 role="status" className={styles.retrieving_data_message}>Fetching user data...</h3>
            </div>
        )    
    };

    if (errorMessageServer) {
        return (
            <div className={styles.main_container}>
                <div className={styles.main_title}>
                    <h2 className={`${styles.h2_font} ${styles.main_title_format}`}>
                        My Profile
                    </h2>
                </div>
                <img src={serverErrorImage} className={styles.server_error_image}/>
                <h3 role="status" className={styles.server_error_message}>{errorMessageServer}</h3>
            </div>
        )    
    }

    if (errorGeneralMessage){
        return (
            <div className={styles.main_container}>
                <div className={styles.main_title}>
                    <h2 className={`${styles.h2_font} ${styles.main_title_format}`}>
                        My Profile
                    </h2>
                </div> 
            <span><BsWifiOff className={styles.no_internet_react_icon}/></span>
            <h3 role="alert" className={styles.no_user_data_error}>{errorGeneralMessage}</h3>
            </div>
        )    
    };

    return (
        <div className={styles.main_container}>
            <div className={styles.main_title}>
                <h2 className={`${styles.h2_font} ${styles.main_title_format}`}>
                    My Profile
                </h2>
            </div>
            <div className={styles.subtitle_1_container}>
                <h3 className={`${styles.h3_font} ${styles.subtitle_1_item}`}>Edit Profile</h3>
                {errorMessageMP && <h4 role="alert" className={styles.profile_error_message}>{errorMessageMP}</h4>}         
                {successMessageMP && <h4 role="status" className ={styles.profile_success_message}>{successMessageMP}</h4>}   
                {!errorMessageMP && !successMessageMP && 
                    <h4 className={`${styles.h4_font} ${styles.subtitle_1_info}`}>
                        Profile Information - This is what others can see about you.
                    </h4>
                }
                <div className={styles.edit_profile_container}>
                    <label htmlFor="name" className={styles.h4_font}> Name: </label>
                    <input 
                        id="name"
                        type="text"
                        value= {userPublicDetails.name}
                        onChange={(e) => {
                            publicDetailsUIreset();
                            setUserPublicDetails({...userPublicDetails, name: e.target.value});
                        }} 
                        required
                        className={styles.input_format}
                        aria-invalid={missingField === "name"}
                    />
                    <label htmlFor="address" className={styles.h4_font}> Address: </label>
                    <input 
                        id="address"
                        type="text"
                        value= {userPublicDetails.address}
                        onChange={(e) => {
                            publicDetailsUIreset();
                            setUserPublicDetails({...userPublicDetails, address: e.target.value});
                        }} 
                        required
                        aria-invalid={missingField === "address"}
                        className={styles.input_format}
                    />
                    <label htmlFor="phone_number" className={styles.h4_font}> Phone Number: </label> 
                    <input 
                        id="phone_number"
                        type="tel"
                        value= {userPublicDetails.phone_number}
                        onChange={(e) => {
                            publicDetailsUIreset();
                        
                            const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
                            setUserPublicDetails({...userPublicDetails, phone_number: numbersOnly});
                        }} 
                        required
                        aria-invalid={missingField === "number"}
                        className={styles.input_format}
                    />
                    <label htmlFor="email" className={styles.h4_font}> Email: </label> 
                    <input 
                        id="email"
                        type="email"
                        value= {userPublicDetails.email}
                        onChange={(e) => {
                            publicDetailsUIreset();
                            setUserPublicDetails({...userPublicDetails, email: e.target.value});
                        }} 
                        required
                        aria-invalid={missingField === "email"}
                        className={styles.input_format}
                    />
                    {!changeRequest ? 
                        <button 
                            onClick={() => setChangeRequest(true)}
                            className={styles.save_profile_changes_button}    
                        >
                            Save Changes
                        </button>
                    :
                        <>
                            <label htmlFor="password_request1" className={styles.h4_font}> Provide password: </label>
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
                                className={styles.input_format}
                            />                                                      
                            <button 
                                type="button"
                                onClick= {() => setShowCurrentPasswordMP(!showCurrentPasswordMP)}
                                aria-describedby="button_hint1"
                                aria-pressed={showCurrentPasswordMP}
                                className={styles.show_hide_password_button_MP}
                            >
                                {showCurrentPasswordMP ? <LuEye/> : <LuEyeClosed/>}
                            </button>  
                            <span id="button_hint1" className={styles.sr_content}>
                                Clicking this button allows your screen reader to read the password you have inserted
                            </span>                            
                            <button 
                                onClick= {updateUserPublicDetails}
                                className={styles.confirm_profile_changes_button}
                            >
                                Confirm Changes
                            </button>         
                        </>          
                    }               
                </div>                    
            </div>
            <div className={styles.subtitle_2_container}>
                <h3 className={`${styles.h3_font} ${styles.subtitle_2_item}`}>Account Management</h3>
                {errorMessageAM && <h4 role="alert" className={styles.account_error_message}>{errorMessageAM}</h4>}
                {successMessageAM && <h4 role="status" className={styles.account_success_message}>{successMessageAM}</h4>}
                {!errorMessageAM && !successMessageAM &&
                    <h4 className={`${styles.h4_font} ${styles.subtitle_2_info}`}>Password Change</h4>
                }
                <div className={styles.account_management_container}>
                    <label htmlFor="current_password" className={styles.h4_font}> Current password: </label>
                    <input 
                        id="current_password"
                        type= {showCurrentPasswordAM ? "text" : "password"}
                        value={userPrivateDetails.password}
                        onChange= {(e) => {
                            privateDetailsUIreset();
                            setUserPrivateDetails({...userPrivateDetails, password: e.target.value});
                        }}
                        required
                        aria-invalid={passErrorCodeAM === "missing_current_pass" || passErrorCodeAM === "incorrect_current_pass"}
                        className={styles.input_format}
                    />
                    <button 
                        type="button"
                        onClick= {() => setShowCurrentPasswordAM(!showCurrentPasswordAM)}
                        aria-describedby="button_hint2"
                        aria-pressed={showCurrentPasswordAM}
                        className={styles.show_hide_password_button_AM}
                    >
                        {showCurrentPasswordAM ? <LuEye/> : <LuEyeClosed/>}                              
                    </button>  
                    <span id="button_hint2" className={styles.sr_content}>
                        Clicking this button allows your screen reader to read the password you have inserted
                    </span>
                    <label htmlFor="new_password" className={styles.h4_font}> New password: </label>
                    <input 
                        id="new_password"
                        type= {showNewPassword ? "text" : "password"}
                        value={userPrivateDetails.newPassword}
                        onChange= {(e) => {
                            privateDetailsUIreset();
                            setUserPrivateDetails({...userPrivateDetails, newPassword: e.target.value});
                        }}
                        required
                        aria-invalid={
                            passErrorCodeAM === "missing_new_pass" ||
                            passErrorCodeAM === "new_pass_wrong_format" ||
                            passErrorCodeAM === "no_match_passwords"    ||
                            passErrorCodeAM === "new_pass_same_old_pass"
                        }
                        className={styles.input_format}
                    />
                    <button 
                        type="button"
                        onClick= {() => setShowNewPassword(!showNewPassword)}
                        aria-describedby="button_hint3"
                        aria-pressed={showNewPassword}
                        className={styles.show_hide_password_button_AM}
                    >
                        {showNewPassword ? <LuEye/> : <LuEyeClosed/>}                                                               
                    </button>
                    <span id="button_hint3" className={styles.sr_content}>
                        Clicking this button allows your screen reader to read the password you have inserted
                    </span>
                    <label htmlFor="password_confirmation" className={styles.h4_font}> Confirm new password: </label>
                    <input 
                        id="password_confirmation"
                        type= {showConfirmPassword ? "text" : "password"}
                        value={userPrivateDetails.passwordConfirmation}
                        onChange= {(e) => {
                            privateDetailsUIreset();
                            setUserPrivateDetails({...userPrivateDetails, passwordConfirmation: e.target.value});
                        }}
                        required
                        aria-invalid={passErrorCodeAM === "no_match_passwords"}
                        className={styles.input_format}
                    />
                    <button 
                        type="button"
                        onClick= {() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-describedby="button_hint4"
                        aria-pressed={showConfirmPassword}
                        className={styles.show_hide_password_button_AM}
                    >
                        {showConfirmPassword ? <LuEye/> : <LuEyeClosed/>}                                                                    
                    </button> 
                    <span id="button_hint4" className={styles.sr_content}>
                        Clicking this button allows your screen reader to read the password you have inserted
                    </span>
                    <button 
                        onClick= {updateUserPrivateDetails}
                        className={styles.change_password_confirm_button}
                    >
                        Change Password
                    </button>
                </div>
            </div>
            <div className={styles.subtitle_3_container}>
                <div className={styles.delete_account_container}>   
                    {errorMessageDA ? 
                        <h3 role="alert" className={styles.delete_account_error_message}>{errorMessageDA}</h3>
                    :
                        <h4 className={`${styles.h4_font} ${styles.delete_account_title}`}>Delete Account</h4>
                    }
                    {!accountDeleteRequest ? 
                        <button 
                            onClick={() => setAccountDeleteRequest(true)}
                            className={`${styles.delete_account_buttons} ${styles.delete_account_button_custom_format}`}
                        >
                            Delete Account
                        </button>
                    :
                        <>
                            <label htmlFor="password_request2" className={styles.h4_font}> Provide Password: </label>
                            <input
                                id="password_request2" 
                                type= {showCurrentPasswordDA ? "text" : "password"} 
                                value={userAccountDeleteDetails.password}
                                onChange= {(e) => {
                                    setErrorMessageDA("");
                                    setPassErrorCodeDA("");
                                    setUserAccountDeleteDetails({...userAccountDeleteDetails, password: e.target.value})
                                }}
                                required
                                aria-invalid={passErrorCodeDA === "missing_password" || passErrorCodeDA === "incorrect_password"}
                                className={styles.input_format}
                            />
                            <button 
                                type="button"
                                onClick= {() => setShowCurrentPasswordDA(!showCurrentPasswordDA)}
                                aria-describedby="button_hint5"
                                aria-pressed={showCurrentPasswordDA}
                                className={styles.show_hide_password_button_DA}
                            >
                                {showCurrentPasswordDA ? <LuEye/> : <LuEyeClosed/>}                                                                  
                            </button>   
                            <span id="button_hint5" className={styles.sr_content}>
                                Clicking this button allows your screen reader to read the password you have inserted
                            </span>
                        </>
                    }                                 
                </div>            
            </div>
            <div className={styles.subtitle_4_container}>        
                <div className={styles.account_deleted_container}>
                    {accountDeleted && accountDeleteRequest &&
                        <>
                            <h3 className={styles.account_deleted_feedback}> Your account is being deleted, please wait.</h3>
                            <h3 className={styles.account_deleted_feedback}> Thank you for using our services!</h3>
                        </>
                    }                                    
                    {!accountDeleted && accountDeleteRequest &&
                        <button onClick= {deleteAccount} className={`${styles.delete_account_buttons} ${styles.confirm_account_deletion_button_custom_format}`}> Confirm Account Deletion</button>
                    }                       
                </div>
            </div>
        </div>
    )   
}

export default DashboardProfileEdit;