import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import styles from "../public/homepage_searchbar_comp.module.css";

function HomePageSearchBar() {
    const [ autoCompleteQuery, setAutoCompleteQuery ] = useState("");
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(true); 

    const [ citySuggestions, setCitySuggestions ] = useState<{ city: string }[]>([]);
    const [ maxPrice, setMaxPrice ] = useState(10000);
    const [ maxPriceLabel, setMaxPriceLabel ] = useState(" No Max ");
    const [ budgetDropdown, setBudgetDropdown ] = useState<boolean>(false); 
    
    const navigate = useNavigate();

    // Error Message → AC = Auto Complete 

    const [errorMessageAC, setErrorMessageAC] = useState(""); 

    useEffect(() => {
        const fetchCity = async () => {
            try {
                const res = await fetch(`/api/cities?city=${autoCompleteQuery}`);
                const result = await res.json();

                if (!res.ok) {
                    setCitySuggestions([]);
                    setErrorMessageAC(result.error);
                    setTimeout(() => {
                        setErrorMessageAC("");
                    }, 750)
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
        setMaxPriceLabel(e.currentTarget.textContent || "No Max");
    }

    const propertySearch = (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/search?city=${autoCompleteQuery}&maxPrice=${maxPrice}`);
    };

    return (
        <div>
            <form onSubmit={propertySearch}>
                <div className={styles.first_row_container}>
                    <label htmlFor="location_selection" className={styles.label}> Location: </label>
                        <input
                            id="location_selection"
                            type="text"
                            value={autoCompleteQuery}
                            onChange={(e) => {
                                const validCity = e.target.value.replace(/[^a-zA-Z-]/g, "");
                                setAutoCompleteQuery(validCity);
                                setAutoCompleteQueryClicked(false); 
                            }}
                            placeholder = " e.g. London"
                            aria-describedby="location_hint"
                            className= {styles.location_input}
                        />
                    <span id="location_hint" className={styles.sr_content}>Insert a city name to see properties for rent in that area.</span>
                </div>
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
                { budgetDropdown ?
                    <div className={styles.second_row_container}>
                        <label htmlFor= "max_price" className={styles.label}> Budget: </label>
                        <ul id="max_price" onClick = {showBudget} className={styles.budget_container_open}>
                            <li data-value= {maxPrice} className={styles.budget_item}>{maxPriceLabel}</li>
                            {maxPriceLabel !== " No Max " && 
                                <li data-value={10000} onClick={setBudget} className={styles.budget_item}> No Max </li>
                            }
                            <li data-value = "500" onClick={setBudget} className={styles.budget_item}> £500 PCM </li>
                            <li data-value = "600" onClick={setBudget} className={styles.budget_item}> £600 PCM </li>
                            <li data-value = "700" onClick={setBudget} className={styles.budget_item}> £700 PCM </li>
                            <li data-value = "800" onClick={setBudget} className={styles.budget_item}> £800 PCM </li>
                            <li data-value = "900" onClick={setBudget} className={styles.budget_item}> £900 PCM </li>
                            <li data-value = "1000" onClick={setBudget} className={styles.budget_item}> £1,000 PCM </li>
                            <li data-value = "1100" onClick={setBudget} className={styles.budget_item}> £1,100 PCM </li>
                            <li data-value = "1200" onClick={setBudget} className={styles.budget_item}> £1,200 PCM </li>
                            <li data-value = "1300" onClick={setBudget} className={styles.budget_item}> £1,300 PCM </li>
                            <li data-value = "1400" onClick={setBudget} className={styles.budget_item}> £1,400 PCM </li>
                            <li data-value = "1500" onClick={setBudget} className={styles.budget_item}> £1,500 PCM </li>
                            <li data-value = "1600" onClick={setBudget} className={styles.budget_item}> £1,600 PCM </li>
                            <li data-value = "1700" onClick={setBudget} className={styles.budget_item}> £1,700 PCM </li>
                            <li data-value = "1800" onClick={setBudget} className={styles.budget_item}> £1,800 PCM </li>
                            <li data-value = "1900" onClick={setBudget} className={styles.budget_item}> £1,900 PCM </li>
                            <li data-value = "2000" onClick={setBudget} className={styles.budget_item}> £2,000 PCM </li>
                        </ul>                              
                        <button type="submit" className={styles.search_button}> Search </button>        
                    </div>
                :
                    <div>
                        <div className={styles.second_row_container}> 
                            <label htmlFor= "max_price" className={styles.label}> Budget: </label>
                            <ul 
                                id="max_price"
                                onClick = {showBudget}
                                className={styles.budget_container_closed}
                                >
                                    <li data-vale= {maxPrice} className={styles.budget_item}>{maxPriceLabel}</li>
                            </ul>  
                            <button type="submit" className={styles.search_button}> Search </button>
                        </div>
                    </div>
                }
            </form>
        </div>
    );
}

export default HomePageSearchBar;