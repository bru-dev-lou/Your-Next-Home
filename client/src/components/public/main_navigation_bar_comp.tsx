import { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";


function MainNavigationBar (){
    const [ errorMessage, setErrorMessage ] = useState(""); 
    const { user, setUser } = useUser();
    const navigate = useNavigate();


    async function signUserOut () {
        
        try {
            const res = await fetch("/api/signOut/", {
                method: "DELETE" 
            });
            
            // delay on setUser to allow navigation to Homepage instead of 401 status returning from route_protection 

            if (res.ok){
                setTimeout(function(){
                setUser(null);
                }, 50);

                navigate("/");
            }
        }

        catch(error){
            setErrorMessage("Failed to sign user out. Please check your internet and try again.");
        }
    }

    async function userNavigation (e: React.ChangeEvent<HTMLSelectElement>) {
        e.preventDefault();

        if (e.target.value === "My Properties") {
            navigate("/dashboard");
            e.target.value = "User Name";
        }

        if (e.target.value === "My Profile") {
            navigate("/dashboard/profile/edit");
            e.target.value = "User Name";            
        }

        if (e.target.value === "Favorite Properties") {
            navigate("/dashboard/property/favorites");
            e.target.value = "User Name";
        }

        if (e.target.value === "Sign Out") {
            signUserOut();
        } 
    }

    return (
        <div>
            <div>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/search">Rent</Link>
                    <Link to="/inquiries">Contact Us</Link>
                    {!user ? <Link to="/signIn">Sign In</Link> : null }
                </nav>
                {errorMessage && 
                    <div role="alert">
                        <h3>{errorMessage}</h3>
                    </div>
                }
            </div>
            {user?
                <div>
                    <select 
                        onChange={(e) => {userNavigation(e)}}
                        aria-label="Dashboard navigation."
                        >
                        <option value="User Name"> {user.name} </option>
                        <option value="My Properties"> My Properties </option>
                        <option value="My Profile"> My Profile </option>
                        <option value="Favorite Properties"> Favorite Properties </option>
                        <option value="Sign Out"> Sign Out </option>
                    </select>
                </div>
                : 
                null
            }
        </div>
    );
}

export default MainNavigationBar;