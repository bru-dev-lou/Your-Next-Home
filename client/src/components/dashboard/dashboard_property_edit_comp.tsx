import { useEffect, useRef, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";

import styles from "../dashboard/dashboard_property_edit_comp.module.css";
import noPropertyPhoto from "../../assets/missing_property_photo.png";
import serverErrorPhoto from "../../assets/server_error_photo.png";

import { MdArrowDropDown } from "react-icons/md";

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
const furnitureTypes = ["Furnished", "Semi-Furnished", "Unfurnished"]; 

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

    const [ autoCompleteQueries, setAutoCompleteQueries ] = useState<{city: string}[]>([]);
    const [ errorMessageAC , setErrorMessageAC ] = useState(""); 
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(false); 

    // Error Messages → PD = Photo Display, PE = Property Edit, PF = Photo Fetch, PU = Photo Upload

    const [ errorMessagePD, setErrorMessagePD ] = useState("");
    const [ errorMessagePF, setErrorMessagePF ] = useState("");
    const [ errorMessageServer, setErrorMessageServer ] = useState(""); 

    //  Error / Success message states required for styling purposes.

    const [ errorMessagePE, setErrorMessagePE ] = useState("");
    const [ shortErrorMessagePE, setShortErrorMessagePE ] = useState("");
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

    //  useRef to ensure setTimeouts do not stack on fetchAutoComplete function

    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null> (null);
    
    //  Setting aria-expanded with the variable below to style input based on the ul being open or not
    
    const autoCompleteOpen = autoCompleteQueries.length > 0 || Boolean(errorMessageAC);

    //  Setting propertyDetails as a variable due to optional chaining triggering lint error 

    const city = propertyDetails?.city ?? "";

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
                console.error(error);
                setErrorMessagePF("Please check your internet and refresh the page."); 
            }
        }   
        fetchData();
    }, [propID]);

    useEffect (() => {
        const fetchAutoComplete = async () => {
            if (city.length > 50) {
                setErrorMessageAC("Maximum length exceeded!");
            
                if (errorTimeoutRef.current) {
                    clearTimeout(errorTimeoutRef.current);
                }

                errorTimeoutRef.current = setTimeout(() => {
                    setErrorMessageAC("");
                }, 2000)
            
                return; 
            };

            try {
                const res = await fetch(`/api/cities?city=${city}`)
                const result = await  res.json(); 

                if (!res.ok) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC(result.error);
                    setTimeout(() => {
                        setErrorMessageAC("");
                    }, 2000);
                }

                else if(city.length === 0) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC("");
                } 

                else if (result.cities.some( (query : {city: string}) => query.city === city)) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC("");
                }
                    
                else {
                    setAutoCompleteQueries(result.cities);
                    setErrorMessageAC("");
                }
            }
  
            catch(error) {
                console.error(error);
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
        }, 100);

        return () => clearTimeout(timeout);
        
    }, [city, autoCompleteQueryClicked]);

    async function propertyDetailsUpdate(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        clearFeedback();

        if (JSON.stringify(propertyDetails) === JSON.stringify(originalPropertyDetails)) {
            setErrorMessagePE("Please update at least one field.");
            setShortErrorMessagePE("Error - Please check Step 1");
            return;
        } 

        // Empty field checks - type and furniture will always have a value so "" values are intentional as they have no aria-invalid.

        const fieldCheck = [
            { field: propertyDetails?.city, error: "Please state where your property is located.", name: "city"},
            { field: propertyDetails?.price, error: "Please state the property's monthly rental rate.", name: "price"},
            { field: propertyDetails?.no_bedrooms, error: "Please state how many bedrooms your property has.", name: "bedrooms"},
            { field: propertyDetails?.no_bathrooms, error: "Please state how many bathrooms your property has.", name: "bathrooms"},
            { field: propertyDetails?.size, error: "Please state the size of your property in m².", name: "size"},
            { field: propertyDetails?.summary, error: "Please provide a summary of your property.", name: "summary" },
            { field: propertyDetails?.detail, error: "Please provide a detailed description of your property.", name: "description"} ,
            { field: propertyDetails?.type, error: "Please choose a property type.", name: ""},
            { field: propertyDetails?.furniture, error: "Please choose your property's type of furnishing.", name: ""}
        ];

        for (const {field, error, name} of fieldCheck) {
            if (!field || field === "0" ) {
                setErrorMessagePE(error);
                setPropertyMissingField(name);
                setShortErrorMessagePE("Error - Please check Step 1");
                return;
            }
        }

        //  City validation

        const validCity = /^[a-zA-Z\- ]+$/.test(propertyDetails?.city ?? ""); 

        if (!validCity) {
            setErrorMessagePE("City must only include letters and hyphens.");
            setShortErrorMessagePE("Error - Please check Step 1");
            return; 
        }

        if ((propertyDetails?.city?.length ?? 0) > 50) {
            setErrorMessagePE("City name must not exceed 50 characters.");
            setShortErrorMessagePE("Error - Please check Step 1");
            return;
        }

        //  Price validation 

        if ((propertyDetails?.price ?? 0) > 99999) {
            setErrorMessagePE("Listing's monthly rate must be less than £100,000.");
            setShortErrorMessagePE("Error - Please check Step 1");
            return;
        } 

        //  Bedrooms validation 

        if ((propertyDetails?.no_bedrooms ?? 0) > 99) {
            setErrorMessagePE("Listing must have less than 100 bedrooms.");
            setShortErrorMessagePE("Error - Please check Step 1");
            return;
        }

        //  Bathrooms validation

        if ((propertyDetails?.no_bathrooms ?? 0) > 99) {
            setErrorMessagePE("Listing must have less than 100 bathrooms.");
            setShortErrorMessagePE("Error - Please check Step 1");
            return;
        }        

        // Size validation 

        if ((propertyDetails?.size ?? 0) > 9999) {
            setErrorMessagePE("Listing's size must be less than 10,000m².");
            setShortErrorMessagePE("Error - Please check Step 1");
            return;
        }

        //  Property summary & description validations are inline in the JSX (onChange handlers) 
        
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
                setShortErrorMessagePE("");
            } 
            
            else {
                setErrorMessagePE(result.error);
                setShortErrorMessagePE("Error - Please check Step 1");
                setPropertyMissingField(result.name);
                setSuccessMessagePE("");
            }
        } 
            
        catch (error) {
            console.error(error);
            setErrorMessagePE("Please check your internet and refresh the page.");
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
            setShortErrorMessagePE("");
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
            console.error(error);
            setErrorMessagePU("Please check your internet and refresh the page.");
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
            console.error(error);
            setErrorMessagePU("Please check your internet and refresh the page.")
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

    // Clear error and success messages, and ARIA-INVALIDs for PE = Property Edit 

    const clearFeedback = () => {
        setErrorMessagePE("");
        setShortErrorMessagePE("");
        setSuccessMessagePE("");
        setPropertyMissingField("");
        setPropertyUpdated(false);
    }

    if (!propertyDetails) {
        return (
            <div className={styles.no_property_error_container}>
                <div className={styles.main_title_container}>
                        <h1 className={styles.main_title}>
                            {!errorMessagePF && !errorMessageServer ? "Loading..." : "Edit Property"}
                        </h1>
                </div>
                <div className={styles.error_messages_container}>        
                    {errorMessagePF && 
                        <div className={styles.no_property_found_container}>
                            <img 
                                src={noPropertyPhoto}
                                className={styles.no_property_found_image}
                                alt="No property found illustration"
                            />
                            <span
                                role="alert"
                                className={styles.PF_error_message}
                            > 
                                {errorMessagePF} 
                            </span>
                        </div>
                    }
                    {errorMessageServer && !errorMessagePF &&
                        <div className={styles.server_error_container}>                
                            <img 
                                src={serverErrorPhoto} 
                                className={styles.server_error_image} 
                                alt="Server error illustration."
                            />
                            <span
                                role="alert"
                                className={styles.server_error_message}
                            >
                                {errorMessageServer}
                            </span>
                        </div>
                    }
                </div>
            </div>
        );
    }   

    return (
        <div className={styles.main_container}>
            <div className={styles.main_title_container}>
                <h1 className={styles.main_title}> Edit Property </h1>
            </div>
            <div className={styles.property_edit_container}>
                <div className={styles.property_data_container}>
                    {errorMessagePE ?
                        <span 
                            role="alert"
                            className={styles.PE_error_message}
                        >
                            {errorMessagePE}
                        </span>
                        :
                        <h2 className={styles.property_data_subtitle}> Update your property details:</h2>
                    }
                    <div className={styles.property_information_container}>
                        <div className={styles.labels_and_inputs_container}>     
                            <label 
                                htmlFor="location"
                                className={styles.label_format}
                            > 
                                City: 
                            </label>
                            <div className={styles.input_and_auto_complete_container}>                            
                                <input 
                                    id="location"
                                    type="text" 
                                    value={propertyDetails.city}
                                    maxLength={50}
                                    onChange={(e) => {
                                        setPropertyDetails({...propertyDetails, city: e.target.value});
                                        clearFeedback();
                                        setAutoCompleteQueryClicked(false);
                                    }}
                                    required
                                    aria-invalid={propertyMissingField === "city"}
                                    aria-describedby="location_hint"
                                    aria-expanded={autoCompleteOpen}
                                    className={styles.input_format_custom}
                                />             
                                <span id="location_hint" className={styles.sr_content}>Where your property is located.</span>
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
                        </div>
                        <div className={styles.labels_and_inputs_container}>
                            <label 
                                id="property_type"
                                className={styles.label_format}
                            >
                                Property Type: 
                            </label>
                            <div className={styles.ul_container}>
                                <ul 
                                    onClick={ () => toggleDropdown(setPropertyTypeDropdown)}
                                    aria-invalid={propertyMissingField === "type"}        
                                    aria-labelledby="property_type"
                                    className={styles.ul_container_closed}
                                >
                                    <li
                                        data-value={propertyDetails.type}
                                        className={styles.list_item_closed}
                                    >
                                        {propertyDetails.type}
                                        <MdArrowDropDown className={styles.react_icon_down_arrow}/>
                                    </li>                   
                                </ul>
                                {propertyTypeDropdown &&                                              
                                    <ul 
                                        onClick={ () => toggleDropdown(setPropertyTypeDropdown)}
                                        className={styles.ul_container_open}
                                    >
                                        <li
                                            data-value={propertyDetails.type}
                                            onClick={() => clearFeedback()}
                                            className={styles.list_item_open}
                                        >
                                            {propertyDetails.type}
                                        </li>
                                        {remainingPropertyTypes.map(type => (
                                            <li 
                                                key={type}
                                                data-value={type}
                                                onClick={(e) => {
                                                    setValue(e, "type");
                                                    clearFeedback();
                                                }}
                                                className={styles.list_item_open}
                                            >
                                                {type}
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>
                        </div>
                        <div className={styles.labels_and_inputs_container}>                        
                            <label 
                                htmlFor="rental_rate"
                                className={styles.label_format}
                            > 
                                Monthly Rate (£): 
                            </label>
                            <input 
                                id="rental_rate"
                                type="text"
                                inputMode="numeric"
                                maxLength={5}                                
                                value={propertyDetails.price ?? ""}
                                onChange={(e) => {
                                    const numberRegex = /^[0-9]*$/;
                                    if (numberRegex.test(e.target.value)) {                            
                                        setPropertyDetails({...propertyDetails, price: e.target.value === "" ? undefined : parseFloat(e.target.value)});
                                        clearFeedback();
                                    }
                                }}
                                required
                                aria-invalid={propertyMissingField === "price"} 
                                className={styles.input_format}
                            />
                        </div>
                        <div className={styles.labels_and_inputs_container}>                        
                            <label 
                                htmlFor="bedrooms"
                                className={styles.label_format}
                            > 
                                Bedrooms: 
                            </label>
                            <input 
                                id="bedrooms"
                                type="text"
                                inputMode="numeric"
                                maxLength={2}
                                value={propertyDetails.no_bedrooms ?? ""}
                                onChange={(e) => {
                                    const numberRegex = /^[0-9]*$/;
                                    if (numberRegex.test(e.target.value)) {                            
                                        setPropertyDetails({...propertyDetails, no_bedrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                                        clearFeedback();
                                    }
                                }} 
                                required
                                aria-invalid={propertyMissingField === "bedrooms"}
                                className={styles.input_format}
                            />
                        </div>
                        <div className={styles.labels_and_inputs_container}>
                            <label 
                                htmlFor="bathrooms"
                                className={styles.label_format}
                            > 
                                Bathrooms: 
                            </label>
                            <input 
                                id="bathrooms"
                                type="text"
                                inputMode="numeric" 
                                maxLength={2}
                                value={propertyDetails.no_bathrooms ?? ""}
                                onChange={(e) => {
                                    const numberRegex = /^[0-9]*$/;
                                    if (numberRegex.test(e.target.value)) {                            
                                        setPropertyDetails({...propertyDetails, no_bathrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                                        clearFeedback();
                                    }
                                }}
                                required
                                aria-invalid={propertyMissingField === "bathrooms"}
                                className={styles.input_format}
                            />
                        </div>
                        <div className={styles.labels_and_inputs_container}>
                            <label 
                                htmlFor="property_size"
                                className={styles.label_format}
                            > 
                                Size (m²): 
                            </label>
                            <input 
                                id="property_size"
                                type="text"
                                inputMode="numeric" 
                                maxLength={4}
                                value={propertyDetails.size ?? ""}    
                                onChange={(e) => { 
                                    const numberRegex = /^[0-9]*$/;
                                    if (numberRegex.test(e.target.value)) {                            
                                        setPropertyDetails({...propertyDetails, size: e.target.value === "" ? undefined : parseInt(e.target.value)});
                                        clearFeedback();
                                    }
                                }} 
                                required
                                aria-invalid={propertyMissingField === "size"}
                                aria-describedby="size_hint"
                                className={styles.input_format}
                            />
                            <span id="size_hint" className={styles.sr_content}>The overall size of your property in m².</span>
                        </div>
                        <div className={styles.labels_and_inputs_container}>
                            <label 
                                id="furniture"
                                className={styles.label_format}
                            > 
                                Furniture: 
                            </label>
                            <div className={styles.ul_container}>
                                <ul
                                    onClick={()=> toggleDropdown(setFurnitureDropdown)}
                                    className={styles.ul_container_closed}
                                    aria-labelledby="furniture"
                                    aria-invalid={propertyMissingField === "furniture"}
                                >
                                    <li
                                        data-value={propertyDetails.furniture}
                                        className={styles.list_item_closed}
                                    >
                                        {propertyDetails.furniture}
                                        <MdArrowDropDown className={styles.react_icon_down_arrow}/>
                                    </li>
                                </ul>
                                {furnitureDropdown &&                        
                                    <ul
                                        onClick={() => toggleDropdown(setFurnitureDropdown)}
                                        className={styles.ul_container_open_custom}
                                    >
                                        <li 
                                            data-value={propertyDetails.furniture}
                                            onClick={ () => clearFeedback()}
                                            className={styles.list_item_open}
                                        >
                                            {propertyDetails.furniture}
                                        </li>
                                        {remainingFurnitureTypes.map(type => (
                                            <li 
                                                key={type}
                                                data-value={type}
                                                onClick={(e) => {
                                                    setValue(e, "furniture");
                                                    clearFeedback();
                                                }}
                                                className={styles.list_item_open}
                                            >
                                                {type}
                                            </li>
                                        ))}
                                    </ul>                    
                                }
                            </div>                 
                        </div>
                        <div className={styles.labels_and_textareas_container}>
                            <div className={styles.label_and_wordcount_container}>
                                <label 
                                    htmlFor="property_summary"
                                    className={styles.label_format_custom}
                                > 
                                    Summary: 
                                </label>
                                <span className={styles.word_count_item}>{summaryWordCount} / 50</span>
                                <span
                                    aria-live="polite" 
                                    className={styles.sr_content}
                                >
                                    {announceSummaryWordCount > 0 && `${announceSummaryWordCount} out of 50 words used.`}
                                </span>                                   
                            </div>
                            <div className={styles.textarea_container}>
                                <textarea
                                    id="property_summary"
                                    value={propertyDetails.summary}
                                    onChange={(e) => {
                                        const words = e.target.value.split(/\s+/).filter(Boolean);
                                        if (words.length <= 50) {
                                            clearFeedback();
                                            setPropertyDetails({ ...propertyDetails, summary: e.target.value });
                                        }
                                    }}
                                    required
                                    aria-invalid={propertyMissingField === "summary"}
                                    className={styles.textarea_format}
                                />
                            </div>
                        </div>
                        <div className={styles.labels_and_textareas_container}>
                            <div className={styles.label_and_wordcount_container}>
                                <label 
                                    htmlFor="property_description"
                                    className={styles.label_format_custom}
                                > 
                                    Description: 
                                </label>
                                <span className={styles.word_count_item}>{descriptionWordCount} / 250</span>
                                <span 
                                    aria-live="polite" 
                                    className={styles.sr_content}
                                >
                                    {announceDescriptionWordCount > 0 && `${announceDescriptionWordCount} out of 250 words used.`}
                                </span>
                            </div>                 
                            <div className={styles.textarea_container}>
                                <textarea
                                    id="property_description"
                                    value={propertyDetails.detail}
                                    onChange={(e) => {
                                        const words = e.target.value.split(/\s+/).filter(Boolean);
                                        if (words.length <= 250) {
                                            setPropertyDetails({ ...propertyDetails, detail: e.target.value });
                                        }
                                        clearFeedback();
                                    }}
                                    required
                                    aria-invalid={propertyMissingField === "description"}
                                    className={styles.textarea_format_custom}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.property_photos_container}>
                    <div className={styles.property_photos_subtitle_container}>
                        {errorMessagePD &&
                            <span role="alert" className={styles.PD_PU_error_message}> {errorMessagePD} </span>
                        }
                        {errorMessagePU && 
                            <span role="alert" className={styles.PD_PU_error_message}> {errorMessagePU} </span>
                        }   
                        {successMessagePU && 
                            <span role="status" className={styles.PU_success_message}> {successMessagePU} </span>
                        }                     
                        {!errorMessagePD && !errorMessagePU && !successMessagePU && 
                            <h2 className={styles.property_photos_subtitle}> Update your property photos: </h2>                        
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
                            className={styles.left_arrow_container}
                            aria-describedby="previous_photos_button"
                        >
                            <IoMdArrowRoundBack className={styles.react_icon_arrow_format}/>
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
                            <LuPlus className={styles.react_icon_plus_sign}/>
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
                                )
                            })}
                            {Array.from({length: 3 - visibleExtraPhotos.length}).map((_, index) => (
                                <li key={index} className={styles.no_extra_photo_list}></li>
                            ))}
                        </ul>
                        <button 
                            disabled={galleryIndex + 3 >= propertyPhotos.length}
                            onClick={() => {nextPhotos()}}
                            className={styles.right_arrow_container}
                            aria-describedby="next_photos_button"
                        >
                            <IoMdArrowRoundForward className={styles.react_icon_arrow_format} />
                        </button>
                        <span id="next_photos_button" className={styles.sr_content}>
                            Displays the next 3 uploaded photos. If there are no more photos, this button will be disabled. 
                        </span>            
                    </div>
                    <div className={styles.feedback_message_container}>    
                        {propertyPhotos.length < 10 && !uploadMessage && 
                            <span 
                                role="status"
                                className={styles.photos_remaining_message}
                            >
                                You may upload {10 - propertyPhotos.length} more {propertyPhotos.length === 9 ? "photo" : "photos"}.
                            </span>
                        }
                        {propertyPhotos.length === 10 && !uploadMessage &&
                            <span 
                                role="status" 
                                className={styles.max_photos_reached_message}
                            >
                                You have reached the maximum number of photos allowed.
                            </span>
                        }
                        {uploadMessage && photoUploading && 
                            <span 
                                role="status"
                                className={styles.uploading_photos_message}
                            >
                                {uploadMessage}
                            </span>
                        }                                            
                    </div>
                    <div className={styles.feedback_message_container_short_viewport}>    
                        {propertyPhotos.length < 10 && !uploadMessage && !shortErrorMessagePE &&
                            <span 
                                role="status"
                                className={styles.photos_remaining_message}
                            >
                                You may upload {10 - propertyPhotos.length} more {propertyPhotos.length === 9 ? "photo" : "photos"}.
                            </span>
                        }
                        {propertyPhotos.length === 10 && !uploadMessage && !shortErrorMessagePE &&
                            <span 
                                role="status" 
                                className={styles.max_photos_reached_message}
                            >
                                You have reached the maximum number of photos allowed.
                            </span>
                        }
                        {uploadMessage && photoUploading && !shortErrorMessagePE &&
                            <span 
                                role="status"
                                className={styles.uploading_photos_message}
                            >
                                {uploadMessage}
                            </span>
                        }              
                        {!uploadMessage && !photoUploading && shortErrorMessagePE && 
                            <span 
                                role="alert"
                                className={styles.short_error_message_PE}
                            >
                                {shortErrorMessagePE}
                            </span>                  
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
                                <span
                                    role="status"
                                    className={styles.PE_success_message}
                                >
                                    {successMessagePE}
                                </span>
                                <button 
                                    onClick={() => {navigate(`/property/${propID}`)}}
                                    aria-describedby="navigation_hint_2"
                                    className={styles.navigation_button}
                                >
                                    See Listing
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