import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../dashboard/dashboard_property_favorites_comp.module.css";
import serverErrorPhoto from "../../assets/server_error_photo.png";
import missingPropertyPhoto from "../../assets/missing_property_photo.png";

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
    const [ noPropertiesMessage, setNoPropertiesMessage ] = useState("");
    const [ errorMessageDP, setErrorMessageDP ] = useState("");

    useEffect(() => {
        async function fetchFavProperties() {
            try {
                const res = await fetch(`/api/dashboard/property/favorites`);
                const result = await res.json(); 

                if (!res.ok) {
                    setErrorMessageFP(result.error);
                }

                else if (result.noProperties) {
                    setNoPropertiesMessage(result.noProperties);
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
                    setErrorMessageDP("");
                    setRemoveIDConfirmation(null);
                }, 5000);
            }
             
            else {
                const refreshFavoritesPage = await fetch (`/api/dashboard/property/favorites`);
                const newFavoritesList = await refreshFavoritesPage.json(); 

                if (newFavoritesList.noProperties) {
                    setNoPropertiesMessage(newFavoritesList.noProperties);
                }
                
                else if (refreshFavoritesPage.ok) {
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
            setErrorMessageDP("Please check your internet and refresh the page.");
        }
    }


    if (errorMessageFP) {
        return (
           <div className={styles.error_container}>
                <div className={styles.main_title_container}>
                    <h1 className={styles.main_title}>Favorite Properties</h1>
                </div>
                <img 
                    src={serverErrorPhoto} 
                    className={styles.server_error_image} 
                    alt="Server error illustration."
                />                
                <span 
                    role="alert"
                    className={styles.error_message_FP}    
                >
                    {errorMessageFP}
                </span>
            </div>
        )
    }

    else if (noPropertiesMessage) {
        return (
           <div className={styles.error_container}>
                <div className={styles.main_title_container}>
                    <h1 className={styles.main_title}>Favorite Properties</h1>
                </div>
                <img 
                    src={missingPropertyPhoto} 
                    className={styles.no_props_image} 
                    alt="No saved properties illustration."
                />                     
                <span 
                    role="alert"
                    className={styles.no_properties_message}    
                >
                    {noPropertiesMessage}
                </span>                
            </div>            
        )
    }

    else if (favoriteProps.length === 0) {
        return (
           <div className={styles.error_container}>
                <div className={styles.main_title_container}>
                    <h1 className={styles.main_title}>Loading... </h1>
                </div>
            </div>            
        )
    }

    return (           
        <div className={styles.main_container}>
            <div className={styles.main_title_container}>
                {errorMessageDP ?
                    <span className={styles.remove_from_favorites_error_message} role="alert">
                        {errorMessageDP}
                    </span>
                    :
                    <h1 className={styles.main_title}>Favorite Properties</h1>
                }                    
            </div>
            <ul className={styles.property_and_favorite_main_container}>              
                {favoriteProps.map((property) => (
                    <li key = {property.id} className={styles.property_and_favorite_container}>                                                    
                        <div className={styles.property_card_container}>
                            <div className={styles.property_card_row_1}>
                                <div className={styles.location_container}>
                                    <span className={styles.sr_content}>Location:</span>
                                    <span className={styles.quick_data_row_1_font}>
                                        {property.city}
                                    </span>
                                </div>
                                <div className={styles.rental_rate_container}>
                                    <span className={styles.sr_content}>Monthly rental rate:</span>
                                    <span className={styles.quick_data_row_1_font}>
                                        £{property.price.toLocaleString()} pcm
                                    </span>
                                </div>
                            </div>
                            <div className={styles.property_card_row_2}>
                                <img src={property.photo_path} 
                                    role="button"
                                    alt={`Main photo for property ${property.id}`} 
                                    tabIndex={0}
                                    onKeyDown= { (e) => { if (e.key === "Enter") {
                                        navigate(`/property/${property.id}`);
                                    }}}
                                    onClick = {() => navigate(`/property/${property.id}`)} 
                                    className={styles.property_photo}
                                />
                                <div className={styles.summary_container}>
                                    <span className={styles.summary_title}>
                                        Summary
                                    </span>
                                    <span className={styles.summary_content}>
                                        {property.summary}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.property_card_row_3}>
                                <div className={styles.date_listed_container}>
                                    <span className={styles.sr_content}>Date listed:</span>
                                    <span className={styles.quick_data_row_3_font}>
                                        {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")}
                                    </span>
                                </div>
                                <div className={styles.remaining_info_container}>
                                    <div className={styles.property_type_container}>
                                        <span className={styles.sr_content}>Property type:</span>
                                        <span className={styles.react_icon}><BsHouse /> </span>
                                        <span className={styles.quick_data_row_3_font}>
                                            {property.type}
                                        </span>
                                    </div>
                                    <div className={styles.bedrooms_container}> 
                                        <span className={styles.react_icon}> <IoBedSharp/> </span>
                                        <span className={`${styles.quick_data_row_3_font} ${styles.quick_data_row_3_wide_viewport}`}>
                                            {property.no_bedrooms} {property.no_bedrooms === 1 ? "bedroom" : "bedrooms"}
                                        </span>
                                        <span className={`${styles.quick_data_row_3_font} ${styles.quick_data_row_3_short_viewport}`}>
                                            {property.no_bedrooms} {property.no_bedrooms === 1 ? "bed" : "beds"}
                                        </span>                                        
                                    </div>
                                    <div className={styles.bathrooms_container}>
                                        <span className={styles.react_icon}> <LuToilet /> </span>                    
                                        <span className={`${styles.quick_data_row_3_font} ${styles.quick_data_row_3_wide_viewport}`}>
                                            {property.no_bathrooms} {property.no_bathrooms === 1 ? "bathroom" : "bathrooms"}
                                        </span>
                                        <span className={`${styles.quick_data_row_3_font} ${styles.quick_data_row_3_short_viewport}`}>
                                            {property.no_bathrooms} {property.no_bathrooms === 1 ? "bath" : "baths"}
                                        </span>                                        
                                    </div>
                                </div>
                            </div>
                        </div>                        
                        {removeIDConfirmation !== property.id ? 
                            <div className={styles.favorites_div}>                    
                                <div className={styles.favorite_button_container}>
                                    <button 
                                        onClick= {() => setRemoveIDConfirmation(property.id)}
                                        className={styles.favorites_button}
                                        aria-describedby={`Favorite_button_property_${property.id}`}
                                    >
                                        <IoIosHeart className={styles.fav_button_react_icon} />
                                    </button>
                                    <span id={`Favorite_button_property_${property.id}`} className={styles.sr_content}>
                                        Clicking this button begins a 2-step process where the relevant property is removed from your favorite's list. 
                                    </span>
                                </div>
                            </div>
                        :
                            <div className={styles.favorites_div_confirm_removal}>
                                <span 
                                    className={`${styles.confirm_removal_question} ${styles.c_f_m_wide_viewport}`}
                                > 
                                    Are you sure?
                                </span>
                                <span 
                                    className={`${styles.confirm_removal_question} ${styles.c_f_m_short_viewport}`}
                                >
                                    Sure?
                                </span>
                                <div className={styles.removal_buttons_container}>
                                    <button 
                                        onClick={() => deleteFavProperty(property.id)}
                                        className={styles.confirm_cancel_removal_button}
                                        aria-label={`Confirm deletion of property ${property.id}`}
                                    >
                                        ✔ 
                                    </button>
                                    <button 
                                        onClick={() => {setRemoveIDConfirmation(null);}}
                                        className={styles.confirm_cancel_removal_button}
                                        aria-label={`Cancel deletion of property ${property.id}`}
                                    >
                                        ✖ 
                                    </button>
                                </div>
                            </div>           
                        }                    
                    </li>
                ))}
            </ul>
            <br></br>
        </div>
    )
}

export default DashboardFavoriteProperties;