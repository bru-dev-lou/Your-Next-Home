import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "../public/detailed_property_page.module.css";
import adPhoto from "../../assets/detailed_page_ad_photo.jpg";
import errorPhoto from "../../assets/server_error_photo.png";

import { IoIosHeartEmpty, IoIosHeart, IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";

import { BsHouse } from "react-icons/bs";
import { IoBedSharp } from "react-icons/io5";
import { LuToilet } from "react-icons/lu";
import { BiCabinet } from "react-icons/bi";
import { IoMdResize } from "react-icons/io";




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
            setErrorMessageFavorites("Failed to add to favorites. Please check your internet and try again.");
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
            setErrorMessageFavorites("Failed to remove from favorites. Please check your internet and try again.")
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
                <h3 role="alert" className={styles.error_FP_message}>{errorMessageFP}</h3>
            </div>
        )
    }

    if (!property) {
        return null
    }

    const visiblePhotos = property.photos.slice(galleryIndex, galleryIndex + 4);
    
    return (
        <div key ={property.id} className={styles.main_container}>
            <div className={styles.first_row}>
                <div className={styles.address_container}>
                    <span className={styles.sr_content}>Address</span>
                    <h3 
                        className={styles.h3_font}
                    >
                        {property.city}
                    </h3>
                </div>
                <div className={styles.monthly_rate_container}>
                    <span className={styles.sr_content}>Monthly rental rate</span>
                    <h3 
                        className={styles.h3_font}
                    >
                        £{property.price.toLocaleString()} pcm
                    </h3>
                </div>
                <div className={styles.date_listed_container}>
                    <span className={styles.sr_content}>Date Property Listed</span>
                    <h3 
                        className={`${styles.h3_font} ${styles.date_position}`}
                    >
                        {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")}
                    </h3>
                </div>
            </div>
            <div role="group" aria-label="Property photos" className={styles.second_row}>
                <div className={styles.main_photo_container}>
                    {errorMessageFavorites && <h4 role="alert" className={styles.fav_error_message}>{errorMessageFavorites}</h4>}                             
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
                            <IoIosHeart color="#a01313" size={40}/> 
                        </button>
                        :
                        <button 
                            onClick={ () => addToFavorites(property.id)}
                            aria-label="add"
                            aria-describedby="add_fav_button"
                            className={styles.fav_button}
                        >
                            <IoIosHeartEmpty color="#f60101" size={40} /> 
                        </button>
                    }                                                              
                    <span id="remove_fav_button" className={styles.sr_content}>If aria-label shows 'remove', it means the property is currently in your favorite properties' list. Clicking the button will remove it from this list.</span>
                    <span id="add_fav_button" className={styles.sr_content}>If aria-label shows 'add', it means the property is not in your favorite properties' list. Clicking the button will add it to this list.</span> 
                </div>               
                <div className={styles.extra_photo_container}>
                    <button 
                        disabled= {galleryIndex === 0}
                        onClick= {() => previousPhotos()}
                        aria-describedby="extra_photo_go_up_button"
                        className={styles.up_arrow_button}
                    >
                        <IoMdArrowRoundUp className={styles.arrow_format} />
                    </button>
                    <span id="extra_photo_go_up_button" className={styles.sr_content}>Display previous 4 property photos. If these are the first 4 property photos, this button will be disabled. </span>                 
                    <ul className={styles.extra_photo_format}>
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
                                <div className={styles.no_extra_photo_div}></div>
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
                    <div className={styles.owner_and_ad_main_container}>
                        <div className={styles.owner_container}>
                            <h4 className={`${styles.h4_font} ${styles.owner_title}`}>Owner Details</h4>
                            <div className={styles.owner_subtitle_container}>
                                <div className={styles.information_container}>
                                    <h5 className={`${styles.owner_font} ${styles.owner_subtitle}`}>Name:</h5>
                                    <h5 
                                        aria-describedby="owner_name_hint"
                                        className={`${styles.owner_font} ${styles.owner_subtitle_info}`}
                                    >
                                        {owner!.name}
                                    </h5>
                                    <span id="owner_name_hint" className={styles.sr_content}>This could be an individual's name or a company's name, depending on who is letting the property.</span>                            
                                </div>
                                <div className={styles.information_container}>
                                    <h5 className={`${styles.owner_font} ${styles.owner_subtitle}`}>Address:</h5>
                                    <h5 
                                        aria-describedby="owner_address_hint"
                                        className={`${styles.owner_font} ${styles.owner_subtitle_info}`}
                                    >
                                        {owner!.address}
                                    </h5>
                                    <span id="owner_address_hint" className={styles.sr_content}>This could be an individual's address or a company's address, depending on who is letting the property.</span>
                                </div>
                                <div className={styles.information_container}>
                                    <h5 className={`${styles.owner_font} ${styles.owner_subtitle}`}>Number:</h5>
                                    <h5 
                                        aria-describedby="owner_phone_number_hint"
                                        className={`${styles.owner_font} ${styles.owner_subtitle_info}`}
                                    >
                                        {owner!.phone_number}
                                    </h5>
                                    <span id="owner_phone_number_hint" className={styles.sr_content}>This could be an individual's phone number or a company's phone number, depending on who is letting the property.</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.ad_container}>
                            <img src={adPhoto} className={styles.ad_photo}></img>
                        </div>                        
                    </div>
                )}
            </div>
            <div className={styles.third_row}>
                <div className={styles.property_summary_container}>
                    <div className={styles.property_summary_item_property_type}>
                        <span className={styles.sr_content}> Property type:</span>
                        <span> <BsHouse className={styles.react_icon} /> </span>
                        <h4 className={`${styles.h4_font} ${styles.property_summary_position}`}>{property.type}</h4>
                    </div>    
                    <div className={styles.property_summary_item_bedrooms_and_bathrooms}>            
                        <span className={styles.sr_content}> Number of bedrooms:</span>
                        <span> <IoBedSharp className={styles.react_icon} /> </span>
                        <h4 className={`${styles.h4_font} ${styles.property_summary_position}`}>{property.no_bedrooms} bedrooms</h4>
                    </div>
                    <div className={styles.property_summary_item_bedrooms_and_bathrooms}>
                        <span className={styles.sr_content}> Number of bathrooms:</span>
                        <span> <LuToilet className={styles.react_icon} /> </span>
                        <h4 className={`${styles.h4_font} ${styles.property_summary_position}`}>{property.no_bathrooms} bathrooms</h4>
                    </div>
                    <div className={styles.property_summary_item_furnishing}>
                        <span className={styles.sr_content}>Furnishing:</span>
                        <span> <BiCabinet className={styles.react_icon}/></span>
                        <h4 className={`${styles.h4_font} ${styles.property_summary_position}`}>{property.furniture}</h4>
                    </div>
                    <div className={styles.property_summary_item_property_size  }>
                        <span className={styles.sr_content}> Property size: </span>
                        <span> <IoMdResize className={styles.react_icon} /> </span>
                        <h4 className={`${styles.h4_font} ${styles.property_summary_position}`}>{property.size} m²</h4>
                    </div>
                </div>
                <div className={styles.property_description_container}>
                    <h4 className={`${styles.h4_font} ${styles.property_description_title_position}`}>Description</h4>
                    <h5 className={`${styles.h5_font} ${styles.property_description_content_position}`}>{property.detail}</h5> 
                    <br></br>         
                </div>    
                <br></br>
            </div>      
        </div>
    )
};

export default DetailedPropertyPage;