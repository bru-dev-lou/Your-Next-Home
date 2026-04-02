import { useState } from 'react';

function AccountCreation () {
    const [ name, setName ] = useState("");
    const [ address, setAddress ] = useState("");
    const [ number, setNumber ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const createAccount = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = {
            name, 
            address,
            number, 
            email, 
            password
        };

        try {
            const res = await fetch("/api/register", {
                method: "POST" ,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            
            const result = await res.json(); 
            console.log(result); 
        }

        catch(error) {
            console.error("Error creating account", error);
        }
    }
/* NEED TO CREATE A CONFIRM PASSWORD CONST FOR THIS TO WORK
 NEXT NEED TO USE BCRYPT TO HASS PASSWORDS - DO NOT ENTER PASSWORDS IN DB
 ALSO NEED REGEX FOR PASSWORDS TO SET REQUIREMENTS */

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
                    value= {password}
                    onChange= {(e) => setPassword(e.target.value)}
                />
        </form>
    </div>
)
}

export default AccountCreation; 