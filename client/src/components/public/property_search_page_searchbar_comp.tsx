import { useEffect, useRef, useState } from "react"; 
import { useSearchParams, useNavigate } from "react-router-dom"; 

import styles from "./property_search_page_searchbar_comp.module.css";
import { GrMapLocation } from "react-icons/gr";
import { LuHouse } from "react-icons/lu";
import { RiMoneyPoundCircleLine, RiArchiveDrawerLine} from "react-icons/ri";
import { IoBedOutline } from "react-icons/io5";
import { PiToilet } from "react-icons/pi";
import { MdArrowDropDown } from "react-icons/md";


type PropertyData = {
    city: string;
    type: string;
    maxPrice: number;
    minBeds: number;
    minBaths: number; 
    furniture: string;
}

type SearchPageProps = {
    sortBy: string;
    setLocationErrorMessage: (message : string) => void;
}

const propertyTypeValues = ["Apartment", "Terraced", "Semi-Detached", "Detached", "Bungalow"];
const budgetValues = Array.from({length : 16}, (_, i) => (i + 5) * 100);
const bedroomValues = [1, 2, 3, 4, 5];
const bathroomValues = [1, 2, 3, 4, 5];
const furnitureValues = ["Furnished", "Semi-Furnished", "Unfurnished"];
const narrowLocationViewport = "(max-width: 701px)"; 

