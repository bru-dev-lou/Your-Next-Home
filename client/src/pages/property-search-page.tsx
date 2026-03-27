import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import PropertyPageSearchBar from "../components/property-search-page-search-bar"; 

function Results () {
  const [params] = useSearchParams();
  
  const city = params.get("city"); 
  const type = params.get("type")
  const maxPrice = params.get("maxPrice");
  const minBeds = params.get("minBeds");
  const minBaths = params.get("minBaths");
  const furniture = params.get("furniture");




  useEffect(() => {
    const fetchHomeResults = async () => {
      const res = await fetch(`api/search?city=${city}&type=${type}&maxPrice=${maxPrice}&minBeds=${minBeds}&minBaths=${minBaths}&furniture=${furniture}`);
      const data = await res.json()
        console.log(data);
    };
    fetchHomeResults();
  }, [city, type, maxPrice, minBeds, minBaths, furniture]);


  return (
    <div>
      <PropertyPageSearchBar />
      <h3>Properties for rent in {city}:</h3>
        <div>
          <h4>{city}</h4>
          <p>${maxPrice}</p>
          <p>MinBedrooms: {minBeds}</p>
          <p>Hello?{furniture}</p>
          <p>tYPE: {type}</p>
        </div>
    </div>
  );
}

export default Results;

