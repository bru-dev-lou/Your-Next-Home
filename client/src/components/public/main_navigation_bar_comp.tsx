import { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";
import styles from "../public/main_navigation_bar_comp.module.css";


function MainNavigationBar (){
    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ dashDrop, setDashDrop ] = useState<boolean>(false);
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

    async function dashDropdown () {
        setDashDrop(!dashDrop);
    }

    async function userNavigation (value : string) {

        if (value === "My Properties") {
            setDashDrop(!dashDrop);
            navigate("/dashboard");
        }

        if (value === "My Profile") {
            setDashDrop(!dashDrop);
            navigate("/dashboard/profile/edit");
        }

        if (value === "Favorite Properties") {
            setDashDrop(!dashDrop);
            navigate("/dashboard/property/favorites");
        }

        if (value === "Sign Out") {
            setDashDrop(!dashDrop);
            signUserOut();
        } 
    }

    return (
        <div>
            {user?
                <div>
                    <nav>
                        <div className={styles.main_container}>
                            <div className={styles.title_container}>
                                <h1 className={styles.title_item}>Your Next Home</h1>
                            </div>
                            <div className={styles.link_container}>
                                <Link to="/" className={styles.link_item}>Home</Link>
                                <Link to="/search" className={styles.link_item}>Rent</Link>
                                <Link to="/inquiries" className={styles.link_item}>Inquiries</Link>
                            </div>
                            <div className={styles.dropdown_container}>
                                <div className={styles.dropdown_positioning}>
                                    {dashDrop ?
                                        <div> 
                                            <ul 
                                                aria-label="Dashboard navigation."
                                                className={styles.dropdown_background}
                                            >   
                                                <li onClick = {dashDropdown} className={styles.dropdown_item}> {user.name} </li>
                                                <li 
                                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)} 
                                                    data-value="My Properties"
                                                    className={styles.dropdown_item}
                                                >My Properties</li>
                                                <li 
                                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                                    data-value="My Profile"
                                                    className={styles.dropdown_item}
                                                >My Profile</li>
                                                <li 
                                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                                    data-value="Favorite Properties"
                                                    className={styles.dropdown_item}
                                                >Favorite Properties</li>
                                                <li 
                                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                                    data-value="Sign Out"
                                                    className={styles.dropdown_item}
                                                >Sign Out</li>
                                            </ul>
                                        </div>
                                    :
                                        <div>
                                            <ul 
                                                onClick = {dashDropdown}
                                                aria-label="Dashboard navigation."
                                            >
                                                <li className={styles.dropdown_item}> {user.name} </li>
                                            </ul>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            : 
                <div>
                    <nav>
                        <div className={styles.main_container}>
                            <div className={styles.title_container}>
                                <h1 className={styles.title_item}>Your Next Home</h1>
                            </div>
                            <div className={styles.link_container}>
                                <Link to="/" className={styles.link_item}>Home</Link>
                                <Link to="/search" className={styles.link_item}>Rent</Link>
                                <Link to="/inquiries" className={styles.link_item}>Inquiries</Link>
                            </div>
                            <div className={styles.sign_in_container}>
                                <Link to="/signIn" className={styles.sign_in_item}>Sign In</Link>
                            </div>
                        </div>    
                    </nav>
                    {errorMessage && 
                        <div role="alert">
                            <h3>{errorMessage}</h3>
                        </div>
                    }
                </div>
            }
        </div>
    );
}

export default MainNavigationBar;