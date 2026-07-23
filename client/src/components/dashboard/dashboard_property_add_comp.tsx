import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import styles from "../dashboard/dashboard_property_add_comp.module.css";

type PropertyData = {
    type: string;
    city: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    size: number;
    furniture: string;
    summary: string;
    detail: string;
}

type PropertyPhotos = {
    url: string;
    file: File;
};

const propertyTypes = ["Apartment", "Terraced", "Semi-Detached", "Detached", "Bungalow"];
const furnitureTypes =["Furnished", "Semi-Furnished", "Unfurnished"]; 


function DashboardPropertyAdd () {
    const navigate = useNavigate();

    // Error Message → AC = Auto Complete 

    const [ autoCompleteQueries, setAutoCompleteQueries ] = useState<{city: string}[]>([]);
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(false); 
    const [ errorMessageAC, setErrorMessageAC ] = useState(""); 

    // States for property data and photos. 

    const [ propertyDetails, setPropertyDetails ] = useState<PropertyData>({type: "", city: "", price: 0, bedrooms: 0, bathrooms: 0, size: 0, furniture: "", summary: "", detail: ""});
    const [ tempURLs, setTempURLs ] = useState<PropertyPhotos[]>([]);
    const [ uploading, setUploading ] = useState(false);

    const [ propertyTypeDropdown, setPropertyTypeDropdown ] = useState<boolean>(false);
    const [ propertyTypeLabel, setPropertyTypeLabel ] = useState("Select");

    const [ furnitureDropdown, setFurnitureDropdown ] = useState<boolean>(false); 
    const [ furnitureLabel, setFurnitureLabel ] = useState("Select"); 

    // Error Message States

    const [ photoErrorMessage, setPhotoErrorMessage ] = useState("");
    const [ dataErrorMessage, setDataErrorMessage ] = useState("");
    const [ dataSuccessMessage, setDataSuccessMessage ] = useState("");
    const [ excessPhotosMessage, setExcessPhotosMessage ] = useState(""); 

    // WAI-ARIA states for missing fields, and live region updates on word count for summary and description fields.

    const [ missingField, setMissingField ] = useState("");

    const [ announceSummaryWordCount, setAnnounceSummaryWordCount ] = useState(0); 
    const summaryWordCount = propertyDetails?.summary ? propertyDetails.summary.split(/\s+/).filter(Boolean).length : 0;

    const [ announceDescriptionWordCount, setAnnounceDescriptionWordCount ] = useState(0); 
    const descriptionWordCount = propertyDetails?.detail ? propertyDetails.detail?.split(/\s+/).filter(Boolean).length : 0;
    
    
    useEffect(() => {
        const fetchAutoComplete = async () => {
            
            try {
                const res = await fetch(`/api/cities?city=${propertyDetails.city}`);
                const result = await res.json();
  
                if (!res.ok) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC(result.error); 
                }
  
                else if(propertyDetails.city.length === 0) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC("");
                }

                else if (autoCompleteQueries.some( query => query.city === propertyDetails.city)) {
                    setAutoCompleteQueries([]);
                }
                
                else {
                    setAutoCompleteQueries(result.cities);
                    setErrorMessageAC("");
                }
            }
  
            catch(error) {
                setErrorMessageAC("Autocomplete currently unavailable.")
                setTimeout(function(){
                    setErrorMessageAC("")} 
                    ,5000)
            }
        }
          
        if (autoCompleteQueryClicked) {
            return;
        }
  
        const timeout = setTimeout (() => {
            fetchAutoComplete();
        }, 100);

        return () => clearTimeout(timeout);
        
    }, [propertyDetails.city, autoCompleteQueryClicked]);

    async function addPropertyData (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setMissingField("");

        const propertyData = new FormData();
        
        for(const tempURL of tempURLs) {
        propertyData.append("photos", tempURL.file);
        };

        propertyData.append("type", propertyDetails.type);
        propertyData.append("city", propertyDetails.city);
        propertyData.append("price", propertyDetails.price.toString());
        propertyData.append("bedrooms", propertyDetails.bedrooms.toString());
        propertyData.append("bathrooms", propertyDetails.bathrooms.toString());
        propertyData.append("size", propertyDetails.size.toString());
        propertyData.append("furniture", propertyDetails.furniture);
        propertyData.append("summary", propertyDetails.summary);
        propertyData.append("detail", propertyDetails.detail);

        try {
            setUploading(true);

            const res = await fetch(`/api/dashboard/property/add`, {
            method: "POST",
            body: propertyData,
            });
            
            const result = await res.json();
            
            if (res.ok) {
                setDataSuccessMessage(result.message);
                setDataErrorMessage("");
                setPhotoErrorMessage("");
                setTimeout(function(){
                    navigate(`/dashboard`)},
                5000);
            }

            else if (result.photosError) {
                setDataErrorMessage("");
                setPhotoErrorMessage(result.photosError); 
                setDataSuccessMessage("");
            }

            else {
                setDataErrorMessage(result.error);
                setPhotoErrorMessage("");
                setMissingField(result.name);
                setDataSuccessMessage("");
            }
        }

        catch (error) {
            setDataErrorMessage("Failed to create new property. Please check your internet and try again."); 
        }

        finally {
            setUploading(false);
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

    function displayPhotos(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault(); 
        
        const files = e.target.files;
        if (!files) {
            return;
        }

        if (tempURLs.length + files.length >= 5) {
            setPhotoErrorMessage("");
        }

        for (const [ index, file ]  of Array.from(files).entries()) {
            const previewURL = URL.createObjectURL(file);

            if (tempURLs.length + index < 10) {
                setExcessPhotosMessage("");
                setPhotoErrorMessage("");
                setTempURLs(prev => [...prev, {url: previewURL, file: file}])
            }   
            
            else {
                setExcessPhotosMessage("Maximum of 10 photos reached. Some photos were not added.")
                return;
            }
        }
    }

    function deletePhotos(index: number) {
        setTempURLs(tempURLs.filter((_, i) => i !== index));    
            setExcessPhotosMessage("");
            setPhotoErrorMessage("");
    }

    function clearDataErrorMessage () {
        setDataErrorMessage("");
    }

    function clearPhotoErrorMessages () {
        setPhotoErrorMessage(""); 
    }

    function showDropdown (setDropdown: React.Dispatch<React.SetStateAction<boolean>>) {
        setDropdown(prev => !prev);
    }

   const setValue = (e: React.MouseEvent<HTMLLIElement>, property: keyof PropertyData, setLabel: (value:string) => void, defaultValue: string) => {
        setPropertyDetails({...propertyDetails, [property]: e.currentTarget.dataset.value!});
        setLabel(e.currentTarget.textContent || defaultValue)
    } 

    const remainingPropertyTypes = propertyTypes.filter(type => type !== propertyTypeLabel); 
    const remainingFurnitureTypes = furnitureTypes.filter(type => type !== furnitureLabel);
    
    return (
        <div>
            <div className={styles.title_container}>
                <h2 className={`${styles.title_format} ${styles.h2_font}`}>New Property</h2>
            </div>
            {errorMessageAC && 
                <h3 
                    role="alert" 
                    className={styles.autocomplete_error_message}
                >
                    {errorMessageAC}
                </h3>
            }
            <div className={styles.main_container}>
                <div className={styles.data_fields_container}>
                    {dataErrorMessage ?
                        <h3 role="alert" className={styles.data_error_message}>{dataErrorMessage}</h3>
                    :
                        <h3 className={`${styles.h3_font} ${styles.step1_format}`}>Step 1: Complete the fields below.</h3>
                    }
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
                                    setAutoCompleteQueryClicked(false);
                                    clearDataErrorMessage(); 
                                }}
                                required
                                aria-invalid={missingField === "city"}
                                aria-describedby="location_hint"
                                className={styles.city_input}
                            />
                        <span id="location_hint" className={styles.sr_content}>State in what city your property is located.</span>
                        <ul 
                            aria-live="polite" 
                            aria-label="City autocomplete suggestions"
                            className={styles.autocomplete_container}
                        > 
                            {autoCompleteQueries.map((query, index) => (
                                <li 
                                    key={index}
                                    onClick = {() => {
                                        setPropertyDetails({...propertyDetails, city: query.city});
                                        setAutoCompleteQueries([]);
                                        setAutoCompleteQueryClicked(true);
                                        }}
                                    tabIndex={0} 
                                    onKeyDown= { (e) => { if (e.key === "Enter") {
                                        setPropertyDetails({...propertyDetails, city: query.city});
                                        setAutoCompleteQueries([]);
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
                    </div>
                    <label 
                        htmlFor="property_type"
                        className={styles.h4_font}
                    > 
                        Property Type: 
                    </label>
                    {propertyTypeDropdown ?
                        <ul  
                            id="property_type"
                            onClick={() => {showDropdown(setPropertyTypeDropdown)}}    
                            aria-invalid={missingField === "type"}
                            className={styles.ul_container_open}
                        >
                            <li 
                                data-value={propertyDetails.type}
                                className={styles.list_item} 
                            >
                                {propertyTypeLabel}
                            </li>
                            {propertyTypeLabel === "" &&  
                                <li 
                                    data-value="Select" 
                                    onClick={(e) => {setValue(e, "type", setPropertyTypeLabel, "" )}} 
                                    className={styles.list_item}
                                >
                                    Select 
                                </li>
                            }
                            {remainingPropertyTypes.map(type => (
                                <li 
                                    key={type} 
                                    data-value={type} 
                                    onClick={(e) => {
                                        setValue(e, "type", setPropertyTypeLabel, "" );
                                        clearDataErrorMessage();
                                    }} 
                                    className={styles.list_item}
                                >
                                    {type}
                                </li>
                            ))}
                        </ul>    
                    :    
                        <ul
                            id="property_type"
                            onClick ={() => showDropdown(setPropertyTypeDropdown)}
                            className={styles.ul_container_closed}
                        >
                            <li 
                                data-value={propertyTypeLabel} 
                                className={styles.list_item_closed}
                            >
                                {propertyTypeLabel}
                            </li>
                        </ul>
                    }
                    <label 
                        htmlFor="rental_rate"
                        className={styles.h4_font}
                    > 
                        Monthly Rate: 
                    </label>
                        <input 
                            id="rental_rate"
                            type="number" 
                            value={propertyDetails.price || ""}
                            onChange={(e) => { 
                                setPropertyDetails({...propertyDetails, price: (Number(e.target.value))})
                                clearDataErrorMessage(); 
                            }} 
                            required 
                            aria-invalid={missingField === "price"}
                            className={styles.standard_input_format}
                        />
                    <label 
                        htmlFor="bedrooms"
                        className={styles.h4_font}
                    > 
                        Bedrooms: 
                    </label>
                        <input 
                            id="bedrooms"
                            type= "number" 
                            value={propertyDetails.bedrooms || ""}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, bedrooms: (Number(e.target.value))})
                                clearDataErrorMessage(); 
                            }} 
                            required
                            aria-invalid={missingField === "bedrooms"}
                            className={styles.standard_input_format}
                        />
                    <label 
                        htmlFor="bathrooms"
                        className={styles.h4_font}
                    > 
                        Bathrooms: 
                    </label>
                        <input 
                            id="bathrooms"
                            type= "number" 
                            value={propertyDetails.bathrooms || ""}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, bathrooms: (Number(e.target.value))})
                                clearDataErrorMessage();
                            }} 
                            required
                            aria-invalid={missingField === "bathrooms"}
                            className={styles.standard_input_format}
                        />
                    <label 
                        htmlFor="property_size"
                        className={styles.h4_font}
                    > 
                        Size (m²): 
                    </label> 
                        <input 
                            id="property_size"
                            type= "number" 
                            value={propertyDetails.size || ""}
                            onChange={(e) => {
                                setPropertyDetails({...propertyDetails, size: (Number(e.target.value))})
                                clearDataErrorMessage(); 
                            }} 
                            required 
                            aria-invalid={missingField === "size"}
                            aria-describedby="size_hint"
                            className={styles.standard_input_format}
                        />
                    <span id="size_hint" className={styles.sr_content}>State the overall size of your property in m².</span>
                    <label 
                        htmlFor="furniture"
                        className={styles.h4_font}
                    > 
                        Furniture: 
                    </label> 
                    {furnitureDropdown ?
                        <ul 
                            id="furniture"
                            onClick={() => {showDropdown(setFurnitureDropdown)}}
                            aria-invalid={missingField === "furniture"}
                            className={styles.ul_container_open} 
                        >
                            <li
                                data-value={propertyDetails.furniture}
                                className={styles.list_item}
                            >
                                {furnitureLabel}
                            </li>
                            {furnitureLabel === "" &&
                                <li
                                    data-value=""
                                    onClick={(e) => setValue(e, "furniture", setFurnitureLabel, "")}
                                    className={styles.list_item}
                                >
                                    Select
                                </li>
                            }
                            {remainingFurnitureTypes.map(type => (
                                <li 
                                    key={type}
                                    data-value={type}
                                    onClick={ (e) =>{
                                        setValue(e,"furniture", setFurnitureLabel, "");
                                        clearDataErrorMessage();
                                    }}
                                    className={styles.list_item}
                                >
                                    {type}
                                </li>
                            ))}
                        </ul>
                    :           
                        <ul
                            id="furniture"
                            onClick={() => showDropdown(setFurnitureDropdown)}
                            aria-invalid={missingField === "furniture"}
                            className={styles.ul_container_closed}
                        >
                            <li
                                data-value={furnitureLabel}
                                className={styles.list_item_closed}
                            >
                                {furnitureLabel}
                            </li>
                        </ul>
                    }                                
                    <div className={styles.summary_container}>
                        <label 
                            htmlFor="property_summary"
                            className={styles.h4_font}
                        > 
                            Summary: 
                        </label>
                            <input 
                                id="property_summary"
                                value={propertyDetails.summary} 
                                onChange={(e) => {
                                    const summaryWords = e.target.value.split(/\s+/).filter(Boolean);
                                    if (summaryWords.length <= 50) {
                                        setPropertyDetails({...propertyDetails, summary: e.target.value})
                                    }
                                    clearDataErrorMessage(); 
                                }}
                                placeholder="Add a short summary about your property."
                                required
                                aria-invalid={missingField === "summary"}
                                className={styles.textarea_format}
                            />
                        <div className={styles.summary_word_count_container}>
                            <span className={styles.summary_word_count}>{summaryWordCount} / 50 </span>
                        </div>
                        <span
                            aria-live="polite"
                            className={styles.sr_content}
                        >
                            {announceSummaryWordCount > 0 && `${announceSummaryWordCount} out of 50 words used.`}
                        </span>
                    </div>
                    <div className={styles.description_container}>
                        <label 
                            htmlFor="property_description"
                            className={`${styles.h4_font} ${styles.description_label}`}
                        > 
                            Description: 
                        </label>
                            <textarea 
                                id="property_description"
                                value={propertyDetails.detail}
                                onChange= {(e) => {
                                    const detailwords = e.target.value.split(/\s+/).filter(Boolean); 
                                        if (detailwords.length <= 250) {
                                        setPropertyDetails({...propertyDetails, detail: e.target.value})
                                    }
                                    clearDataErrorMessage(); 
                                }}
                                placeholder="Add a description of your property."
                                required
                                aria-invalid={missingField === "detail"}
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
                </div>
                <div className={styles.photo_main_container}>
                    {photoErrorMessage ?
                        <h3 role="alert" className={styles.photo_error_message}>{photoErrorMessage}</h3>
                    :
                        <h3 className={`${styles.h3_font} ${styles.step2_format}`}>Step 2: Upload between 5 to 10 photos.</h3>
                    }
                    <div className={styles.photo_upload_container}>
                        {tempURLs.length < 10 ? (
                            <div className={styles.upload_button_container}>
                                <input 
                                    id="photo_upload"
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={ (e) => {displayPhotos(e); clearPhotoErrorMessages()}}
                                    className={styles.upload_button}
                                />
                                <h4 role="status" className={`${styles.remmaining_photos_number_message} ${styles.h4_font}`}>You can upload {10 - tempURLs.length} more photos.</h4>
                            </div>
                        ) : (
                            null
                        )}                
                        <ul>
                            {tempURLs.map((tempURL, index) => (
                                <li 
                                    key={tempURL.url}
                                    className={styles.uploaded_photos_contaienr}
                                >
                                    <img 
                                        src={tempURL.url} 
                                        alt={`Photo preview of photo number ${index}`} 
                                        className={styles.uploaded_photos}/>
                                    <button 
                                        onClick={() => deletePhotos(index)}
                                        aria-label="Remove photo"
                                        className={styles.photo_removal_button}
                                    >
                                        x
                                    </button>                       
                                </li>
                            ))}            
                        </ul>
                    </div>
                </div> 
                <div className={styles.feedback_messages_container}>      
                    {excessPhotosMessage && 
                        <h3 
                            role="alert"
                            className={styles.excess_photos_message}
                        >
                            {excessPhotosMessage}
                        </h3>
                    }
                    {!uploading && !dataSuccessMessage && !photoErrorMessage && 
                        <button 
                            onClick={addPropertyData}
                            className={styles.create_listing_button}
                        >
                            Create Listing
                        </button>
                    }
                    {uploading && 
                        <h3
                            role="alert"
                            className={styles.uploading_message}
                        >
                            Please wait while we add your property!
                        </h3>
                    }
                    {dataSuccessMessage && (
                        <div role="alert" className={styles.success_message_container}>
                            <h3 className={styles.success_message_1}>{dataSuccessMessage}</h3>
                            <h3 className={styles.success_message_2}> You will now be redirected to your properties.</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardPropertyAdd; 