import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import PropertyPageSearchBar from "../components/property-search-page-search-bar"; 

type Property = { 
  id : number; 
  city : string; 
  type :  string;
  price : number; 
  no_bedrooms : number;
  no_bathrooms : number;
  size : number;
  furniture: string;
  summary : string;
  date_listed :  string;
}

function Results () {
  const [params] = useSearchParams();
  
  const city = params.get("city"); 
  const type = params.get("type") || ""
  const maxPrice = params.get("maxPrice");
  const minBeds = params.get("minBeds");
  const minBaths = params.get("minBaths");
  const furniture = params.get("furniture") || "";


const [ results, setResults] = useState<Property[]>([])
 
  useEffect(() => {
    const fetchHomeResults = async () => {
      const res = await fetch(`/api/search?city=${city}&type=${type}&maxPrice=${maxPrice}&minBeds=${minBeds}&minBaths=${minBaths}&furniture=${furniture}`);
      const data = await res.json()
        console.log(data);
        setResults(data); 
        };
    fetchHomeResults();
  }, [city, type, maxPrice, minBeds, minBaths, furniture]);




  return (
    <div>
        <div>
          <PropertyPageSearchBar />
          <h3>Properties for rent in {city}:</h3>
        </div>
          {results.map(result => (
            <div id = "propertyCard" key = {result.id}> 
            <li id = "propertyCity">{result.city}</li>
            <li id = "propertyType"> {result.type}</li>
            <li id = "propertyPrice">  ${result.price}</li>
            <li id = "propertySummary"> {result.summary}</li>
            <li id = "propertyDateListed"> {result.date_listed} </li>
            </div>
          ))}
    </div>
  );
}

export default Results;

