import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import PropertyPageSearchBar from "../components/property-search-page-search-bar"; 

function Results () {
  const [params] = useSearchParams();
  
  const city = params.get("city");
  const maxPrice = params.get("maxPrice");

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch(`/api/search?city=${city}&maxPrice=${maxPrice}`);
      const data = await res.json()
        console.log(data);
    };

    fetchResults();
  }, [city, maxPrice]);


  return (
    <div>
      <PropertyPageSearchBar />
      <h2>Search Results</h2>
      <p>Here are the results for your search.</p>
        <p>City: {city}</p>
    </div>
  );
}

export default Results;

