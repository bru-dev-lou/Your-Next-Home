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
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ successMessage, setSuccessMessage ] = useState(""); 
    const [ missingField, setMissingField ] = useState("");
    const [ inUseField, setInUseField ] = useState("");

    const [ showPassword, setShowPassword ] = useState(false);
    const [ showConfirmPassword, setConfirmShowPassword ] = useState(false);
   
    const createAccount = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setMissingField("");
        setInUseField("");

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
                setErrorMessage("");
            }

            else {
                setErrorMessage(result.error);
                setMissingField(result.name);
                setInUseField(result.column);
            }
        }

        catch(error) {
            setErrorMessage("Failed to create account. Please check your internet and try again.")
        }
    };

    return (
        <div>
            <form 
                onSubmit={createAccount}
                noValidate
            >
                <div className={styles.main_container}>
                    <h2 className={styles.main_title}> Make an account with us, it's easy!</h2>
                    <div className={styles.container_format}>
                        <label htmlFor="username" className={styles.label_format}> Username: </label>
                        <input 
                            id="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => {
                                setData({...data, username: e.target.value})
                                setErrorMessage("")
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
                                setData({...data, name: e.target.value})
                                setErrorMessage("")
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
                                setData({...data, address: e.target.value})
                                setErrorMessage("")
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
                                setData({...data, number: e.target.value})
                                setErrorMessage("")
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
                                setData({...data, email: e.target.value})
                                setErrorMessage("")
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
                                setData({...data, password: e.target.value})
                                setErrorMessage("")
                            }}
                            autoComplete= "new-password"
                            required
                            aria-describedby="password_hint"
                            aria-invalid={missingField === "password" || errorMessage.includes("password") ? "true" : "false"}
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
                                setErrorMessage("")
                            }}
                            autoComplete="new-password"
                            required
                            aria-invalid={missingField === "confirm_password" || errorMessage.includes("password") ? "true" : "false"}
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
                            style={{visibility: errorMessage || successMessage ? "hidden" : "visible"}}
                        > 
                            Create Account 
                        </button>
                        { errorMessage && <p role="alert" className={styles.error_message}> { errorMessage } </p> }
                        {successMessage &&
                            <div role="status" className={styles.success_container}>
                                <h3 className={styles.success_message}>{successMessage}</h3>
                                <h4 className={styles.success_instructions}>Please note down your username and password for future reference.</h4>
                            </div>
                        }
                    </div>
                </div>
            </form>
        </div>
    );
}

export default SignUp; 