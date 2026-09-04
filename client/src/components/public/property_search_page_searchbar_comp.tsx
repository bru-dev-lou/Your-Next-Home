import { useEffect, useState } from "react"; 
import { useSearchParams, useNavigate } from "react-router-dom"; 
import styles from "./property_search_page_searchbar_comp.module.css";


type PropertyData = {
    city: string;
    type: string;
    maxPrice: number;
    minBeds: number;
    minBaths: number; 
    furniture: string;
}

type FilterValue = {
    sortBy: string;
}

const propertyTypeValues = ["Apartment", "Terraced", "Semi-Detached", "Detached", "Bungalow"];
const budgetValues = Array.from({length : 16}, (_, i) => (i + 5) * 100);
const bedroomValues = [1, 2, 3, 4, 5];
const bathroomValues = [1, 2, 3, 4, 5];
const furnitureValues = ["Furnished", "Semi-Furnished", "Unfurnished"];


function PropertySearchPageSearchBar ({sortBy} : FilterValue) {
    const navigate = useNavigate();     
    const [ params ] = useSearchParams();
    
    const cityDefault = params.get("city") || "";
    const [ propData, setPropData ] = useState<PropertyData>({city: cityDefault, type: "", furniture: "", minBeds: 0, minBaths: 0, maxPrice: 100000});
    
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

    useEffect(() => {
        const fetchAutoComplete = async () => {
            try {
                const res = await fetch(`/api/cities?city=${propData.city}`);
                const result = await res.json();
  
                if (!res.ok) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC(result.error); 
                    setTimeout(() => {
                        setErrorMessageAC("");
                    }, 750)
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

        setLabel(e.currentTarget.textContent || defaultValue)

    } 


    const buttonSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/search?city=${propData.city}&type=${propData.type}&furniture=${propData.furniture}&minBeds=${propData.minBeds}&minBaths=${propData.minBaths}&maxPrice=${propData.maxPrice}&sortBy=${sortBy}`);
    };

    return (
        <form 
            onSubmit={buttonSearch}
            className={styles.main_container}
        >
            <div className={styles.first_row_container}>
                <div className={styles.location_container}>
                    <label htmlFor ="location" className={`${styles.h2_font} ${styles.location_label}`}> Location: </label>
                    <input 
                        id="location"
                        type = "text"
                        value = {propData.city}
                        onChange = {(e) => {
                            const validCity = e.target.value.replace(/[^a-zA-Z-]/g, "");
                            setPropData({...propData, city: validCity});
                            setAutoCompleteQueryClicked(false);
                        }}   
                        placeholder = "Enter your preferred location" 
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
                            <li role="alert" className={`${styles.ac_error_message} ${styles.autocomplete_item}`}>
                                {errorMessageAC}
                            </li>
                        }                        
                    </ul>
                </div> 
                <div className={styles.property_type_container}>
                    <label htmlFor ="property_type" className={` ${styles.h2_font} ${styles.property_type_label}`}> Property Type: </label>
                    {!propertyTypeDropdown ? 
                        <ul
                            id="property_type"
                            onClick ={() => showDropdown(setPropertyTypeDropdown)}
                            className={styles.property_type_container_closed}
                        >
                            <li 
                                data-value={propertyTypeLabel} 
                                className={styles.generic_list_item_format}
                            >
                                {propertyTypeLabel}
                            </li>
                        </ul>
                    :                        
                        <ul 
                            id="property_type"
                            onClick ={() => showDropdown(setPropertyTypeDropdown)}
                            className={styles.property_type_container_open}
                        >
                            <li 
                                data-value={propData.type} 
                                className={styles.generic_list_item_format}
                            >
                                {propertyTypeLabel}
                            </li>
                            {propertyTypeLabel !== "Show all" &&  
                                <li 
                                    data-value="" 
                                    onClick={(e) => {setValue(e, "type", setPropertyTypeLabel, "Show all" )}} 
                                    className={styles.generic_list_item_format}
                                >
                                    Show all
                                </li>
                            }
                            {propertyTypeValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={(e) => {setValue(e, "type", setPropertyTypeLabel, "Show all" )}} 
                                    className={styles.generic_list_item_format}
                                >
                                    {value}
                                </li>
                            ))}
                        </ul>            
                    }
                </div>
                <div className={styles.budget_container}>
                    <label htmlFor= "max_price" className={`${styles.budget_label} ${styles.h2_font}`}> Budget: </label>
                    {!budgetDropdown ?
                        <ul 
                            id="max_price"
                            onClick = {() => showDropdown(setBudgetDropdown)} 
                            className={styles.budget_container_closed}
                        >
                            <li 
                                data-value={propData.maxPrice} 
                                className={styles.generic_list_item_format}
                            >
                                {maxPriceLabel}
                            </li>
                        </ul>  
                    :                    
                        <ul 
                            id="max_price" 
                            onClick = {() => showDropdown(setBudgetDropdown)} 
                            className={styles.budget_container_open}
                        >
                            <li 
                                data-value= {propData.maxPrice} 
                                className={styles.generic_list_item_format}
                            >
                                {maxPriceLabel}
                            </li>
                            {maxPriceLabel !== "No Maximum" && 
                                <li 
                                    data-value={10000} 
                                    onClick={(e) => {setValue(e, "maxPrice", setMaxPriceLabel, "No Maximum")}} 
                                    className={styles.generic_list_item_format}
                                > 
                                    No Maximum 
                                </li>
                            }
                            {budgetValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={(e) => {setValue(e, "maxPrice", setMaxPriceLabel, "No Maximum")}} 
                                    className={styles.generic_list_item_format}
                                > 
                                    £{value.toLocaleString()}PCM
                                </li>
                            ))}
                        </ul>                              
                    }
                </div>
            </div>
            <div className={styles.second_row_container}>
                <div className={styles.bedrooms_container}>
                    <label htmlFor ="min_bedrooms" className={`${styles.h2_font} ${styles.bedrooms_label}`}> Bedrooms: </label>
                    <span id="bedroom_hint" className={styles.sr_content}>Minimum number of bedrooms you require.</span>
                    {!bedroomsDropdown ? 
                        <ul 
                            id="min_bedrooms"
                            onClick = {() => showDropdown(setBedroomsDropdown)}
                            aria-describedby="bedroom_hint"
                            className={styles.bedrooms_container_closed}
                        >
                            <li 
                                data-value= {propData.minBeds} 
                                className={styles.generic_list_item_format}
                            >
                                {bedroomsLabel}
                            </li>      
                        </ul>
                    :                        
                        <ul
                            id="min_bedrooms"
                            onClick = {() => showDropdown(setBedroomsDropdown)} 
                            aria-describedby="bedroom_hint"
                            className={styles.bedrooms_container_open}
                        >
                            <li 
                                data-value={propData.minBeds} 
                                className={styles.generic_list_item_format}
                            >
                                {bedroomsLabel}
                            </li>
                            {bedroomsLabel !== "No Minimum" && 
                                <li 
                                    data-value={0} 
                                    onClick={(e) => {setValue(e, "minBeds", setBedroomsLabel, "No Minimum")}}                                     
                                    className={styles.generic_list_item_format}
                                >
                                    No Minimum
                                </li>
                            }
                            {bedroomValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={(e) => {setValue(e, "minBeds", setBedroomsLabel, "No Minimum")}}  
                                    className={styles.generic_list_item_format}
                                >
                                    {value}
                                </li>
                            ))}
                        </ul>
                    }                
                </div>
                <div className={styles.bathrooms_container}>
                    <label htmlFor = "min_bathrooms" className={`${styles.h2_font} ${styles.bathroom_label}`}> Bathrooms: </label>
                    <span id="bathroom_hint" className={styles.sr_content}>Minimum number of bathrooms you require.</span>
                    {bathroomsDropdown ? 
                        <ul
                            id="min_bathrooms"
                            onClick = {() => showDropdown(setBathroomsDropdown)}
                            aria-describedby="bathroom_hint"
                            className={styles.bathrooms_container_open}
                        >
                            <li 
                                data-value={propData.minBaths} 
                                className={styles.generic_list_item_format}
                            >
                                {bathroomsLabel}
                            </li>
                            {bathroomsLabel !== "No Minimum" &&
                                <li 
                                    data-value={0} 
                                    onClick={(e) => {setValue(e, "minBaths", setBathroomsLabel, "No Minimum")}}
                                    className={styles.generic_list_item_format}
                                >
                                    No Minimum
                                </li>
                            }
                            {bathroomValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value}
                                    onClick={(e) => {setValue(e, "minBaths", setBathroomsLabel, "No Minimum")}}
                                    className={styles.generic_list_item_format}
                                >
                                    {value}
                                </li>
                            ))}
                        </ul>
                    :
                        <ul
                            id="min_bathrooms"
                            onClick = {() => showDropdown(setBathroomsDropdown)}
                            aria-describedby="bathroom_hint"
                            className={styles.bathrooms_container_closed}
                        >
                            <li 
                                data-value={propData.minBaths} 
                                className={styles.generic_list_item_format}
                            >
                                {bathroomsLabel}
                            </li>
                        </ul>
                    }
                </div>
                <div className={styles.furniture_container}>
                    <label htmlFor = "furniture" className={`${styles.h2_font} ${styles.furniture_label}`}> Furnishing: </label>
                    { furnitureDropdown ?
                        <ul 
                            id="furniture"
                            onClick = {() => showDropdown(setFurnitureDropdown)}
                            className={styles.furniture_container_open}
                        >
                            <li 
                                data-value = {propData.furniture}
                                className={styles.generic_list_item_format}
                            >
                                {furnitureLabel}
                            </li>
                            {furnitureLabel !== "Any" && 
                                <li 
                                    data-value = {""} 
                                    onClick={(e) => {setValue(e, "furniture", setFurnitureLabel, "Any")}} 
                                    className={styles.generic_list_item_format}
                                >
                                    Any
                                </li>
                            }
                            {furnitureValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value}
                                    onClick={(e) => {setValue(e, "furniture", setFurnitureLabel, "Any")}} 
                                    className={styles.generic_list_item_format}
                                >
                                    {value}
                                </li>
                            ))}  
                        </ul>
                    :
                        <ul 
                            id="furniture"
                            onClick = {() => showDropdown(setFurnitureDropdown)}
                            className={styles.furniture_container_closed}
                        >
                            <li 
                                data-value = {propData.furniture} 
                                className={styles.generic_list_item_format}
                            >
                                {furnitureLabel}
                            </li>    
                        </ul>
                    }                    
                </div>
                <button type="submit" className={styles.search_button}>Search</button>
            </div>
        </form>
    )
}

export default PropertySearchPageSearchBar; 