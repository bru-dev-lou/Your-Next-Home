import { useState } from "react";
import { useNavigate } from "react-router-dom";


function SignIn () {
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState(""); 
    const [ errorMessage, setErrorMessage ] = useState(""); 
    const navigate = useNavigate(); 

    const signIn = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setErrorMessage("");

        const data = {
            username,
            password
        };

        try { 
            const res = await fetch ("api/signIn", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            console.log(result);

            if (res.ok) {
                navigate(`/myprofile/${result.username}/${result.id}`);
            }   
            else {
                setErrorMessage(result.error);
            }
        }

        catch (error) {
            console.error(error);
        }
    };

return (
    <div>
        <form onSubmit={signIn}>
            <label> Username: </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete= "username"
                />
            <br />
            <label> Password: </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete= "current-password"
                />
                <br />
            <button type="submit"> Sign In </button>
        </form>
            { errorMessage && <p> { errorMessage } </p> }
        </div>
    )
}

export default SignIn;