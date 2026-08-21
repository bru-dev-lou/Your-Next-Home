import { useEffect, useState, useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";

import styles from "../dashboard/dashboard_property_edit_comp.module.css";
import serverErrorPhoto from "../../assets/server_error_photo.png";

import { LuPlus } from "react-icons/lu";
import { TiDelete } from "react-icons/ti";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdArrowRoundForward } from "react-icons/io";


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


const propertyTypes = ["Apartment", "Terraced", "Semi-Detached", "Detached", "Bungalow"];
const furnitureTypes = ["Furnished", "Semi-furnished", "Unfurnished"]; 

function DashboardPropertyEdit() {
    const navigate = useNavigate();  
    const { propID } = useParams();
 
// Original Property Details vs Property Details prevents unneccessary API calls when fields have not been updated. 

    const [ originalPropertyDetails, setOriginalPropertyDetails ] = useState<PropertyDetails | null>(null); 
    const [ propertyDetails, setPropertyDetails ] = useState<PropertyDetails | null>(null);

    const [ propertyPhotos, setPropertyPhotos ] = useState<PropertyPhotos[]>([]);
    const [ galleryIndex, setGalleryIndex ] = useState<number>(0); 
    const [ mainPhotoIndex, setMainPhotoIndex ] = useState<number>(0); 

//  Auto comnplete function states for city input. 

    const [ cities, setCities ] = useState<{city: string}[]>([]);
    const [ errorMessageAC , setErrorMessageAC ] = useState(""); 
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(false); 

// Error Messages → PD = Photo Display, PE = Property Edit, PF = Photo Fetch, PU = Photo Upload

    const [ errorMessagePD, setErrorMessagePD ] = useState("");
    const [ errorMessagePF, setErrorMessagePF ] = useState("");
    const [ errorMessageServer, setErrorMessageServer ] = useState(""); 

//  Error / Success message states required for styling purposes.

    const [ errorMessagePE, setErrorMessagePE ] = useState("");
    const [ successMessagePE, setSuccessMessagePE ] = useState("");
    const [ propertyMissingField, setPropertyMissingField ] = useState("");
    const [ propertyUpdated, setPropertyUpdated ] = useState(false);

    const [ errorMessagePU, setErrorMessagePU ] = useState(""); 
    const [ successMessagePU, setSuccessMessagePU ] = useState("");
    const [ photoUploading, setPhotoUploading ] = useState(false); 
    const [ uploadMessage, setUploadMessage ] = useState("");
    
// React hooks for hiding file upload element
    
    const photoUploadButton = useRef<HTMLInputElement>(null);

// WAI-ARIA states for live region updates on word count for summary and description fields.

    const [ announceSummaryWordCount, setAnnounceSummaryWordCount ] = useState(0); 
    const summaryWordCount = propertyDetails?.summary ? propertyDetails.summary.split(/\s+/).filter(Boolean).length : 0;

    const [ announceDescriptionWordCount, setAnnounceDescriptionWordCount ] = useState(0); 
    const descriptionWordCount = propertyDetails?.detail ? propertyDetails.detail?.split(/\s+/).filter(Boolean).length : 0;

//  useStates to show dropdowns and to show values selected 

    const [ propertyTypeDropdown, setPropertyTypeDropdown ] = useState<boolean>(false); 
    const [ furnitureDropdown, setFurnitureDropdown ] = useState<boolean>(false); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/dashboard/property/edit/${propID}`);
                const result = await res.json();

                if (!res.ok) {
                    if (result.error) {
                        setErrorMessageServer(result.error);
                    }
                    
                    if (result.errorProperty) {
                        setErrorMessagePF(result.errorProperty);                     
                    }
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
                    setErrorMessageAC(result.error);
                    setTimeout(() => {
                        setErrorMessageAC("");
                    }, 750) 
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

        //  City validation

        const validCity = /^[a-zA-Z\-]+$/.test(propertyDetails?.city ?? ""); 

        if (!validCity) {
            setErrorMessagePE("City name must only include letters and hyphens.");
            return; 
        }

        // Property summary & description validations are inline in the JSX (onChange handlers) 
        
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

        if (files.length === 1) {
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
                setErrorMessagePU("You may only upload up to 10 photos.");
                setTimeout(() => {setErrorMessagePU("")},5000);
                setSuccessMessagePU("");
                setUploadMessage("");
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

            else if(result.noFilesError) {
                setErrorMessagePU(result.noFilesError);
            }

            else if(result.excessiveFiles) {
                setErrorMessagePU(result.excessiveFiles);
                setTimeout(() => {setErrorMessagePU("")},5000);                
            }

            else {
                setErrorMessagePU(result.error);
                setSuccessMessagePU("");
            }
        }

        catch (error) {
            setErrorMessagePU("Failed to upload photos. Please check internet connection.");
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

                if (result.error) {
                    setErrorMessagePU(result.error);
                }

                else if (result.minPhotosError) {
                    setErrorMessagePU(result.minPhotosError)
                    setTimeout(() => {setErrorMessagePU("")}, 5000);
                }
            }

            else {
                const photoIndex = propertyPhotos.findIndex(photo => photo.id === photoID);

                if (photoIndex === mainPhotoIndex) {
                    setMainPhotoIndex(0); 
                }

                else if (photoIndex < mainPhotoIndex ){
                    setMainPhotoIndex(mainPhotoIndex - 1);
                } 

                const newPhotos = propertyPhotos.filter(photo => photo.id !== photoID);
                setPropertyPhotos(newPhotos);

                if (galleryIndex >= newPhotos.length) {
                    setGalleryIndex(Math.max(0, galleryIndex - 3));
                }

                setSuccessMessagePU(""); 
                setErrorMessagePU("");
            }
        }
        
        catch (error) { 
            setErrorMessagePU("Failed to delete photo. Please check your internet and try again.")
        }
    }

    const toggleDropdown = (setDropdown: React.Dispatch<React.SetStateAction<boolean>>) => {
        setDropdown(prev => !prev)
    } 

    const setValue = (e:React.MouseEvent<HTMLLIElement>, property: keyof PropertyDetails) => {
        setPropertyDetails({...propertyDetails, [property]: e.currentTarget.dataset.value });
    }

    const remainingPropertyTypes = propertyTypes.filter(type => type !== propertyDetails?.type);
    const remainingFurnitureTypes = furnitureTypes.filter(type => type !== propertyDetails?.furniture);  

    const visibleExtraPhotos = propertyPhotos.slice(galleryIndex, galleryIndex + 3);
    
    const previousPhotos = () => {
        if (galleryIndex >= 3) {
            setGalleryIndex(prev => prev -3);
        }
    }

    const nextPhotos = () => {
        if (galleryIndex + 3 < propertyPhotos.length) {
            setGalleryIndex(prev => prev + 3);
        } 
    }

    if (!propertyDetails) {
        return (
            <div className={styles.no_property_error_container}>
                <div className={styles.main_title_container}>
                    <h2 className={`${styles.main_title} ${styles.h2_font}`}> Edit Property </h2>
                </div>        
                {errorMessagePF && 
                    <h2 
                        role="alert"
                        className={styles.PF_error_message}
                    > 
                        {errorMessagePF} 
                    </h2>
                }
                {errorMessageServer && !errorMessagePF &&
                    <div>                
                        <img 
                            src={serverErrorPhoto} 
                            className={styles.server_error_image} 
                            alt="Server error illustration."
                        />
                        <h2
                            role="alert"
                            className={styles.server_error_message}
                        >
                            {errorMessageServer}
                        </h2>
                    </div>
                }
                {!errorMessagePF && !errorMessageServer && 
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
                            {errorMessageAC && 
                                <li role="alert" className={`${styles.error_message_ac} ${styles.autocomplete_item}`}>
                                    {errorMessageAC}
                                </li>                                
                            }                            
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
                            id="propert_type"
                            onClick={ () => toggleDropdown(setPropertyTypeDropdown)}
                            className={styles.ul_container_open}
                        >
                            <li
                                data-value={propertyDetails.type}
                                className={styles.list_item}
                            >
                                {propertyDetails.type}
                            </li>
                            {remainingPropertyTypes.map(type => (
                                <li 
                                    key={type}
                                    data-value={type}
                                    onClick={(e) => {
                                        setValue(e, "type");
                                        setErrorMessagePE("");
                                        setSuccessMessagePE("");
                                    }}
                                    className={styles.list_item}
                                >
                                    {type}
                                </li>
                            ))}
                        </ul>
                    :
                        <ul 
                            id="propert_type"
                            onClick={ () => toggleDropdown(setPropertyTypeDropdown)}
                            className={styles.ul_container_closed}
                        >
                            <li
                                data-value={propertyDetails.type}
                                className={styles.list_item_closed}
                            >
                                {propertyDetails.type}
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
                        value={propertyDetails.price ?? ""}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, price: e.target.value === "" ? undefined : parseFloat(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }}
                        required
                        aria-invalid={propertyMissingField === "price"} 
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
                        type="number" 
                        value={propertyDetails.no_bedrooms ?? ""}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, no_bedrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }} 
                        required
                        aria-invalid={propertyMissingField === "bedrooms"}
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
                        type="number" 
                        value={propertyDetails.no_bathrooms ?? ""}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, no_bathrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }}
                        required
                        aria-invalid={propertyMissingField === "bathrooms"}
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
                        type="number" 
                        value={propertyDetails.size ?? ""}    
                        onChange={(e) => { 
                            setPropertyDetails({...propertyDetails, size: e.target.value === "" ? undefined : parseInt(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }} 
                        required
                        aria-invalid={propertyMissingField === "size"}
                        className={styles.standard_input_format}
                    />
                    <label 
                        htmlFor="furniture"
                        className={styles.h4_font}
                    > 
                        Furniture: 
                    </label>
                    {furnitureDropdown ?
                        <ul
                            id="furniture"
                            onClick={() => toggleDropdown(setFurnitureDropdown)}
                            className={styles.ul_container_open}
                        >
                            <li 
                                data-value={propertyDetails.furniture}
                                className={styles.list_item}
                            >
                                {propertyDetails.furniture}
                            </li>
                            {remainingFurnitureTypes.map(type => (
                                <li 
                                    key={type}
                                    data-value={type}
                                    onClick={(e) => {
                                        setValue(e, "furniture");
                                        setErrorMessagePE("");
                                        setSuccessMessagePE("");
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
                            onClick={()=> toggleDropdown(setFurnitureDropdown)}
                            className={styles.ul_container_closed}
                        >
                            <li
                                data-value={propertyDetails.furniture}
                                className={styles.list_item}
                            >
                                {propertyDetails.furniture}
                            </li>
                        </ul>
                    }                        
                    <div className={styles.summary_container}>
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
                            className={`${styles.textarea_format} ${styles.textarea_summary_custom}`}
                        />
                        <div className={styles.summary_word_count_container}>
                            <span className={styles.word_count_item}>{summaryWordCount} / 50</span>
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
                            htmlFor="description"
                            className={styles.h4_font}
                        > 
                            Description: 
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
                            }}}
                            required
                            aria-invalid={propertyMissingField === "description"}
                            className={`${styles.textarea_format} ${styles.textarea_description_custom}`}
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
                <div>
                    <div>
                        {errorMessagePD &&
                            <h3 role="alert" className={styles.PD_PU_error_message}> {errorMessagePD} </h3>
                        }
                        {errorMessagePU && 
                            <h3 role="alert" className={styles.PD_PU_error_message}> {errorMessagePU} </h3>
                        }   
                        {successMessagePU && 
                            <h3 role="status" className={styles.PU_success_message}> {successMessagePU} </h3>
                        }                     
                        {!errorMessagePD && !errorMessagePU && !successMessagePU && 
                            <h3 className={styles.h3_font}> Update your property photos: </h3>                        
                        }                        
                    </div>
                    <div className={styles.main_photo_container}>
                        {!errorMessagePD ?
                            <img 
                            src={propertyPhotos[mainPhotoIndex].photo_path}
                            className={styles.main_photo}
                            alt={`Main photo for propert number ${propID}`}
                            />
                        :
                            <div className={styles.no_main_photo_div}></div>
                        }
                    </div>
                    <div className={styles.extra_photos_row}>
                        <button 
                            disabled={galleryIndex === 0}
                            onClick={ () => previousPhotos()}
                            className={styles.left_arrow_format}
                            aria-describedby="previous_photos_button"
                        >
                            <IoMdArrowRoundBack className={styles.react_arrow_format}/>
                        </button>
                        <span id="previous_photos_button" className={styles.sr_content}>
                            Display previous 3 uploaded photos. If these are the first 3 uploaded photos, this button will be disabled. 
                        </span>                        
                        <button 
                            disabled={propertyPhotos.length >= 10}
                            onClick={() =>photoUploadButton.current?.click()}
                            className={styles.photo_upload_button}
                            aria-label="Photo upload button"
                        >
                            <LuPlus className={styles.photo_upload_react_icon}/>
                        </button>
                        <input 
                            id="photo_upload"
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={(e)=> {
                                photoUpload(e); 
                            }} 
                            ref={photoUploadButton}
                            style={{display: "none"}}
                        />
                        <ul className={styles.extra_photos_container}>
                            {visibleExtraPhotos.map((photo, index) => {
                                const realIndex = galleryIndex + index;
                                return (
                                <li 
                                    key={photo.id}
                                    className={styles.extra_photos_list}
                                >
                                    <img 
                                        src={photo.photo_path} 
                                        onClick={ () => {setMainPhotoIndex(realIndex)}}
                                        className={styles.extra_photos}
                                        alt={`Photo number ${realIndex + 1} of property number ${propID}`} 
                                    />
                                    <button 
                                        onClick={(e) => photoDelete(photo.id, photo.photo_path, e)}
                                        className={styles.delete_photo_button}
                                        aria-label={`Delete photo number ${realIndex + 1}`}                                        
                                    > 
                                        <TiDelete className={styles.delete_photo_react_icon} />
                                    </button>
                                </li>
                            )})}
                            {Array.from({length: 3 - visibleExtraPhotos.length}).map((_, index) => (
                                <div key={index} className={styles.no_extra_photo_div}></div>
                            ))}
                        </ul>
                        <button 
                            disabled={galleryIndex + 3 >= propertyPhotos.length}
                            onClick={() => {nextPhotos()}}
                            className={styles.right_arrow_format}
                            aria-describedby="next_photos_button"
                        >
                            <IoMdArrowRoundForward className={styles.react_arrow_format} />
                        </button>
                        <span id="next_photos_button" className={styles.sr_content}>
                            Displays the next 3 uploaded photos. If there are no more photos, this button will be disabled. 
                        </span>            
                    </div>
                    <div className={styles.feedback_message_container}>    
                        {propertyPhotos.length < 10 && !uploadMessage &&
                            <h3 className={styles.h3_font}>
                                You may upload {10 - propertyPhotos.length} more {propertyPhotos.length === 9 ? "photo" : "photos"}.
                            </h3>
                        }
                        {propertyPhotos.length === 10 && !uploadMessage &&
                            <h3 className={styles.h3_font}>
                                You have reached the maximum number of photos allowed.
                            </h3>
                        }
                        {uploadMessage && photoUploading && 
                            <h3 
                                role="status"
                                className={`${styles.h3_font} ${styles.upload_message}`}
                            >
                                {uploadMessage}
                            </h3>
                        }
                    </div>
                    <div className={styles.property_update_final_container}>
                        {!uploadMessage && !photoUploading && !successMessagePE &&
                            <button 
                                onClick={propertyDetailsUpdate}
                                className={styles.update_property_button}
                            > 
                                Update Property 
                            </button>
                        }
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
                                >
                                    Check your property out!
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