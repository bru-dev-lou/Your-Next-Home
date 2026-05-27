import {useState} from "react";
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

    const [ propertyDetails, setPropertyDetails ] = useState<PropertyData>({type: "", city: "", price: 0, bedrooms: 0, bathrooms: 0, size: 0, furniture: "", summary: "", detail: ""});
    const [ tempURLs, setTempURLs ] = useState<PropertyPhotos[]>([]);

    const [ dataErrorMessage, setDataErrorMessage ] = useState("");
    const [ dataSuccessMessage, setDataSuccessMessage ] = useState("");
    const [ excessPhotosMessage, setExcessPhotosMessage ] = useState(""); 

    const [ uploading, setUploading ] = useState(false);

  

    async function addPropertyData (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        
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
            <label>
                City: 
                    <input 
                        onChange={(e) => setPropertyDetails({...propertyDetails, city: e.target.value})}
                        value={propertyDetails.city}
                    />
            </label>
            <br />
            <label>
                Type:
                    <select onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})} 
                    value={propertyDetails.type}>
                        <option value={propertyDetails.type}> {propertyDetails.type} </option>
                        {propertyDetails.type === "Apartment" ? null : <option value="Apartment">Apartment</option>}
                        {propertyDetails.type === "Terraced" ? null : <option value="Terraced">Terraced</option>}
                        {propertyDetails.type === "Semi-Detached" ? null : <option value="Semi-Detached">Semi-Detached</option>}
                        {propertyDetails.type === "Detached" ? null : <option value="Detached">Detached</option>}
                        {propertyDetails.type === "Bungalow" ? null : <option value="Bungalow">Bungalow</option>}
                    </select>
            </label>
            <br />
            <label>
                Price (£):
                    <input 
                        type="number" 
                        onChange={(e) => setPropertyDetails({...propertyDetails, price: (Number(e.target.value))})} 
                        value={propertyDetails.price || ""}
                    />
            </label>
            <br />
            <label>
                Bedrooms:
                    <input 
                        type= "number" 
                        onChange={(e) => setPropertyDetails({...propertyDetails, bedrooms: (Number(e.target.value))})} 
                        value={propertyDetails.bedrooms || ""}
                    />
            </label>
            <br />
            <label>
                Bathrooms:
                    <input type= "number" 
                    onChange={(e) => setPropertyDetails({...propertyDetails, bathrooms: (Number(e.target.value))})} 
                    value={propertyDetails.bathrooms || ""}
                    />
            </label>
            <br />
            <label>
                Size: 
                    <input type= "number" 
                    onChange={(e) => setPropertyDetails({...propertyDetails, size: (Number(e.target.value))})} 
                    value={propertyDetails.size || ""}
                    />
            <br />
            </label>
            <label>
                Furniture: 
                    <select onChange={(e) => setPropertyDetails({...propertyDetails, furniture: e.target.value})} 
                    value={propertyDetails.furniture}
                    >
                        <option value={propertyDetails.furniture}>{propertyDetails.furniture}</option>
                        {propertyDetails.furniture === "Furnished" ? null : <option value="Furnished">Furnished</option>}
                        {propertyDetails.furniture === "Semi-Furnished" ? null : <option value="Semi-Furnished">Semi-Furnished</option>}
                        {propertyDetails.furniture === "Unfurnished" ? null : <option value="Unfurnished">Unfurnished</option>}
                </select>
            </label>
            <br />
            <label>
                Summary (max 50 words):
                    <textarea onChange={(e) => {
                        const summaryWords = e.target.value.split(/\s+/).filter(Boolean);
                        if (summaryWords.length <= 50) {
                            setPropertyDetails({...propertyDetails, summary: e.target.value})
                        } 
                    }}
                    value={propertyDetails.summary} placeholder="Add a short summary about your property."/>
            </label>
            <>
                {propertyDetails.summary ? propertyDetails.summary.split(/\s+/).filter(Boolean).length : 0} / 50 words
            </>
            <br />
            <label>
                Detailed Description (max 250 words):
                <textarea onChange= {(e) => {
                    const detailwords = e.target.value.split(/\s+/).filter(Boolean); 
                    if (detailwords.length <= 250) {
                        setPropertyDetails({...propertyDetails, detail: e.target.value})
                    }
                }}
                value={propertyDetails.detail} placeholder="Add a detailed description of your property."/>
            </label>
            <>
                {propertyDetails.detail ? propertyDetails.detail.split(/\s+/).filter(Boolean).length : 0} / 250 words
            </>

            <h4>Step 2: Upload 5 to 10 photos.</h4>
                <ul style={{listStyle:"none"}}>
                    {tempURLs.map((tempURL, index) => (
                        <li key={tempURL.url}>
                            <img src={tempURL.url} alt="Photo preview" style={{ width: "200px", height: "200px"}}/>
                            <button onClick={() => deletePhotos(index)}>x</button>
                        </li>
                    ))}            
                </ul> 
            {tempURLs.length < 10 ? (
                <div>
                    <input type="file" multiple accept="image/*" onChange={displayPhotos} />
                    <p>You can upload {10 - tempURLs.length} more photos.</p>
                </div>
            ) : (
                null
            )} 
            {excessPhotosMessage && <p>{excessPhotosMessage}</p>}
            {dataErrorMessage && !uploading && <p style={{color: "red"}}>{dataErrorMessage}</p>}
            {!uploading && !dataSuccessMessage && (
                <button onClick={addPropertyData}>Create your property!</button>
            )}
            {uploading && <p>Please wait while we add your property!</p>}
            {dataSuccessMessage && (
                <div>
                    <h3 style={{color: "green"}}>{dataSuccessMessage}</h3>
                    <h3 style={{color: "green"}}> You will now be redirected to your properties.</h3>
                </div>
            )}
        </div>
    );
}

export default DashboardPropertyAdd; 