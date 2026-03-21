import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function Results () {
  const [params] = useSearchParams();
  
  const city = params.get("city");
  const minBeds = params.get("minBeds");
  const maxPrice = params.get("maxPrice");

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch(`/api/search?city=${city}&minBeds=${minBeds}&maxPrice=${maxPrice}`);
      const data = await res.json()
        console.log(data);
    };

    fetchResults();
  }, [city, minBeds, maxPrice]);


  return (
    <div>
      <h2>Search Results</h2>
      <p>Here are the results for your search.</p>
        <p>City: {city}</p>
        <p>Minimum Bedrooms: {minBeds}</p>
    </div>
  );
}

export default Results;

