import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const [ accountCreated, setAccountCreated ] = useState(false); 
   
    const navigate = useNavigate(); 

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
                setAccountCreated(true);
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
            <form onSubmit={createAccount}>
                <label htmlFor="username"> Username: </label>
                    <input 
                        id="username"
                        type="text"
                        value={data.username}
                        onChange={(e) => setData({...data, username: e.target.value})}
                        autoComplete="username"
                        aria-required="true"
                        aria-describedby="username_hint"
                        aria-invalid={missingField === "username" || inUseField === "username" ? "true" : "false"}
                    />
                    <span id="username_hint" className="hidden-content">Choose a username to set up your account. This information will remain private. </span>
                <br></br>
                <label htmlFor="name"> Name: </label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange= {(e) => setData({...data, name: e.target.value})}
                        aria-required="true"
                        aria-describedby="name_hint"
                        aria-invalid={missingField === "name" ? "true" : "false"}
                    />
                    <span id="name_hint" className="hidden-content">If you represent a company, insert its name. If you are an individual property owner, insert your name. This information will be visible to other users.</span>
                <br></br>
                <label htmlFor="address"> Address: </label>
                    <input 
                        id="address"
                        type= "text"
                        value={data.address}
                        onChange= {(e) => setData({...data, address: e.target.value})}
                        aria-required="true"
                        aria-describedby="address_hint"
                        aria-invalid={missingField === "address" || inUseField === "address" ? "true" : "false"}
                    />
                    <span id="address_hint" className="hidden-content">If you represent a company, insert its address. If you are an individual property owner, insert your property's address. This information will be visible to other users.</span>
                <br></br>
                <label htmlFor="phone_number"> Phone Number:</label>
                    <input
                        id="phone_number"
                        type= "text"
                        value= {data.number}
                        onChange= {(e) => setData({...data, number: e.target.value})}
                        aria-required="true"
                        aria-describedby="phone_number_hint"
                        aria-invalid={missingField === "phone_number" || inUseField === "phone_number" ? "true" : "false"}
                    />
                    <span id="phone_number_hint" className="hidden-content">If you represent a company, insert your work phone number. If you are an individual property owner, insert your prefered phone number to be contacted on. This information will be visible to other users.</span>
                <br></br>
                <label htmlFor="email_address"> Email: </label>
                    <input
                        id="email_address"
                        type= "email"
                        value= {data.email}
                        onChange={(e) => setData({...data, email: e.target.value})}
                        aria-required="true"
                        aria-describedby="email_hint"           
                        aria-invalid={missingField === "email" || inUseField === "email" ? "true" : "false"}     
                    />
                    <span id="email_hint" className="hidden-content">If you represent a company, inser your work email address. If you are an individual property owner, insert your prefered email address to be contacted on. This information will be visible to other users.</span>
                <br></br>
                <label htmlFor="password"> Password: </label>
                    <input
                        id="password"
                        type= {showPassword ? "text" : "password"}
                        value= {data.password}
                        onChange= {(e) => setData({...data, password: e.target.value})}
                        autoComplete= "new-password"
                        aria-required="true"
                        aria-describedby="password_hint"
                        aria-invalid={missingField === "password" || errorMessage.includes("password") ? "true" : "false"}
                    />
                    <span id="password_hint" className="hidden-content">Your password must be 8 or more characters long. It must have one lowercase letter, one uppercase letter, a number and a special character from the following options: ? ! @ # $ % ^ & *. </span>
                    <button 
                        type="button"
                        onClick= {() => setShowPassword(!showPassword)}
                        aria-describedby="password_button_hint"
                        >
                            {showPassword ? "Hide" : "Show"}
                    </button>
                    <span id="password_button_hint" className="hidden-content">Clicking this button will make the password content visible. Clicking it once again, will make the password content private.</span>
                <br></br>
                <label htmlFor="confirm_password"> Confirm Password: </label>
                    <input
                        id="confirm_password"
                        type= {showConfirmPassword ? "text" : "password"}
                        value= {data.confirmPass}
                        onChange= {(e) => setData({...data, confirmPass: e.target.value})}
                        autoComplete="new-password"
                        aria-required="true"
                        aria-describedby="password_confirmation_hint"
                        aria-invalid={missingField === "confirm_password" || errorMessage.includes("password") ? "true" : "false"}
                    />
                    <span id="password_confirmation_hint" className="hidden-content">Insert the same password as before in order to confirm you desired password matches your choice.</span>
                    <button 
                        type="button"
                        onClick= {() => setConfirmShowPassword(!showConfirmPassword)}
                        aria-describedby="password_confirmation_button_hint"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                    <span id="password_confirmation_button_hint" className="hidden-content">Clicking this button will make the confirm password content visible. Clicking it once again, will make the confirm password content private.</span>
                <br></br>
                {!accountCreated && <button type="submit"> Create Account </button> }
            </form>
            { accountCreated &&
                <div>
                    <h3 role="status">{successMessage}</h3>
                    <h4>Please note down your username and password for future reference.</h4>
                    <button onClick={ () => navigate("/signIn")}> Sign In </button>
                </div> 
            }
            { errorMessage && <p role="alert"> { errorMessage } </p> }
        </div>
    );
}

export default SignUp; 