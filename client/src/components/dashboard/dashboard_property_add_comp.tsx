import {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";

import styles from "../dashboard/dashboard_property_add_comp.module.css";
import { LuPlus } from "react-icons/lu";
import { TiDelete } from "react-icons/ti";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdArrowRoundForward } from "react-icons/io";


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
    const [ mainPhotoIndex, setMainPhotoIndex ] = useState<number>(0); 
    const [ galleryIndex, setGalleryIndex ] = useState<number>(0); 
    
    const [ uploading, setUploading ] = useState(false);

    const [ propertyTypeDropdown, setPropertyTypeDropdown ] = useState<boolean>(false);
    const [ propertyTypeLabel, setPropertyTypeLabel ] = useState("Select");

    const [ furnitureDropdown, setFurnitureDropdown ] = useState<boolean>(false); 
    const [ furnitureLabel, setFurnitureLabel ] = useState("Select"); 

    // React hooks for hiding file upload element

    const photoUpload = useRef<HTMLInputElement>(null);

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
                    setTimeout(() => {
                        setErrorMessageAC("");
                    },2000);
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
                setErrorMessageAC("Please check your internet!");
                setTimeout(() => {
                    setErrorMessageAC("");
                }, 2000);
            }
        }
          
        if (autoCompleteQueryClicked) {
            return;
        }
  
        const timeout = setTimeout (() => {
            fetchAutoComplete();
        }, 300);

        return () => clearTimeout(timeout);
        
    }, [propertyDetails.city, autoCompleteQueryClicked]);

    async function addPropertyData (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setMissingField("");

        // Empty field checks

        const fieldCheck = [
            { field: propertyDetails.city, error: "Please state where your property is located." },
            { field: propertyDetails.type, error: "Please choose a property type." },
            { field: propertyDetails.price, error: "Please state the property's monthly rental rate." },
            { field: propertyDetails.bedrooms, error: "Please state how many bedrooms your property has." },
            { field: propertyDetails.bathrooms, error: "Please state how many bathrooms your property has." },
            { field: propertyDetails.size, error: "Please state the size of your property in m²." },
            { field: propertyDetails.furniture, error: "Please choose your property's type of furnishing." },
            { field: propertyDetails.summary, error: "Please provide a summary of your property." },
            { field: propertyDetails.detail, error: "Please provide a detailed description of your property." } 
        ];

        for (const {field, error} of fieldCheck) {
            if (!field || field === "0" ) {
                setDataErrorMessage(error); 
                return;
            }
        }

        //  City validation

        const validCity = /^[a-zA-Z\- ]+$/.test(propertyDetails?.city); 

        if (!validCity) {
            setDataErrorMessage("City must only include letters and hyphens.");
            return; 
        }

        if ((propertyDetails?.city?.length ?? 0) > 50) {
            setDataErrorMessage("City name must not exceed 50 characters.");
            return;
        }

        //  Price validation 

        if ((propertyDetails?.price ?? 0) > 99999) {
            setDataErrorMessage("Listing's monthly rate must be less than £100,000.");
            return;
        } 

        //  Bedrooms validation 

        if ((propertyDetails?.bedrooms ?? 0) > 99) {
            setDataErrorMessage("Listing must have less than 100 bedrooms.");
            return;
        }

        //  Bathrooms validation

        if ((propertyDetails?.bathrooms ?? 0) > 99) {
            setDataErrorMessage("Listing must have less than 100 bathrooms.");
            return;
        }        

        // Size validation 

        if ((propertyDetails?.size ?? 0) > 9999) {
            setDataErrorMessage("Listing's size must be less than 10,000m².");
            return;
        }

        //  Property summary & description validations are inline in the JSX (onChange handlers) 
        
        //  Min photos check 

        if (tempURLs.length < 5) {
            setPhotoErrorMessage(`Please upload at least ${5 - tempURLs.length} more ${tempURLs.length === 4 ? "photo" : "photos"}.`);
            setTimeout(() => {
                setPhotoErrorMessage("");
            }, 5000);   
            return;
        }

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
            const uploadTimeout = setTimeout(() => 
            setUploading(true), 300);

            const res = await fetch(`/api/dashboard/property/add`, {
            method: "POST",
            body: propertyData,
            });
            
            clearTimeout(uploadTimeout);
                
            const result = await res.json();
            
            if (res.ok) {
                setDataSuccessMessage(result.message);
                setDataErrorMessage("");
                setPhotoErrorMessage("");
                setTimeout(() =>{
                    navigate(`/dashboard`)
                },5000);
            }

            else if (result.photosError) {
                setDataErrorMessage("");
                setPhotoErrorMessage(result.photosError); 
                setTimeout(() => {
                    setPhotoErrorMessage("");
                }, 5000);
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
        URL.revokeObjectURL(tempURLs[index].url);

        if (index === mainPhotoIndex) {
            setTempURLs(tempURLs.filter((_, i) => i !== index));  
            setMainPhotoIndex(0);
        }

        else if (index < mainPhotoIndex) {
            setTempURLs(tempURLs.filter((_, i) => i !== index));  
            setMainPhotoIndex(mainPhotoIndex - 1);
        }

        const propertyPhotos = tempURLs.filter((_, i) => i !== index);
        setTempURLs(propertyPhotos);
        
        if (galleryIndex >= propertyPhotos.length) {
            setGalleryIndex(Math.max(0, galleryIndex - 3));
        }

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
    const visiblePhotos = tempURLs.slice(galleryIndex, galleryIndex + 3); 

    function previousPhotos () {
        if (galleryIndex >= 3) { 
            setGalleryIndex(prev => prev - 3)
        }
    }

    function nextPhotos () {
        if (galleryIndex + 3 < tempURLs.length) {
            setGalleryIndex(prev => prev + 3)
        }
    }
    
    return (
        <div className={styles.main_container}>
            <div className={styles.main_title_container}>
                <h2 className={`${styles.main_title} ${styles.h2_font}`}>New Property</h2>
            </div>
            <div className={styles.add_property_container}>
                <div className={styles.property_data_container}>
                    <div className={styles.data_subtitle_container}>
                        {dataErrorMessage ?
                            <h3 role="alert" 
                            className={styles.data_error_message}
                        >
                            {dataErrorMessage}
                        </h3>
                        :
                            <h3 className={styles.h3_font}>Step 1: Complete the fields below.</h3>
                        }
                    </div>
                    <div className={styles.city_container}>
                        <label 
                            htmlFor="location"
                            className={`${styles.h4_font} ${styles.city_label}`}
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
                            {errorMessageAC && 
                                <li role="alert" className={`${styles.error_message_ac} ${styles.autocomplete_item}`}>
                                    {errorMessageAC}
                                </li>
                            }                                  
                        </ul>
                    </div>
                    <label 
                        htmlFor="property_type"
                        className={`${styles.h4_font} ${styles.standard_label_format}`}
                    > 
                        Property Type: 
                    </label>
                    {!propertyTypeDropdown ?
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
                        :                    
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
                    }
                    <label 
                        htmlFor="rental_rate"
                        className={`${styles.h4_font} ${styles.standard_label_format}`}
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
                            className={`${styles.standard_input_format} ${styles.input_custom}`}
                        />
                    <label 
                        htmlFor="bedrooms"
                        className={`${styles.h4_font} ${styles.standard_label_format}`}
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
                        className={`${styles.h4_font} ${styles.standard_label_format}`}
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
                        className={`${styles.h4_font} ${styles.standard_label_format}`}
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
                        className={`${styles.h4_font} ${styles.standard_label_format}`}
                    > 
                        Furniture: 
                    </label> 
                    {!furnitureDropdown ?
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
                        :                    
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
                    }                                
                    <div className={styles.summary_container}>
                        <label 
                            htmlFor="property_summary"
                            className={`${styles.h4_font} ${styles.summary_description_label_format}`}
                        > 
                            Summary: 
                        </label>
                        <textarea 
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
                            <span className={styles.word_count_item}>{summaryWordCount} / 50 </span>
                            <span
                                aria-live="polite"
                                className={styles.sr_content}
                            >
                                {announceSummaryWordCount > 0 && `${announceSummaryWordCount} out of 50 words used.`}
                            </span>                        
                        </div>
                    </div>
                    <div className={styles.description_container}>
                        <label 
                            htmlFor="property_description"
                            className={`${styles.h4_font} ${styles.summary_description_label_format}`}
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
                                placeholder="Add a description of your property. Finish off by add an empty paragraph so your description has a space at the end."
                                required
                                aria-invalid={missingField === "detail"}
                                className={styles.textarea_format}
                            />
                        <div className={styles.description_word_count_container}>
                            <span className={styles.word_count_item}>{descriptionWordCount} / 250</span>
                            <span 
                                aria-live="polite" 
                                className={styles.sr_content}
                            >
                                {announceDescriptionWordCount > 0 && `${announceDescriptionWordCount} out of 250 words used.`}
                            </span>                        
                        </div>
                    </div>
                </div>
                <div className={styles.property_image_container}>
                    <div className={styles.image_subtitle_container}>
                        {photoErrorMessage ?
                            <h3 
                                role="alert" 
                                className={styles.photo_error_message}
                            >
                                {photoErrorMessage}
                            </h3>
                        :
                            <h3 className={styles.h3_font}>Step 2: Upload between 5 to 10 photos.</h3>
                        }
                    </div>
                    <div className={styles.main_photo_container}>
                        {tempURLs.length > 0 ?                        
                            <img 
                                src={tempURLs[mainPhotoIndex].url}
                                className={styles.main_photo}
                                alt="Main property photo"                                
                                />
                        :
                            <div className={styles.no_main_photo_div}></div>
                        }
                    </div>
                    <div className={styles.extra_photos_row}>
                        <button
                            disabled = {galleryIndex === 0}
                            onClick={() => previousPhotos()}
                            className={styles.left_arrow_container}
                            aria-describedby="previous_photos_button"
                        >
                            <IoMdArrowRoundBack className={styles.react_arrow_format} />                           
                        </button>
                        <span id="previous_photos_button" className={styles.sr_content}>
                            Display previous 3 uploaded photos. If these are the first 3 uploaded photos, this button will be disabled. 
                        </span>
                        <button 
                            disabled={tempURLs.length >= 10}
                            onClick={ () => photoUpload.current?.click()}
                            className={styles.photo_upload_button}
                            aria-label="Photo upload button"
                        >
                            <LuPlus className={styles.photo_upload_react_icon}/>
                        </button> 
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={(e) => {
                                displayPhotos(e); 
                                clearPhotoErrorMessages()
                            }}
                            ref={photoUpload}
                            style={{display: "none"}}
                        />                                                       
                        <ul className={styles.extra_photos_container}>
                            {visiblePhotos.map((tempURL, index) => {
                                const realIndex = galleryIndex + index;
                                return (
                                    <li 
                                        key={tempURL.url}
                                        className={styles.extra_photos_list}
                                    >
                                        <img 
                                            src={tempURL.url} 
                                            onClick={ () => setMainPhotoIndex(realIndex)}
                                            className={styles.extra_photos}
                                            alt={`Photo preview of photo number ${realIndex + 1}`} 
                                        />
                                        <button 
                                            onClick={() => deletePhotos(realIndex)}
                                            className={styles.delete_photo_button}
                                            aria-label="Remove photo"
                                        >
                                            <TiDelete className={styles.delete_photo_react_icon} />
                                        </button>                       
                                    </li>
                                )
                            })}  
                            {Array.from({ length: 3 - visiblePhotos.length }).map((_, index) => (
                                <li key={index} className={styles.no_extra_photo_li}></li>
                            ))}       
                        </ul>   
                        <button 
                            disabled={galleryIndex + 3 >= tempURLs.length}
                            onClick={() => nextPhotos()}
                            aria-labelledby="next_photos_button"
                            className={styles.right_arrow_container}
                        >
                            <IoMdArrowRoundForward className={styles.react_arrow_format} />
                        </button>
                        <span id="next_photos_button" className={styles.sr_content}>
                            Displays the next 3 uploaded photos. If there are no more photos, this button will be disabled. 
                        </span>
                    </div>                
                    <div className={styles.feedback_messages_container}>    
                        {tempURLs.length < 10 && !excessPhotosMessage && !uploading && !dataSuccessMessage &&
                        <h3 
                            role="status" 
                            className={styles.h3_font}
                        >
                            Upload up to {10 - tempURLs.length} more {tempURLs.length === 9 ? "photo" : "photos"}.
                        </h3> 
                        }                          
                        {excessPhotosMessage && !dataSuccessMessage &&
                            <h3 
                                role="alert"
                                className={styles.excess_photos_message}
                            >
                                {excessPhotosMessage}
                            </h3>
                        }
                        {!uploading && !dataSuccessMessage && 
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
                                className={`${styles.uploading_message} ${styles.h3_font}`}
                            >
                                Creating listing, please wait...
                            </h3>
                        }
                        {dataSuccessMessage &&                         
                            <div role="alert" className={styles.success_message_container}>
                                <h3 className={styles.success_message_1}>{dataSuccessMessage}</h3>
                                <h3 className={styles.success_message_2}>
                                    Redirecting you to your properties...
                                </h3>
                            </div>
                        }                   
                    </div>
                </div> 
            </div>
        </div>
    );
}

export default DashboardPropertyAdd; 