import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import PropertySearchPageSearchBar from "../../components/public/property_search_page_searchbar_comp";

type PropertyDetails = {
  id: number;
  type: string;
  city: string;
  price: number;
  no_bedrooms: number;
  no_bathrooms: number;
  summary: string;
  date_listed: string;
  photo_path: string;
}

type ErrorResponse = {
  id: number | null;
  error: string;
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

  const [propertyResults, setPropertyResults] = useState<PropertyDetails[]>([]);
  const [propFavorite, setPropFavorite] = useState<Set<number>>(new Set());

  // Error Message → FP = Favorite Property, PR = Property Results

  const [errorMessageFP, setErrorMessageFP] = useState<ErrorResponse>({id: null, error: ""});
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
            setIntroMessage(`Properties available for rent in England:`);
          }

          else {
            setIntroMessage(`Properties available for rent in ${city}:`);
          }

          setPropertyResults(data); 
        }
      }

      catch (error){
        setErrorMessagePR("Failed to fetch requested properties. Please check your internet and refresh the page.");
      }
    };
    
    fetchPropertyResults();
    
  }, [city, type, maxPrice, minBeds, minBaths, furniture, sortByValue]);

  function orderResults (filterValue : string) {
    navigate(`/search?city=${city}&type=${type}&furniture=${furniture}&minBeds=${minBeds}&minBaths=${minBaths}&maxPrice=${maxPrice}&sortBy=${filterValue}`);
  }; 

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

  const propertyDetailedResult = (propID : number) => {
    navigate(`/property/${propID}`);
  };

  async function addToFavorites (propID : number) {
    const updateSet = new Set(propFavorite); 
    setErrorMessageFP({id: null, error: ""});

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
        setErrorMessageFP({id: null, error: ""});
        updateSet.add(propID);
        setPropFavorite(updateSet); 
      }

      else {
        setErrorMessageFP({id: propID, error: result.error});
        setTimeout(function() {
          setErrorMessageFP({id: null, error: ""});
        }, 2000);
      }
    }

    catch (error) {
      setErrorMessageFP({id: propID, error: "Failed to add to favorites. Please check your internet and try again."});
      setTimeout(function() {
        setErrorMessageFP({id: null, error: ""});
      }, 3500);
    }
  };

  async function removeFromFavorites (propID : number) {
    const updateSet = new Set(propFavorite); 
    setErrorMessageFP({id:null, error: ""});

    
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
        setErrorMessageFP({id: propID, error:result.error});
      }  

      else {
        setErrorMessageFP({id: null, error: ""});
        updateSet.delete(propID);
        setPropFavorite(updateSet);
      }
    }

    catch (error) {
      setErrorMessageFP({id: propID, error: "Failed to remove from favorites. Please check your internet and try again."});
      setTimeout(function() {
        setErrorMessageFP({id: null, error: ""});
      }, 3500);    
    }
  };



  return (
    <div>
      <h4 className="hidden-content">Refine your search.</h4>
      <PropertySearchPageSearchBar sortBy={sortByValue} />
      <select 
        onChange = { (e) => orderResults(e.target.value)}
        value = {sortByValue} 
        aria-label="Sort by"
        aria-describedby="sort_by_hint"
        >
        <option value =""> Sort By</option>
        <option value ="date">Date</option>
        <option value ="highestprice">Highest Price</option>
        <option value ="lowestprice">Lowest Price</option>
      </select>
      <span id="sort_by_hint" className="hidden-content">Choose in what order your properties are shown. Most recently listed is the default setting.</span>
      {errorMessagePR ?
        <div role="alert">
          <h4>{errorMessagePR}</h4>
        </div>
      :
        <h4>{introMessage}</h4>
      }       
      {propertyResults.map(property => (
        <div key={property.id}> 
          <span className="hidden-content">Address</span>
          <p>{property.city}</p>
          <span className="hidden-content">Monthly rental rate</span>
          <p> £{property.price.toLocaleString()} per month </p>
          <img 
            src={property.photo_path}
            role="button"
            alt={`Main photo for property number ${property.id} - press enter to view detailed property page.`}
            tabIndex={0} 
            onKeyDown= { (e) => { if (e.key === "Enter" || e.key === " ") {
              propertyDetailedResult(property.id);
            }}} 
            onClick={ () => propertyDetailedResult(property.id)} 
          />
          <br />
          {propFavorite.has(property.id) ?
            <button onClick={ () => removeFromFavorites(property.id)}> Remove from favorites </button>
            :
            <button onClick={ () => addToFavorites(property.id)}> Add to favorites </button>
          }
          {errorMessageFP.id === property.id && 
            <div role="alert">
              <h4>{errorMessageFP.error}</h4>
            </div>
          }
          <br/>
          <p className="hidden-content">Summary</p>
          <p>{property.summary}</p>
          <p>Date Listed: {new Date(property.date_listed).toLocaleDateString("en-GB")} </p>
          <p>Property Type: {property.type}</p>
          <p>Bedrooms: {property.no_bedrooms}</p>
          <p>Bathrooms: {property.no_bathrooms}</p>
        </div>
      ))}
    </div>
  );
}

export default PropertySearchPage;