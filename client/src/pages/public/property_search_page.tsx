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
  const type = params.get("type") || "";
  const maxPrice = params.get("maxPrice") || "";
  const minBeds = params.get("minBeds") || "";
  const minBaths = params.get("minBaths") || "";
  const furniture = params.get("furniture") || "";
  const sortByValue = params.get("sortBy") || "";

  const [propertyResults, setPropertyResults] = useState<Property[]>([]);
  const [propFavorite, setPropFavorite] = useState<Set<number>>(new Set());

  // Error Message → FP = Favorite Property, PR = Property Results

  const [errorMessageFP, setErrorMessageFP] = useState("");
  const [errorMessagePR, setErrorMessagePR] = useState("");
  const [introMessage, setIntroMessage] = useState("");


  useEffect(() => {
    const fetchPropertyResults = async () => {
      
      try{
        const res = await fetch(`/api/search?city=${city}&type=${type}&furniture=${furniture}&minBeds=${minBeds}&minBaths=${minBaths}&maxPrice=${maxPrice}&sortBy=${sortByValue}`);

        const data = await res.json();
        if (!res.ok) {
          setErrorMessagePR(data.error);
          setIntroMessage("");
        }
      
        else if (data.message) {
          setErrorMessagePR(data.message);
          setIntroMessage("");
          setPropertyResults([]);
        }

        else {
          setErrorMessagePR("");
          if (!city) {
            setIntroMessage(`Properties avaliable for rent in England:`);
          }

          else {
            setIntroMessage(`Properties available for rent in ${city}:`);
          }
          setPropertyResults(data); 
        }
      }

      catch (error){
        setErrorMessagePR("Failed to fetch requested properties. Please check your internet and refresh the page.")
      }
    }
    
    fetchPropertyResults();
    
  }, [city, type, maxPrice, minBeds, minBaths, furniture, sortByValue]);

  useEffect (() => {
    const fetchFavorites = async () => {
      const updateSet = new Set(propFavorite);
    
      try {
        const res = await fetch ("/api/search/favorites");
        const results = await res.json(); 
        if (res.ok) {
          for (const result of results) {
            updateSet.add(result.property_id);
          }
          setPropFavorite(updateSet);
        }

        else {
          return;
        }
      }
      
      // Silent crash coded to avoid bad UI / UX. 

      catch(error) {}
    }
      fetchFavorites();
  }, []);

  function orderResults (filterValue : string) {
    navigate(`/search?city=${city}&type=${type}&furniture=${furniture}&minBeds=${minBeds}&minBaths=${minBaths}&maxPrice=${maxPrice}&sortBy=${filterValue}`);
  } 

  async function addToFavorites (propID : number) {
    const updateSet = new Set(propFavorite); 

    try {
      const res = await fetch (`/api/search/favorites/`, {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({propID})
      });

      const result = await res.json(); 

      if (res.ok) {
        setErrorMessageFP("");
        updateSet.add(propID);
        setPropFavorite(updateSet); 
      }

      else {
        setErrorMessageFP(result.error);
      }
    }

    catch (error) {
      setErrorMessageFP("Failed to add to favorites. Please check your internet and try again.");
    }
  }

  async function removeFromFavorites (propID : number) {
    const updateSet = new Set(propFavorite); 
    
    try {
      const res = await fetch (`/api/search/favorites`, {
        method: "DELETE",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({propID})
      });
      
      if (!res.ok) {
        const result = await res.json(); 
        setErrorMessageFP(result.error);
      }  

      else {
        setErrorMessageFP("");
        updateSet.delete(propID);
        setPropFavorite(updateSet);
      }
    }

    catch (error) {
      setErrorMessageFP("Failed to remove from favorites. Please check your internet and try again.");    
    }
  }

  const propertyDetailResult = (propID : number) => {
    navigate(`/property/${propID}`)
  }

  return (
    <div>
      <PropertySearchPageSearchBar sortBy={sortByValue} />
      <select 
        onChange = { (e) => orderResults(e.target.value)}
        value = {sortByValue} 
        >
        <option value = ""> Sort By</option>
        <option value = "date">Date</option>
        <option value = "highestprice">Highest Price</option>
        <option value = "lowestprice">Lowest Price</option>
      </select>
      {errorMessagePR ?
        <h4>{errorMessagePR}</h4>
      :
        <h4>{introMessage}</h4>
      }       
      {propertyResults.map(result => (
        <div id = "propertyCard" key = {result.id}> 
          <img onClick={ () => propertyDetailResult(result.id)} id = "propertyMainPhoto" src = {result.photo_path} />
          {propFavorite.has(result.id) ?
            <button onClick={ () => removeFromFavorites(result.id)}> Remove from favorites </button>
            :
            <button onClick={ () => addToFavorites(result.id)}> Add to favorites </button>
          }
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