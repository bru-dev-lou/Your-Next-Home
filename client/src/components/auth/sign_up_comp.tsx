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

        //  Username validation 

        if (data.username.length < 5 || data.username.length > 20) {
            setShortErrorMessage("Username must be between 5 and 20 characters.");
            return; 
        }

        //  Name validation 

        if (data.name.length < 5 || data.name.length > 50) {
            setShortErrorMessage("Name must be between 5 and 50 characters.");
            return;
        }

        const nameHasLetters = /\p{L}/u.test(data.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(data.name);

        if (!nameHasLetters || !nameIsValidFormat) {
            setShortErrorMessage("Please include a name with no numbers.");
            return;
        } 

        //  Address validation 

        if (data.address.split(/\s+/).filter(Boolean).length < 5 || data.address.split(/\s+/).filter(Boolean).length > 25) {
            setShortErrorMessage("Address must be between 5 and 25 words.");
            return;
        }        

        //  Phone number validation 

        const validNumber = /^[0-9]{10,}$/.test(data.number);

        if (!validNumber) {
           setLongErrorMessage("Please ensure your phone number is at least 10 digits long with no spaces or symbols.");
           return; 
        }

        //  Email validation 

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
                <div className={styles.container_format}>
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
                        className={`${styles.input_format} ${styles.input_1}`}
                    />
                    <span id="username_hint" className={styles.sr_content}>Choose a username to set up your account. This information will remain private. </span>
                </div>
                <div className={styles.container_format}>
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
                        className={`${styles.input_format} ${styles.input_2}`}
                    />
                    <span id="name_hint" className={styles.sr_content}>If you represent a company, insert its name. If you are an individual property owner, insert your name. This information will be visible to other users.</span>
                </div>
                <div className={styles.container_format}>
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
                        className={`${styles.input_format} ${styles.input_3}`}
                    />
                    <span id="address_hint" className={styles.sr_content}>If you represent a company, insert its address. If you are an individual property owner, insert your property's address. This information will be visible to other users.</span>
                </div>
                <div className={styles.container_format}>
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
                        className={`${styles.input_format} ${styles.input_4}`}
                    />
                    <span id="phone_number_hint" className={styles.sr_content}>If you represent a company, insert your work phone number. If you are an individual property owner, insert your prefered phone number to be contacted on. This information will be visible to other users.</span>
                </div>
                <div className={styles.container_format}>
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
                        className={`${styles.input_format} ${styles.input_5}`}  
                    />
                    <span id="email_hint" className={styles.sr_content}>If you represent a company, insert your work email address. If you are an individual property owner, insert your prefered email address to be contacted on. This information will be visible to other users.</span>
                </div>
                <div className={styles.container_format}>
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
                        className={`${styles.input_format} ${styles.input_6}`}
                    />
                    <span id="password_hint" className={styles.sr_content}>Your password must be 8 or more characters long. It must have one lowercase letter, one uppercase letter, a number and a special character from the following options: ? ! @ # $ % ^ & *. </span>
                    <button 
                        type="button"
                        onClick= {() => setShowPassword(!showPassword)}
                        className={styles.password_button}
                    >
                        {showPassword ? <LuEyeClosed color="#125370" /> : <LuEye color="#125370"/>}
                    </button>
                </div>
                <div className={styles.container_format}>
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
                        className={`${styles.input_format} ${styles.input_7}`}
                    />
                    <button 
                        type="button"
                        onClick= {() => setConfirmShowPassword(!showConfirmPassword)}
                        className={styles.password_button}
                        >
                            {showConfirmPassword ? <LuEyeClosed color="#125370" /> : <LuEye color="#125370"/>}
                    </button>
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