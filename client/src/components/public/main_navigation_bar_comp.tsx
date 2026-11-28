import { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/user_context";
import { apiFetch } from "../../api";

import styles from "../public/main_navigation_bar_comp.module.css";
import logo from "../../assets/logo.png";


function MainNavigationBar (){
    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ dashDrop, setDashDrop ] = useState<boolean>(false);
    const { user, setUser } = useUser();
    const navigate = useNavigate();


    async function signUserOut () {
        
        try {
            const res = await apiFetch("/api/signOut/", {
                method: "DELETE" 
            });
            
            if (res.ok){
                setUser(null);
                navigate("/");
            }
        }

        catch(error){
            console.error(error);
            setErrorMessage("Failed to sign user out.");
            setTimeout(() => {
                setErrorMessage("Please check your internet refresh the page.");
            }, 2000);
            setTimeout(() => {
                setErrorMessage("");
            }, 4000); 
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
            {!user ?
                <nav className={styles.nav_container_no_user}>
                    <div className={styles.title_container_no_user}>
                        <span className={styles.font_format}>
                            Your Next Home 
                            <img src={logo} className={styles.logo_img} alt="company logo"/>
                        </span>
                    </div>
                    <div className={styles.link_container_no_user}>
                        <Link to="/" className={`${styles.link_item} ${styles.font_format}`}>Home</Link>
                        <Link to="/search" className={`${styles.link_item} ${styles.font_format}`}>Rent</Link>
                        <Link to="/inquiries" className={`${styles.link_item} ${styles.font_format}`}>Inquiries</Link>
                    </div>
                    <div className={styles.sign_in_container}> 
                        <Link to="/signIn" className={`${styles.sign_in_item} ${styles.font_format}`}>Sign In</Link>
                    </div>
                </nav>
            :            
                <nav className={styles.nav_container_with_user}>
                    <div className={styles.title_container_with_user}>
                        <span className={styles.font_format}>
                            Your Next Home 
                            <img src={logo} className={styles.logo_img} alt="company logo"/>
                        </span>
                    </div>
                    {!errorMessage ? 
                        <div className={styles.link_container_with_user}>
                            <Link to="/" className={`${styles.link_item} ${styles.font_format}`}>Home</Link>
                            <Link to="/search" className={`${styles.link_item} ${styles.font_format}`}>Rent</Link>
                            <Link to="/inquiries" className={`${styles.link_item} ${styles.font_format}`}>Inquiries</Link>
                        </div>
                    :
                        <div className={styles.link_container_with_user}>
                            <span 
                                role="alert" 
                                className={styles.error_message}    
                            >
                                {errorMessage}
                            </span>
                        </div>   
                    }      
                    <div className={styles.user_container}>
                        <button
                            onClick = {dashDropdown}    
                            aria-expanded={dashDrop}
                            aria-label="Dashboard navigation."
                            className={`${styles.user_container_closed} ${styles.font_format}`}
                        >
                            <span className={`${styles.wide_viewport} ${styles.username_format_closed}`}>{user.name}</span>
                            <span className={`${styles.short_viewport} ${styles.username_format_closed}`}>Dashboard</span>                              
                        </button>
                        {dashDrop &&
                            <ul 
                                aria-label="Dashboard navigation."
                                className={styles.user_container_open}
                            >   
                                <li 
                                    onClick = {dashDropdown} 
                                    className={`${styles.username_format_open} ${styles.font_format}`}
                                > 
                                    <span className={styles.wide_viewport}>{user.name}</span>
                                    <span className={styles.short_viewport}>Dashboard</span> 
                                </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)} 
                                    data-value="My Properties"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    <span className={styles.wide_viewport}>My Properties</span>
                                    <span className={styles.short_viewport}>Properties</span> 
                                </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                    data-value="My Profile"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    <span className={styles.wide_viewport}>My Profile</span>
                                    <span className={styles.short_viewport}>Profile</span> 
                                </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                    data-value="Favorite Properties"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    <span className={styles.wide_viewport}>Favorite Properties</span>
                                    <span className={styles.short_viewport}>Favorites</span> 
                                </li>
                                <li 
                                    onClick = {(e) => userNavigation(e.currentTarget.dataset.value!)}
                                    data-value="Sign Out"
                                    className={`${styles.dropdown_item} ${styles.font_format}`}
                                >
                                    Sign Out
                                </li>
                            </ul>
                        }
                    </div>
                </nav>
            }       
        </div>
    );
}

export default MainNavigationBar;