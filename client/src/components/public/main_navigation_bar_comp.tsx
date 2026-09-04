import { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";

import styles from "../public/main_navigation_bar_comp.module.css";
import logo from "../../assets/logo.png";


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
            
            if (res.ok){
                setUser(null);
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
        <div className={styles.main_container}>   
            {!user?
                <nav className={styles.nav_container}>
                    <div className={styles.title_container}>
                        <h2 className={styles.font_format}>Your Next Home</h2>
                        <img src={logo} className={styles.logo_img}/>
                    </div>
                    <div className={styles.link_container}>
                        <Link to="/" className={`${styles.link_item} ${styles.font_format}`}>Home</Link>
                        <Link to="/search" className={`${styles.link_item} ${styles.font_format}`}>Rent</Link>
                        <Link to="/inquiries" className={`${styles.link_item} ${styles.font_format}`}>Inquiries</Link>
                    </div>
                    <div className={styles.sign_in_container}>
                        <Link to="/signIn" className={`${styles.sign_in_item} ${styles.font_format}`}>Sign In</Link>
                    </div>
                </nav>
            :            
                <nav className={styles.nav_container}>
                    <div className={styles.title_container}>
                        <h2 className={styles.font_format}>Your Next Home</h2>
                        <img src={logo} className={styles.logo_img}/>
                    </div>
                    <div className={styles.link_container}>
                        <Link to="/" className={`${styles.link_item} ${styles.font_format}`}>Home</Link>
                        <Link to="/search" className={`${styles.link_item} ${styles.font_format}`}>Rent</Link>
                        <Link to="/inquiries" className={`${styles.link_item} ${styles.font_format}`}>Inquiries</Link>
                    </div>
                    {!dashDrop ?
                        <div className={styles.dropdown_container_format}>
                            <ul 
                                onClick = {dashDropdown}
                                aria-label="Dashboard navigation."
                                className={styles.dropdown_container_closed}
                            >
                                <li className={`${styles.dropdown_item_username} ${styles.closed_position} ${styles.font_format}`}> {user.name} </li>
                            </ul>
                        </div>
                    :                            
                        <div className={styles.dropdown_container_format}>
                            <ul 
                                aria-label="Dashboard navigation."
                                className={styles.dropdown_container_open_user}
                            >   
                                <li onClick = {dashDropdown} className={`${styles.dropdown_item_username} ${styles.open_position} ${styles.font_format}`}> {user.name} </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)} 
                                    data-value="My Properties"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    My Properties
                                </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                    data-value="My Profile"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    My Profile
                                </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                    data-value="Favorite Properties"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    Favorite Properties
                                </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                    data-value="Sign Out"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    Sign Out
                                </li>
                            </ul>
                        </div>
                    }
                </nav>
            }      
            {errorMessage && 
                <h3 role="alert" className={styles.error_message}>
                    {errorMessage}
                </h3>
            }          
        </div>
    );
}

export default MainNavigationBar;