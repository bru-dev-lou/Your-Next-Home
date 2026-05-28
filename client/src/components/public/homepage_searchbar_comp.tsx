import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

function HomePageSearchBar() {
    const [autoCompleteQueries, setAutoCompleteQueries] = useState<{city: string}[]>([]);
    const [autoCompleteQueryClicked, setAutoCompleteQueryClicked] = useState(false); 


    const [city, setCity] = useState("");
    const [maxPrice, setMaxPrice] = useState(10000);
    
    const navigate = useNavigate();
    

    // Error Message → AC = Auto Complete 

    const [errorMessageAC, setErrorMessageAC] = useState(""); 

    useEffect(() => {
        const fetchAutoComplete = async () => {
            try {

                const res = await fetch(`/api/cities?city=${city}`);
                const result = await res.json();

                if (!res.ok) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC(result.error) 
                }

                else if(city.length === 0) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC("");
                }

                else {
                    setAutoCompleteQueries(result.cities);
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

        setTimeout(() => {
            fetchAutoComplete();
        }, 250);
    
        
    }, [city, autoCompleteQueryClicked]);
        

    const propertySearch = (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/search?city=${city}&maxPrice=${maxPrice}`);
    };

    return (
        <div>
            <form onSubmit={propertySearch}>
            <label htmlFor = "citySelectHomePage"> Location: </label>
                <input
                    id = "citySelectHomePage"
                    name="city"
                    type="text"
                    placeholder = "London"
                    value= {city}
                    onChange={(e) => {
                        setCity(e.target.value),
                        setAutoCompleteQueryClicked(false)
                        }}
                />
            <label htmlFor= "maxPriceHomePage"> Max Price </label>
            <select 
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
            <ul> 
                {errorMessageAC ? 
                        errorMessageAC 
                    : 
                        autoCompleteQueries.map((query, index) => (
                        <li 
                            key={index}
                            onClick = {() => {
                                setCity(query.city),
                                setAutoCompleteQueries([]),
                                setAutoCompleteQueryClicked(true)}}
                                style = {{ cursor: "pointer"}}
                            >
                            {query.city}
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}

export default HomePageSearchBar;