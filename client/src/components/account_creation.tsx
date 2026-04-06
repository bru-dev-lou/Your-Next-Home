import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function AccountCreation () {
    const [ name, setName ] = useState("");
    const [ address, setAddress ] = useState("");
    const [ number, setNumber ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ confirmPass, setConfirmPass ] = useState("");
    const [ accountCreated, setAccountCreated ] = useState(false); 
    const [ errorMessage, setErrorMessage ] = useState("");
    const navigate = useNavigate(); 

    const createAccount = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        const data = {
            name, 
            address,
            number, 
            email, 
            password,
            confirmPass
        };

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            
            const result = await res.json(); 
            console.log(result);

            if (res.ok) {
                setAccountCreated(true);
            }
            else {
                setErrorMessage(result.error);
            }
        }

        catch(error) {
            console.error(error);
        }
    }

return (
    <div>
        <form onSubmit={createAccount}>
            <label> Name: </label>
                <input
                    type="text"
                    placeholder="Enter your name."
                    value={name}
                    onChange= {(e) => setName(e.target.value)}
                />
            <br></br>
            <label> Address: </label>
                <input 
                    type= "text"
                    placeholder= "Add your company's address."
                    value={address}
                    onChange= {(e) =>setAddress(e.target.value)}
                />
            <br></br>
            <label> Phone Number:</label>
                <input
                    type= "text"
                    placeholder= "Add your phone number"
                    value= {number}
                    onChange= {(e) => setNumber(e.target.value)}
                />
            <br></br>
            <label> Email: </label>
                <input
                    type= "email"
                    placeholder= "Enter your email address"
                    value= {email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            <br></br>
            <label> Password: </label>
                <input
                    type= "password"
                    placeholder= "Choose a password"
                    value= {password}
                    onChange= {(e) => setPassword(e.target.value)}
                />
            <br></br>
            <label> Confirm Password: </label>
                <input
                    type= "password"
                    placeholder = "Type your password again"
                    value= {confirmPass}
                    onChange= {(e) => setConfirmPass(e.target.value)}
                />
            <br></br>
            {!accountCreated && <button type= "submit"> Create Account </button> }
        </form>
            { accountCreated &&
                <div>
                    <h3>Thank you, your account has been created!</h3>
                    <button onClick={ () => navigate("/signIn")}> Sign In </button>
                </div> 
            }
            { errorMessage && <p> { errorMessage } </p> }
    </div>
)
}

export default AccountCreation; 