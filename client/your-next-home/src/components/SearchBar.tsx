import { useState, type JSX, useEffect } from 'react'; 

function SearchBar ():JSX.Element {
    const [query, setQuery] = useState('');
    const [cities, setCities] = useState<{ city: string }[]>([]);

    useEffect (() => {
        if (query.length === 0) {
            setCities([]);
        return;        
    }

    const fetchCity = async () => {
        const res = await fetch("/api/cities?city=" + query)
        const data = await res.json(); 

        console.log(data)

        setCities(data.cities);
    }; 
    
fetchCity(); 

}, [query]); 

    return(
        <div>
            <input 
                name="city" 
                type="text" 
                placeholder="Find your next home..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
            />

            <ul>
                {cities.length > 0 && cities.map((city:{ city: string }, index:number) => (
                    <li key={index}>{city.city}</li>
                ))}
            </ul>
        </div>
    );
}


export default SearchBar;