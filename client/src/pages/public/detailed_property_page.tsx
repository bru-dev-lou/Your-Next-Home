import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "../public/detailed_property_page.module.css";
import adPhoto from "../../assets/detailed_page_ad_photo.jpg";

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
    photos: [{photo_path: string, is_main: boolean}]; 
};

type OwnerDetails = {
    name: string; 
    address: string;
    phone_number: number;
}

function DetailedPropertyPage () {
    const {propID} = useParams();

    const [ property, setProperty ] = useState<PropertyDetails | null>(null);
    const [ owner, setOwner ] = useState<OwnerDetails | null>(null);

    const [ propFavorite, setPropFavorite ] = useState<Set<number>>(new Set());

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

    if (errorMessageFP) {
        return (
            <div>
                <h3 role="alert">{errorMessageFP}</h3>
            </div>
        )
    }

    if (!property) {
        return null 
    }
    
    const mainPhoto = property.photos.filter(photo => photo.is_main);
    const extraPhotos = property.photos.filter(photo => !photo.is_main);

    return (
        <div key ={property.id} className={styles.main_container}>
            <div className={styles.first_row}>
                <span className={styles.sr_content}>Address</span>
                <h3 
                    className={`${styles.h3_font} ${styles.address_position}`}
                >
                    {property.city}
                </h3>
                <span className={styles.sr_content}>Monthly rental rate</span>
                <h3 
                    className={`${styles.h3_font} ${styles.price_position}`}
                >
                    £{property.price.toLocaleString()} pcm
                </h3>
                <h3 
                    className={`${styles.h3_font} ${styles.date_position}`}
                >
                    {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")}
                </h3>
            </div>
            <div role="group" aria-label="Property photos" className={styles.second_row}>
                <div className={styles.photo_container}>
                    <div className={styles.main_photo_container}>
                        <img 
                            src={mainPhoto[0].photo_path}
                            className={styles.main_photo}
                        />                                    
                    </div>
                    <div className={styles.extra_photo_container}>
                    {extraPhotos.map((photo, index) => (
                        <img 
                            key={index} 
                            src={photo.photo_path}
                            alt={`Photos number ${index + 1} of property number ${property.id}`}
                            className={styles.extra_photo} 
                        />
                    ))}
                    </div>
                    {propFavorite.has(property.id) ?
                        <button 
                            onClick={ () => removeFromFavorites(property.id)}
                            aria-describedby="button_hint"
                            className={styles.fav_button}
                        > 
                            Remove from favorites 
                        </button>
                        :
                        <button 
                            onClick={ () => addToFavorites(property.id)}
                            aria-describedby="button_hint"
                            className={styles.fav_button}
                        >
                            Add to favorites 
                        </button>
                    }                     
                    <span id="button_hint" className={styles.sr_content}>If button shows 'remove', it means the property is currently in your favorite properties' list. Clicking the button will remove it from this list.</span> 
                    {errorMessageFavorites && <h4 role="alert" className={styles.fav_error_message}>{errorMessageFavorites}</h4>}
                </div>
                {owner && (
                    <div className={styles.owner_and_ad_container}>
                        <span className={styles.sr_content}>Property owner's name.</span>
                        <h4 
                            aria-describedby="owner_name_hint"
                            className={`${styles.h4_font} ${styles.owner_name_position}`}
                        >
                            {owner!.name}
                        </h4>
                        <span id="owner_name_hint" className={styles.sr_content}>This could be an individual's name or a company's name, depending on who is letting the property.</span>
                        <span className={styles.sr_content}>Address where the owner of the property is located</span>
                        <h4 
                            aria-describedby="owner_address_hint"
                            className={`${styles.h4_font} ${styles.owner_address_position}`}
                        >
                            {owner!.address}
                        </h4>
                        <span id="owner_address_hint" className={styles.sr_content}>This could be an individual's address or a company's address, depending on who is letting the property.</span>
                        <span className={styles.sr_content}>Property owner's phone number</span>
                        <h4 
                            aria-describedby="owner_phone_number_hint"
                            className={`${styles.h4_font} ${styles.owner_number_position}`}
                        >
                            {owner!.phone_number}
                        </h4>
                        <span id="owner_phone_number_hint" className={styles.sr_content}>This could be an individual's phone number or a company's phone number, depending on who is letting the property.</span>
                        <img src={adPhoto} className={styles.ad_photo}></img>
                    </div>
                )}
            </div>
            <div className={styles.third_row}>
                <div className={styles.property_details_contaienr}>
                    <span className={styles.sr_content}> Property type:</span>
                    <h4 className={`${styles.h4_font} ${styles.property_type_position}`}>{property.type}</h4>
                    <span className={styles.sr_content}> Number of bedrooms:</span>
                    <h4 className={`${styles.h4_font} ${styles.property_bedrooms_position}`}>{property.no_bedrooms}</h4>
                    <span className={styles.sr_content}> Number of bathrooms:</span>
                    <h4 className={`${styles.h4_font} ${styles.property_bathrooms_position}`}>{property.no_bathrooms}</h4>
                    <span className={styles.sr_content}> Property size: </span>
                    <h4 className={`${styles.h4_font} ${styles.property_size_position}`}>{property.size} m²</h4>
                </div>
                <div className={styles.property_description_container}>
                    <h4 className={`${styles.h4_font} ${styles.property_description_title_position}`}>Description</h4>
                    <h4 className={`${styles.h4_font} ${styles.property_description_content_position}`}>{property.detail}</h4>          
                </div>    
            </div>      
        </div>
    )
};

export default DetailedPropertyPage;