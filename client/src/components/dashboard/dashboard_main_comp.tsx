import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../dashboard/dashboard_main_comp.module.css";
import serverErrorPhoto from "../../assets/server_error_photo.png";

import { BsHouse } from "react-icons/bs";
import { IoBedSharp } from "react-icons/io5";
import { LuToilet } from "react-icons/lu";

import { FaPencilAlt } from "react-icons/fa";
import { BsTrash3Fill } from "react-icons/bs";

import { BsWifiOff } from "react-icons/bs";



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
    
    const [ noInternetMessage, setNoInternetMessage ] = useState("");
    
    function messageReset () {
        setTimeout (function () {
            setDeletePropertyMessage("");
            setDeletePropertyError("");
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
                    setData(result);
                }

                else {
                    setFetchPropertyMessage(""); 
                    setData(result);
                }
            }
            
            catch (error) {
                setNoInternetMessage("Please check your internet and refresh the page.")
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
                messageReset();
            }
                    
            else {
                setDeletePropertyMessage(result.message); 
                messageReset();

                const refreshPropertyPage = await fetch(`/api/dashboard`);
                const refreshResult = await refreshPropertyPage.json();
                
                if (!refreshPropertyPage.ok) {
                    setData(null);
                    setFetchPropertyError(refreshResult.error);
                }

                else if (refreshResult.message) {
                    setData(refreshResult);
                    setFetchPropertyMessage(refreshResult.message);
                }

                else {
                    setData(refreshResult);  
                }
            }
        }

        catch(error) {
            setNoInternetMessage("Please check your internet and refresh the page.");
        }
    }
    
    if (!data) {
        return (
            <div className={styles.main_container_for_errors}>
                {fetchPropertyError ?
                    <div className={styles.error_container}>
                        <div className={styles.title_container}>
                            <h1 className={styles.main_title}>My Properties</h1>
                        </div>
                        <img 
                            src={serverErrorPhoto} 
                            className={styles.error_image} 
                            alt="Server error illustration."
                        />
                        <div role="alert" className={styles.error_message_container}>
                            <span 
                                className={styles.error_message}
                            >
                                {fetchPropertyError}
                            </span>                        
                        </div>
                    </div>
                :
                    <div className={styles.error_container}>
                        <div className={styles.title_container}>
                            <h1 className={styles.sr_content}>My Properties</h1>
                            <span className={styles.main_title_loading} role="status">Loading...</span>
                        </div>
                        {noInternetMessage && 
                        <div className={styles.no_data_no_internet_container}>
                            <BsWifiOff className={styles.no_internet_react_icon}/>
                            <span className={styles.no_internet_message}> {noInternetMessage} </span>
                        </div>
                        }
                    </div>    
                }
            </div>
        )
    }

    return (
        <div className={styles.main_container}>
            <div className={styles.title_container}>
                <h1 className={styles.main_title}> My Properties </h1>
            </div>
            <div className={styles.first_row}>       
                {deletePropertyMessage &&  
                <div role="alert" className={styles.delete_property_feedback_container}>
                    <span className={styles.delete_property_message}>
                        {deletePropertyMessage}
                    </span>
                </div>
                }
                {deletePropertyError &&
                <div role="alert" className={styles.delete_property_feedback_container}>
                    <span className={styles.delete_property_error}>
                        {deletePropertyError}
                    </span>
                </div>
                }
                {noInternetMessage &&
                <div role="alert" className={` ${styles.delete_property_feedback_container} ${styles.no_internet_container}`}>
                    <span className={styles.delete_property_error}>
                        {noInternetMessage}
                    </span>
                </div>
                }
                {fetchPropertyMessage && !deletePropertyMessage && !deletePropertyError && !noInternetMessage &&
                <div className={styles.no_property_container}>
                    <span className={styles.welcome_message}>Welcome back, {data.user.name}!</span>
                </div>
                }
                {!deletePropertyMessage && !deletePropertyError && !fetchPropertyMessage && !noInternetMessage &&
                <div className={styles.welcome_message_container}>
                    <span className={styles.welcome_message}>Welcome back, {data.user.name}!</span>
                </div>
                }   
                {!noInternetMessage &&          
                    <button 
                        onClick= {() => navigate(`/dashboard/property/add`)}
                        className={styles.add_property_button}
                    >
                        + New Property
                    </button>
                }
            </div>
            {fetchPropertyMessage && !deletePropertyMessage && !deletePropertyError &&
                <div className={styles.no_property_message_container}>            
                    <span className={styles.no_property_message}>{fetchPropertyMessage} </span>
                </div>
            }
            {data.properties.length > 0 && 
            <ul className={styles.property_list_container}>
                {data.properties.map((property: UserProperties) => (
                    <li key={property.id} className={styles.property_main_container}>
                        <div className={styles.property_card_container}>
                            <div className={styles.property_card_first_row}>
                                <div className={styles.address_container}>
                                    <span className={styles.sr_content}>Address</span>
                                    <span className={styles.quick_data_font}>{property.city}</span>
                                </div>
                                <div className={styles.budget_container}>
                                    <span className={styles.sr_content}>Monthly rental rate</span>
                                    <span className={styles.quick_data_font}> £{property.price.toLocaleString()} pcm </span>
                                </div>
                            </div>
                            <div className={styles.property_card_second_row}>
                                <img    
                                    src={property.photo_path} 
                                    role="button"
                                    alt={`Main photo for property ${property.id}`}
                                    tabIndex={0} 
                                    onKeyDown= { (e) => { if (e.key === "Enter" || e.key === " ") {
                                        navigate(`/property/${property.id}`);
                                    }}}
                                    onClick={ () => navigate(`/property/${property.id}`)}
                                    className={styles.main_photo}
                                />
                                <div className={styles.property_summary_container}> 
                                    <span className={`${styles.property_summary_title} ${styles.quick_data_font}`}>Summary</span>
                                    <p className={styles.property_summary_content}>{property.summary}</p>
                                </div>
                            </div>
                            <div className={styles.property_card_third_row}>
                                <div className={styles.date_listed_container}>
                                    <span className={styles.sr_content}> Date listed:</span>
                                    <span
                                        className={styles.quick_data_font_row_3}
                                    >
                                        {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")} 
                                    </span>
                                </div>
                                <div className={styles.basic_info_main_container}>
                                    <div className={styles.basic_info_property_type_container}>
                                        <span className={styles.sr_content}> Property type:</span>
                                        <span><BsHouse className={styles.quick_data_react_icon}/></span>                                        
                                        <span 
                                            className={`${styles.basic_info_position} ${styles.quick_data_font_row_3}`}
                                        >
                                            {property.type}
                                        </span>
                                    </div>
                                    <div className={styles.basic_info_bedrooms_container}>
                                        <span className={styles.sr_content}> Number of bedrooms:</span>
                                        <span><IoBedSharp className={styles.quick_data_react_icon}/></span>                                    
                                        <span 
                                            className={`${styles.basic_info_position} ${styles.quick_data_font_row_3} ${styles.quick_data_wide_viewport}`}
                                        >
                                            {property.no_bedrooms !== 1 ? `${property.no_bedrooms} bedrooms` : `${property.no_bedrooms} bedroom`}
                                        </span>
                                        <span 
                                            className={`${styles.basic_info_position} ${styles.quick_data_font_row_3} ${styles.quick_data_short_viewport}`}
                                        >
                                            {property.no_bedrooms !== 1 ? `${property.no_bedrooms} beds` : `${property.no_bedrooms} bed`}
                                        </span>
                                    </div>
                                    <div className={styles.basic_info_bathrooms_container}>
                                        <span className={styles.sr_content}> Number of bathrooms:</span>
                                        <span><LuToilet className={styles.quick_data_react_icon}/></span>                                    
                                        <span 
                                            className={`${styles.basic_info_position} ${styles.quick_data_font_row_3} ${styles.quick_data_wide_viewport}`}
                                        > 
                                            {property.no_bathrooms !== 1 ? `${property.no_bathrooms} bathrooms` : `${property.no_bathrooms} bathroom`} 
                                        </span>
                                        <span 
                                            className={`${styles.basic_info_position} ${styles.quick_data_font_row_3} ${styles.quick_data_short_viewport}`}
                                        > 
                                            {property.no_bathrooms !== 1 ? `${property.no_bathrooms} baths` : `${property.no_bathrooms} bath`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.buttons_container}>
                            <button 
                                onClick = {() => navigate(`/dashboard/property/edit/${property.id}`)}
                                className={styles.property_button}
                                aria-label={`Edit property ${property.id}`}
                            > 
                                <FaPencilAlt className={styles.property_react_icon} /> 
                            </button>
                            <button 
                                onClick = {() => setDeleteIDConfirmed(property.id)}
                                className={styles.property_button}
                                aria-label={`Delete property ${property.id}`}                                
                            > 
                                <BsTrash3Fill className={styles.property_react_icon} />
                            </button>
                        </div>
                        <div className={ deleteIDConfirmed === property.id ? styles.delete_property_container_visible : styles.delete_property_container_hidden}>
                            <span className={styles.confirm_delete_message_wide_viewport}> Are you sure? </span>
                            <span className={styles.confirm_delete_message_short_viewport}> Sure? </span>
                            <div className={styles.delete_button_container}>
                                <button 
                                    onClick={() => propertyDelete(property.id)}
                                    className={styles.delete_button}      
                                    aria-label={`Confirm deletion of property ${property.id}`}       
                                >
                                    ✔
                                </button>
                                <button 
                                    onClick={() => {setDeleteIDConfirmed(null)}}
                                    className={styles.delete_button}
                                    aria-label={`Cancel deletion of property ${property.id}`}       
                                > 
                                    ✖ 
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>            
            }      
        </div>    
    )
}


export default DashboardMain;