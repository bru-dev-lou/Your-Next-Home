import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useUser } from "../../context/user_context";

type userData = {
    username: string;
    password: string;
}

function SignIn () {
    const [ data, setData ] = useState<userData>({username: "", password: ""})
    const [ errorMessage, setErrorMessage ] = useState(""); 
    
    const navigate = useNavigate(); 
    const { setUser } = useUser();

    const signIn = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setErrorMessage("");

        try { 
            const res = await fetch ("api/signIn", {
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
    <div>
        <form onSubmit={signIn}>
            <label> Username: </label>
                <input
                    type="text"
                    value={data.username}
                    onChange={(e) => setData({...data, username: e.target.value})}
                    autoComplete= "username"
                />
            <br />
            <label> Password: </label>
                <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData({...data, password: e.target.value})}
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