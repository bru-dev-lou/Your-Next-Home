import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type userData = {
    username: string;
    name: string;
    address: string;
    number: string;
    email: string;
    password: string;
    confirmPass: string;
}

function SignUp () {
    const [ data, setData ] = useState<userData>({username: "", name: "", address: "", number: "", email: "", password: "", confirmPass: ""});
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ successMessage, setSuccessMessage ] = useState(""); 

    const [ showPassword, setShowPassword ] = useState(false);
    const [ showConfirmPassword, setConfirmShowPassword ] = useState(false);
    const [ accountCreated, setAccountCreated ] = useState(false); 
   
    const navigate = useNavigate(); 

    const createAccount = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

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
            }
        }

        catch(error) {
            setErrorMessage("Something went wrong while creating your account. Please check your internet and try again.")
        }
    }

return (
    <div>
        <form onSubmit={createAccount}>
            <label> Username: </label>
                <input 
                    type="text"
                    value={data.username}
                    onChange={(e) => setData({...data, username: e.target.value})}
                />
            <br></br>
            <label> Name: </label>
                <input
                    type="text"
                    value={data.name}
                    onChange= {(e) => setData({...data, name: e.target.value})}
                />
            <br></br>
            <label> Address: </label>
                <input 
                    type= "text"
                    value={data.address}
                    onChange= {(e) => setData({...data, address: e.target.value})}
                />
            <br></br>
            <label> Phone Number:</label>
                <input
                    type= "text"
                    value= {data.number}
                    onChange= {(e) => setData({...data, number: e.target.value})}
                />
            <br></br>
            <label> Email: </label>
                <input
                    type= "email"
                    value= {data.email}
                    onChange={(e) => setData({...data, email: e.target.value})}
                />
            <br></br>
            <label> Password: </label>
                <input
                    type= {showPassword ? "text" : "password"}
                    value= {data.password}
                    onChange= {(e) => setData({...data, password: e.target.value})}
                    autoComplete= "new-password"
                />
                <button 
                    type="button"
                    onClick= {() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                </button>
            <br></br>
            <label> Confirm Password: </label>
                <input
                    type= {showConfirmPassword ? "text" : "password"}
                    value= {data.confirmPass}
                    onChange= {(e) => setData({...data, confirmPass: e.target.value})}
                    autoComplete="new-password"
                />
                <button 
                    type="button"
                    onClick= {() => setConfirmShowPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? "Hide" : "Show"}
                </button>
            <br></br>
            {!accountCreated && <button type="submit"> Create Account </button> }
        </form>
            { accountCreated &&
                <div>
                    <h3>{successMessage}</h3>
                    <h4>Please note down your username and password for future reference.</h4>
                    <button onClick={ () => navigate("/signIn")}> Sign In </button>
                </div> 
            }
            { errorMessage && <p> { errorMessage } </p> }
    </div>
)
}

export default SignUp; 