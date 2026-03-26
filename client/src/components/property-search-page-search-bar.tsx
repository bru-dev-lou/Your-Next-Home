import { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 

function PropertyPageSearchBar () {
    const [type, setType] = useState('');
    const [city, setCity] = useState('');
    const [maxPrice, setMaxPrice] = useState(10000); 
    const [minBeds, setMinBeds] = useState(0);
    const [minBaths, setMinBaths] = useState(0);
    const [furniture, setFurniture] = useState('');
    const navigate = useNavigate(); 

const buttonSearch = (e: any) => {
    e.preventDefault();
    navigate(`/search?city=${city}&type=${type}maxPrice=${maxPrice}&minBeds=${minBeds}&minBaths=${minBaths}&furnished=${furniture}`)
};

return (
    <div>
        <form onSubmit={buttonSearch} method="get">
            <label htmlFor = "citySelect">Enter a location</label>
                 <input 
                        id = "cityselect"
                        name = "city"
                        type = "text"
                        placeholder = "Enter your preferred location" 
                        value = {city}
                        onChange = {(e) => setCity(e.target.value)}  
                    />
            <label htmlFor = "propertyType">Property Type</label>
                <select 
                    onChange = {(e) => setType(e.target.value)}
                    id = "propertyType">
                        <option value=''>Show all</option>
                        <option value='Apartment'>Apartment</option>
                        <option value='Terraced'>Terraced</option>
                        <option value='Semi-Detached'>Semi-Detached</option>
                        <option value='Detached'>Detached</option>
                        <option value='Bungalow'>Bungalow</option>
                </select>            
            <label htmlFor = "maxPrice"> Max Price</label>
                <select 
                    onChange = {(e) => setMaxPrice(Number(e.target.value))}
                    id = "maxPrice"
                    >
                        <option value = {maxPrice}> No max </option>
                        <option value = "500"> $500 PCM </option>
                        <option value = "600"> $600 PCM </option>
                        <option value = "700"> $700 PCM </option>
                        <option value = "800"> $800 PCM </option>
                        <option value = "900"> $900 PCM </option>
                        <option value = "1000"> $1,000 PCM </option>
                        <option value = "1100"> $1,100 PCM </option>
                        <option value = "1200"> $,1200 PCM </option>
                        <option value = "1300"> $1,300 PCM </option>
                        <option value = "1400"> $1,400 PCM </option>
                        <option value = "1500"> $1,500 PCM </option>
                        <option value = "1600"> $1,600 PCM </option>
                        <option value = "1700"> $1,700 PCM </option>
                        <option value = "1800"> $1,800 PCM </option>
                        <option value = "1900"> $1,900 PCM </option>
                        <option value = "2000"> $2,000 PCM </option>
                </select>
            <br></br>
            <label htmlFor = "minBedrooms">No. of Bedrooms</label>
                <select
                    onChange={(e) => setMinBeds(Number(e.target.value))}
                    id ="minBedrooms" 
                    >
                        <option value= {minBeds}>No min</option>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                        <option value='5'>5</option>
                </select>
            <label htmlFor = "minBathrooms">No. of Bathrooms</label>
                <select
                    onChange={(e) => setMinBaths(Number(e.target.value))}
                    id = "minBathrooms"
                    >
                        <option value= {minBaths}>No min</option>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                        <option value='5'>5</option>
                </select>
            <label htmlFor = "Furniture">Furnishing</label>
            <select 
                onChange={(e) => setFurniture(e.target.value)}
                id = "Furniture"
                >
                        <option value = {furniture}> Any</option>
                        <option value = 'Furnished'> Furnished</option>
                        <option value = 'Semi-furnished'> Semi-Furnished</option>
                        <option value = 'Unfurnished'> Unfurnished</option>        
            </select>
            <button type="submit">Search</button>
        </form>
    </div>
)
}

export default PropertyPageSearchBar; 