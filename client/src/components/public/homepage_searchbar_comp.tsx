import { useState, useRef, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { apiFetch } from "../../api";

import styles from "../public/homepage_searchbar_comp.module.css";
import logo from "../../assets/logo_high_contrast.png";

import { MdArrowDropDown } from "react-icons/md";


const budgetValues = Array.from({length : 16}, (_, i) => (i + 5) * 100);

function HomePageSearchBar() {
    const navigate = useNavigate();

    const [ autoCompleteQuery, setAutoCompleteQuery ] = useState("");
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(true); 

    const [ citySuggestions, setCitySuggestions ] = useState<{ city: string }[]>([]);
    const [ maxPrice, setMaxPrice ] = useState(99999);
    const [ maxPriceLabel, setMaxPriceLabel ] = useState("No Maximum");
    const [ budgetDropdown, setBudgetDropdown ] = useState<boolean>(false); 

    // Error Message → AC = Auto Complete 

    const [errorMessageAC, setErrorMessageAC] = useState(""); 
    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null> (null);
    const [ locationErrorMessage, setLocationErrorMessage ] = useState(""); 

    useEffect(() => {
        const fetchCity = async () => {
            if (autoCompleteQuery.length > 50) {
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
                const res = await apiFetch(`/api/cities?city=${autoCompleteQuery}`);
                const result = await res.json();

                if (!res.ok) {
                    setCitySuggestions([]);
                    setErrorMessageAC(result.error);
                    setTimeout(() => {
                        setErrorMessageAC("");
                    }, 2000)
                }

                else if(autoCompleteQuery.length === 0) {
                    setCitySuggestions([]);
                    setErrorMessageAC("");
                }

                else if (result.cities.some(( query : {city : string})  => query.city.toLowerCase() === autoCompleteQuery.toLowerCase())){
                    setCitySuggestions([]);
                }

                else {
                    setCitySuggestions(result.cities);
                    setErrorMessageAC("");
                }
            }

            catch(error) {
                console.error(error);
                setErrorMessageAC("AutoComplete feature currently unavailable.");
            }
        };
            
        if (autoCompleteQueryClicked) {
            return;
        }

        const timeout = setTimeout(() => {
            fetchCity();
        }, 100);
    
        return () => clearTimeout(timeout);
        
    }, [autoCompleteQuery, autoCompleteQueryClicked]);
        
    const showBudget = () => {
        setBudgetDropdown(!budgetDropdown);
    }

    const setBudget = (e : React.MouseEvent<HTMLLIElement>) => {
        setMaxPrice(Number(e.currentTarget.dataset.value)); 
        setMaxPriceLabel(e.currentTarget.innerText || "No Maximum");
    }

    const propertySearch = (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validCity = autoCompleteQuery === "" || /^[a-zA-Z\- ]+$/.test(autoCompleteQuery); 

        if (autoCompleteQuery.length > 50) {
            setLocationErrorMessage("Location must be less than 50 characters!");
            setTimeout(() => setLocationErrorMessage(""), 3000);
            return;
        }
        
        if (!validCity) {
            setLocationErrorMessage("Location must only include letters and hyphens.");
            setTimeout(() => setLocationErrorMessage(""), 3000);            
            return;
        }

        navigate(`/search?city=${autoCompleteQuery}&maxPrice=${maxPrice}`);
    };

    const autoCompleteOpen = citySuggestions.length > 0 || Boolean(errorMessageAC); 

    return (
        <div className={styles.search_box_container}>
            {locationErrorMessage ? 
                <span 
                    role="alert"
                    className={styles.error_message}
                >
                    {locationErrorMessage}
                </span>
            :
                <div className={styles.welcome_container}>
                    <span className={styles.slogan_message_wide_viewport}>Your journey starts here!</span>
                    <span className={styles.company_name_short_viewport}>
                        Your Next Home 
                        <img src={logo} className={styles.logo_img} alt="company logo"/>
                    </span>                
                </div>
            }
            <form className={styles.main_container} onSubmit={propertySearch}>
                <div className={styles.location_container}>
                    <label htmlFor="location_selection" className={styles.label_format}> Location: </label>
                    <div className={styles.input_and_autocomplete_container}>
                        <input
                            id="location_selection"
                            type="text"
                            maxLength={50}
                            value={autoCompleteQuery}
                            onChange={(e) => {
                                const validCity = e.target.value.replace(/[^a-zA-Z- ]/g, "");
                                setAutoCompleteQuery(validCity);
                                setAutoCompleteQueryClicked(false); 
                            }}
                            placeholder = "e.g. London"
                            aria-describedby="location_hint"
                            aria-expanded={autoCompleteOpen}                            
                            className= {styles.location_input}
                        />
                        <span id="location_hint" className={styles.sr_content}>Insert a city name to see properties for rent in that area.</span>
                        <ul 
                            aria-live="polite" 
                            aria-label="City autocomplete suggestions."
                            className={styles.autocomplete_container}
                        >
                            {citySuggestions.map((city, index) => (
                                <li 
                                    key={index}
                                    onClick = {() => {
                                        setAutoCompleteQuery(city.city);
                                        setCitySuggestions([]);
                                        setAutoCompleteQueryClicked(true);
                                    }}
                                    tabIndex={0}
                                    onKeyDown= { (e) => { if (e.key === "Enter") {
                                        setAutoCompleteQuery(city.city);
                                        setCitySuggestions([]);
                                        setAutoCompleteQueryClicked(true);
                                    }}}
                                    aria-label={`Select ${city.city}`}
                                    className={styles.autocomplete_item}
                                >   
                                    {city.city}
                                </li>
                            ))}
                            {errorMessageAC && 
                                <li role="alert" className={styles.ac_error_message}>
                                    {errorMessageAC}
                                </li>
                            }
                        </ul>
                    </div>
                </div>
                <div className={styles.budget_container}> 
                    <label id="max_price" className={styles.label_format}> Budget: </label>
                    <div className={styles.ul_container}>
                        <ul 
                            onClick = {showBudget}
                            aria-labelledby="max_price"
                            className={styles.budget_container_closed}
                        >
                            <li 
                                data-value= {maxPrice} 
                                className={styles.budget_item_closed}
                            >
                                {maxPriceLabel !== "No Maximum" && maxPriceLabel !== "No Max" ?
                                    maxPriceLabel
                                :
                                    <>
                                    <span className={styles.budget_item_wide_viewport}>No Maximum</span>  
                                    <span className={styles.budget_item_short_viewport}>No Max</span>                                
                                    </>
                                }
                                <MdArrowDropDown className={styles.react_icon_down_arrow}/>
                            </li>
                        </ul>  
                        {budgetDropdown &&                    
                            <ul
                                onClick = {showBudget} 
                                className={styles.budget_container_open}
                                aria-labelledby="max_price"
                            >
                                <li data-value= {maxPrice} className={styles.budget_item_open}>
                                    {maxPriceLabel !== "No Maximum" && maxPriceLabel !== "No Max" ?
                                        maxPriceLabel
                                    :
                                        <>
                                        <span className={styles.budget_item_wide_viewport}>No Maximum</span>  
                                        <span className={styles.budget_item_short_viewport}>No Max</span>                                
                                        </>
                                    }                                    
                                </li>
                                {maxPriceLabel !== "No Maximum" && maxPriceLabel !== "No Max" &&
                                    <li 
                                        data-value={99999} 
                                        onClick={setBudget} 
                                        className={styles.budget_item_open}
                                    > 
                                        <span className={styles.budget_item_wide_viewport}>No Maximum</span>  
                                        <span className={styles.budget_item_short_viewport}>No Max</span>
                                    </li>
                                }
                                {budgetValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={setBudget}
                                    className={styles.budget_item_open}
                                > 
                                    £{value.toLocaleString()} PCM
                                </li>
                                ))}
                            </ul>   
                        }                           
                    </div>
                    <button type="submit" className={styles.search_button}> Search </button>                                                            
                </div>                        
            </form>
        </div>
    );
}

export default HomePageSearchBar;