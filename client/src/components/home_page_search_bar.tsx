import { useState, type JSX, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

function HomePageSearchBar(): JSX.Element {
    const [query, setQuery] = useState('');
    const [cities, setCities] = useState<{ city: string }[]>([]);
    const [maxPrice, setMaxPrice] = useState(10000);
    const navigate = useNavigate();



    useEffect(() => {
        if (query.length === 0) {
            setCities([]);
            return;
        }

        const fetchCity = async () => {
            const res = await fetch("/api/cities?city=" + query);
            const data = await res.json();
            setCities(data.cities);
        };

    const timeout = setTimeout(() => {
        fetchCity();
    }, 250);

    return () => clearTimeout(timeout);

    }, [query]);

    const buttonSearch = (e:any) => {
        e.preventDefault();
        navigate(`/search?city=${query}&maxPrice=${maxPrice}`);
    };

    return (
        <div>
            <form onSubmit={buttonSearch}>
            <label htmlFor = "citySelectHomePage">Location</label>
                <input
                    id = "citySelectHomePage"
                    name="city"
                    type="text"
                    placeholder = "London"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
                {cities.map((city, index) => (
                    <li 
                        key={index}
                        onClick = {() => setQuery(city.city)}
                        style = {{ cursor: "pointer"}}
                        >
                        {city.city}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HomePageSearchBar;

/// Add CSS italics to input 