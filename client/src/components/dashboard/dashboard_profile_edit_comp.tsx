import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";

import styles from "../dashboard/dashboard_profile_edit_comp.module.css"; 
import serverErrorImage from "../../assets/server_error_photo.png";
import { LuEye, LuEyeClosed } from "react-icons/lu";



type UserPublicData = {
    username: string;
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

    const [ originalUserPublicDetails, setOriginalUserPublicDetails] = useState<UserPublicData>({username: "", name: "", address: "", phone_number: "", email: "", password: ""}); 
    const [ userPublicDetails, setUserPublicDetails ] = useState<UserPublicData>({username: "", name: "", address: "", phone_number: "", email: "", password: ""}); 

    const [ userPrivateDetails, setUserPrivateDetails ] = useState<UserPrivateData>({password: "", newPassword: "", passwordConfirmation: ""});
    const [ userAccountDeleteDetails, setUserAccountDeleteDetails ] = useState<UserAccountDeleteData>({password: ""});
    
    // Error Messages - EP = Edit Profile / AM = Account Management / DA = Delete Account 

    const [ errorGeneralMessage, setErrorGeneralMessage ] = useState("");
    const [ errorMessageServer, setErrorMessageServer ] = useState("");
    const [ errorMessageEP, setErrorMessageEP ] = useState(""); 
    const [ successMessageMP, setSuccessMessageMP ] = useState("");
    const [ errorMessageAM, setErrorMessageAM ] = useState(""); 
    const [ longErrorMessageAM, setLongErrorMessageAM ] = useState("");
    const [ successMessageAM, setSuccessMessageAM ] = useState("");
    const [ errorMessageDA, setErrorMessageDA ] = useState(""); 

    // Show / Hide password button states.

    const [ showCurrentPasswordEP, setShowCurrentPasswordEP ] = useState(false);
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
    const [ passErrorCodeEP, setPassErrorCodeEP ] = useState(""); 
    const [ passErrorCodeAM, setPassErrorCodeAM] = useState(""); 
    const [ passErrorCodeDA, setPassErrorCodeDA ] = useState(""); 
    

    // User data fetch 

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
                console.error(error);
                setErrorGeneralMessage("Failed to fetch user's data. \n Please check your internet and refresh the page.");
            }

            finally {
                setDataLoading(false);
            }
        }
        fetchData();

    }, []);

    // UI reset for Edit Profile page section 

    const publicDetailsUIreset = () => {
        setErrorMessageEP(""); 
        setSuccessMessageMP("");
        setMissingField("");
        setChangeRequest(false);
    }    

    const publicDetaisUIresetForPassword = () => {
        setErrorMessageEP(""); 
        setSuccessMessageMP("");
        setMissingField("");
    }

    const passwordAndChangeRequestReset = () => {
        setChangeRequest(false);
        setOriginalUserPublicDetails({...userPublicDetails, password: ""});
        setUserPublicDetails({...userPublicDetails, password: ""});
    }

    async function updateUserPublicDetails (e:React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        publicDetaisUIresetForPassword()
        
        
        //  Empty field checks

        const fieldCheck = [
            {field: userPublicDetails.name, error: "Please provide your name to update your profile.", name: "name"},
            {field: userPublicDetails.address,  error: "Please provide your address to update your profile.", name: "address"},
            {field: userPublicDetails.phone_number,  error: "Please provide your phone number to update your profile.", name: "number"},
            {field: userPublicDetails.email, error: "Please provide your email to update your profile.", name: "email"}
        ];

        for (const {field, error, name} of fieldCheck) {
            if (!field) {
                setErrorMessageEP(error);
                setMissingField(name);
                passwordAndChangeRequestReset();
                return;
            }
        }

        // Name validation 

        if (userPublicDetails.name.length < 5) {
            setErrorMessageEP("Please include a name at least 5 characters long.");
            passwordAndChangeRequestReset();
            return;
        }

        if (userPublicDetails.name.length > 20) {
            setErrorMessageEP("Please include a name shorter than 20 characters.");
            passwordAndChangeRequestReset();
            return;
        }

        const nameHasLetters = /\p{L}/u.test(userPublicDetails.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(userPublicDetails.name);

        if (!nameHasLetters || !nameIsValidFormat) {
            setErrorMessageEP("Please include a name with no special characters.");
            passwordAndChangeRequestReset();
            return;
        }

        // Address validation 

        if (userPublicDetails.address.length < 5) {
            setErrorMessageEP("Please include an address at least 5 characters long.");
            passwordAndChangeRequestReset();
            return;
        }

        if (userPublicDetails.address.length > 40) {
            setErrorMessageEP("Please include an address shorter than 40 characters.");
            passwordAndChangeRequestReset();
            return;
        }

        // Phone number validation 

        if (userPublicDetails.phone_number.length > 20) {
            setErrorMessageEP("Phone number must be shorter than 20 digits.");
            passwordAndChangeRequestReset();
            return;
        }

        const validNumber = /^[0-9]{10,}$/.test(userPublicDetails.phone_number);
        
        if (!validNumber) {
            setErrorMessageEP("Please ensure your phone number is at least 10 digits long.");
            passwordAndChangeRequestReset();
            return;
        }

        // Email validation 

        if (userPublicDetails.email.length > 50) {
            setErrorMessageEP("Please include an email shorter than 50 characters.");
            passwordAndChangeRequestReset();
            return; 
        }        

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userPublicDetails.email);

        if (!isValidEmail) {
            setErrorMessageEP("Please include a valid email address.");
            passwordAndChangeRequestReset();
            return;
        }

        // Password check

        if (!userPublicDetails.password) {
            setErrorMessageEP("Please provide your password to confirm these changes.");
            setPassErrorCodeEP("missing_password");
            return;
        }        

        // No changes validation

        const {password: _password1, ...detailsToCompare} = userPublicDetails;
        const {password: _password2, ...originalDetails} = originalUserPublicDetails;

        if (JSON.stringify(detailsToCompare) === JSON.stringify(originalDetails)) {
            setErrorMessageEP("Please update at least one field.");
            passwordAndChangeRequestReset();
            return;
        }        

        try {
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
                setErrorMessageEP("");                
                setPassErrorCodeEP("");

                setSuccessMessageMP(result.message);
                passwordAndChangeRequestReset();

                setTimeout(() => {
                    setSuccessMessageMP("");
                }, 10000)
            }

            else if (result.passwordError) {
                setErrorMessageEP(result.passwordError);
                setPassErrorCodeEP(result.name); 

                setSuccessMessageMP("");
                passwordAndChangeRequestReset();      
            }

            else {
                setErrorMessageEP(result.error);
                setMissingField(result.name);
                
                setSuccessMessageMP("");
                passwordAndChangeRequestReset();    
            }
        }

        catch (error) {
            console.error(error);
            setErrorMessageEP("Please check your internet and refresh the page.")
        };
    }

    async function updateUserPrivateDetails (e:React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault(); 
        privateDetailsUIreset();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

        // Current password check

        if (!userPrivateDetails.password) {
            setErrorMessageAM("Please start by providing your password.");
            setPassErrorCodeAM("missing_current_pass");
            return;
        }

        // New password check & validation 

        if(!userPrivateDetails.newPassword) {
            setErrorMessageAM("Please choose a new password.");
            setPassErrorCodeAM("missing_new_pass");
            return;
        }

        if (userPrivateDetails.newPassword !== userPrivateDetails.passwordConfirmation) {
            setErrorMessageAM("Passwords do not match.");
            setPassErrorCodeAM("no_match_passwords");
            return;
        }                

        if (!passwordRegex.test(userPrivateDetails.newPassword)) {
            setLongErrorMessageAM("Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*].");
            setPassErrorCodeAM("new_pass_wrong_format");
            return;
        }

        if (userPrivateDetails.newPassword === userPrivateDetails.password) {
            setErrorMessageAM("New password cannot be the same as old password.");
            setPassErrorCodeAM("new_pass_same_old_pass");
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

            else if (result.longError) {
                setErrorMessageAM("");
                setSuccessMessageAM("");
                setLongErrorMessageAM(result.longError);
                setPassErrorCodeAM(result.name); 
            }

            else {
                setSuccessMessageAM("");
                setErrorMessageAM(result.error);
                setPassErrorCodeAM(result.name); 
            }
        }
            
        catch (error) {
            console.error(error);
            setErrorMessageAM("Please check your internet and refresh the page.")
        }
    }

    async function deleteAccount (e:React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessageDA("");
        setPassErrorCodeDA("");

        //  Password check 

        if (!userAccountDeleteDetails.password) {
            setErrorMessageDA("Please provide your password before deleting your account.");
            setPassErrorCodeDA("missing_password");
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
            console.error(error);
            setErrorMessageDA("Please check your internet and refresh the page.")
        }
    }

    const privateDetailsUIreset = () => {
        setErrorMessageAM("");
        setLongErrorMessageAM("");
        setSuccessMessageAM("");
        setPassErrorCodeAM("");        
    }

    if (dataLoading) {
        return (
            <div className={styles.error_container}>
                <div className={styles.main_title_container}>
                    <h1 className={styles.sr_content}> My Profile </h1>
                    <span 
                        role="status"
                        className={styles.main_title}
                    >
                        Fetching user data...
                    </span>
                </div>
            </div>
        )    
    };

    if (errorMessageServer) {
        return (
            <div className={styles.error_container}>
                <div className={styles.main_title_container}>
                    <h1 className={styles.main_title}>
                        My Profile
                    </h1>
                </div>
                <img alt="Server error illustration" src={serverErrorImage} className={styles.server_error_image}/>
                <span role="alert" className={styles.server_error_message}>{errorMessageServer}</span>
            </div>
        )    
    }

    if (errorGeneralMessage){
        return (
            <div className={styles.error_container}>
                <div className={styles.main_title_container}>
                    <h1 className={styles.main_title}>
                        My Profile
                    </h1>
                </div> 
                <div className={styles.error_message_container}>
                    <img alt="Server error illustration" src={serverErrorImage} className={styles.server_error_image}/>
                    <span role="alert" className={styles.no_user_data_error}>{errorGeneralMessage}</span>
                </div>
            </div>
        )    
    };

    return (
        <div className={styles.main_container}>
            <div className={styles.main_title_container}>
                <h1 className={styles.main_title}>
                    My Profile
                </h1>
            </div>
            <div className={styles.edit_profile_container}>
                <div className={styles.edit_profile_titles_subtitles_container}>
                    <h2 className={styles.edit_profile_title}>Edit Profile</h2>
                    {errorMessageEP && <span role="alert" className={styles.edit_profile_error_message}>{errorMessageEP}</span>}         
                    {successMessageMP && <span role="status" className ={styles.edit_profile_success_message}>{successMessageMP}</span>}   
                    {!errorMessageEP && !successMessageMP && 
                        <span className={styles.edit_profile_subtitle}>
                            Profile Information - This is what others can see about you.
                        </span>
                    }
                </div>
                <form 
                    onSubmit={updateUserPublicDetails}
                    className={styles.edit_profile_user_data_container}
                    noValidate
                >
                    <div className={styles.edit_profile_labels_and_inputs}>
                        <label htmlFor="name" className={styles.edit_profile_label_format}> Name: </label>
                        <input 
                            id="name"
                            type="text"
                            value= {userPublicDetails.name}
                            onChange={(e) => {
                                publicDetailsUIreset();
                                setUserPublicDetails({...userPublicDetails, name: e.target.value});
                            }} 
                            required
                            className={styles.edit_profile_input_format}
                            aria-invalid={missingField === "name"}
                        />
                    </div>
                    <div className={styles.edit_profile_labels_and_inputs}>
                        <label htmlFor="address" className={styles.edit_profile_label_format}> Address: </label>
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
                            className={styles.edit_profile_input_format}
                        />
                    </div>
                    <div className={styles.edit_profile_labels_and_inputs}>
                        <label htmlFor="phone_number" className={styles.edit_profile_label_format}> Phone Number: </label> 
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
                            className={styles.edit_profile_input_format}
                        />
                    </div>
                    <div className={styles.edit_profile_labels_and_inputs}>
                        <label htmlFor="email" className={styles.edit_profile_label_format}> Email: </label> 
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
                            className={styles.edit_profile_input_format}
                        />
                    </div>
                    {!changeRequest ? 
                            <button 
                                type="button"
                                onClick={() => setChangeRequest(true)}
                                className={styles.edit_profile_save_changes_button}    
                            >
                                Save Changes
                            </button>
                    :
                        <div className={styles.password_container}>
                            <div className={styles.edit_profile_labels_and_inputs}>
                                <label htmlFor="password_request_1" className={styles.edit_profile_label_format}> Provide password: </label>
                                <input 
                                    value = {originalUserPublicDetails.username}
                                    autoComplete="username"
                                    aria-hidden="true"
                                    className={styles.sr_content}
                                    tabIndex={-1}
                                    readOnly 
                                />
                                <input 
                                    id="password_request_1"
                                    type= {showCurrentPasswordEP ? "text" : "password"} 
                                    value = {userPublicDetails.password}
                                    onChange= {(e) => {
                                        publicDetaisUIresetForPassword();
                                        setUserPublicDetails({...userPublicDetails, password: e.target.value});
                                    }}
                                    required
                                    aria-invalid={passErrorCodeEP === "missing_password" || passErrorCodeEP === "incorrect_password"}
                                    autoComplete="current-password"
                                    className={`${styles.edit_profile_input_format} ${styles.password_input_padding}`}
                                />                                                      
                                <button 
                                    type="button"
                                    onClick= {() => setShowCurrentPasswordEP(!showCurrentPasswordEP)}
                                    aria-label="Show password"
                                    aria-pressed={showCurrentPasswordEP}
                                    className={styles.show_hide_password_button_EP}
                                >
                                    {showCurrentPasswordEP ? <LuEye/> : <LuEyeClosed/>}
                                </button>  
                            </div>                          
                            <button 
                                type="submit"
                                className={styles.edit_profile_confirm_changes_button}
                            >
                                Confirm Changes
                            </button>      
                        </div>                             
                    }
                </form>
            </div>          
            <div className={styles.account_management_container}>
                <div className={styles.account_management_titles_and_subtitles}>
                    <h2 className={styles.account_management_title}>Account Management</h2>
                    {errorMessageAM && <span role="alert" className={styles.account_management_error_message}>{errorMessageAM}</span>}
                    {longErrorMessageAM && <span role="alert" className={styles.account_management_long_error_message}>{longErrorMessageAM}</span>}
                    {successMessageAM && <span role="status" className={styles.account_management_success_message}>{successMessageAM}</span>}
                    {!errorMessageAM && !longErrorMessageAM && !successMessageAM &&
                        <span className={styles.account_management_subtitle}>Password Change</span>
                    }
                </div>
                <form 
                    onSubmit={updateUserPrivateDetails}
                    className={styles.password_change_container}
                    noValidate
                >
                    <div className={styles.account_management_labels_and_inputs}>
                        <label htmlFor="current_password" className={styles.account_management_label_format}> Current password: </label>
                        <input 
                            value = {originalUserPublicDetails.username}
                            autoComplete="username"
                            aria-hidden="true"
                            className={styles.sr_content}
                            tabIndex={-1}
                            readOnly 
                        />                        
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
                            autoComplete="current-password"
                            className={`${styles.account_management_input_format} ${styles.password_input_padding}`}
                        />
                        <button 
                            type="button"
                            onClick= {() => setShowCurrentPasswordAM(!showCurrentPasswordAM)}
                            aria-label="Show current password"
                            aria-pressed={showCurrentPasswordAM}
                            className={styles.show_hide_password_button_AM}
                        >
                            {showCurrentPasswordAM ? <LuEye/> : <LuEyeClosed/>}                              
                        </button>  
                    </div>
                    <div className={styles.account_management_labels_and_inputs}>
                        <label htmlFor="new_password" className={styles.account_management_label_format}> New password: </label>
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
                            autoComplete="new-password"
                            className={`${styles.account_management_input_format} ${styles.password_input_padding}`}
                        />
                        <button 
                            type="button"
                            onClick= {() => setShowNewPassword(!showNewPassword)}
                            aria-label="Show new password"
                            aria-pressed={showNewPassword}
                            className={styles.show_hide_password_button_AM}
                        >
                            {showNewPassword ? <LuEye/> : <LuEyeClosed/>}                                                               
                        </button>
                    </div>
                    <div className={styles.account_management_labels_and_inputs}>
                        <label htmlFor="password_confirmation" className={styles.account_management_label_format}> Confirm new password: </label>
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
                            autoComplete="new-password"
                            className={`${styles.account_management_input_format} ${styles.password_input_padding}`}
                        />
                        <button 
                            type="button"
                            onClick= {() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="Show confirm new password"
                            aria-pressed={showConfirmPassword}
                            className={styles.show_hide_password_button_AM}
                        >
                            {showConfirmPassword ? <LuEye/> : <LuEyeClosed/>}                                                                    
                        </button> 
                    </div>
                    <button 
                        type="submit"
                        className={styles.change_password_confirm_button}
                    >
                        Change Password
                    </button>
                </form>                       
            </div>
            <form 
                onSubmit={deleteAccount}
                className={styles.delete_account_container}
                noValidate
            >
                {errorMessageDA ? 
                    <span role="alert" className={styles.delete_account_error_message}>{errorMessageDA}</span>
                :
                    <h2 className={styles.delete_account_title}>Delete Account</h2>
                }
                {!accountDeleteRequest ? 
                    <button 
                        type="button"
                        onClick={() => setAccountDeleteRequest(true)}
                        className={styles.delete_account_request_button}    
                    >
                        Delete Account
                    </button>
                :
                    <div 
                        className={styles.delete_account_labels_and_inputs}
                        style={{display: accountDeleteRequest && accountDeleted ? "none" : "flex" }}
                    >
                        <label htmlFor="password_request_2" className={styles.delete_account_label_format}> Provide Password: </label>
                        <input 
                            value = {originalUserPublicDetails.username}
                            autoComplete="username"
                            aria-hidden="true"
                            className={styles.sr_content}
                            tabIndex={-1}
                            readOnly 
                        />                        
                        <input
                            id="password_request_2" 
                            type= {showCurrentPasswordDA ? "text" : "password"} 
                            value={userAccountDeleteDetails.password}
                            onChange= {(e) => {
                                setErrorMessageDA("");
                                setPassErrorCodeDA("");
                                setUserAccountDeleteDetails({...userAccountDeleteDetails, password: e.target.value})
                            }}
                            required
                            aria-invalid={passErrorCodeDA === "missing_password" || passErrorCodeDA === "incorrect_password"}
                            autoComplete="current-password"
                            className={`${styles.delete_account_input_format} ${styles.password_input_padding}`}
                        />
                        <button 
                            type="button"
                            onClick= {() => setShowCurrentPasswordDA(!showCurrentPasswordDA)}
                            aria-label="Show provide password"
                            aria-pressed={showCurrentPasswordDA}
                            className={styles.show_hide_password_button_DA}
                        >
                            {showCurrentPasswordDA ? <LuEye/> : <LuEyeClosed/>}                                                                  
                        </button>   
                    </div>
                }                                 
                <div className={styles.account_deleted_container}>
                    {!accountDeleted && accountDeleteRequest &&
                        <button type="submit" className={styles.delete_account_confirm_button}> Confirm Account Deletion</button>
                    }     
                    {accountDeleted && accountDeleteRequest &&
                        <div role="alert">
                            <span className={styles.account_deleted_message}> Your account is being deleted, please wait.</span>
                            <span className={styles.account_deleted_message}> Thank you for using our services!</span>
                        </div>    
                    }
                    <br></br>                                  
                </div>
            </form>
        </div>
    )   
}

export default DashboardProfileEdit;