import { useState } from 'react';
import { apiFetch } from "../../api";

import styles from "../../components/auth/sign_up_comp.module.css"; 
import { LuEye, LuEyeClosed } from "react-icons/lu";


type NewUserData = {
    username: string;
    name: string;
    address: string;
    number: string;
    email: string;
    password: string;
    confirmPass: string;
}

function SignUp () {
    const [ data, setData ] = useState<NewUserData>({username: "", name: "", address: "", number: "", email: "", password: "", confirmPass: ""});
    
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ errorField, setErrorField ] = useState(""); 
    const [ successMessage, setSuccessMessage ] = useState(""); 

    const [ showPassword, setShowPassword ] = useState(false);
    const [ showConfirmPassword, setConfirmShowPassword ] = useState(false);
   
    const createAccount = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearFeedback();

        // Remove whitespaces to avoid bypassing length validations

        const cleanData = {
            ...data,
            username: data.username.trim(),
            name: data.name.trim(),
            address: data.address.trim(),
            email: data.email.trim().toLowerCase(), 
        };
        
        // Empty field check

        const blankFieldCheck = [
            {field: cleanData.username, missingFieldError:"Please choose a username", name: "username"},
            {field: cleanData.name, missingFieldError: "Please provide your name / company's name", name: "name"},
            {field: cleanData.address, missingFieldError: "Please provide your address / company's address", name: "address"},
            {field: cleanData.number, missingFieldError: "Please provide your phone number / company's phone number", name: "phone_number"},
            {field: cleanData.email, missingFieldError: "Please provide your email address", name: "email"},
            {field: cleanData.password, missingFieldError: "Please choose a password", name: "password"},
            {field: cleanData.confirmPass, missingFieldError: "Please confirm your chosen password", name: "confirm_password"}
        ];

        for (const {field, missingFieldError, name} of blankFieldCheck) {
            if(!field) {
                setErrorMessage(missingFieldError);
                setErrorField(name);
                return;
            }
        } 

        //  Username validation 

        if (cleanData.username.length < 5 || cleanData.username.length > 20) {
            setErrorMessage("Username must be between 5 and 20 characters");
            setErrorField("username");
            return; 
        }

        //  Name validation 

        const nameHasLetters = /\p{L}/u.test(cleanData.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(cleanData.name);

        if (!nameHasLetters || !nameIsValidFormat) {
            setErrorMessage("Name must include no special characters");
            setErrorField("name");
            return;
        }         

        if (cleanData.name.length < 5 || cleanData.name.length > 20) {
            setErrorMessage("Name must be between 5 and 20 characters");
            setErrorField("name");
            return;
        }

        // Address validation 

        if (cleanData.address.length < 5 ||  cleanData.address.length > 40) {
            setErrorMessage("Address must be between 5 and 40 characters");
            setErrorField("address");
            return;
        }

        //  Phone number validation 

        const validNumber = /^[0-9]+$/.test(cleanData.number);

        if (!validNumber) {
           setErrorMessage("Phone number must only include numbers");
           setErrorField("phone_number");
           return; 
        }

        if (cleanData.number.length < 10 || cleanData.number.length > 20) {
            setErrorMessage("Phone number must be between 10 and 20 digits");
            setErrorField("phone_number");
            return;
        }

        //  Email validation 

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanData.email);

        if (!isValidEmail) {
            setErrorMessage("Please include a valid email address");
            setErrorField("email")
            return;
        }

        if (cleanData.email.length > 50) {
            setErrorMessage("Email must be shorter than 50 characters");
            setErrorField("email")
            return; 
        }

        // Password validation 

        if (cleanData.confirmPass !== cleanData.password) {
            setErrorMessage("Passwords must match");
            setErrorField("confirm_password")
            return; 
        }    

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

        if (!passwordRegex.test(cleanData.password)) {
            setErrorMessage("Incorrect password format");
            setErrorField("password");
            return;
        }

        try {
            const res = await apiFetch("/api/signUp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cleanData)
            });
            
            const result = await res.json(); 

            if (res.ok) {
                setSuccessMessage(result.message);
                setErrorMessage("");
                setErrorField("");
            }

            else if (result.missingError) {
                setErrorMessage(result.missingError);
                setErrorField(result.name);
            }

            else if (result.validationError) {
                setErrorMessage(result.validationError);
                setErrorField(result.name);
            }

            else if (result.existingError) {
                setErrorMessage(result.existingError);
                setErrorField(result.name);
            }

            else {
                setErrorMessage(result.serverError)
            }
        }

        catch(error) {
            console.error(error);
            setErrorMessage("Please check your internet and refresh the page.")
        }
    };

    // Clear feedback messages function so ARIA-INVALID resets and reduce verbose in JSX return

    const clearFeedback = () => {
        setErrorMessage("");
        setErrorField("");
        setSuccessMessage("");
    }

    return (
        <form 
            onSubmit={createAccount}
            noValidate
            className={styles.main_container}
        >
            <h2 className={styles.main_title}> Make an account with us, it's easy!</h2>
            <div className={styles.user_info_main_container}>
                <div className={styles.user_info_sub_container}>
                    <label htmlFor="username" className={styles.label_format}> Username: </label>
                    <input 
                        id="username"
                        type="text"
                        value={data.username}
                        maxLength={20}
                        onChange={(e) => {
                            setData({...data, username: e.target.value});
                            clearFeedback();
                        }}
                        autoComplete="username"
                        aria-describedby="username_hint"
                        aria-invalid={errorField === "username"}
                        className={styles.input_format}
                    />
                    <span id="username_hint" className={styles.feedback_content}>
                        Choose a username to set up your account. <br /> 
                        This information is <span className={styles.feedback_emphasis}>private</span>. 
                    </span>
                </div>
                <div className={styles.user_info_sub_container}>
                    <label htmlFor="name" className={styles.label_format}> Name: </label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        maxLength={40}
                        onChange= {(e) => {
                            setData({...data, name: e.target.value});
                            clearFeedback();                 
                        }}
                        aria-describedby="name_hint"
                        aria-invalid={errorField === "name"}
                        className={styles.input_format}
                    />
                    <span id="name_hint" className={styles.feedback_content}>
                        Provide your name / company's name. <br />
                        This information is <span className={styles.feedback_emphasis}>public</span>.
                    </span>
                </div>
                <div className={styles.user_info_sub_container}>
                    <label htmlFor="address" className={styles.label_format}> Address: </label>
                    <input 
                        id="address"
                        type= "text"
                        value={data.address}
                        maxLength={40}
                        onChange= {(e) => {
                            const addressWords = e.target.value.split(/\s+/).filter(Boolean);
                            if (addressWords.length <= 25) {
                                setData({...data, address: e.target.value});
                                clearFeedback();                 
                            }
                        }}                            
                        aria-describedby="address_hint"
                        aria-invalid={errorField === "address"}
                        className={styles.input_format}
                    />
                    <span id="address_hint" className={styles.feedback_content}>
                        Provide your address / company's address. <br />
                        This information is <span className={styles.feedback_emphasis}>public</span>.
                    </span>
                </div>
                <div className={styles.user_info_sub_container}>
                    <label htmlFor="phone_number" className={styles.label_format}> Phone Number:</label>
                    <input
                        id="phone_number"
                        type= "tel"
                        value= {data.number}
                        maxLength={20}
                        onChange= {(e) => {
                            const filteredNumber = e.target.value.replace(/[^0-9]/g, "");   
                            setData({...data, number: filteredNumber});
                            clearFeedback();
                        }}
                        aria-describedby="phone_number_hint"
                        aria-invalid={errorField === "phone_number"}
                        className={styles.input_format}
                    />
                    <span id="phone_number_hint"className={styles.feedback_content}>
                        Provide your number / company's number. <br />
                        This information is <span className={styles.feedback_emphasis}>public</span>.
                    </span>      </div>
                <div className={styles.user_info_sub_container}>
                    <label htmlFor="email_address" className={styles.label_format}> Email: </label>
                    <input
                        id="email_address"
                        type="email"
                        value= {data.email}
                        maxLength={50}
                        onChange={(e) => { 
                            setData({...data, email: e.target.value});
                            clearFeedback();
                        }}
                        aria-describedby="email_hint"           
                        aria-invalid={errorField === "email"}   
                        className={styles.input_format}  
                    />
                    <span id="email_hint" className={styles.feedback_content}>
                        Provide your email / company's email. <br />
                        This information is <span className={styles.feedback_emphasis}>private</span>.
                    </span>       
                </div>
                <div className={styles.user_info_sub_container}>
                    <label htmlFor="password" className={styles.label_format}> Password: </label>
                    <div className={styles.password_wrapper}>
                        <input
                            id="password"
                            type= {showPassword ? "text" : "password"}
                            value= {data.password}
                            onChange= {(e) => {
                                setData({...data, password: e.target.value});
                                clearFeedback();
                            }}
                            autoComplete="new-password"
                            aria-describedby="password_hint"
                            aria-invalid={errorField === "password"}
                            className={styles.input_format_password}
                        />
                        <span id="password_hint" className={styles.feedback_content_custom}>
                            8+ characters, with upper and lowercase<br />
                            letters, a number and a special character.<br />
                            [? ! @ # $ % ^ & *]
                        </span>
                        <button 
                            type="button"
                            onClick= {() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className={styles.password_button}                        
                        >
                            {showPassword ? 
                                <LuEyeClosed className={styles.react_icon_password} /> 
                            : 
                                <LuEye className={styles.react_icon_password} />
                            }
                        </button>
                    </div>
                </div>
                <div className={styles.user_info_sub_container}>
                    <label htmlFor="confirm_password" className={styles.label_format}> Confirm Password: </label>
                    <div className={styles.password_wrapper}>
                        <input
                            id="confirm_password"
                            type= {showConfirmPassword ? "text" : "password"}
                            value= {data.confirmPass}
                            onChange= {(e) => {
                                setData({...data, confirmPass: e.target.value})
                                clearFeedback();         
                            }}
                            autoComplete="new-password"
                            aria-invalid={errorField === "confirm_password"}
                            className={styles.input_format_password}
                        />
                        <button 
                            type="button"
                            onClick= {() => setConfirmShowPassword(!showConfirmPassword)}
                            className={styles.password_button}
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}                                
                        >
                            {showConfirmPassword ? 
                                <LuEyeClosed className={styles.react_icon_password} /> 
                            : 
                                <LuEye className={styles.react_icon_password} />
                            }
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles.results_container}>
                {!errorMessage && !successMessage &&
                    <button 
                        type="submit" 
                        className={styles.create_account_button}
                    > 
                        Create Account 
                    </button>
                }
                {errorMessage && <span role="alert" className={styles.error_message}> { errorMessage } </span>}
                {successMessage &&
                    <div role="status" className={styles.success_container}>
                        <span className={styles.success_message}>{successMessage}</span>
                        <span className={styles.success_instructions}>Please note down your username and password.</span>
                    </div>
                }
            </div>
        </form>
    );
}

export default SignUp; 