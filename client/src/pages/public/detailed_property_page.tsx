import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "../public/detailed_property_page.module.css";
import adPhoto from "../../assets/detailed_page_ad_photo.jpg";
import errorPhoto from "../../assets/server_error_photo.png";

import { IoIosHeartEmpty, IoIosHeart, IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";

import { BsHouse } from "react-icons/bs";
import { IoBedSharp } from "react-icons/io5";
import { LuToilet } from "react-icons/lu";
import { BiCabinet } from "react-icons/bi";
import { IoMdResize } from "react-icons/io";
import { BsHouseGear } from "react-icons/bs";

type PropertyDetails = {
    id: number;
    type: string;
    city: string;
    price: number;
    no_bedrooms: number;
    no_bathrooms: number;
    size: number;
    furniture: string;
    date_listed: string;
    detail: string;
    photos: {photo_path: string, is_main: boolean}[]; 
};

type OwnerDetails = {
    name: string; 
    address: string;
    phone_number: string;
}

function DetailedPropertyPage () {
    const {propID} = useParams();
    const propID_Formatted = String(propID).padStart(4, "0");

    const [ property, setProperty ] = useState<PropertyDetails | null>(null);
    const [ owner, setOwner ] = useState<OwnerDetails | null>(null);

    const [ propFavorite, setPropFavorite ] = useState<Set<number>>(new Set());
    
    const [ galleryIndex, setGalleryIndex ] = useState<number>(0); 
    const [ photoIndex, setPhotoIndex ] = useState<number>(0);

    const [ errorMessageFP,  setErrorMessageFP] = useState(""); 
    const [ errorMessageFavorites, setErrorMessageFavorites ] = useState("");

    
    useEffect (() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/property/${propID}`);
                const result = await res.json(); 

                if (!res.ok) {
                    setErrorMessageFP(result.error)
                }

                else {
                    setProperty(result.propertyData);
                    setPhotoIndex(result.propertyData.photos.findIndex((photo: {photo_path: string, is_main: boolean})  => photo.is_main));
                    setOwner(result.ownerData);
                }
            }

            catch(error) {
                console.error(error);
                setErrorMessageFP("Failed to fetch this property. Please check your internet and refresh the page.")
            }
        }
        
        fetchData();

    }, [propID]); 

    useEffect (() => {
        const fetchFavorites = async () => {
            const updateSet = new Set(propFavorite);
            
            try {
                const res = await fetch ("/api/search/favorites");
                const results = await res.json(); 
                
                if (res.ok) {
                    for (const result of results) {
                        updateSet.add(result.property_id);
                    }
                    setPropFavorite(updateSet);
                }

                else {
                    return;
                }
            }

            catch(error) {
                console.error(error);
            }
        }
        fetchFavorites();
    }, []);

    async function addToFavorites (propID : number) {
        const updateSet = new Set(propFavorite);

        try {            
            const res = await fetch (`/api/search/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({propID})
            });

            const result = await res.json(); 

            if (res.ok) {
                setErrorMessageFavorites("");
                updateSet.add(propID);
                setPropFavorite(updateSet); 
            }

            else {
                setErrorMessageFavorites(result.error);
                setTimeout(() => {
                    setErrorMessageFavorites("");
                }, 3000)
            }
        }

        catch (error) {
            console.error(error);
            setErrorMessageFavorites("Failed to add to favorites. Please check your internet and try again.");
            setTimeout(() => {
                setErrorMessageFavorites("");
            }, 4000)            
        }
    }         

    async function removeFromFavorites (propID : number) {
        const updateSet = new Set(propFavorite); 
    
        try {
            const res = await fetch (`/api/search/favorites`, {
                method: "DELETE",
                headers: {
                    "Content-Type" : "application/json"
            },
                body: JSON.stringify({propID})
            });

            if (!res.ok) {
                const result = await res.json(); 
                setErrorMessageFavorites(result.error)
                setTimeout(() => {
                    setErrorMessageFavorites("");
                }, 3000)                
            }  

            else {
                setErrorMessageFavorites("");
                updateSet.delete(propID);
                setPropFavorite(updateSet);
            }
        }

        catch (error) {
            console.error(error);
            setErrorMessageFavorites("Failed to remove from favorites. Please check your internet and try again.")
            setTimeout(() => {
                setErrorMessageFavorites("");
            }, 4000)       
        }
    }

    function previousPhotos () {
        if (galleryIndex >= 4) {
        setGalleryIndex(prev => prev - 4)
        }
    }

    function nextPhotos () {
        if (galleryIndex + 4 < property!.photos.length) {
        setGalleryIndex(prev => prev + 4)
        }
    }

    if (errorMessageFP) {
        return (
            <div className={styles.error_FP_container}>
                <img src={errorPhoto} className={styles.error_FP_img} />
                <div role="alert" className={styles.error_FP_message_container}>
                    <h1 className={styles.error_FP_message}>{errorMessageFP}</h1>
                </div>
            </div>
        )
    }

    if (!property) {
        return null
    }

    const visiblePhotos = property.photos.slice(galleryIndex, galleryIndex + 4);
    
    return (
        <div key ={property.id} className={styles.main_container}>
            <h1 className={styles.sr_content}> Property {property.id} - Detailed page. </h1>
            <div className={styles.first_row}>
                <h2 className={styles.sr_content}> Property {property.id} - Location, monthly rate and date listed.</h2>
                <div className={styles.address_container}>
                    <span className={styles.sr_content}>Address</span>
                    <span
                        className={styles.quick_property_data_font}
                    >
                        {property.city}
                    </span>
                </div>
                <div className={styles.monthly_rate_container}>
                    <span className={styles.sr_content}>Monthly rental rate</span>
                    <span
                        className={styles.quick_property_data_font}
                    >
                        £{property.price.toLocaleString()} pcm
                    </span>
                </div>
                <div className={styles.date_listed_container}>
                    <span className={styles.sr_content}>Date Property Listed</span>
                    <span 
                        className={styles.quick_property_data_font}
                    >
                        {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")}
                    </span>
                </div>
            </div>
            <div role="group" aria-label="Property photos" className={styles.second_row}>
                <div className={styles.main_photo_container}>
                    {errorMessageFavorites && <p role="alert" className={styles.fav_error_message}>{errorMessageFavorites}</p>}                             
                    <img 
                        src={property.photos[photoIndex].photo_path}
                        alt={`Main photo of property number ${property.id}`}
                        className={styles.main_photo}
                    />
                    {propFavorite.has(property.id) ?
                        <button 
                            onClick={ () => removeFromFavorites(property.id)}
                            aria-label="remove"
                            aria-describedby="remove_fav_button"
                            className={styles.fav_button}
                        > 
                            <IoIosHeart className={styles.react_icon_is_favorite} /> 
                        </button>
                        :
                        <button 
                            onClick={ () => addToFavorites(property.id)}
                            aria-label="add"
                            aria-describedby="add_fav_button"
                            className={styles.fav_button}
                        >
                            <IoIosHeartEmpty className={styles.react_icon_not_favorite} /> 
                        </button>
                    }                                                              
                    <span id="remove_fav_button" className={styles.sr_content}>If aria-label shows 'remove', it means the property is currently in your favorite properties' list. Clicking the button will remove it from this list.</span>
                    <span id="add_fav_button" className={styles.sr_content}>If aria-label shows 'add', it means the property is not in your favorite properties' list. Clicking the button will add it to this list.</span> 
                </div>               
                <div className={styles.extra_photo_main_container}>
                    <button 
                        disabled= {galleryIndex === 0}
                        onClick= {() => previousPhotos()}
                        aria-describedby="extra_photo_go_up_button"
                        className={styles.up_arrow_button}
                    >
                        <IoMdArrowRoundUp className={styles.arrow_format} />
                    </button>
                    <span id="extra_photo_go_up_button" className={styles.sr_content}>Display previous 4 property photos. If these are the first 4 property photos, this button will be disabled. </span>                 
                    <ul className={styles.extra_photo_container}>
                        {visiblePhotos.map((photo, index) => ( 
                            <li key={index} className={styles.list_item_format}> 
                                <img 
                                    onClick={ () => setPhotoIndex(property.photos.indexOf(photo))}
                                    src={photo.photo_path}
                                    alt={`Photos number ${index + 1} of property number ${property.id}`}
                                    className={styles.extra_photo} 
                                />
                            </li> 
                        ))}
                        {Array.from({length: 4 - visiblePhotos.length}).map((_, index) => (
                            <li key={index} className={styles.list_item_format}>
                                <div className={styles.no_extra_photo_div}>
                                    <RxCross1 className={styles.react_icon_no_photo} />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button 
                        disabled= {galleryIndex + 4 >= property.photos.length} 
                        onClick= { () => nextPhotos() }
                        aria-describedby="button_hint_4"
                        className={styles.down_arrow_button}
                    >
                        <IoMdArrowRoundDown className={styles.arrow_format} />
                    </button>    
                    <span id="button_hint_4" className={styles.sr_content}>Display next 4 property photos. If there are no more photos, this button will be disabled.</span>             
                </div>
                {owner && (
                    <div className={styles.owner_and_ad_main_container_wide_viewport}>
                        <div className={styles.owner_container_wide_viewport}>
                            <h2 className={`${styles.owner_font} ${styles.owner_title_wide_viewport}`}>Owner Details</h2>
                            <div className={styles.owner_subtitle_container_wide_viewport}>
                                <div className={styles.information_container_wide_viewport}>
                                    <span className={`${styles.owner_font} ${styles.owner_subtitle_wide_viewport}`}>Name:</span>
                                    <span 
                                        aria-describedby="owner_name_hint"
                                        className={`${styles.owner_font} ${styles.owner_subtitle_info_wide_viewport}`}
                                    >
                                        {owner!.name}
                                    </span>
                                    <span id="owner_name_hint" className={styles.sr_content}>This could be an individual's name or a company's name, depending on who is letting the property.</span>                            
                                </div>
                                <div className={styles.information_container_wide_viewport}>
                                    <span className={`${styles.owner_font} ${styles.owner_subtitle_wide_viewport}`}>Address:</span>
                                    <span 
                                        aria-describedby="owner_address_hint"
                                        className={`${styles.owner_font} ${styles.owner_subtitle_info_wide_viewport}`}
                                    >
                                        {owner!.address}
                                    </span>
                                    <span id="owner_address_hint" className={styles.sr_content}>This could be an individual's address or a company's address, depending on who is letting the property.</span>
                                </div>
                                <div className={styles.information_container_wide_viewport}>
                                    <span className={`${styles.owner_font} ${styles.owner_subtitle_wide_viewport}`}>Number:</span>
                                    <span 
                                        aria-describedby="owner_phone_number_hint"
                                        className={`${styles.owner_font} ${styles.owner_subtitle_info_wide_viewport}`}
                                    >
                                        {owner!.phone_number}
                                    </span>
                                    <span id="owner_phone_number_hint" className={styles.sr_content}>This could be an individual's phone number or a company's phone number, depending on who is letting the property.</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.ad_container_wide_viewport}>
                            <img src={adPhoto} className={styles.ad_photo_wide_viewport} alt="Advertisement image for moving houses"/>
                        </div>                        
                    </div>
                )}
            </div>
            <div className={styles.third_row}>
                <div className={styles.property_summary_container_wide_viewport}>
                    <h2 className={styles.sr_content}>Property {property.id} - Quick data information </h2>
                    <div className={styles.property_summary_item_property_type}>
                        <span className={styles.sr_content}> Property type:</span>
                        <span> <BsHouse className={styles.react_icon} /> </span>
                        <span className={`${styles.detailed_property_data_font} ${styles.property_summary_position}`}>{property.type}</span>
                    </div>    
                    <div className={styles.property_summary_item_bedrooms_and_bathrooms}>            
                        <span className={styles.sr_content}> Number of bedrooms:</span>
                        <span> <IoBedSharp className={styles.react_icon} /> </span>
                        <span className={`${styles.detailed_property_data_font} ${styles.property_summary_position}`}>{property.no_bedrooms} bedrooms</span>
                    </div>
                    <div className={styles.property_summary_item_bedrooms_and_bathrooms}>
                        <span className={styles.sr_content}> Number of bathrooms:</span>
                        <span> <LuToilet className={styles.react_icon} /> </span>
                        <span className={`${styles.detailed_property_data_font} ${styles.property_summary_position}`}>{property.no_bathrooms} bathrooms</span>
                    </div>
                    <div className={styles.property_summary_item_furnishing}>
                        <span className={styles.sr_content}>Furnishing:</span>
                        <span> <BiCabinet className={styles.react_icon}/></span>
                        <span className={`${styles.detailed_property_data_font} ${styles.property_summary_position}`}>{property.furniture}</span>
                    </div>
                    <div className={styles.property_summary_item_property_size  }>
                        <span className={styles.sr_content}> Property size: </span>
                        <span> <IoMdResize className={styles.react_icon} /> </span>
                        <span className={`${styles.detailed_property_data_font} ${styles.property_summary_position}`}>{property.size} m²</span>
                    </div>
                </div>
                <div className={styles.property_description_container}>
                    <div className={styles.description_title_container}>
                        <h2 className={`${styles.description_title_font} ${styles.property_description_title_position}`}>Description</h2>
                        <span 
                            className={`${styles.description_title_font} ${styles.propID_position} ${styles.propID_wide_viewport}`}
                        > 
                            PROP {propID_Formatted} 
                        </span>
                    </div>
                    <div className={styles.property_summary_container_short_viewport}>
                        <h2 className={styles.sr_content}>Property {property.id} - Quick data information </h2>
                        <div className={styles.property_summary_item_property_type_short_viewport}>
                            <span className={`${styles.detailed_property_data_font} ${styles.property_summary_item_short_viewport}`}> Property Type:</span>
                            <span className={styles.react_icon_span}> 
                                <BsHouse 
                                    className={styles.react_icon_short_viewport}
                                    role="img"
                                    aria-label="Property Type" 
                                /> 
                            </span>                            
                            <span className={`${styles.detailed_property_data_font} ${styles.light_font_weight}`}>{property.type}</span>
                        </div>   
                        <div className={styles.property_summary_item_bathrooms_short_viewport}>
                            <span className={`${styles.detailed_property_data_font} ${styles.property_summary_item_short_viewport_c2}`}> Bathrooms:</span>
                            <span className={styles.react_icon_span}>
                                <LuToilet 
                                    className={styles.react_icon_short_viewport}
                                    role="img"
                                    aria-label="Bathrooms" 
                                />
                            </span>                        
                            <span className={`${styles.detailed_property_data_font} ${styles.light_font_weight}`}>{property.no_bathrooms} bathrooms</span>
                        </div>        
                        <div className={styles.property_summary_item_furnishing_short_viewport}>
                            <span className={`${styles.detailed_property_data_font} ${styles.property_summary_item_short_viewport}`}>Furnishing:</span>
                            <span className={styles.react_icon_span}> 
                                <BiCabinet 
                                    className={styles.react_icon_short_viewport}
                                    role="img"
                                    aria-label="Furnishing" 
                                />
                            </span>                            
                            <span className={`${styles.detailed_property_data_font} ${styles.light_font_weight}`}>{property.furniture}</span>
                        </div>                                         
                        <div className={styles.property_summary_item_bedrooms_short_viewport}>            
                            <span className={`${styles.detailed_property_data_font} ${styles.property_summary_item_short_viewport_c2}`}> Bedrooms:</span>
                            <span className={styles.react_icon_span}>
                                <IoBedSharp 
                                    className={styles.react_icon_short_viewport}
                                    role="img"
                                    aria-label="Bedrooms" 
                                />
                            </span>                           
                            <span className={`${styles.detailed_property_data_font} ${styles.light_font_weight}`}>{property.no_bedrooms} bedrooms</span>
                        </div>
                        <div className={styles.property_summary_item_property_ID_short_viewport}>
                            <span className={`${styles.detailed_property_data_font} ${styles.property_summary_item_short_viewport}`}> Property ID:</span>
                            <span className={styles.react_icon_span}> 
                                <BsHouseGear 
                                    className={styles.react_icon_short_viewport}
                                    role="img"
                                    aria-label="Property ID" 
                                />                                    
                            </span>
                            <span className={`${styles.detailed_property_data_font} ${styles.light_font_weight}`}> PROP {propID_Formatted} </span>
                        </div>
                        <div className={styles.property_summary_item_property_size_short_viewport}>
                            <span className={`${styles.detailed_property_data_font} ${styles.property_summary_item_short_viewport_c2}`}> Size: </span>
                            <span className={styles.react_icon_span}> 
                                <IoMdResize 
                                    className={styles.react_icon_short_viewport}
                                    role="img"
                                    aria-label="Property Size" 
                                /> 
                            </span>                            
                            <span className={`${styles.detailed_property_data_font} ${styles.light_font_weight}`}>{property.size} m²</span>
                        </div>
                    </div>                    
                    <p className={`${styles.description_content_font} ${styles.property_description_content_position}`}>{property.detail}</p> 
                    </div>    
                <br></br>
            </div>      
        {owner && (
            <div className={styles.owner_and_ad_main_container_short_viewport}>
                <div className={styles.owner_container_short_viewport}>
                    <h2 className={`${styles.owner_font} ${styles.owner_title_short_viewport}`}>Owner Details</h2>
                    <div className={styles.owner_subtitle_container_short_viewport}>
                        <div className={styles.information_container_short_viewport}>
                            <span className={`${styles.owner_font} ${styles.owner_subtitle_short_viewport}`}>Name:</span>
                            <span 
                                aria-describedby="owner_name_hint_short_viewport"
                                className={`${styles.owner_font} ${styles.owner_subtitle_info_short_viewport}`}
                            >
                                {owner!.name}
                            </span>
                            <span id="owner_name_hint_short_viewport" className={styles.sr_content}>This could be an individual's name or a company's name, depending on who is letting the property.</span>                            
                        </div>
                        <div className={styles.information_container_short_viewport}>
                            <span className={`${styles.owner_font} ${styles.owner_subtitle_short_viewport}`}>Address:</span>
                            <span 
                                aria-describedby="owner_address_hint_short_viewport"
                                className={`${styles.owner_font} ${styles.owner_subtitle_info_short_viewport}`}
                            >
                                {owner!.address}
                            </span>
                            <span id="owner_address_hint_short_viewport" className={styles.sr_content}>This could be an individual's address or a company's address, depending on who is letting the property.</span>
                        </div>
                        <div className={styles.information_container_short_viewport}>
                            <span className={`${styles.owner_font} ${styles.owner_subtitle_short_viewport}`}>Number:</span>
                            <span 
                                aria-describedby="owner_phone_number_hint_short_viewport"
                                className={`${styles.owner_font} ${styles.owner_subtitle_info_short_viewport}`}
                            >
                                {owner!.phone_number}
                            </span>
                            <span id="owner_phone_number_hint_short_viewport" className={styles.sr_content}>This could be an individual's phone number or a company's phone number, depending on who is letting the property.</span>
                        </div>
                    </div>
                </div>
                <div className={styles.ad_container_short_viewport}>
                    <img src={adPhoto} className={styles.ad_photo_short_viewport} alt="Advertisement image for moving houses"/>
                </div>            
            </div>            
        )}
            <br></br>            
        </div>
    )
};

export default DetailedPropertyPage;