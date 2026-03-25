import { useState, type JSX, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

function HomePageSearchBar(): JSX.Element {
    const [query, setQuery] = useState('');
    const [cities, setCities] = useState<{ city: string }[]>([]);
    const [minBeds, setMinBeds] = useState(0);
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

    const buttonSearch = (e:any) => {
        e.preventDefault();
        navigate(`/search?city=${query}&minBeds=${minBeds}&maxPrice=${maxPrice}`);
    };

    return (
        <div>
            <form onSubmit={buttonSearch}>
            <input
                name="city"
                type="text"
                placeholder="Location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <select onChange={(e) => setMinBeds(Number(e.target.value))}>
                <option value="0">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
            </select>
            <input
                type="text"
                min="0"
                max="1000000"
                placeholder = "Max Price ($)"
                onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <button type="submit"> Search </button>
            </form>
            <ul>
                {cities.map((city, index) => (
                    <li key={index}>{city.city}</li>
                ))}
            </ul>
        </div>
    );
}

export default HomePageSearchBar;