function PropertySearchPageSearchBar ({sortBy, setLocationErrorMessage} : SearchPageProps ) {
    const navigate = useNavigate();     
    const [ params ] = useSearchParams();
    
    const cityDefault = params.get("city") || "";
    const [ propData, setPropData ] = useState<PropertyData>({city: cityDefault, type: "", furniture: "", minBeds: 0, minBaths: 0, maxPrice: 99999});
    
    const [ propertyTypeDropdown, setPropertyTypeDropdown ] = useState<boolean>(false);     
    const [ propertyTypeLabel, setPropertyTypeLabel ] = useState("Show all");


    const [ budgetDropdown, setBudgetDropdown ] = useState<boolean>(false); 
    const [ maxPriceLabel, setMaxPriceLabel ] = useState("No Maximum");


    const [ bedroomsDropdown, setBedroomsDropdown ] = useState<boolean>(false); 
    const [ bedroomsLabel, setBedroomsLabel ] = useState("No Minimum"); 


    const [ bathroomsDropdown, setBathroomsDropdown ] = useState<boolean>(false); 
    const [ bathroomsLabel, setBathroomsLabel ] = useState("No Minimum");


    const [ furnitureDropdown, setFurnitureDropdown ] = useState<boolean>(false);
    const [ furnitureLabel, setFurnitureLabel ] = useState("Any");


    const [ autoCompleteQueries, setAutoCompleteQueries ] = useState<{city: string}[]>([]);
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(false); 

    // Error Message → AC = Auto Complete 

    const [ errorMessageAC, setErrorMessageAC ] = useState(""); 
    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null> (null);
    
    // Match media for placeholder due to viewport width restrictions 

    const [ narrowViewport, setNarrowViewport ] = useState( () => window.matchMedia(narrowLocationViewport).matches);

    //  Ref variables to close dropdowns when clicking anywhere in the document 

    const propertyTypeRef = useRef<HTMLDivElement>(null); 
    const budgetRef = useRef<HTMLDivElement>(null);
    const bedroomsRef = useRef<HTMLDivElement>(null);
    const bathroomsRef = useRef<HTMLDivElement>(null);
    const furnitureRef = useRef<HTMLDivElement>(null); 
    
    useEffect(() => {
        function ClickCheck (e:MouseEvent) {

            if(!e.composedPath().includes(propertyTypeRef.current!)) {
                setPropertyTypeDropdown(false); 
            }

            if(!e.composedPath().includes(budgetRef.current!)) {
                setBudgetDropdown(false); 
            }
            
            if(!e.composedPath().includes(bedroomsRef.current!)) {
                setBedroomsDropdown(false); 
            }

            if(!e.composedPath().includes(bathroomsRef.current!)) {
                setBathroomsDropdown(false); 
            }

            if(!e.composedPath().includes(furnitureRef.current!)) {
                setFurnitureDropdown(false); 
            }
        }
        
        function EscapeCheck (e:KeyboardEvent) {
            if (e.key === "Escape") {
                setPropertyTypeDropdown(false);
                setBudgetDropdown(false);
                setBedroomsDropdown(false);
                setBathroomsDropdown(false);
                setFurnitureDropdown(false);
            }
        }
        
        document.addEventListener("click", ClickCheck);
        document.addEventListener("keydown", EscapeCheck); 
        
        return () => {
            document.removeEventListener("click", ClickCheck);
            document.removeEventListener("keydown", EscapeCheck);
        }

    }, []);
    
    useEffect (() => {
        const mediaCheck = window.matchMedia(narrowLocationViewport);
        const handleChange = (e:MediaQueryListEvent) => setNarrowViewport(e.matches);

        mediaCheck.addEventListener("change", handleChange);
        return () => mediaCheck.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        const fetchAutoComplete = async () => {
            if (propData.city.length > 50) {
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
                const res = await fetch(`/api/cities?city=${propData.city}`);
                const result = await res.json();
  
                if (!res.ok) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC(result.error); 
                    setTimeout(() => {
                        setErrorMessageAC("");
                    }, 2000)
                }
  
                else if(propData.city.length === 0) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC("");
                }

                else if (propData.city === cityDefault) {
                    setAutoCompleteQueries([]);
                }

                else if (autoCompleteQueries.some(query=> query.city.toLowerCase() === propData.city.toLowerCase())) {
                    setAutoCompleteQueries([]);
                }

                else {
                    setAutoCompleteQueries(result.cities);
                    setErrorMessageAC("");
                }
            }
  
            catch(error) {
                setErrorMessageAC("Autocomplete currently unavailable.");
            }
        }
          
        if (autoCompleteQueryClicked) {
            return;
        }
  
        const timeout = setTimeout(() => {
            fetchAutoComplete();
        }, 100); 
        
        return () => clearTimeout(timeout)
        
    }, [propData.city, autoCompleteQueryClicked]);

    const showDropdown = (setDropdown: React.Dispatch<React.SetStateAction<boolean>>) => {
        setDropdown(prev => !prev); 
    }

    const setValue = (e: React.MouseEvent<HTMLLIElement>, property: keyof PropertyData, setLabel: (value:string) => void, defaultValue: string) => {
        if (typeof propData[property] === "number") {
            setPropData({...propData, [property]: Number(e.currentTarget.dataset.value!)});
        }
        
        else {
        setPropData({...propData, [property]: e.currentTarget.dataset.value!});
        }

        setLabel(e.currentTarget.innerText || defaultValue);
    } 

    const buttonSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validCity = propData.city === "" || /^[a-zA-Z\- ]+$/.test(propData.city); 

        if (propData.city.length > 50) {
            setLocationErrorMessage("Location: 50 characters max!");    
            setTimeout(() => setLocationErrorMessage(""), 2000);
            return;
        }

        if (!validCity) {
            setLocationErrorMessage("Location: Letters and hyphens only!");
            setTimeout(() => setLocationErrorMessage(""), 2000);
            return; 
        }
        
        navigate(`/search?city=${propData.city}&type=${propData.type}&furniture=${propData.furniture}&minBeds=${propData.minBeds}&minBaths=${propData.minBaths}&maxPrice=${propData.maxPrice}&sortBy=${sortBy}`);
    };

    return (
        <form 
            onSubmit={buttonSearch}
            className={styles.main_container}
        >
            <div className={styles.first_row_container}>
                <div className={styles.location_container}>
                    <label 
                        htmlFor ="location" 
                        className={`${styles.label_font} ${styles.location_label} ${styles.label_wide_viewport}`}
                    > 
                        Location: 
                    </label>
                    <label 
                        htmlFor="location"
                        className={styles.label_short_viewport}
                        aria-label="Property location"
                    >
                        <GrMapLocation className={styles.react_icon_format}/> 
                    </label>
                    <div className={styles.autocomplete_wrapper}>
                        <input 
                            id="location"
                            type = "text"
                            value = {propData.city}
                            onChange = {(e) => {
                                const validCity = e.target.value.replace(/[^a-zA-Z- ]/g, "");
                                setPropData({...propData, city: validCity});
                                setAutoCompleteQueryClicked(false);
                            }}   
                            placeholder = {narrowViewport ? "Location" : "Enter your preferred location"} 
                            className={styles.location_input}
                        />
                        <ul 
                            aria-live="polite" 
                            aria-label="City autocomplete suggestions."
                            className={styles.autocomplete_container}
                        >
                            {autoCompleteQueries.map((query, index) => (
                                <li 
                                    key={index}
                                    onClick = {() => {
                                        setPropData({...propData, city: query.city});
                                        setAutoCompleteQueries([]);
                                        setAutoCompleteQueryClicked(true);
                                        }}
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === "Enter") {
                                        setPropData({...propData, city: query.city});
                                        setAutoCompleteQueries([]);
                                        setAutoCompleteQueryClicked(true);
                                    }}}
                                    aria-label={`Select ${query.city}`}
                                    className={styles.autocomplete_item}
                                >
                                    {query.city}
                                </li>
                            ))}
                            {errorMessageAC && 
                                <>
                                    <li 
                                        role="alert" 
                                        className={`${styles.ac_error_message} ${styles.autocomplete_item} ${styles.ac_error_wide_viewport}`}
                                    >
                                        {errorMessageAC}
                                    </li>
                                    <li 
                                        role="alert" 
                                        className={`${styles.ac_error_message} ${styles.autocomplete_item} ${styles.ac_error_short_viewport}`}
                                    >
                                        Too long!
                                    </li>
                                </>
                            }                        
                        </ul>
                    </div>
                </div> 
                <div className={styles.property_type_container}>
                    <label 
                        htmlFor="property_type" 
                        className={`${styles.label_font} ${styles.property_type_label} ${styles.label_wide_viewport}`}
                    > 
                        Property Type: 
                    </label>
                    <label 
                        htmlFor="property_type"
                        className={styles.label_short_viewport}
                        aria-label="Property type"
                    >
                        <LuHouse className={styles.react_icon_format} />
                    </label>
                    <div 
                        ref={propertyTypeRef}
                        className={styles.property_type_wrapper}
                    >
                        {!propertyTypeDropdown ? 
                            <ul
                                id="property_type"
                                onClick={() => showDropdown(setPropertyTypeDropdown)}
                                className={styles.first_row_container_closed}
                            >
                                <li 
                                    data-value={propertyTypeLabel} 
                                    className={styles.list_item_closed}
                                >
                                    {propertyTypeLabel !== "Show all" && propertyTypeLabel !== "All" ?
                                        propertyTypeLabel
                                    :
                                        <>
                                        <span className={styles.li_element_wide_viewport}>Show all</span>
                                        <span className={styles.li_element_short_viewport}>All</span>  
                                        </>
                                    }                    
                                    <MdArrowDropDown className={styles.react_icon_down_arrow}/>              
                                </li>
                            </ul>
                        :                        
                            <ul 
                                id="property_type"
                                onClick ={() => showDropdown(setPropertyTypeDropdown)}
                                className={styles.first_row_container_open}
                            >
                                <li 
                                    data-value={propData.type} 
                                    className={styles.list_item_open}
                                >
                                    {propertyTypeLabel !== "Show all" && propertyTypeLabel !== "All" ?
                                        propertyTypeLabel
                                    :
                                        <>
                                        <span className={styles.li_element_wide_viewport}>Show all</span>
                                        <span className={styles.li_element_short_viewport}>All</span>  
                                        </>
                                    }     
                                </li>
                                {propertyTypeLabel !== "Show all" && propertyTypeLabel !== "All" &&  
                                    <li 
                                        data-value="" 
                                        onClick={(e) => {setValue(e, "type", setPropertyTypeLabel, "Show all" )}} 
                                        className={styles.list_item_open}
                                    >
                                        <span className={styles.li_element_wide_viewport}>Show all</span>
                                        <span className={styles.li_element_short_viewport}>All</span>
                                    </li>
                                }
                                {propertyTypeValues.map(value => (
                                    <li 
                                        key={value} 
                                        data-value={value} 
                                        onClick={(e) => {setValue(e, "type", setPropertyTypeLabel, "Show all" )}} 
                                        className={styles.list_item_open}
                                    >
                                        {value}
                                    </li>
                                ))}
                            </ul>            
                        }
                    </div>
                </div>
                <div className={styles.budget_container}>
                    <label 
                        htmlFor= "max_price" 
                        className={`${styles.budget_label} ${styles.label_font} ${styles.label_wide_viewport}`}
                    > 
                        Budget: 
                    </label>
                    <label 
                        htmlFor="max_price"
                        className={styles.label_short_viewport}
                        aria-label="Maximum budget"
                    >
                        <RiMoneyPoundCircleLine className={styles.react_icon_format} />
                    </label>
                    <div 
                        ref={budgetRef}
                        className={styles.budget_wrapper}
                    >
                        {!budgetDropdown ?
                            <ul 
                                id="max_price"
                                onClick = {() => showDropdown(setBudgetDropdown)} 
                                className={styles.first_row_container_closed}
                            >
                                <li 
                                    data-value={propData.maxPrice} 
                                    className={styles.list_item_closed}
                                >
                                    {maxPriceLabel !== "No Maximum" && maxPriceLabel !== "No Max" ?
                                        maxPriceLabel
                                    :
                                        <>
                                            <span className={styles.li_element_wide_viewport}>No Maximum</span>
                                            <span className={styles.li_element_short_viewport}>No Max</span>                                    
                                        </>
                                    }   
                                    <MdArrowDropDown className={styles.react_icon_down_arrow}/>                                                  
                                </li>
                            </ul>  
                        :                    
                            <ul 
                                id="max_price" 
                                onClick = {() => showDropdown(setBudgetDropdown)} 
                                className={styles.first_row_container_open}
                            >
                                <li 
                                    data-value= {propData.maxPrice} 
                                    className={styles.list_item_open}
                                >
                                    {maxPriceLabel !== "No Maximum" && maxPriceLabel !== "No Max" ?
                                        maxPriceLabel
                                    :
                                        <>
                                            <span className={styles.li_element_wide_viewport}>No Maximum</span>
                                            <span className={styles.li_element_short_viewport}>No Max</span>                                    
                                        </>
                                    }
                                </li>
                                {maxPriceLabel !== "No Maximum" && maxPriceLabel !== "No Max" &&
                                    <li 
                                        data-value={99999} 
                                        onClick={(e) => {setValue(e, "maxPrice", setMaxPriceLabel, "No Maximum")}} 
                                        className={styles.list_item_open}
                                    > 
                                        <span className={styles.li_element_wide_viewport}>No Maximum</span>
                                        <span className={styles.li_element_short_viewport}>No Max</span>
                                    </li>
                                }
                                {budgetValues.map(value => (
                                    <li 
                                        key={value} 
                                        data-value={value} 
                                        onClick={(e) => {setValue(e, "maxPrice", setMaxPriceLabel, "No Maximum")}} 
                                        className={styles.list_item_open}
                                    > 
                                        £{value.toLocaleString()}PCM
                                    </li>
                                ))}
                            </ul>                              
                        }
                    </div>
                </div>
            </div>
            <div className={styles.second_row_container}>
                <div className={styles.bedrooms_container}>
                    <label 
                        htmlFor ="min_bedrooms" 
                        className={`${styles.label_font} ${styles.bedrooms_label} ${styles.label_wide_viewport}`}
                    > 
                        Bedrooms: 
                    </label>
                    <label 
                        htmlFor="min_bedrooms"
                        className={`${styles.label_short_viewport} ${styles.label_short_viewport_bedrooms_custom}`}
                        aria-label="Minimum number of bedrooms"
                    >
                        <IoBedOutline className={styles.react_icon_format} />
                    </label>
                    <span id="bedroom_hint" className={styles.sr_content}>Minimum number of bedrooms you require.</span>
                    <div 
                        ref={bedroomsRef}
                        className={styles.bedrooms_wrapper}
                    >
                        {!bedroomsDropdown ? 
                            <ul 
                                id="min_bedrooms"
                                onClick = {() => showDropdown(setBedroomsDropdown)}
                                aria-describedby="bedroom_hint"
                                className={styles.second_row_container_closed}
                            >
                                <li 
                                    data-value= {propData.minBeds} 
                                    className={styles.list_item_closed}
                                >
                                    {bedroomsLabel !== "No Minimum" && bedroomsLabel !== "No Min" ?
                                        bedroomsLabel
                                    :
                                        <>
                                            <span className={styles.li_element_wide_viewport}>No Minimum</span>
                                            <span className={styles.li_element_short_viewport}>No Min</span>                                    
                                        </> 
                                    }         
                                    <MdArrowDropDown className={styles.react_icon_down_arrow}/>              
                                </li>      
                            </ul>
                        :                        
                            <ul
                                id="min_bedrooms"
                                onClick = {() => showDropdown(setBedroomsDropdown)} 
                                aria-describedby="bedroom_hint"
                                className={styles.second_row_container_open}
                            >
                                <li 
                                    data-value={propData.minBeds} 
                                    className={styles.list_item_open}
                                >
                                    {bedroomsLabel !== "No Minimum" && bedroomsLabel !== "No Min" ?
                                        bedroomsLabel
                                    :
                                        <>
                                            <span className={styles.li_element_wide_viewport}>No Minimum</span>
                                            <span className={styles.li_element_short_viewport}>No Min</span>                                    
                                        </> 
                                    }        
                                </li>
                                {bedroomsLabel !== "No Minimum" && bedroomsLabel !== "No Min" &&
                                    <li 
                                        data-value={0} 
                                        onClick={(e) => {setValue(e, "minBeds", setBedroomsLabel, "No Minimum")}}                                     
                                        className={styles.list_item_open}
                                    >
                                        <span className={styles.li_element_wide_viewport}>No Minimum</span>
                                        <span className={styles.li_element_short_viewport}>No Min</span>
                                    </li>
                                }
                                {bedroomValues.map(value => (
                                    <li 
                                        key={value} 
                                        data-value={value} 
                                        onClick={(e) => {setValue(e, "minBeds", setBedroomsLabel, "No Minimum")}}  
                                        className={styles.list_item_open}
                                    >
                                        {value}
                                    </li>
                                ))}
                            </ul>
                        }                
                    </div>
                </div>
                <div className={styles.bathrooms_container}>
                    <label 
                        htmlFor="min_bathrooms" 
                        className={`${styles.label_font} ${styles.bathroom_label} ${styles.label_wide_viewport}`}
                    > 
                        Bathrooms: 
                    </label>
                    <label 
                        htmlFor="min_bathrooms"
                        className={styles.label_short_viewport}
                        aria-label="Minimum number of bathrooms"
                    >
                        <PiToilet className={styles.react_icon_format} />
                    </label>
                    <span id="bathroom_hint" className={styles.sr_content}>Minimum number of bathrooms you require.</span>
                    <div 
                        ref={bathroomsRef}
                        className={styles.bathrooms_wrapper}
                    >
                        {!bathroomsDropdown ? 
                            <ul
                                id="min_bathrooms"
                                onClick = {() => showDropdown(setBathroomsDropdown)}
                                aria-describedby="bathroom_hint"
                                className={styles.second_row_container_closed}
                            >
                                <li 
                                    data-value={propData.minBaths} 
                                    className={styles.list_item_closed}
                                >
                                    {bathroomsLabel !== "No Minimum" && bathroomsLabel !== "No Min" ? 
                                        bathroomsLabel
                                    :
                                        <>
                                            <span className={styles.li_element_wide_viewport}>No Minimum</span>
                                            <span className={styles.li_element_short_viewport}>No Min</span>                                    
                                        </> 
                                    }
                                    <MdArrowDropDown className={styles.react_icon_down_arrow}/>              
                                </li>
                            </ul>
                        :                    
                            <ul
                                id="min_bathrooms"
                                onClick = {() => showDropdown(setBathroomsDropdown)}
                                aria-describedby="bathroom_hint"
                                className={styles.second_row_container_open}
                            >
                                <li 
                                    data-value={propData.minBaths} 
                                    className={styles.list_item_open}
                                >
                                    {bathroomsLabel !== "No Minimum" && bathroomsLabel !== "No Min" ? 
                                        bathroomsLabel
                                    :
                                        <>
                                            <span className={styles.li_element_wide_viewport}>No Minimum</span>
                                            <span className={styles.li_element_short_viewport}>No Min</span>                                    
                                        </> 
                                    }
                                </li>
                                {bathroomsLabel !== "No Minimum" && bathroomsLabel !== "No Min" &&
                                    <li 
                                        data-value={0} 
                                        onClick={(e) => {setValue(e, "minBaths", setBathroomsLabel, "No Minimum")}}
                                        className={styles.list_item_open}
                                    >
                                        <span className={styles.li_element_wide_viewport}>No Minimum</span>
                                        <span className={styles.li_element_short_viewport}>No Min</span>
                                    </li>
                                }
                                {bathroomValues.map(value => (
                                    <li 
                                        key={value} 
                                        data-value={value}
                                        onClick={(e) => {setValue(e, "minBaths", setBathroomsLabel, "No Minimum")}}
                                        className={styles.list_item_open}
                                    >
                                        {value}
                                    </li>
                                ))}
                            </ul>
                        }
                    </div>
                </div>
                <div className={styles.furniture_container}>
                    <label 
                        htmlFor="furniture" 
                        className={`${styles.label_font} ${styles.furniture_label} ${styles.label_wide_viewport}`}
                    > 
                        Furnishing: 
                    </label>
                    <label 
                        htmlFor="furniture"
                        className={styles.label_short_viewport}
                        aria-label="Type of furnishing"
                    >
                        <RiArchiveDrawerLine className={styles.react_icon_format} />
                    </label>
                    <div 
                        ref={furnitureRef}
                        className={styles.furniture_wrapper}
                    >
                        {!furnitureDropdown ?
                            <ul 
                                id="furniture"
                                onClick = {() => showDropdown(setFurnitureDropdown)}
                                className={styles.second_row_container_closed}
                            >
                                <li 
                                    data-value = {propData.furniture} 
                                    className={styles.list_item_closed}
                                >
                                    {furnitureLabel} <MdArrowDropDown className={styles.react_icon_down_arrow}/>              
                                </li>    
                            </ul>
                        :                        
                            <ul 
                                id="furniture"
                                onClick = {() => showDropdown(setFurnitureDropdown)}
                                className={styles.second_row_container_open}
                            >
                                <li 
                                    data-value = {propData.furniture}
                                    className={styles.list_item_open}
                                >
                                    {furnitureLabel}
                                </li>
                                {furnitureLabel !== "Any" && 
                                    <li 
                                        data-value = {""} 
                                        onClick={(e) => {setValue(e, "furniture", setFurnitureLabel, "Any")}} 
                                        className={styles.list_item_open}
                                    >
                                        Any
                                    </li>
                                }
                                {furnitureValues.map(value => (
                                    <li 
                                        key={value} 
                                        data-value={value}
                                        onClick={(e) => {setValue(e, "furniture", setFurnitureLabel, "Any")}} 
                                        className={styles.list_item_open}
                                    >
                                        {value}
                                    </li>
                                ))}  
                            </ul>
                        }                    
                    </div>
                </div>
                <button type="submit" className={styles.search_button}>Search</button>
            </div>
        </form>
    )
}

export default PropertySearchPageSearchBar; 