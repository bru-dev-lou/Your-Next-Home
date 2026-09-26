import { useState, useRef, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import styles from "../public/homepage_searchbar_comp.module.css";

type HomePageErrorMessageFunction = {
    setLocationErrorMessage: (message: string) => void;
} 

const budgetValues = Array.from({length : 16}, (_, i) => (i + 5) * 100);

function HomePageSearchBar( {setLocationErrorMessage} : HomePageErrorMessageFunction ) {
    const [ autoCompleteQuery, setAutoCompleteQuery ] = useState("");
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(true); 

    const [ citySuggestions, setCitySuggestions ] = useState<{ city: string }[]>([]);
    const [ maxPrice, setMaxPrice ] = useState(99999);
    const [ maxPriceLabel, setMaxPriceLabel ] = useState("No Maximum");
    const [ budgetDropdown, setBudgetDropdown ] = useState<boolean>(false); 
    
    const navigate = useNavigate();

    // Error Message → AC = Auto Complete 

    const [errorMessageAC, setErrorMessageAC] = useState(""); 
    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null> (null);


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
                const res = await fetch(`/api/cities?city=${autoCompleteQuery}`);
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

                else if (citySuggestions.some(query => query.city.toLowerCase() === autoCompleteQuery.toLowerCase())){
                    setCitySuggestions([]);
                }

                else {
                    setCitySuggestions(result.cities);
                    setErrorMessageAC("");
                }
            }

            catch(error) {
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
        setMaxPriceLabel(e.currentTarget.textContent || "No Maximum");
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

    return (
        <div>
            <form onSubmit={propertySearch}>
                <div className={styles.main_container}>
                    <div className={styles.location_container}>
                        <label htmlFor="location_selection" className={styles.label}> Location: </label>
                        <input
                            id="location_selection"
                            type="text"
                            value={autoCompleteQuery}
                            onChange={(e) => {
                                const validCity = e.target.value.replace(/[^a-zA-Z- ]/g, "");
                                setAutoCompleteQuery(validCity);
                                setAutoCompleteQueryClicked(false); 
                            }}
                            placeholder = " e.g. London"
                            aria-describedby="location_hint"
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
                                <li role="alert" className={`${styles.ac_error_message} ${styles.autocomplete_item}`}>
                                    {errorMessageAC}
                                </li>
                            }
                        </ul>
                    </div>
                    {!budgetDropdown ?
                        <div className={styles.budget_container}> 
                            <label htmlFor= "max_price" className={styles.label}> Budget: </label>
                            <ul 
                                id="max_price"
                                onClick = {showBudget}
                                className={styles.budget_container_closed}
                            >
                                <li 
                                    data-value= {maxPrice} 
                                    className={styles.budget_item_closed}
                                >
                                    {maxPriceLabel}
                                </li>
                            </ul>  
                            <button type="submit" className={styles.search_button}> Search </button>
                        </div>
                    :                        
                        <div className={styles.budget_container}>
                            <label htmlFor= "max_price" className={styles.label}> Budget: </label>
                            <ul id="max_price" onClick = {showBudget} className={styles.budget_container_open}>
                                <li data-value= {maxPrice} className={styles.budget_item}>{maxPriceLabel}</li>
                                {maxPriceLabel !== "No Maximum" && 
                                    <li 
                                        data-value={99999} 
                                        onClick={setBudget} 
                                        className={styles.budget_item}
                                    > 
                                        No Maximum 
                                    </li>
                                }
                                {budgetValues.map(value => (
                                <li 
                                    key={value} 
                                    data-value={value} 
                                    onClick={setBudget}
                                    className={styles.budget_item}
                                > 
                                    £{value.toLocaleString()}PCM
                                </li>
                                ))}
                            </ul>                              
                            <button type="submit" className={styles.search_button}> Search </button>                                    
                        </div>        
                    }
                </div>
            </form>
        </div>
    );
}

export default HomePageSearchBar;