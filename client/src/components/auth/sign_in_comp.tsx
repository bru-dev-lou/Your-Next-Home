import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/user_context";

import { apiFetch } from "../../api";

import styles from "../../components/auth/sign_in_comp.module.css";

type UserData = {
    username: string;
    password: string;
}

function SignIn () {
    const [ data, setData ] = useState<UserData>({username: "", password: ""});
    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ buttonDisabled, setButtonDisabled ] = useState<boolean>(false);
    
    const navigate = useNavigate(); 
    const { setUser } = useUser();

    const signIn = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setErrorMessage("");
        setButtonDisabled(true);

        if (!data.username || !data.password) {
            const missing = [];
            if (!data.username) missing.push("username");
            if (!data.password) missing.push("password");
            
            setErrorMessage(`Please provide your ${missing.join(" and ")}.`)
            setButtonDisabled(false);
            
            return;
        }

        try { 
            const res = await apiFetch ("/api/signIn", {
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
            console.error(error);
            setErrorMessage("Please check your internet and refresh the page.");
        }

        finally {
            setButtonDisabled(false);
        }
    };

    return (
        <form 
            onSubmit={signIn} 
            noValidate 
            className={styles.main_container}
        >
            <h2 className={styles.main_title}>Sign in and get started!</h2>
            <div className={styles.container_format}>
                <label htmlFor="username" className={styles.label_format}> Username: </label>
                <input
                    id="username"
                    type="text"
                    value={data.username}
                    onChange={(e) => {
                        setData({...data, username: e.target.value});
                        setErrorMessage("");
                    }}
                    autoComplete= "username"
                    aria-invalid={errorMessage.includes("username") || errorMessage.includes("credentials")}
                    className={styles.input_format}
                />
            </div>
            <div className={styles.container_format}>
                <label htmlFor="password" className={styles.label_format}> Password: </label>
                <input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => {
                        setData({...data, password: e.target.value});
                        setErrorMessage("");
                    }}
                    autoComplete= "current-password"
                    aria-invalid={errorMessage.includes("password") || errorMessage.includes("credentials")}
                    className={styles.input_format}
                />
            </div>
            <div className={styles.results_container}>
                { errorMessage ?
                    <span role="alert" className={styles.error_message}> { errorMessage } </span> 
                :
                    <div className={styles.submit_container}>
                        <span className={styles.register_message}>   
                            Don't have an account? <Link to="/signUp" className={styles.link_format}>Register</Link> now, it's free!
                        </span>
                        <button 
                            type="submit" 
                            className={styles.button_format} 
                            disabled={buttonDisabled}
                        > 
                            Sign In 
                        </button>            
                    </div>
                }
            </div>
        </form>        
    );
}

export default SignIn;