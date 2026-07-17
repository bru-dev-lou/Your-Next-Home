import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../dashboard/dashboard_main_comp.module.css";
import serverErrorPhoto from "../../assets/server_error_photo.png";

import { BsHouse } from "react-icons/bs";
import { IoBedSharp } from "react-icons/io5";
import { LuToilet } from "react-icons/lu";

import { FaPencilAlt } from "react-icons/fa";
import { BsTrash3Fill } from "react-icons/bs";


type UserProperties ={
        id: number;
        type: string;
        city: string;
        price: number;
        no_bedrooms: number;
        no_bathrooms: number;
        summary: string;
        date_listed: string;
        photo_path: string;
};
    
type UserDetails = {
        name: string;
};

type DashboardData = {
        user: UserDetails;
        properties: UserProperties[];
    };

function DashboardMain() {
    const navigate = useNavigate();

    const [ data, setData ] = useState<DashboardData | null>(null);
    const [ deleteIDConfirmed, setDeleteIDConfirmed ] = useState<number | null>(null); 

    const [ fetchPropertyMessage, setFetchPropertyMessage ] = useState(""); 
    const [ fetchPropertyError, setFetchPropertyError ] = useState("");

    const [ deletePropertyMessage, setDeletePropertyMessage ] = useState("");
    const [ deletePropertyError, setDeletePropertyError ] = useState("");  
    function messageReset () {
        setTimeout (function () {
            setDeletePropertyMessage("");
        }, 7000);
    }

    
    useEffect(() => {
        const fetchPropertyData = async () => {
            try {
                const res = await fetch(`/api/dashboard`);
                const result = await res.json();

                if (!res.ok) {
                    setFetchPropertyError(result.error); 
                }

                else if (result.message) {
                    setFetchPropertyMessage(result.message); 
                }

                else {
                    setFetchPropertyMessage(""); 
                    setData(result);
                }
            }
            
            catch (error) {
                setFetchPropertyMessage("Failed to fetch your properties. Please check your internet and refresh the page.")
            }
        }
        
        fetchPropertyData();

    } , []);


    async function propertyDelete (propID: number) {
        
        try {
            const res = await fetch(`/api/dashboard`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ propID })
            });

            const result = await res.json();


            if (!res.ok) {
                setDeletePropertyError(result.error);
            }
                    
            else {
                setDeletePropertyMessage(result.message); 
                messageReset();

                const refreshPropertyPage = await fetch(`/api/dashboard`);
                const refreshResult = await refreshPropertyPage.json();
                
                if (!refreshPropertyPage.ok) {
                    setData(null);
                    setFetchPropertyMessage(refreshResult.error);
                }

                else if (refreshResult.message) {
                    setData(null);
                    setFetchPropertyMessage(refreshResult.message);
                }

                else {
                    setData(refreshResult);  
                }
            }
        }

        catch(error) {
            setDeletePropertyMessage("Failed to delete property. Please check your internet and try again.");
        }
    }
    
    if (!data) {
        return (
            <div>
                {fetchPropertyError ? 
                <div className={styles.main_container}>
                    <div className={styles.title_container}>
                        <h2 className={`${styles.main_title} ${styles.h2_font}`}>My properties</h2>
                    </div>
                    <div className={styles.error_image_container}>
                        <img className={styles.error_image} src={serverErrorPhoto} />
                    </div>
                    <div className={styles.error_container}>
                        <h2 
                            role="alert"
                            className={`${styles.error_message} ${styles.h2_font}`}
                        >
                            {fetchPropertyError}
                        </h2>
                    </div>
                </div>
                : 
                <div>
                    <div className={styles.title_container}>
                        <h2 className={`${styles.main_title} ${styles.h2_font}`}>My properties</h2>
                    </div>
                    <h2 className={`${styles.loading_message} ${styles.h2_font}`}>Loading...</h2>
                </div>
                }
            </div>
        );
    }

    if (data)
        return (
                <div>
                    <div className={styles.title_container}>
                        <h2 className={`${styles.main_title} ${styles.h2_font}`}> My Properties </h2>
                    </div>
                    <div className={styles.first_row}>
                        {deletePropertyMessage &&  
                            <h2 
                                role="alert"
                                className={`${styles.delete_property_message} ${styles.h2_font}`}
                            >
                                {deletePropertyMessage}
                            </h2>
                        }
                        {deletePropertyError &&
                            <h2 
                                role="alert"
                                className={`${styles.delete_property_error} ${styles.h2_font}`}
                            >
                                {deletePropertyError}
                            </h2>
                        }
                        {!deletePropertyMessage && !deletePropertyError &&
                                <h2 className={`${styles.welcome_message} ${styles.h2_font_custom}`}> Welcome back {data.user.name}! </h2>
                        }             
                        <button 
                            onClick= {() => navigate(`/dashboard/property/add`)}
                            className={`${styles.add_property_button} ${styles.h3_font}`}
                        >
                            + New property
                        </button>
                    </div>
                    {data.properties.length > 0 ? (
                        <ul className={styles.property_main_container}>
                            {data.properties.map((property: UserProperties) => (
                                <li key={property.id} className={styles.property_card_container}>
                                    <div className={styles.first_property_row}>
                                        <span className={styles.sr_content}>Address</span>
                                        <h3 className={`${styles.property_address} ${styles.h3_font}`}>{property.city}</h3>
                                        <span className={styles.sr_content}>Monthly rental rate</span>
                                        <h3 className={`${styles.property_rental_rate} ${styles.h3_font}`}> £{property.price.toLocaleString()} pcm </h3>
                                    </div>
                                    <div className={styles.second_property_row}>
                                        <img    
                                            src={property.photo_path} 
                                            role="button"
                                            alt="Property's main photo - press enter to view detailed property page."
                                            tabIndex={0} 
                                            onKeyDown= { (e) => { if (e.key === "Enter" || e.key === " ") {
                                                navigate(`/property/${property.id}`);
                                            }}}
                                            onClick={ () => navigate(`/property/${property.id}`)}
                                            className={styles.main_photo}
                                        />
                                        <div className={styles.property_summary_container}> 
                                            <h3 className={`${styles.property_summary_title} ${styles.h3_font}`}>Summary</h3>
                                            <div className={styles.trial}>  
                                                <h4 className={`${styles.property_summary_content} ${styles.h4_font}`}>{property.summary}</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.third_property_row}>
                                        <span className={styles.sr_content}> Date listed:</span>
                                        <h3 
                                            className={`${styles.property_date_listed} ${styles.h3_font}`}
                                        >
                                            {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")} 
                                        </h3>
                                        <span className={styles.sr_content}> Property type:</span>
                                        <span><BsHouse className={styles.react_icon}/></span>                                        
                                        <h3 
                                            className={`${styles.property_type} ${styles.h4_font}`}
                                        >
                                            {property.type}
                                        </h3>
                                        <span className={styles.sr_content}> Number of bedrooms:</span>
                                        <span><IoBedSharp className={styles.react_icon}/></span>                                    
                                        <h3 
                                            className={`${styles.property_bedrooms} ${styles.h4_font}`}
                                        >
                                            {property.no_bedrooms} bedrooms
                                        </h3>
                                        <span className={styles.sr_content}> Number of bathrooms:</span>
                                        <span><LuToilet className={styles.react_icon}/></span>                                    
                                        <h3 
                                            className={`${styles.property_bathrooms} ${styles.h4_font}`}
                                        > 
                                            {property.no_bathrooms} bathrooms 
                                        </h3>
                                    </div>
                                    <div className={styles.buttons_container}>
                                        <button 
                                            onClick = {() => navigate(`/dashboard/property/edit/${property.id}`)}
                                            className={styles.edit_property_button}
                                        > 
                                            <FaPencilAlt className={styles.edit_property_react_icon} /> 
                                        </button>
                                        <button 
                                            onClick = {() => setDeleteIDConfirmed(property.id)}
                                            className={styles.delete_property_button}
                                        > 
                                            <BsTrash3Fill className={styles.delete_property_react_icon} />
                                        </button>
                                        {deleteIDConfirmed === property.id ? (
                                            <div className={styles.confirm_delete_container}>
                                                <h4 className={styles.confirm_delete_message}> Are you sure ? </h4>
                                                <button 
                                                    onClick={() => propertyDelete(property.id)}
                                                    className={styles.delete_confirm_button}
                                                >
                                                    ✔
                                                </button>
                                                <button 
                                                    onClick={() => {setDeleteIDConfirmed(null)}}
                                                    className={styles.delete_cancel_button}
                                                > 
                                                    ✖ 
                                                </button>
                                            </div>
                                            ) : null} 
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <h3 role="alert">{fetchPropertyMessage}</h3>
                    )}
                </div>
        );
}


export default DashboardMain;