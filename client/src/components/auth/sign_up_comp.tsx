import { useState } from 'react';

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
    
    const [ shortErrorMessage, setShortErrorMessage ] = useState("");
    const [ longErrorMessage, setLongErrorMessage ] = useState("");
    const [ successMessage, setSuccessMessage ] = useState(""); 

    const [ missingField, setMissingField ] = useState("");
    const [ inUseField, setInUseField ] = useState("");
    const [ errorField, setErrorField ] = useState(""); 

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
            {field: cleanData.username, error:"Please choose a username.", name: "username"},
            {field: cleanData.name, error: "Please provide your name / company's name.", name: "name"},
            {field: cleanData.address, error: "Please provide your address / company's address.", name: "address"},
            {field: cleanData.number, error: "Please provide your phone number / company's phone number.", name: "phone_number"},
            {field: cleanData.email, error: "Please provide your email address.", name: "email"},
            {field: cleanData.password, error: "Please choose a password.", name: "password"},
            {field: cleanData.confirmPass, error: "Please confirm your chosen password.", name: "confirm_password"}
        ];

        for (const {field, error, name} of blankFieldCheck) {
            if(!field) {
                setShortErrorMessage(error);
                setMissingField(name);
                return;
            }
        } 

        //  Username validation 

        if (cleanData.username.length < 5 || cleanData.username.length > 20) {
            setShortErrorMessage("Your username must be between 5 and 20 characters.");
            setErrorField("username");
            return; 
        }

        //  Name validation 

        if (cleanData.name.length < 5) {
            setShortErrorMessage("Please include a name at least 5 characters long.");
            setErrorField("name");
            return;
        }

        if (cleanData.name.length > 39) {
            setShortErrorMessage("Please include a name shorter than 40 characters.");
            setErrorField("name");
            return;
        }

        const nameHasLetters = /\p{L}/u.test(cleanData.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(cleanData.name);

        if (!nameHasLetters || !nameIsValidFormat) {
            setShortErrorMessage("Please include a name with no special characters");
            setErrorField("name");
            return;
        } 

        // Address validation 

        if (cleanData.address.length < 5) {
            setShortErrorMessage("Please include an address at least 5 characters long.");
            setErrorField("address");
            return;
        }

        if (cleanData.address.length > 40) {
            setShortErrorMessage("Please include an address shorter than 40 characters.");
            setErrorField("address");
            return;
        }

        //  Phone number validation 

        if (cleanData.number.length > 20) {
            setShortErrorMessage("Phone number must be shorter than 20 digits.");
            setErrorField("phone_number");
            return;
        }

        const validNumber = /^[0-9]{10,}$/.test(cleanData.number);

        if (!validNumber) {
           setLongErrorMessage("Please ensure your phone number is at least 10 digits long with no spaces or symbols.");
           setErrorField("phone_number");
           return; 
        }

        //  Email validation 

        if (cleanData.email.length > 50) {
            setShortErrorMessage("Please include an email shorter than 50 characters.");
            setErrorField("email")
            return; 
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanData.email);

        if (!isValidEmail) {
            setShortErrorMessage("Please include a valid email address.");
            setErrorField("email")
            return;
        }

        if (cleanData.confirmPass !== cleanData.password) {
            setShortErrorMessage("Passwords must match.");
            setErrorField("confirm_password")
            return; 
        }    

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

        if (!passwordRegex.test(cleanData.password)) {
            setLongErrorMessage("Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*].");
            setErrorField("password");
            return;
        }

        try {
            const res = await fetch("/api/signUp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cleanData)
            });
            
            const result = await res.json(); 

            if (res.ok) {
                setSuccessMessage(result.message);
                setShortErrorMessage("");
                setLongErrorMessage("");
            }

            else if (result.error) {
                setShortErrorMessage(result.error);
                setLongErrorMessage("");
                setMissingField(result.name);
                setInUseField(result.column);
            }
            else {
                setShortErrorMessage(result.shortError);
                setLongErrorMessage(result.longError);
                setErrorField(result.errorField);
            }
        }

        catch(error) {
            setLongErrorMessage("Failed to create account. Please check your internet and try again.")
        }
    };


    // Clear feedback messages function so ARIA-INVALID resets and reduce verbose in JSX return

    const clearFeedback = () => {
        setShortErrorMessage("");
        setLongErrorMessage("");
        setSuccessMessage("");
        setMissingField("");
        setInUseField("");
        setErrorField("");
    }

    return (
        <div className={styles.main_container}>
            <form 
                onSubmit={createAccount}
                noValidate
                className={styles.register_container}
            >
                <h2 className={styles.main_title}> Make an account with us, it's easy!</h2>
                <div className={styles.user_info_main_container}>
                    <div className={styles.user_info_sub_container}>
                        <label htmlFor="username" className={styles.label_format}> Username: </label>
                        <input 
                            id="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => {
                                setData({...data, username: e.target.value});
                                clearFeedback();
                            }}
                            autoComplete="username"
                            required
                            aria-describedby="username_hint"
                            aria-invalid={missingField === "username" || inUseField === "username" || errorField === "username"}
                            className={styles.input_format}
                        />
                        <span id="username_hint" className={styles.sr_content}>Choose a username to set up your account. This information will remain private. </span>
                    </div>
                    <div className={styles.user_info_sub_container}>
                        <label htmlFor="name" className={styles.label_format}> Name: </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange= {(e) => {
                                setData({...data, name: e.target.value});
                                clearFeedback();                 
                            }}
                            required
                            aria-describedby="name_hint"
                            aria-invalid={missingField === "name" || errorField === "name"}
                            className={styles.input_format}
                        />
                        <span id="name_hint" className={styles.sr_content}>If you represent a company, insert its name. If you are an individual property owner, insert your name. This information will be visible to other users.</span>
                    </div>
                    <div className={styles.user_info_sub_container}>
                        <label htmlFor="address" className={styles.label_format}> Address: </label>
                        <input 
                            id="address"
                            type= "text"
                            value={data.address}
                            onChange= {(e) => {
                                const addressWords = e.target.value.split(/\s+/).filter(Boolean);
                                if (addressWords.length <= 25) {
                                    setData({...data, address: e.target.value});
                                    clearFeedback();                 
                                }
                            }}                            
                            required
                            aria-describedby="address_hint"
                            aria-invalid={missingField === "address" || inUseField === "address" || errorField === "address"}
                            className={styles.input_format}
                        />
                        <span id="address_hint" className={styles.sr_content}>If you represent a company, insert its address. If you are an individual property owner, insert your property's address. This information will be visible to other users.</span>
                    </div>
                    <div className={styles.user_info_sub_container}>
                        <label htmlFor="phone_number" className={styles.label_format}> Phone Number:</label>
                        <input
                            id="phone_number"
                            type= "tel"
                            value= {data.number}
                            onChange= {(e) => {
                                const filteredNumber = e.target.value.replace(/[^0-9]/g, "");   
                                setData({...data, number: filteredNumber});
                                clearFeedback();
                            }}
                            required
                            aria-describedby="phone_number_hint"
                            aria-invalid={missingField === "phone_number" || inUseField === "phone_number" || errorField === "phone_number"}
                            className={styles.input_format}
                        />
                        <span id="phone_number_hint" className={styles.sr_content}>If you represent a company, insert your work phone number. If you are an individual property owner, insert your prefered phone number to be contacted on. This information will be visible to other users.</span>
                    </div>
                    <div className={styles.user_info_sub_container}>
                        <label htmlFor="email_address" className={styles.label_format}> Email: </label>
                        <input
                            id="email_address"
                            type= "email"
                            value= {data.email}
                            onChange={(e) => { 
                                setData({...data, email: e.target.value});
                                clearFeedback();
                            }}
                            required
                            aria-describedby="email_hint"           
                            aria-invalid={missingField === "email" || inUseField === "email" || errorField === "email"}   
                            className={styles.input_format}  
                        />
                        <span id="email_hint" className={styles.sr_content}>If you represent a company, insert your work email address. If you are an individual property owner, insert your prefered email address to be contacted on. This information will be visible to other users.</span>
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
                                autoComplete= "new-password"
                                required
                                aria-describedby="password_hint"
                                aria-invalid={missingField === "password" || errorField === "password"}
                                className={styles.input_format_password}
                            />
                            <span id="password_hint" className={styles.sr_content}>Your password must be 8 or more characters long. It must have one lowercase letter, one uppercase letter, a number and a special character from the following options: ? ! @ # $ % ^ & *. </span>
                            <button 
                                type="button"
                                onClick= {() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className={styles.password_button}                        
                            >
                                {showPassword ? <LuEyeClosed color="#125370" /> : <LuEye color="#125370"/>}
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
                                required
                                aria-invalid={missingField === "confirm_password" || errorField === "password" || errorField === "confirm_password"}
                                className={styles.input_format_password}
                            />
                            <button 
                                type="button"
                                onClick= {() => setConfirmShowPassword(!showConfirmPassword)}
                                className={styles.password_button}
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}                                
                            >
                                {showConfirmPassword ? <LuEyeClosed color="#125370" /> : <LuEye color="#125370"/>}
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.results_container}>
                    <button 
                        type="submit" 
                        className={styles.create_account_button}
                        style={{visibility: shortErrorMessage || longErrorMessage || successMessage ? "hidden" : "visible"}}
                    > 
                        Create Account 
                    </button>
                    {shortErrorMessage && <p role="alert" className={styles.short_error_message}> { shortErrorMessage } </p>}
                    {longErrorMessage && <p role="alert" className={styles.long_error_message}> { longErrorMessage } </p> }
                    {successMessage &&
                        <div role="status" className={styles.success_container}>
                            <h3 className={styles.success_message}>{successMessage}</h3>
                            <h4 className={styles.success_instructions}>Please note down your username and password.</h4>
                        </div>
                    }
                </div>
            </form>
        </div>
    );
}

export default SignUp; 