import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

function HomePageSearchBar() {
    const [ autoCompleteQuery, setAutoCompleteQuery ] = useState("");

    const [ cities, setCities ] = useState<{ city: string }[]>([]);
    const [ maxPrice, setMaxPrice ] = useState(10000);
    
    const navigate = useNavigate();

    // Error Message → AC = Auto Complete 

    const [errorMessageAC, setErrorMessageAC] = useState(""); 

    useEffect(() => {
        const fetchCity = async () => {
            try {
                const res = await fetch(`/api/cities?city=${autoCompleteQuery}`);
                const result = await res.json();

                if (!res.ok) {
                    setCities([]);
                    setErrorMessageAC(result.error);
                }

                else if(autoCompleteQuery.length === 0) {
                    setCities([]);
                    setErrorMessageAC("");
                }

                else {
                    setCities(result.cities);
                    setErrorMessageAC("");
                }
            }

            catch(error) {
                setErrorMessageAC("AutoComplete feature currently unavailable.");
            }
        };
            
        const timeout = setTimeout(() => {
            fetchCity();
        }, 250);
    
        return () => clearTimeout(timeout);
        
    }, [autoCompleteQuery]);
        

    const propertySearch = (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/search?city=${autoCompleteQuery}&maxPrice=${maxPrice}`);
    };

    return (
        <div>
            <form onSubmit={propertySearch}>
                <label htmlFor="location_selection"> Location: </label>
                    <input
                        id="location_selection"
                        type="text"
                        value={autoCompleteQuery}
                        onChange={(e) => setAutoCompleteQuery(e.target.value)}
                        placeholder = "London"
                        aria-describedby="location_hint"
                    />
                    <span id="location_hint" className="hidden-content">Insert a city name to see properties for rent in that area.</span>
                <label htmlFor= "max_price"> Max Price: </label>
                    <select 
                        id="max_price"
                        onChange = {(e) => setMaxPrice(Number(e.target.value))}>
                            <option value = {10000} > No Max </option>
                            <option value = "500"> $500 PCM </option>
                            <option value = "600"> $600 PCM </option>
                            <option value = "700"> $700 PCM </option>
                            <option value = "800"> $800 PCM </option>
                            <option value = "900"> $900 PCM </option>
                            <option value = "1000"> $1,000 PCM </option>
                            <option value = "1100"> $1,100 PCM </option>
                            <option value = "1200"> $1,200 PCM </option>
                            <option value = "1300"> $1,300 PCM </option>
                            <option value = "1400"> $1,400 PCM </option>
                            <option value = "1500"> $1,500 PCM </option>
                            <option value = "1600"> $1,600 PCM </option>
                            <option value = "1700"> $1,700 PCM </option>
                            <option value = "1800"> $1,800 PCM </option>
                            <option value = "1900"> $1,900 PCM </option>
                            <option value = "2000"> $2,000 PCM </option>
                    </select>
                <button type="submit"> Search </button>
            </form>
            <ul role="listbox" aria-live="polite" aria-label="City autocomplete suggestions based on user input.">
                {cities.map((city, index) => (
                    <li 
                        key={index}
                        onClick = {() => setAutoCompleteQuery(city.city)}
                        style = {{ cursor: "pointer"}}
                        role="option"
                        aria-label={`Select ${city.city}`}
                        >
                        {city.city}
                    </li>
                ))}
            </ul>
            {errorMessageAC && <h3 role="alert">{errorMessageAC}</h3>}
        </div>
    );
}

export default HomePageSearchBar;