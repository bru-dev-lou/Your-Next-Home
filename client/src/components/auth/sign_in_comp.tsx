import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/user_context";

import sign_in_photo from "../../assets/sign_in_photo.jpg";
import styles from "../../components/auth/sign_in_comp.module.css";

type UserData = {
    username: string;
    password: string;
}

function SignIn () {
    const [ data, setData ] = useState<UserData>({username: "", password: ""});
    const [ errorMessage, setErrorMessage ] = useState(""); 
    
    const navigate = useNavigate(); 
    const { setUser } = useUser();

    const signIn = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setErrorMessage("");

        try { 
            const res = await fetch ("/api/signIn", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                setUser({ id: result.id, name: result.name, username: result.username }); 
                navigate(`/dashboard`);
            }   

            else {
                setErrorMessage(result.error);
            }
        }

        catch (error) {
            setErrorMessage("Failed to sign user in. Please check your internet and try again.");
        }
    };

    return (
        <div className={styles.main_container}>
            <form onSubmit={signIn} noValidate className={styles.sign_in_container}>
                    <h2 className={styles.main_title}>Sign in and get started!</h2>
                    <div className={styles.username_password_container}>
                        <label htmlFor="username" className={styles.username_password_label}> Username: </label>
                        <input
                            id="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => {
                                setData({...data, username: e.target.value});
                                setErrorMessage("");
                            }}
                            autoComplete= "username"
                            aria-invalid={errorMessage? "true" : "false"}
                            required
                            className={styles.username_password_input}
                        />
                    </div>
                    <div className={styles.username_password_container}>
                        <label htmlFor="password" className={styles.username_password_label}> Password: </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => {
                                setData({...data, password: e.target.value});
                                setErrorMessage("");
                            }}
                            autoComplete= "current-password"
                            aria-invalid={errorMessage ? "true" : "false"}
                            required
                            className={styles.username_password_input}
                        />
                    </div>
                    <div className={styles.submit_container} style={{display: errorMessage ? "none" : "block"}}>
                        <h5 className={styles.register_message}>Don't have an account? <Link to="/signUp" className={styles.link_format}>Register</Link> now, it's free!</h5>
                        <button 
                            type="submit" 
                            className={styles.button_format} 
                        > 
                            Sign In 
                        </button>            
                    </div>
                    { errorMessage && <p role="alert" className={styles.error_message}> { errorMessage } </p> }
            </form>
            <img src={sign_in_photo} className={styles.sign_in_photo}/>
        </div>                
    );
}

export default SignIn;