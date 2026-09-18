import { useState } from 'react';

import register_account_photo from "../../assets/register_account_photo.jpg";

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

    const [ showPassword, setShowPassword ] = useState(false);
    const [ showConfirmPassword, setConfirmShowPassword ] = useState(false);
   
    const createAccount = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShortErrorMessage("");
        setLongErrorMessage("");
        setMissingField("");
        setInUseField("");

        
    // Empty field check

    const blankFieldCheck = [
        {field: data.username, error:"Please choose a username."},
        {field: data.name, error: "Please provide your name / company's name."},
        {field: data.address, error: "Please provide your address / company's address."},
        {field: data.number, error: "Please provide your phone number / company's phone number."},
        {field: data.email, error: "Please provide your email address."},
        {field: data.password, error: "Please choose a password."},
        {field: data.confirmPass, error: "Please confirm your chosen password."}
    ];

    for (const {field, error} of blankFieldCheck) {
        if(!field) {
            setShortErrorMessage(error);
            return;
        }
    } 

        //  Username validation 

        if (data.username.length < 5 || data.username.length > 20) {
            setShortErrorMessage("Your username must be between 5 and 20 characters.");
            return; 
        }

        //  Name validation 

        if (data.name.length < 5) {
            setShortErrorMessage("Please include a name at least 5 characters long.");
            return;
        }

        if (data.name.length > 39) {
            setShortErrorMessage("Please include a name shorter than 40 characters.");
            return;
        }

        const nameHasLetters = /\p{L}/u.test(data.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(data.name);

        if (!nameHasLetters || !nameIsValidFormat) {
            setShortErrorMessage("Please include a name with no special characters");
            return;
        } 

        // Address validation 

        if (data.address.length < 5) {
            setShortErrorMessage("Please include an address at least 5 characters long.");
            return;
        }

        if (data.address.length > 40) {
            setShortErrorMessage("Please include an address shorter than 40 characters.");
            return;
        }

        //  Phone number validation 

        if (data.number.length > 20) {
            setShortErrorMessage("Phone number must be shorter than 20 digits.");
            return;
        }

        const validNumber = /^[0-9]{10,}$/.test(data.number);

        if (!validNumber) {
           setLongErrorMessage("Please ensure your phone number is at least 10 digits long with no spaces or symbols.");
           return; 
        }

        //  Email validation 

        if (data.email.length > 50) {
            setShortErrorMessage("Please include an email shorter than 50 characters.");
            return; 
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

        if (!isValidEmail) {
            setShortErrorMessage("Please include a valid email address.");
            return;
        }

        /*  Password validation 
            Do not change error messages - Changing them will affect ARIA-INVALID 
        */

        if (data.confirmPass !== data.password) {
            setShortErrorMessage("Passwords must match.");
            return; 
        }    

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

        if (!passwordRegex.test(data.password)) {
            setLongErrorMessage("Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*].");
            return;
        }

        try {
            const res = await fetch("/api/signUp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            
            const result = await res.json(); 

            if (res.ok) {
                setSuccessMessage(result.message);
                setShortErrorMessage("");
                setLongErrorMessage("");
            }

            else {
                setShortErrorMessage(result.shortError);
                setLongErrorMessage(result.longError);
                setMissingField(result.name);
                setInUseField(result.column);
            }
        }

        catch(error) {
            setLongErrorMessage("Failed to create account. Please check your internet and try again.")
        }
    };

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
                                setShortErrorMessage("");
                                setLongErrorMessage("");
                            }}
                            autoComplete="username"
                            required
                            aria-describedby="username_hint"
                            aria-invalid={missingField === "username" || inUseField === "username" ? "true" : "false"}
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
                                setShortErrorMessage("");
                                setLongErrorMessage("");                 
                            }}
                            required
                            aria-describedby="name_hint"
                            aria-invalid={missingField === "name" ? "true" : "false"}
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
                                    setShortErrorMessage("");
                                    setLongErrorMessage("");                 
                                }
                            }}                            
                            required
                            aria-describedby="address_hint"
                            aria-invalid={missingField === "address" || inUseField === "address" ? "true" : "false"}
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
                                setShortErrorMessage("");
                                setLongErrorMessage("");
                            }}
                            required
                            aria-describedby="phone_number_hint"
                            aria-invalid={missingField === "phone_number" || inUseField === "phone_number" ? "true" : "false"}
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
                                setShortErrorMessage("");
                                setLongErrorMessage("");
                            }}
                            required
                            aria-describedby="email_hint"           
                            aria-invalid={missingField === "email" || inUseField === "email" ? "true" : "false"}   
                            className={styles.input_format}  
                        />
                        <span id="email_hint" className={styles.sr_content}>If you represent a company, insert your work email address. If you are an individual property owner, insert your prefered email address to be contacted on. This information will be visible to other users.</span>
                    </div>
                    <div className={styles.user_info_sub_container}>
                        <label htmlFor="password" className={styles.label_format}> Password: </label>
                        <input
                            id="password"
                            type= {showPassword ? "text" : "password"}
                            value= {data.password}
                            onChange= {(e) => {
                                setData({...data, password: e.target.value});
                                setShortErrorMessage("");
                                setLongErrorMessage("");
                            }}
                            autoComplete= "new-password"
                            required
                            aria-describedby="password_hint"
                            aria-invalid={missingField === "password" || shortErrorMessage.includes("password") || longErrorMessage.includes("password") ? "true" : "false"}
                            className={styles.input_format}
                        />
                        <span id="password_hint" className={styles.sr_content}>Your password must be 8 or more characters long. It must have one lowercase letter, one uppercase letter, a number and a special character from the following options: ? ! @ # $ % ^ & *. </span>
                        <button 
                            type="button"
                            onClick= {() => setShowPassword(!showPassword)}
                            className={`${styles.password_button} ${styles.password_button_1_format}`}                        
                        >
                            {showPassword ? <LuEyeClosed color="#125370" /> : <LuEye color="#125370"/>}
                        </button>
                    </div>
                    <div className={styles.user_info_sub_container}>
                        <label htmlFor="confirm_password" className={styles.label_format}> Confirm Password: </label>
                        <input
                            id="confirm_password"
                            type= {showConfirmPassword ? "text" : "password"}
                            value= {data.confirmPass}
                            onChange= {(e) => {
                                setData({...data, confirmPass: e.target.value})
                                setShortErrorMessage("");
                                setLongErrorMessage("");         
                            }}
                            autoComplete="new-password"
                            required
                            aria-invalid={missingField === "confirm_password" || shortErrorMessage.includes("password") || longErrorMessage.includes("password") ? "true" : "false"}
                            className={styles.input_format}
                        />
                        <button 
                            type="button"
                            onClick= {() => setConfirmShowPassword(!showConfirmPassword)}
                            className={`${styles.password_button} ${styles.password_button_2_format}`}
                            >
                                {showConfirmPassword ? <LuEyeClosed color="#125370" /> : <LuEye color="#125370"/>}
                        </button>
                    </div>
                </div>
                <div className={styles.results_container}>
                    <button 
                        type="submit" 
                        className={styles.create_account_button}
                        style={{display: shortErrorMessage || longErrorMessage || successMessage ? "none" : "block"}}
                    > 
                        Create Account 
                    </button>
                    {shortErrorMessage && <p role="alert" className={`${styles.error_message} ${styles.short_error}`}> { shortErrorMessage } </p>}
                    {longErrorMessage && <p role="alert" className={`${styles.error_message} ${styles.long_error}`}> { longErrorMessage } </p> }
                    {successMessage &&
                        <div role="status" className={styles.success_container}>
                            <h3 className={styles.success_message}>{successMessage}</h3>
                            <h4 className={styles.success_instructions}>Please note down your username and password for future reference.</h4>
                        </div>
                    }
                </div>
            </form>
            <img src={register_account_photo} className={styles.main_photo}></img>
        </div>
    );
}

export default SignUp; 