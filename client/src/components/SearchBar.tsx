import { useState, type JSX, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

function SearchBar(): JSX.Element {
    const [query, setQuery] = useState('');
    const [cities, setCities] = useState<{ city: string }[]>([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000000);
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

    const buttonSearch = () => {
        navigate(`/search?city=${query}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
    }

    return (
        <div>
            <input
                name="city"
                type="text"
                placeholder="Location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <input
                type="text"
                min="0"
                max="1000000"
                placeholder = "Minimum Price"
                onChange={(e) => setMinPrice(Number(e.target.value))}
            />
            <input
                type="text"
                min="0"
                max="1000000"
                placeholder = "Maximum Price"
                onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <button onClick={buttonSearch}> Search </button>
            <ul>
                {cities.map((city, index) => (
                    <li key={index}>{city.city}</li>
                ))}
            </ul>
        </div>
    );
}

export default SearchBar;
