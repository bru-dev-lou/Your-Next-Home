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
    const [ maxPriceLabel, setMaxPriceLabel ] = useState("No Max");


    const [ bedroomsDropdown, setBedroomsDropdown ] = useState<boolean>(false); 
    const [ bedroomsLabel, setBedroomsLabel ] = useState("No Min"); 


    const [ bathroomsDropdown, setBathroomsDropdown ] = useState<boolean>(false); 
    const [ bathroomsLabel, setBathroomsLabel ] = useState("No Min");


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
        <div className={styles.main_container}>
            <form onSubmit={buttonSearch}>
                <div className={styles.first_row_container}>
                    <label htmlFor ="location" className={`${styles.h2_font} ${styles.location_label}`}> Location: </label>
                    <input 
                        id="location"
                        type = "text"
                        value = {propData.city}
                        onChange = {(e) => {
                            setPropData({...propData, city: e.target.value});
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
                    </ul>
                    {errorMessageAC && 
                        <div role="alert">
                            <h3>{errorMessageAC}</h3>
                        </div>
                    }
                    <label htmlFor ="property_type" className={` ${styles.h2_font} ${styles.property_type_label}`}> Property Type: </label>
                    {propertyTypeDropdown ? 
                        <ul 
                            id="property_type"
                            onClick ={() => showDropdown(setPropertyTypeDropdown)}
                            className={styles.property_type_container_open}
                        >
                            <li 
                                data-value={propData.type} 
                                className={styles.item_format}
                            >
                                {propertyTypeLabel}
                            </li>
                            {propertyTypeLabel !== "Show all" &&  
                                <li 
                                    data-value="" 
                                    onClick={(e) => {setValue(e, "type", setPropertyTypeLabel, "Show all" )}} 
                                    className={styles.item_format}
                                >
                                    Show all
                                </li>
                            }
                            {propertyTypeValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={(e) => {setValue(e, "type", setPropertyTypeLabel, "Show all" )}} 
                                    className={styles.item_format}
                                >
                                    {value}
                                </li>
                            ))}
                        </ul>            
                    :
                        <ul
                            id="property_type"
                            onClick ={() => showDropdown(setPropertyTypeDropdown)}
                            className={styles.property_type_container_closed}
                        >
                            <li 
                                data-value={propertyTypeLabel} 
                                className={styles.item_format}
                            >
                                {propertyTypeLabel}
                            </li>
                        </ul>
                    }
                    <label htmlFor= "max_price" className={`${styles.budget_label} ${styles.h2_font}`}> Budget: </label>
                    {budgetDropdown ?
                        <ul 
                            id="max_price" 
                            onClick = {() => showDropdown(setBudgetDropdown)} 
                            className={styles.budget_container_open}
                        >
                            <li 
                                data-value= {propData.maxPrice} 
                                className={styles.item_format}
                            >
                                {maxPriceLabel}
                            </li>
                            {maxPriceLabel !== "No Max" && 
                                <li 
                                    data-value={10000} 
                                    onClick={(e) => {setValue(e, "maxPrice", setMaxPriceLabel, "No Max")}} 
                                    className={styles.item_format}
                                > 
                                    No Max 
                                </li>
                            }
                            {budgetValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={(e) => {setValue(e, "maxPrice", setMaxPriceLabel, "No Max")}} 
                                    className={styles.item_format}
                                > 
                                    £{value.toLocaleString()}PCM
                                </li>
                            ))}
                        </ul>                              
                    :
                        <ul 
                            id="max_price"
                            onClick = {() => showDropdown(setBudgetDropdown)} 
                            className={styles.budget_container_closed}
                        >
                            <li 
                                data-value={propData.maxPrice} 
                                className={styles.item_format}
                            >
                                {maxPriceLabel}
                            </li>
                        </ul>  
                    }
                </div>
                <div className={styles.second_row_container}>
                    <label htmlFor ="min_bedrooms" className={`${styles.h2_font} ${styles.bedrooms_label}`}> Bedrooms: </label>
                    {bedroomsDropdown ? 
                        <ul
                            id="min_bedrooms"
                            onClick = {() => showDropdown(setBedroomsDropdown)} 
                            aria-describedby="bedroom_hint"
                            className={styles.bedrooms_container_open}
                        >
                            <li 
                                data-value={propData.minBeds} 
                                className={styles.item_format}
                            >
                                {bedroomsLabel}
                            </li>
                            {bedroomsLabel !== "No Min" && 
                                <li 
                                    data-value={0} 
                                    onClick={(e) => {setValue(e, "minBeds", setBedroomsLabel, "No Min")}}                                     
                                    className={styles.item_format}
                                >
                                    No Min
                                </li>
                            }
                            {bedroomValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={(e) => {setValue(e, "minBeds", setBedroomsLabel, "No Min")}}  
                                    className={styles.item_format}
                                >
                                    {value}
                                </li>
                            ))}
                        </ul>
                    :
                        <ul
                            id="min_bedrooms"
                            onClick = {() => showDropdown(setBedroomsDropdown)}
                            aria-describedby="bedroom_hint"
                            className={styles.bedrooms_container_closed}
                        >
                            <li 
                                data-value= {propData.minBeds} 
                                className={styles.item_format}
                            >
                                {bedroomsLabel}
                            </li>      
                        </ul>
                    }              
                        <span id="bedroom_hint" className={styles.sr_content}>Minimum number of bedrooms you require.</span>
                        <label htmlFor = "min_bathrooms" className={`${styles.h2_font} ${styles.bathroom_label}`}> Bathrooms: </label>
                    {bathroomsDropdown ? 
                        <ul
                            id="min_bathrooms"
                            onClick = {() => showDropdown(setBathroomsDropdown)}
                            aria-describedby="bathroom_hint"
                            className={styles.bathrooms_container_open}
                        >
                            <li 
                                data-value={propData.minBaths} 
                                className={styles.item_format}
                            >
                                {bathroomsLabel}
                            </li>
                            {bathroomsLabel !== "No Min" &&
                                <li 
                                    data-value={0} 
                                    onClick={(e) => {setValue(e, "minBaths", setBathroomsLabel, "No Min")}}
                                    className={styles.item_format}
                                >
                                    No Min
                                </li>
                            }
                            {bathroomValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value}
                                    onClick={(e) => {setValue(e, "minBaths", setBathroomsLabel, "No Min")}}
                                    className={styles.item_format}
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
                                className={styles.item_format}
                            >
                                {bathroomsLabel}
                            </li>
                        </ul>
                    }
                        <span id="bathroom_hint" className={styles.sr_content}>Minimum number of bathrooms you require.</span>
                        <label htmlFor = "furniture" className={`${styles.h2_font} ${styles.furniture_label}`}> Furnishing: </label>
                    { furnitureDropdown ?
                        <ul 
                            id="furniture"
                            onClick = {() => showDropdown(setFurnitureDropdown)}
                            className={styles.furniture_container_open}
                        >
                            <li 
                                data-value = {propData.furniture}
                                className={styles.item_format}
                            >
                                {furnitureLabel}
                            </li>
                            {furnitureLabel !== "Any" && 
                                <li 
                                    data-value = {""} 
                                    onClick={(e) => {setValue(e, "furniture", setFurnitureLabel, "Any")}} 
                                    className={styles.item_format}
                                >
                                    Any
                                </li>
                            }
                            {furnitureValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value}
                                    onClick={(e) => {setValue(e, "furniture", setFurnitureLabel, "Any")}} 
                                    className={styles.item_format}
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
                                className={styles.item_format}
                            >
                                {furnitureLabel}
                            </li>    
                        </ul>
                    }                    
                    <button type="submit" className={styles.search_button}>Search</button>
                </div>
            </form>
        </div>
    )
}

export default PropertySearchPageSearchBar; 