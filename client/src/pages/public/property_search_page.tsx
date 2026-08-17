import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import PropertySearchPageSearchBar from "../../components/public/property_search_page_searchbar_comp";

import styles from "../public/property_search_page.module.css";

import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { BsHouse } from "react-icons/bs";
import { IoBedSharp } from "react-icons/io5";
import { LuToilet } from "react-icons/lu";


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

  const [ propertyResults, setPropertyResults ] = useState<PropertyDetails[]>([]);
  const [ propFavorite, setPropFavorite ] = useState<Set<number>>(new Set());
  const [ orderDropdown, setOrderDropdown ] = useState<boolean>(false); 
  const [ orderByLabel, setOrderByLabel ] = useState("Date");

  // Error Message → FP = Favorite Property, PR = Property Results

  const [ errorMessageFP, setErrorMessageFP ] = useState<ErrorResponse>({id: null, error: ""});
  const [ errorMessagePR, setErrorMessagePR ] = useState("");
  const [ introMessage, setIntroMessage ] = useState("");


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

  function orderResults (filterValue : string, filterString: string) {
    navigate(`/search?city=${city}&type=${type}&furniture=${furniture}&minBeds=${minBeds}&minBaths=${minBaths}&maxPrice=${maxPrice}&sortBy=${filterValue}`);
    setOrderDropdown(!orderDropdown);
    setOrderByLabel(filterString);
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
      <div className={styles.intro_main_container}>
        <div className={styles.intro_title_container}>
          {introMessage && 
            <h2 className={`${styles.intro_item} ${styles.intro_item_font}`}>{introMessage}</h2>
          }
          {errorMessagePR &&
            <h2 role="alert" className={styles.pr_error_format}>{errorMessagePR}</h2>
          }       
          <h2 className={styles.intro_item_font}>Order by:</h2>
        </div>
        {orderDropdown ?
          <ul 
            aria-label="Sort by"
            aria-describedby="sort_by_hint"
            className={styles.order_by_container_open}
          >
            <li 
              data-value ="date"
              onClick={ (e) => {orderResults(e.currentTarget.dataset.value!, e.currentTarget.textContent)}}
              className={styles.order_by_item}
            >
              Date
            </li>
            <li 
              data-value ="highestprice" 
              onClick={ (e) => {orderResults(e.currentTarget.dataset.value!, e.currentTarget.textContent)}}
              className={styles.order_by_item}
            >
              Highest Price
            </li>
            <li 
              data-value ="lowestprice" 
              onClick={ (e) => {orderResults(e.currentTarget.dataset.value!, e.currentTarget.textContent)}}
              className={styles.order_by_item}
            >
              Lowest Price
            </li>
          </ul>
        :
          <ul 
            onClick={ () => {setOrderDropdown(!orderDropdown)}}
            aria-label="Sort by"
            aria-describedby="sort_by_hint"
            className={styles.order_by_container_closed}
          >
            <li 
              data-value={sortByValue}
              className={styles.order_by_item}
            >
              {orderByLabel}
            </li>
          </ul>
        }
      <span id="sort_by_hint" className={styles.sr_content}>Choose in what order your properties are shown. Most recently listed is the default setting.</span>
      </div>
      <div className={styles.property_main_container}>
        {propertyResults.map(property => (
          <div className={styles.property_card_container} key={property.id}>
            <div className={styles.property_card_first_row}> 
              <span className={styles.sr_content}>Address</span>
              <h3 className={styles.h3_format}>{property.city}</h3>
              <span className={styles.sr_content}>Monthly rental rate</span>
              <h3 className={styles.h3_format}>£{property.price.toLocaleString()} pcm</h3>
            </div>
            <div className={styles.property_card_second_row}>
              {errorMessageFP.id === property.id &&
                  <h4 role="alert" className={styles.fp_error_format}>{errorMessageFP.error}</h4>
              }             
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
                <button 
                  onClick={ () => removeFromFavorites(property.id)}
                  aria-label="remove"
                  aria-describedby="button_hint_1"
                  className={styles.fav_button}
                > 
                  <IoIosHeart color="#a01313" size={40}/> 
                </button>
              :
                <button 
                  onClick={ () => addToFavorites(property.id)}
                  aria-label="add"
                  aria-describedby="button_hint_2"
                  className={styles.fav_button}
                > 
                  <IoIosHeartEmpty color="#f60101" size={40} /> 
                </button>
              }
              <span id="button_hint_1" className={styles.sr_content}>
                If aria-label shows 'remove', it means the property is currently in your favorite properties' list. Clicking the button will remove it from this list.
              </span>
              <span id="button_hint_2" className={styles.sr_content}>
                If aria-label shows 'add', it means the property is not in your favorite properties' list. Clicking the button will add it to this list.
              </span> 
              <h4 className={styles.summary_title_format}>Summary</h4>
              <h4 className={`${styles.h4_format} ${styles.summary_content_format}`}>{property.summary}</h4>
            </div>
            <div className={styles.property_card_third_row}>
              <h4 
                className={`${styles.h4_format} ${styles.date_listed_position}`}
              >
                {new Date(property.date_listed).toLocaleDateString("en-GB").replace(/\//g, ".")}
              </h4>
              <span> <BsHouse className={styles.react_icon}/> </span>
              <h4  
                className={`${styles.h4_format} ${styles.quick_data_position}`}
              >
                {property.type}
              </h4>
              <span> <IoBedSharp className={styles.react_icon} /> </span>
              <h4  
                className={`${styles.h4_format} ${styles.quick_data_position}`}
              >
                {`${property.no_bedrooms} ${property.no_bedrooms > 1 ? "bedrooms" : "bedroom"}`}
              </h4>
              <span> <LuToilet className={styles.react_icon} /> </span>
              <h4  
                className={`${styles.h4_format} ${styles.quick_data_position}`}
              >
                 {`${property.no_bathrooms} ${property.no_bathrooms > 1 ? "bathrooms" : "bathroom"}`}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertySearchPage;