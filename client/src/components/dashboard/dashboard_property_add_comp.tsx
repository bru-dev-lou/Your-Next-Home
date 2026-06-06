import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

type PropertyData = {
    type: string;
    city: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    size: number;
    furniture: string;
    summary: string;
    detail: string;
}

type PropertyPhotos = {
    url: string;
    file: File;
};

function DashboardPropertyAdd () {
    const navigate = useNavigate();

    // Error Message → AC = Auto Complete 

    const [ autoCompleteQueries, setAutoCompleteQueries ] = useState<{city: string}[]>([]);
    const [ autoCompleteQueryClicked, setAutoCompleteQueryClicked ] = useState(false); 
    const [ errorMessageAC, setErrorMessageAC ] = useState(""); 

    // States for roperty data and photos. 

    const [ propertyDetails, setPropertyDetails ] = useState<PropertyData>({type: "", city: "", price: 0, bedrooms: 0, bathrooms: 0, size: 0, furniture: "", summary: "", detail: ""});
    const [ tempURLs, setTempURLs ] = useState<PropertyPhotos[]>([]);

    const [ dataErrorMessage, setDataErrorMessage ] = useState("");
    const [ dataSuccessMessage, setDataSuccessMessage ] = useState("");
    const [ excessPhotosMessage, setExcessPhotosMessage ] = useState(""); 

    const [ uploading, setUploading ] = useState(false);

    // WAI-ARIA states for missing fields, and live region updates on word count for summary and description fields.

    const [ missingField, setMissingField ] = useState("");

    const [ announceSummaryWordCount, setAnnounceSummaryWordCount ] = useState(0); 
    const summaryWordCount = propertyDetails?.summary ? propertyDetails.summary.split(/\s+/).filter(Boolean).length : 0;

    const [ announceDescriptionWordCount, setAnnounceDescriptionWordCount ] = useState(0); 
    const descriptionWordCount = propertyDetails?.detail ? propertyDetails.detail?.split(/\s+/).filter(Boolean).length : 0;
    

    useEffect(() => {
        const fetchAutoComplete = async () => {
            try {
  
                const res = await fetch(`/api/cities?city=${propertyDetails.city}`);
                const result = await res.json();
  
                if (!res.ok) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC(result.error) 
                }
  
                else if(propertyDetails.city.length === 0) {
                    setAutoCompleteQueries([]);
                    setErrorMessageAC("");
                }

                else if (autoCompleteQueries.some( query => query.city === propertyDetails.city)) {
                    setAutoCompleteQueries([]);
                }
                
                else {
                    setAutoCompleteQueries(result.cities);
                    setErrorMessageAC("");
                }
            }
  
            catch(error) {
                setErrorMessageAC("AutoComplete feature currently unavailable.")
            }
        }
          
        if (autoCompleteQueryClicked) {
            return;
        }
  
        const timeout = setTimeout (() => {
            fetchAutoComplete();
        }, 100);

        return () => clearTimeout(timeout);
        
    }, [propertyDetails.city, autoCompleteQueryClicked]);

    async function addPropertyData (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setMissingField("");

        const propertyData = new FormData();
        
        for(const tempURL of tempURLs) {
        propertyData.append("photos", tempURL.file);
        };

        propertyData.append("type", propertyDetails.type);
        propertyData.append("city", propertyDetails.city);
        propertyData.append("price", propertyDetails.price.toString());
        propertyData.append("bedrooms", propertyDetails.bedrooms.toString());
        propertyData.append("bathrooms", propertyDetails.bathrooms.toString());
        propertyData.append("size", propertyDetails.size.toString());
        propertyData.append("furniture", propertyDetails.furniture);
        propertyData.append("summary", propertyDetails.summary);
        propertyData.append("detail", propertyDetails.detail);

        try {
            setUploading(true);

            const res = await fetch(`/api/dashboard/property/add`, {
            method: "POST",
            body: propertyData,
            });
            
            const result = await res.json();
            
            if (res.ok) {
                setDataSuccessMessage(result.message);
                setDataErrorMessage("");
                setTimeout(function(){
                    navigate(`/dashboard`)},
                5000);
            }

            else {
                setDataErrorMessage(result.error);
                setMissingField(result.name);
                setDataSuccessMessage("");
            }
        }

        catch (error) {
            setDataErrorMessage("Failed to create new property. Please check your internet and try again."); 
        }

        finally {
            setUploading(false);
        }
    }

    // Word count useEffects for property summary and property description with 1.5 second debounce. 

    useEffect(() => {
        const summaryWordCountTimeout = setTimeout(() => {
            setAnnounceSummaryWordCount(summaryWordCount); 
        }, 1500);

        return () => clearTimeout(summaryWordCountTimeout);
    
    }, [summaryWordCount]); 

    useEffect(() => {
        const descriptionWordCountTimeout = setTimeout(() => {
            setAnnounceDescriptionWordCount(descriptionWordCount); 
        }, 1500);

        return () => clearTimeout(descriptionWordCountTimeout);
    
    }, [descriptionWordCount]);

    async function displayPhotos(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault(); 
        
        const files = e.target.files;
        if (!files) {
            return;
        }

        if (tempURLs.length + files.length >= 5) {
            setDataErrorMessage("");
        }

        for (const [ index, file ]  of Array.from(files).entries()) {
            const previewURL = URL.createObjectURL(file);

            if (tempURLs.length + index < 10) {
                setExcessPhotosMessage("");
                setDataErrorMessage("");
                setTempURLs(prev => [...prev, {url: previewURL, file: file}])
            }   
            
            else {
                setExcessPhotosMessage("Maximum of 10 photos reached. Some photos were not added.")
                return;
            }
        }
    }

    function deletePhotos(index: number) {
        setTempURLs(tempURLs.filter((_, i) => i !== index));    
            setExcessPhotosMessage("");
            setDataErrorMessage("");
    }

    return (
        <div>
            <h3>Create Your Property</h3>
            <h4>Step 1: Fill in all of the fields below.</h4>
            <br />
            <label htmlFor="location"> City: </label>
                <input 
                    id="location"
                    type="text"
                    value={propertyDetails.city}
                    onChange={(e) => {
                        setPropertyDetails({...propertyDetails, city: e.target.value});
                        setAutoCompleteQueryClicked(false);
                    }}
                    required
                    aria-invalid={missingField === "city"}
                    aria-describedby="location_hint"
                />
            <span id="location_hint" className="hidden-content">State in what city your property is located.</span>
            <ul aria-live="polite" aria-label="City autocomplete suggestions"> 
                {autoCompleteQueries.map((query, index) => (
                    <li 
                        key={index}
                        onClick = {() => {
                            setPropertyDetails({...propertyDetails, city: query.city});
                            setAutoCompleteQueries([]);
                            setAutoCompleteQueryClicked(true);
                            }}
                        tabIndex={0} 
                        onKeyDown= { (e) => { if (e.key === "Enter") {
                            setPropertyDetails({...propertyDetails, city: query.city});
                            setAutoCompleteQueries([]);
                            setAutoCompleteQueryClicked(true);
                        }}}
                        style = {{ cursor: "pointer"}}
                        aria-label={`Select ${query.city}`}
                    >
                        {query.city}
                    </li>
                ))}
            </ul>
                {errorMessageAC && 
                    <div role="alert">
                        <h3>{errorMessageAC}</h3>
                    </div>
                }
            <br />
            <label htmlFor="property_type"> Property Type: </label>
                <select 
                    id="property_type"
                    value={propertyDetails.type}
                    onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})}
                    required
                    aria-invalid={missingField === "type"}
                >
                    <option value={propertyDetails.type}> {propertyDetails.type} </option>
                    {propertyDetails.type !== "Apartment" && <option value="Apartment">Apartment</option>}
                    {propertyDetails.type !== "Terraced" && <option value="Terraced">Terraced</option>}
                    {propertyDetails.type !== "Semi-Detached" && <option value="Semi-Detached">Semi-Detached</option>}
                    {propertyDetails.type !== "Detached" && <option value="Detached">Detached</option>}
                    {propertyDetails.type !== "Bungalow" && <option value="Bungalow">Bungalow</option>}
                </select>
            <br />
            <label htmlFor="rental_rate"> Price PCM (£): </label>
                <input 
                    id="rental_rate"
                    type="number" 
                    value={propertyDetails.price || ""}
                    onChange={(e) => setPropertyDetails({...propertyDetails, price: (Number(e.target.value))})} 
                    required 
                    aria-invalid={missingField === "price"}
                />
            <br />
            <label htmlFor="bedrooms"> Bedrooms: </label>
                <input 
                    id="bedrooms"
                    type= "number" 
                    value={propertyDetails.bedrooms || ""}
                    onChange={(e) => setPropertyDetails({...propertyDetails, bedrooms: (Number(e.target.value))})} 
                    required
                    aria-invalid={missingField === "bedrooms"}
                />
            <br />
            <label htmlFor="bathrooms"> Bathrooms: </label>
                <input 
                    id="bathrooms"
                    type= "number" 
                    value={propertyDetails.bathrooms || ""}
                    onChange={(e) => setPropertyDetails({...propertyDetails, bathrooms: (Number(e.target.value))})} 
                    required
                    aria-invalid={missingField === "bathrooms"}
                />
            <br />
            <label htmlFor="property_size"> Size (m²): </label> 
                <input 
                    id="property_size"
                    type= "number" 
                    value={propertyDetails.size || ""}
                    onChange={(e) => setPropertyDetails({...propertyDetails, size: (Number(e.target.value))})} 
                    required 
                    aria-invalid={missingField === "size"}
                    aria-describedby="size_hint"
                />
            <span id="size_hint" className="hidden-content">State the overall size of your property in m².</span>
            <br />
            <label htmlFor="furniture"> Furniture: </label> 
                <select 
                    id="furniture"
                    value={propertyDetails.furniture}
                    onChange={(e) => setPropertyDetails({...propertyDetails, furniture: e.target.value})} 
                    required
                    aria-invalid={missingField === "furniture"}
                >
                    <option value={propertyDetails.furniture}>{propertyDetails.furniture}</option>
                    {propertyDetails.furniture !== "Furnished" && <option value="Furnished">Furnished</option>}
                    {propertyDetails.furniture !== "Semi-Furnished" && <option value="Semi-Furnished">Semi-Furnished</option>}
                    {propertyDetails.furniture !== "Unfurnished" && <option value="Unfurnished">Unfurnished</option>}
                </select>
            <br />
            <label htmlFor="property_summary"> Summary: </label>
                <textarea 
                    id="property_summary"
                    value={propertyDetails.summary} 
                    onChange={(e) => {
                        const summaryWords = e.target.value.split(/\s+/).filter(Boolean);
                        if (summaryWords.length <= 50) {
                            setPropertyDetails({...propertyDetails, summary: e.target.value})
                        }
                    }}
                    placeholder="Add a short summary about your property."
                    required
                    aria-invalid={missingField === "summary"}
                />
            <span>{summaryWordCount} / 50 words </span>
            <span
                aria-live="polite"
                className="hidden-content"
            >
                {announceSummaryWordCount > 0 && `${announceSummaryWordCount} out of 50 words used.`}
            </span>
            <br />
            <label htmlFor="property_description"> Description: </label>
                <textarea 
                    id="property_description"
                    value={propertyDetails.detail}
                    onChange= {(e) => {
                        const detailwords = e.target.value.split(/\s+/).filter(Boolean); 
                            if (detailwords.length <= 250) {
                            setPropertyDetails({...propertyDetails, detail: e.target.value})
                        }
                    }}
                    placeholder="Add a description of your property."
                    required
                    aria-invalid={missingField === "detail"}
                />
            <span>{descriptionWordCount} / 250 words</span>
            <span 
                aria-live="polite" 
                className="hidden-content"
            >
                {announceDescriptionWordCount > 0 && `${announceDescriptionWordCount} out of 250 words used.`}
            </span>
            <h4>Step 2: Upload 5 to 10 photos.</h4>
                <ul style={{listStyle:"none"}}>
                    {tempURLs.map((tempURL, index) => (
                        <li key={tempURL.url}>
                            <img src={tempURL.url} alt={`Photo preview of photo number ${index}`} style={{ width: "200px", height: "200px"}}/>
                            <button 
                                onClick={() => deletePhotos(index)}
                                aria-label="Remove photo"
                            >
                                x
                            </button>                       
                        </li>
                    ))}            
                </ul> 
            {tempURLs.length < 10 ? (
                <div>
                    <label htmlFor="photo_upload">Upload Photos</label>
                    <input 
                        id="photo_upload"
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={displayPhotos}
                    />
                    <p role="status">You can upload {10 - tempURLs.length} more photos.</p>
                </div>
            ) : (
                null
            )} 
            {excessPhotosMessage && <p role="alert">{excessPhotosMessage}</p>}
            {dataErrorMessage && !uploading && <p role="alert" style={{color: "red"}}>{dataErrorMessage}</p>}
            {!uploading && !dataSuccessMessage && (
                <button onClick={addPropertyData}>Create your property!</button>
            )}
            {uploading && <p role="alert">Please wait while we add your property!</p>}
            {dataSuccessMessage && (
                <div role="alert">
                    <h3 style={{color: "green"}}>{dataSuccessMessage}</h3>
                    <h3 style={{color: "green"}}> You will now be redirected to your properties.</h3>
                </div>
            )}
        </div>
    );
}

export default DashboardPropertyAdd; 