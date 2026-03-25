import { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 

function PropertPageSearchBar () {
    const [city, setCity] = useState('');
    const [maxPrice, setMaxPrice] = useState(); 
    const [minbeds, setMinBeds] = useState();
    const [minbaths, setMinBaths] = useState();
    const [garden, setGarden] = useState();
    const [balcony, setBalcony] = useState(); 
    const navigate = useNavigate(); 

const buttonSearch = (e: any) => {
    e.preventDefault();
    navigate(`/search?city=${city}&maxPrice=${maxPrice}&minBeds=${minbeds}&minBaths=${minbaths}&garden=${garden}&balcony=${balcony}`);
};

return (
    <div>
        <form onSubmit={buttonSearch} method="get">
            /// add inputs + different types + event handlers
        </form>
    </div>
)

}
