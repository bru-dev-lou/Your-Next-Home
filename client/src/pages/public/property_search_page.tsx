import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import PropertySearchPageSearchBar from "../../components/public/property_search_page_searchbar_comp";
import styles from "../public/property_search_page.module.css";

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
            setIntroMessage(`Properties available for rent in England`);
          }

          else {
            setIntroMessage(`Properties available for rent in ${city}`);
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
      <PropertySearchPageSearchBar sortBy={sortByValue} />
      <div className={styles.intro_container}>
        {introMessage && 
          <h2 className={`${styles.intro_item} ${styles.intro_item_font}`}>{introMessage}</h2>
        }
        <h2 className={`${styles.intro_item} ${styles.intro_item_font}`}>Order by:</h2>
        <select 
          onChange = { (e) => orderResults(e.target.value)}
          value = {sortByValue} 
          aria-label="Sort by"
          aria-describedby="sort_by_hint"
        >
          <option value ="date">Date</option>
          <option value ="highestprice">Highest Price</option>
          <option value ="lowestprice">Lowest Price</option>
        </select>
        <span id="sort_by_hint" className={styles.sr_content}>Choose in what order your properties are shown. Most recently listed is the default setting.</span>
      </div>
      {errorMessagePR &&
          <h4 role="alert" className={styles.pr_error_format}>{errorMessagePR}</h4>
      }       
      {propertyResults.map(property => (
        <div className={styles.property_card_container} key={property.id}>
          <div className={styles.property_card_first_row}> 
            <span className={styles.sr_content}>Address</span>
            <h3 className={`${styles.h3_format} ${styles.address_format}`}>{property.city}</h3>
            <span className={styles.sr_content}>Monthly rental rate</span>
            <h3 className={`${styles.h3_format} ${styles.rate_format}`}>£{property.price.toLocaleString()} pcm</h3>
          </div>
          <div className={styles.property_card_second_row}>
            <img 
              src={property.photo_path}
              role="button"
              alt={`Main photo for property number ${property.id} - press enter to view detailed property page.`}
              tabIndex={0} 
              onKeyDown= { (e) => { if (e.key === "Enter" || e.key === " ") {
                propertyDetailedResult(property.id);
              }}} 
              onClick={ () => propertyDetailedResult(property.id)} 
              className={styles.image_format}
            />
            {propFavorite.has(property.id) ?
              <button onClick={ () => removeFromFavorites(property.id)}> Remove from favorites </button>
              :
              <button onClick={ () => addToFavorites(property.id)}> Add to favorites </button>
            }
            {errorMessageFP.id === property.id && 
                <h4 role="alert" className={styles.fp_error_format}>{errorMessageFP.error}</h4>
            }
            <p className={styles.sr_content}>Summary</p>
            <h4 className={`${styles.h4_format} ${styles.date_summar_format}`}>{property.summary}</h4>
          </div>
          <div className={styles.property_card_third_row}>
            <h4 className={`${styles.h4_format} ${styles.date_listed_format}`}>{new Date(property.date_listed).toLocaleDateString("en-GB")} </h4>
            <div className={styles.basic_info_container}>
              <h4  className={`${styles.h4_format} ${styles.property_type_format}`}>⌂   {property.type}</h4>
              <h4  className={`${styles.h4_format} ${styles.bedrooms_format}`}>🛏   {property.no_bedrooms}</h4>
              <h4  className={`${styles.h4_format} ${styles.bathrooms_format}`}>𓋥   {property.no_bathrooms}</h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PropertySearchPage;