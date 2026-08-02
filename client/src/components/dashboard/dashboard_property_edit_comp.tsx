import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import styles from "../dashboard/dashboard_property_edit_comp.module.css";

type PropertyDetails = {
    type?: string;
    city?: string;
    price?: number;
    no_bedrooms?: number;
    no_bathrooms?: number;
    size?: number;
    furniture?: string;
    summary?: string;
    detail?: string
};

type PropertyPhotos = {
    id: number;
    photo_path: string;
}

function DashboardPropertyEdit() {
    const navigate = useNavigate();  
    const { propID } = useParams();
 
// Original Property Details vs Property Details prevents unneccessary API calls when fields have not been updated. 

    const [ originalPropertyDetails, setOriginalPropertyDetails ] = useState<PropertyDetails | null>(null); 
    const [ propertyDetails, setPropertyDetails ] = useState<PropertyDetails | null>(null);

    const [ propertyPhotos, setPropertyPhotos ] = useState<PropertyPhotos[]>([]);

//  Auto comnplete function states for city input. 

    const [ cities, setCities ] = useState<{city: string}[]>([]);
    const [ errorMessageAC , setErrorMessageAC ] = useState(""); 
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(false); 

// Error Messages → PD = Photo Display, PE = Property Edit, PF = Photo Fetch, PU = Photo Upload

    const [ errorMessagePD, setErrorMessagePD ] = useState("");
    const [ errorMessagePF, setErrorMessagePF ] = useState("");

//  Error / Success message states required for styling purposes.

    const [ errorMessagePE, setErrorMessagePE ] = useState("");
    const [ successMessagePE, setSuccessMessagePE ] = useState("");
    const [ propertyMissingField, setPropertyMissingField ] = useState("");
    const [ propertyUpdated, setPropertyUpdated ] = useState(false);

    const [ errorMessagePU, setErrorMessagePU ] = useState(""); 
    const [ successMessagePU, setSuccessMessagePU ] = useState("");
    const [ photoUploading, setPhotoUploading ] = useState(false); 
    const [ uploadMessage, setUploadMessage ] = useState("");

// WAI-ARIA states for live region updates on word count for summary and description fields.

    const [ announceSummaryWordCount, setAnnounceSummaryWordCount ] = useState(0); 
    const summaryWordCount = propertyDetails?.summary ? propertyDetails.summary.split(/\s+/).filter(Boolean).length : 0;

    const [ announceDescriptionWordCount, setAnnounceDescriptionWordCount ] = useState(0); 
    const descriptionWordCount = propertyDetails?.detail ? propertyDetails.detail?.split(/\s+/).filter(Boolean).length : 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/dashboard/property/edit/${propID}`);
                const result = await res.json();

                if (!res.ok) {
                    setErrorMessagePF(result.errorProperty);
                }

                else if (result.errorPhotos) {
                    setErrorMessagePD(result.errorPhotos);
                    setOriginalPropertyDetails(result.property);
                    setPropertyDetails(result.property); 
                }

                else {
                    setOriginalPropertyDetails(result.property);
                    setPropertyDetails(result.property);
                    setPropertyPhotos(result.photos);           
                    setErrorMessagePF("");
                    setErrorMessagePD("");
                }
            }
            
            catch (error) {
                setErrorMessagePF("Something went wrong while fetching your property. Please check your internet and refresh the page."); 
            }
        }   
        fetchData();
    }, []);

    useEffect (() => {
        const fetchAutoComplete = async () => {
            try {
                const res = await fetch(`/api/cities?city=${propertyDetails!.city}`)
                const result = await  res.json(); 

                if (!res.ok) {
                    setCities([]);
                    setErrorMessageAC(result.error) 
                }

                else if(propertyDetails?.city?.length === 0) {
                    setCities([]);
                    setErrorMessageAC("");
                } 

                else if (result.cities.some( (query : {city: string}) => query.city === propertyDetails?.city)) {
                    setCities([]);
                    setErrorMessageAC("");
                }
                    
                else {
                    setCities(result.cities);
                    setErrorMessageAC("");
                }
            }
  
            catch(error) {
                setErrorMessageAC("AutoComplete feature currently unavailable.")
            }
        }
          
        if (autoCompleteQueryClicked) {
            return;
        }
  
        const timeout = setTimeout (() => {
            fetchAutoComplete();
        }, 100);

        return () => clearTimeout(timeout);
        
    }, [propertyDetails?.city, autoCompleteQueryClicked]);

    async function propertyDetailsUpdate(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        setPropertyUpdated(false);
        setPropertyMissingField("");

        if (JSON.stringify(propertyDetails) === JSON.stringify(originalPropertyDetails)) {
            setErrorMessagePE("Please update at least one field.");
            return;
        } 

        try {
            const res = await fetch(`/api/dashboard/property/edit/${propID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(propertyDetails)
            });

            const result = await res.json();

            if (res.ok) {
                setPropertyUpdated(true);
                setOriginalPropertyDetails(propertyDetails); 
                setSuccessMessagePE(result.message);
                setErrorMessagePE("");
            } 
            
            else {
                setErrorMessagePE(result.error);
                setPropertyMissingField(result.name);
                setSuccessMessagePE("");
            }
        } 
            
        catch (error) {
            setErrorMessagePE("Failed to update property. Please check your internet and try again.");
        }
    }

