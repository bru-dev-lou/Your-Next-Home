import { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";

function MainNavigationBar (){
    const [ errorMessage, setErrorMessage ] = useState(""); 
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    useEffect (() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch("/api/userCheck");
                const result = await res.json(); 
            
                if (res.ok) {
                    setUser(result.userData);
                }
            }
            catch (error) {
            // silent fail - user will see the 'Sign in' link. 
            }
        }
        fetchUserData()
    }, []);

    async function signUserOut (e:React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault(); 
        
        try {
            const res = await fetch("/api/signOut/", {
                method: "DELETE" 
            })

            if (res.ok){
                setUser(null); 
                navigate("/");
            }
        }

        catch(error){
            setErrorMessage("Failed to sign user out. Please check your internet and try again.");
        }
    }

    return (
        <nav>
            <header>
                <Link to="/">Home</Link>
                <Link to="/search">Rent</Link>
                <Link to="/inquiries">Contact Us</Link>
                {!user ? <Link to="/signIn">Sign In</Link>
                :
                <button onClick = {signUserOut}>Sign Out</button>
                }
            </header>
            {errorMessage && <h3>{errorMessage}</h3>}
        </nav>
    );
}

export default MainNavigationBar;