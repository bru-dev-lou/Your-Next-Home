import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

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
  photo_path : string;
}

function Results () {
  const [params] = useSearchParams();
  
  const city = params.get("city") || ""; 
  const type = params.get("type") || ""
  const maxPrice = params.get("maxPrice") || "";
  const minBeds = params.get("minBeds") || "";
  const minBaths = params.get("minBaths") || "";
  const furniture = params.get("furniture") || "";

  const navigate = useNavigate(); 

  const [ results, setResults] = useState<Property[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch(`/api/search?city=${city}&type=${type}&maxPrice=${maxPrice}&minBeds=${minBeds}&minBaths=${minBaths}&furniture=${furniture}`);
      const data = await res.json()
        console.log(data);
        setResults(data); 
        };
    fetchResults();
  }, [city, type, maxPrice, minBeds, minBaths, furniture]);


  const propertyDetail = (id : any) => {
    navigate(`/property/${id}`)
  };

  return (
    <div>
        <div>
          <PropertyPageSearchBar />
          <h3>Properties for rent in {city}:</h3>
        </div>
          {results.map(result => (
            <div id = "propertyCard" key = {result.id}> 
            <img onClick={ () => propertyDetail(result.id)} id = "propertyMainPhoto" src = {result.photo_path} />
            <p id = "propertyCity">{result.city}</p>
            <p id = "propertyPrice">  £{result.price}</p>
            <p id = "propertySummary"> {result.summary}</p>
            <p id = "propertyDateListed"> {result.date_listed} </p>
            <p> PROP{result.id}</p> 
            </div>
          ))}
    </div>
  );
}

export default Results;