// Word count useEffects for property summary and property description with 1.5 second debounce. 

    useEffect(() => {
        const summaryWordCountTimeout = setTimeout(() => {
            setAnnounceSummaryWordCount(summaryWordCount); 
        }, 1500);

        return () => clearTimeout(summaryWordCountTimeout);
    
    }, [summaryWordCount]); 

    useEffect(() => {
        const descriptionWordCountTimeout = setTimeout(() => {
            setAnnounceDescriptionWordCount(descriptionWordCount); 
        }, 1500);

        return () => clearTimeout(descriptionWordCountTimeout);
    
    }, [descriptionWordCount]);


    async function photoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        
        const files = e.target.files;
        const formData = new FormData();
        
        if (!files) {
            return; 
        }

        else if (files.length === 1) {
            setUploadMessage("Please wait while we upload your photo.");
        }

        else if (files.length > 1 && files.length < 10) {
            setUploadMessage("Please wait while we upload your photos.");
        }


        for (const [index,  file] of Array.from(files).entries()) {
            if (propertyPhotos.length + index < 10 ) {
                formData.append("photos", file);
                setErrorMessagePU("");
            }
            
            else {
                setErrorMessagePU("You may only upload 10 photos.");
                setSuccessMessagePU("");
                return;
            }
        }


        
        try {
            setPhotoUploading(true);
            setSuccessMessagePU("");
            setErrorMessagePU("");
            setErrorMessagePE("");
            setSuccessMessagePE("");

            const res = await fetch(`/api/dashboard/property/edit/${propID}`, {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            
            if (res.ok) {
                setPropertyPhotos(result.newPhotos);
                setSuccessMessagePU(result.message);  
                setErrorMessagePU("");          
            }

            else {
                setErrorMessagePU(result.error);
                setSuccessMessagePU("");
            }
        }

        catch (error) {
            setErrorMessagePU("Failed to upload new photos. Please check your internet and try again.");
        }

        finally {
            setPhotoUploading(false);
            setUploadMessage("");
        }
    }

    async function photoDelete(photoID: number, photo_path: string, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        
        try {
            const res = await fetch(`/api/dashboard/property/edit/${propID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ photoID, photo_path })
            });
            

            if (!res.ok) {
                const result = await res.json();
                setErrorMessagePU(result.error);
            }

            else {
                setPropertyPhotos(propertyPhotos.filter(photo => photo.id !== photoID));
                setSuccessMessagePU(""); 
                setErrorMessagePU("");
            }
        }
        
        catch (error) { 
            setErrorMessagePU("Failed to delete photo. Please check your internet and try again.")
        }
    }

    if (!propertyDetails) {
        return (
            <div className={styles.no_property_error_container}>
                {errorMessagePF ? 
                    <h2 
                        role="alert"
                        className={styles.PF_error_message}
                    > 
                        {errorMessagePF} 
                    </h2>
                :
                    <h2
                        role="status"
                        className={styles.loading_message}
                    >
                        Loading...
                    </h2>
                }
            </div>
        );
    }   

    return (
        <div>
            <div className={styles.main_title_container}>
                <h2 className={`${styles.main_title} ${styles.h2_font}`}> Edit Property </h2>
            </div>
            <div className={styles.property_edit_container}>
                <div className={styles.property_data_container}>
                    <div className={styles.subtitle_container}>
                        {errorMessagePE ?
                            <h3 
                                role="alert"
                                className={styles.PE_error_message}
                            >
                                {errorMessagePE}
                            </h3>
                            :
                            <h3 className={styles.h3_font}> Update your property details:</h3>
                        }
                    </div>                    
                    <div className={styles.city_container}>
                        <label 
                            htmlFor="location"
                            className={styles.h4_font}
                        > 
                            City: 
                        </label>
                        <input 
                            id="location"
                            type="text" 
                            value={propertyDetails.city}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, city: e.target.value});
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                                setAutoCompleteQueryClicked(false);
                            }}
                            required
                            aria-invalid={propertyMissingField === "city"}
                            className={styles.city_input}
                        />                    
                        <ul 
                            aria-live="polite" 
                            aria-label="City autocomplete suggestions"
                            className={styles.autocomplete_container}> 
                            {cities.map((query, index) => (
                                <li 
                                    key={index}
                                    onClick = {() => {
                                        setPropertyDetails({...propertyDetails, city: query.city});
                                        setCities([]);
                                        setAutoCompleteQueryClicked(true);
                                        }}
                                    tabIndex={0} 
                                    onKeyDown= { (e) => { if (e.key === "Enter") {
                                        setPropertyDetails({...propertyDetails, city: query.city});
                                        setCities([]);
                                        setAutoCompleteQueryClicked(true);
                                    }}}
                                    style = {{ cursor: "pointer"}}
                                    aria-label={`Select ${query.city}`}
                                    className={styles.autocomplete_item}
                                >
                                    {query.city}
                                </li>
                            ))}
                        </ul>
                        {errorMessageAC && 
                                <h3 role="alert" className={styles.AC_error}>{errorMessageAC}</h3>                                
                        }
                    </div>
                    <label 
                        htmlFor="property_type"
                        className={styles.h4_font}
                    >
                        Property Type: 
                    </label>
                        <select 
                            id="property_type"
                            value={propertyDetails.type}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, type: e.target.value});
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                            }}
                            required
                            aria-invalid={propertyMissingField === "type"}
                        >
                            <option value={propertyDetails.type}>{propertyDetails.type}</option>
                            {propertyDetails.type !== "Apartment" && <option value="Apartment">Apartment</option>}
                            {propertyDetails.type !== "Terraced" && <option value="Terraced" >Terraced</option>}
                            {propertyDetails.type !== "Semi-Detached" && <option value="Semi-Detached" >Semi-Detached</option>}
                            {propertyDetails.type !== "Detached" && <option value="Detached" >Detached</option>}
                            {propertyDetails.type !== "Bungalow" && <option value="Bungalow" >Bungalow</option>}
                        </select>  
                    
                    <label 
                        htmlFor="rental_rate"
                        className={styles.h4_font}
                    > 
                        Monthly Rate: 
                    </label>
                        <input 
                            id="rental_rate"
                            type="number" 
                            value={propertyDetails.price ?? ""}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, price: e.target.value === "" ? undefined : parseFloat(e.target.value)});
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                            }}
                            required
                            aria-invalid={propertyMissingField === "price"} 
                            className={styles.rental_rate_input}
                        />
                    <label 
                        htmlFor="bedrooms"
                        className={styles.h4_font}
                    > 
                        Bedrooms: 
                    </label>
                        <input 
                            id="bedrooms"
                            type="number" 
                            value={propertyDetails.no_bedrooms ?? ""}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, no_bedrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                            }} 
                            required
                            aria-invalid={propertyMissingField === "bedrooms"}
                            className={styles.bedrooms_input}
                        />
                    <label 
                        htmlFor="bathrooms"
                        className={styles.h4_font}
                    > 
                        Bathrooms: 
                    </label>
                        <input 
                            id="bathrooms"
                            type="number" 
                            value={propertyDetails.no_bathrooms ?? ""}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, no_bathrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                            }}
                            required
                            aria-invalid={propertyMissingField === "bathrooms"}
                            className={styles.bathrooms_input}
                        />
                    <label 
                        htmlFor="property_size"
                        className={styles.h4_font}
                    > 
                        Size (m²): 
                    </label>
                        <input 
                            id="property_size"
                            type="number" 
                            value={propertyDetails.size ?? ""}    
                            onChange={(e) => { 
                                setPropertyDetails({...propertyDetails, size: e.target.value === "" ? undefined : parseInt(e.target.value)});
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                            }} 
                            required
                            aria-invalid={propertyMissingField === "size"}
                            className={styles.property_size_input}
                        />
                    <label 
                        htmlFor="furniture"
                        className={styles.h4_font}
                    > 
                        Furniture: 
                    </label>
                        <select 
                            id="furniture"
                            value={propertyDetails.furniture}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, furniture: e.target.value});
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                            }}
                            required
                            aria-invalid={propertyMissingField === "furniture"}
                        >
                            <option value={propertyDetails.furniture}>{propertyDetails.furniture}</option>
                            {propertyDetails.furniture !== "Furnished" && <option value = "Furnished"> Furnished</option>}
                            {propertyDetails.furniture !== "Semi-furnished" && <option value = "Semi-furnished"> Semi-Furnished</option>}
                            {propertyDetails.furniture !== "Unfurnished" && <option value = "Unfurnished"> Unfurnished</option>}        
                        </select>
                    <label 
                        htmlFor="summary"
                        className={styles.h4_font}
                    > 
                        Summary: 
                    </label>
                        <textarea
                            id="summary"
                            value={propertyDetails.summary}
                            onChange={(e) => {
                                const words = e.target.value.split(/\s+/).filter(Boolean);
                                if (words.length <= 50) {
                                    setErrorMessagePE("");
                                    setSuccessMessagePE("");
                                    setPropertyDetails({ ...propertyDetails, summary: e.target.value });
                                }
                            }}
                            required
                            aria-invalid={propertyMissingField === "summary"}
                            className={styles.summary_textarea}
                        />
                    <span className={styles.word_count_container}>{summaryWordCount} / 50 words</span>
                    <span
                        aria-live="polite" 
                        className={styles.sr_content}
                    >
                        {announceSummaryWordCount > 0 && `${announceSummaryWordCount} out of 50 words used.`}
                    </span>
                    <label 
                        htmlFor="description"
                        className={styles.h4_font}
                    > 
                        Property Description: 
                    </label>
                        <textarea
                            id="description"
                            value={propertyDetails.detail}
                            onChange={(e) => {
                                const words = e.target.value.split(/\s+/).filter(Boolean);
                                if (words.length <= 250) {
                                    setErrorMessagePE("");
                                    setSuccessMessagePE("");
                                    setPropertyDetails({ ...propertyDetails, detail: e.target.value });
                                }
                            }}
                            required
                            aria-invalid={propertyMissingField === "description"}
                            className={styles.description_textarea}
                        />
                    <span>{descriptionWordCount} / 250 words</span>
                    <span 
                        aria-live="polite" 
                        className={styles.sr_content}
                    >
                        {announceDescriptionWordCount > 0 && `${announceDescriptionWordCount} out of 250 words used.`}
                    </span>
                </div>
                <div className={styles.property_photos_container}>
                    <div className={styles.property_photos_title_container}>
                        {errorMessagePD ? 
                            <h3 
                                role="alert" 
                                className={styles.PD_error_message}
                            >
                                {errorMessagePD}
                            </h3>
                        :
                        <h3 className={styles.h3_font}> Update your property photos: </h3>
                        }
                    </div>
                    {propertyPhotos.length > 0 && (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {propertyPhotos.map((photo, index) => (
                                <li key={photo.id}>
                                    <img src={photo.photo_path} 
                                        alt={`Photo number ${index+1} of property number ${propID}`} 
                                        style={{ width: "200px", height: "150px" }} 
                                    />
                                    <button 
                                        aria-label={`Delete photo number ${index+1}`}
                                        onClick={(e) => photoDelete(photo.id, photo.photo_path, e)}> 
                                        x 
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {propertyPhotos.length < 10 ?  
                        <div>
                            <input 
                                id="photo_upload"
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={photoUpload} 
                            />
                            <h3 className={styles.h3_font}>
                                Upload up to {10 - propertyPhotos.length} more {propertyPhotos.length === 9 ? "photo" : "photos"}.
                            </h3>
                        </div>
                    : 
                        <h3 className={styles.excess_photos_message}>
                            You have reached the maximum number of photos.
                        </h3>
                    }
                    {uploadMessage && photoUploading && 
                        <h3 
                            role="status"
                            className={styles.photo_uploading_message}
                        >
                            {uploadMessage}
                        </h3>
                    }
                    {successMessagePU && 
                        <h3
                            role="status"
                            className={styles.photo_upload_success_message}
                        >
                            {successMessagePU}
                        </h3>
                    }
                    {errorMessagePU && 
                        <h3 
                            role="alert"
                            className={styles.photo_upload_error_message}
                        >
                            {errorMessagePU}
                        </h3>
                    }
                    <div className={styles.property_update_final_container}>
                        <button onClick={propertyDetailsUpdate}> Update Property </button>
                        {propertyUpdated && successMessagePE &&
                            <div className={styles.property_update_success_container}>
                                <h3
                                    role="status"
                                    className={styles.PE_success_message}
                                >
                                    {successMessagePE}
                                </h3>
                                <button 
                                    onClick={() => {navigate(`/property/${propID}`)}}
                                    aria-describedby="navigation_hint_2"
                                    className={styles.navigation_button}
                                >Check your property out!
                                </button>
                                <span id="navigation_hint_2" className={styles.sr_content}>Clicking this button will navigate you to the detailed property page.</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPropertyEdit;