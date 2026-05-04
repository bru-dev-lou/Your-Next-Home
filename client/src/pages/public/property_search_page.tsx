import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import PropertySearchPageSearchBar from "../../components/public/property_search_page_searchbar_comp";

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

function PropertySearchPage () {
  const [params] = useSearchParams();
  const navigate = useNavigate(); 

  const city = params.get("city") || ""; 
  const type = params.get("type") || ""
  const maxPrice = params.get("maxPrice") || "";
  const minBeds = params.get("minBeds") || "";
  const minBaths = params.get("minBaths") || "";
  const furniture = params.get("furniture") || "";
  const ownerID = params.get("ownerID"); 

  const [ results, setResults] = useState<Property[]>([]);

  // Error Message → FP = Favorite Property

  const [ errorMessageFP, setErrorMessageFP ] = useState("");

    useEffect(() => {
      const fetchResults = async () => {
        const res = await fetch(`/api/search?city=${city}&type=${type}&maxPrice=${maxPrice}&minBeds=${minBeds}&minBaths=${minBaths}&furniture=${furniture}`);
        const data = await res.json()
          console.log(data);
          setResults(data); 
          };
      fetchResults();
    }, [city, type, maxPrice, minBeds, minBaths, furniture]);



  async function addToFavorites (propID : number) {

    try {
      const res = await fetch (`/api/search/${ownerID}`, {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({propID})
      });

      const result = await res.json(); 
      console.log(result); 

      // need to add button style change when res.ok

      if (res.ok) {
        setErrorMessageFP("");
      }

      else {
        setErrorMessageFP(result.errorMessage);
      }
    }

    // Will return error until ownerID param is added properly via users signing in and receiving a token

    catch (error) {
      console.log(error);
    }
  } 

  const propertyDetail = (id : number) => {
    navigate(`/property/${id}`)
  };

  return (
    <div>
        <div>
          <PropertySearchPageSearchBar />
          <h3>Properties for rent in {city}:</h3>
        </div>
          {results.map(result => (
            <div id = "propertyCard" key = {result.id}> 
            <img onClick={ () => propertyDetail(result.id)} id = "propertyMainPhoto" src = {result.photo_path} />
            <button onClick={ () => addToFavorites(result.id)}> Add to favorites </button>
            {errorMessageFP && <h4>{errorMessageFP}</h4>}
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

export default PropertySearchPage;

