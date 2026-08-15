import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../dashboard/dashboard_property_favorites_comp.module.css";

import { IoIosHeart } from "react-icons/io";
import { BsHouse} from "react-icons/bs";
import { IoBedSharp } from "react-icons/io5";
import { LuToilet } from "react-icons/lu";


type Properties = {
  id: number;
  type: string;
  city: string;
  price: number;
  no_bedrooms: number;
  no_bathrooms: number;
  summary: string;
  date_listed: string;
  photo_path: string;
}

const DashboardFavoriteProperties = () => {
    const navigate = useNavigate();

    const [favoriteProps, setFavoriteProps] = useState<Properties[]>([]); 
    const [removeIDConfirmation, setRemoveIDConfirmation] = useState<number | null>(null); 

    //  Error Messages →  FP = Favorite Properties / DP = Delete Properties

    const [ errorMessageFP, setErrorMessageFP ] = useState("");
    const [ errorMessageDP, setErrorMessageDP ] = useState("");

    useEffect(() => {
        async function fetchFavProperties() {
            try {
                const res = await fetch(`/api/dashboard/property/favorites`);
                const result = await res.json(); 
                if (!res.ok) {
                    setErrorMessageFP(result.error);
                }
                else {
                    setFavoriteProps(result);
                }
            }
            
            catch (error) {
                setErrorMessageFP("Failed to fetch user's favorite properties. Please check your internet and refresh the page.")
            }
        }
        fetchFavProperties();
    }, []);


    async function deleteFavProperty(propID : number) {
        try {
            const res = await fetch (`/api/dashboard/property/favorites/${propID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({propID})
            });

            if (!res.ok) {
                const result = await res.json();
                setErrorMessageDP(result.error);
                setTimeout(() => {
                    setErrorMessageDP("")
                }, 5000);
            }
             
            else {
                const refreshFavoritesPage = await fetch (`/api/dashboard/property/favorites`);
                const newFavoritesList = await refreshFavoritesPage.json(); 

                if (refreshFavoritesPage.ok) {
                    setFavoriteProps(newFavoritesList); 
                    setErrorMessageDP("");
                }
                
                else {
                    setFavoriteProps([]);
                    setErrorMessageFP(newFavoritesList.error);
                }
            }
        }
        
        catch(error){
            setErrorMessageDP("Failed to delete property. Please check your internet and try again.");
        }
    }


    if (favoriteProps.length === 0) {
        return (
           <div>
                <h2 className={`${styles.h2_font} ${styles.main_title}`}>Favorite Properties</h2>
                {errorMessageFP && <h4 role="alert">{errorMessageFP}</h4>}
            </div>
        )
    }

    return (
        <div className={styles.main_container}>
            <div className={styles.main_title}>
                <h2 className={`${styles.h2_font} ${styles.main_title_message}`}>Favorite Properties</h2>
            </div>
            {errorMessageDP && 
                <h3 className={styles.remove_from_favorites_error_message} role="alert">
                    {errorMessageDP}
                </h3>
            }                      
            <div className={styles.property_main_container}>
                {favoriteProps.map((property) => {
                    return (
                        <div key = {property.id} className={styles.property_card_and_favorites_container}>                                                    
                            <div className={styles.property_card_container}>  
                                <div className={styles.property_card}>
                                    <div className={styles.property_card_row_1}>
                                        <span className={styles.sr_content}>Location:</span>
                                        <h3 className={`${styles.h3_font} ${styles.location_format}`}>
                                            {property.city}
                                        </h3>
                                        <span className={styles.sr_content}>Monthly rental rate:</span>
                                        <h3 className={`${styles.h3_font} ${styles.rental_rate_format}`}>
                                            £{property.price.toLocaleString()} pcm
                                        </h3>
                                    </div>
                                    <div className={styles.property_card_row_2}>
                                        <div className={styles.photo_container}>
                                            <img src={property.photo_path} 
                                                role="button"
                                                alt="Property's main photo - press enter to view detailed property page." 
                                                tabIndex={0}
                                                onKeyDown= { (e) => { if (e.key === "Enter" || e.key === " ") {
                                                    navigate(`/property/${property.id}`);
                                                }}}
                                                onClick = {() => navigate(`/property/${property.id}`)} 
                                                className={styles.property_photo}
                                            />
                                        </div>
                                        <div className={styles.summary_container}>
                                            <h3 className={styles.h3_font}>Summary</h3>
                                            <div className={styles.summary_description_position}>
                                                <h4 className={`${styles.h4_font} ${styles.summary_description_format}`}>
                                                    {property.summary}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.property_card_row_3}>
                                        <div className={styles.date_listed_container}>
                                            <span className={styles.sr_content}>Date listed:</span>
                                            <h4 className={styles.h4_font}>
                                                {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")}
                                            </h4>
                                        </div>
                                        <div className={styles.remaining_info_container}>
                                            <div className={styles.remaining_info_position}>
                                                <span className={styles.sr_content}>Property type:</span>
                                                <span className={styles.react_icon}><BsHouse /> </span>
                                                <h4 className={`${styles.h4_font} ${styles.property_type_format}`}>
                                                    {property.type}
                                                </h4>
                                            </div>
                                            <div className={styles.remaining_info_position}> 
                                                <span className={styles.react_icon}> <IoBedSharp/> </span>
                                                <h4 className={styles.h4_font}>
                                                    {property.no_bedrooms} {property.no_bedrooms === 1 ? "bedroom" : "bedrooms"}
                                                </h4>
                                            </div>
                                            <div className={styles.remaining_info_position_custom}>
                                                <span className={styles.react_icon}> <LuToilet /> </span>                    
                                                <h4 className={styles.h4_font}>
                                                    {property.no_bathrooms} {property.no_bathrooms === 1 ? "bathroom" : "bathrooms"}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>                        
                            </div>
                            <div className={styles.favorites_div}>
                                {removeIDConfirmation !== property.id ? 
                                    <div className={styles.remove_request}>
                                        <button 
                                            onClick= {() => setRemoveIDConfirmation(property.id)}
                                            className={styles.favorites_button}
                                            aria-describedby="favorites_button"
                                        >
                                            <IoIosHeart className={styles.fav_button_react_icon} />
                                        </button>
                                        <span id="favorites_button" className={styles.sr_content}>
                                            Clicking this button begins a 2-step process where the relevant property is removed from your favorite's list. 
                                        </span>
                                    </div>
                                :
                                    <div className={styles.confirm_removal_container}>
                                        <h3 
                                            className={`${styles.h3_font} ${styles.confirm_removal_message}`}
                                            aria-label="Remove from favorites question"> 
                                            Are you sure?
                                        </h3>
                                        <div className={styles.removal_buttons_container}>
                                            <button 
                                                onClick={() => deleteFavProperty(property.id)}
                                                className={styles.confirm_removal_button}
                                                aria-label="confirm"
                                            >
                                                ✔ 
                                            </button>
                                            <button 
                                                onClick={() => {setRemoveIDConfirmation(null);}}
                                                className={styles.cancel_removal_button}
                                                aria-label="cancel"
                                            >
                                                ✖ 
                                            </button>
                                        </div>
                                    </div>           
                                }                    
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default DashboardFavoriteProperties;