import {useState} from "react";
import {useParams, useNavigate} from "react-router-dom";

type Photos = {
    url: string;
    file: File;
};

function DashboardPropertyAdd () {
    const { username, ownerID } = useParams();
    const navigate = useNavigate();

    const [ type, setType ] = useState("");
    const [ city, setCity ] = useState("");
    const [ price, setPrice ] = useState(0);
    const [ bedrooms, setBedrooms ] = useState(0); 
    const [ bathrooms, setBathrooms ] = useState(0); 
    const [ size, setSize ] = useState(0); 
    const [ furniture, setFurniture ] = useState(""); 
    const [ summary, setSummary ] = useState("");
    const [ detail, setDetail ] = useState(""); 

    const [ dataErrorMessage, setDataErrorMessage ] = useState("");
    const [ dataSuccessMessage, setDataSuccessMessage ] = useState("");
    const [ tempURLs, setTempURLs ] = useState<Photos[]>([]);
    const [ uploading, setUploading ] = useState(false);
    const [ excessPhotosMessage, setExcessPhotosMessage ] = useState(""); 
  

    async function addPropertyData (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const propertyData = new FormData();
        
        for(const tempURL of tempURLs) {
        propertyData.append("photos", tempURL.file);
        };

        propertyData.append("type", type);
        propertyData.append("city", city);
        propertyData.append("price", price.toString());
        propertyData.append("bedrooms", bedrooms.toString());
        propertyData.append("bathrooms", bathrooms.toString());
        propertyData.append("size", size.toString());
        propertyData.append("furniture", furniture);
        propertyData.append("summary", summary);
        propertyData.append("ownerID", ownerID as string);
        propertyData.append("detail", detail);

        try {
            setUploading(true);

            const res = await fetch(`/api/dashboard/property/add/${username}/${ownerID}`, {
            method: "POST",
            body: propertyData,
            });
            
            const result = await res.json();
            console.log(result); 

            if (res.ok) {
                setDataSuccessMessage(result.message);
                setDataErrorMessage("");
                setTimeout(function(){
                    navigate(`/dashboard/${username}/${ownerID}`)},
                5000);
            }

            else {
                setDataErrorMessage(result.error);
                setDataSuccessMessage("");
            }
        }

        catch (error) {
            console.error("Error creating property:", error);
            setDataErrorMessage(`${error}`);
            setDataSuccessMessage("");
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

        for (const [ index, file ]  of Array.from(files).entries()) {
            const previewURL = URL.createObjectURL(file);
            if (tempURLs.length + index < 10) {
                setTempURLs(prev => [...prev, {url: previewURL, file: file}])
            }

            else {
                setExcessPhotosMessage("");
                return;
            }
        }
    }

    function deletePhotos(index: number) {
        setTempURLs(tempURLs.filter((_, i) => i !== index));    
            setExcessPhotosMessage("");
    }

    return (
        <div>
            <h3>Create Your Property</h3>
            <h4>Step 1: Fill in all of the fields below.</h4>
            <br />
            <label>
                City: 
                <input onChange={(e) => setCity(e.target.value)}/>
            </label>
            <br />
            <label>
                Type:
                    <select onChange={(e) => setType(e.target.value)} value={type}>
                        <option value={type}> {type} </option>
                        {type === "Apartment" ? null : <option value="Apartment">Apartment</option>}
                        {type === "Terraced" ? null : <option value="Terraced">Terraced</option>}
                        {type === "Semi-Detached" ? null : <option value="Semi-Detached">Semi-Detached</option>}
                        {type === "Detached" ? null : <option value="Detached">Detached</option>}
                        {type === "Bungalow" ? null : <option value="Bungalow">Bungalow</option>}
                    </select>
            </label>
            <br />
            <label>
                Price (£):
            {price === 0 ?
                <input type="number" onChange={(e) => setPrice(Number(e.target.value))} value=""/>
                :
                <input type="number" onChange={(e) => setPrice(Number(e.target.value))} value={price}/>
            }           
            </label>
            <br />
            <label>
                Bedrooms:
            {bedrooms === 0 ? 
                <input type= "number" onChange={(e) => setBedrooms(Number(e.target.value))} value=""/>
                : 
                <input type= "number" onChange={(e) => setBedrooms(Number(e.target.value))} value={bedrooms}/>
            }
            </label>
            <br />
            <label>
                Bathrooms:
            {bathrooms === 0 ? 
                <input type= "number" onChange={(e) => setBathrooms(Number(e.target.value))} value=""/>
                : 
                <input type= "number" onChange={(e) => setBathrooms(Number(e.target.value))} value={bathrooms}/>
            }
            </label>
            <br />
            <label>
                Size (m²):
            {size === 0 ? 
                <input type= "number" onChange={(e) => setSize(Number(e.target.value))} value=""/>
                : 
                <input type= "number" onChange={(e) => setSize(Number(e.target.value))} value={size}/>
            }
            <br />
            </label>
            <label>
                Furniture: 
                    <select onChange={(e) => setFurniture(e.target.value)} value={furniture}>
                        <option value={furniture}>{furniture}</option>
                        {furniture === "Furnished" ? null : <option value="Furnished">Furnished</option>}
                        {furniture === "Semi-Furnished" ? null : <option value="Semi-Furnished">Semi-Furnished</option>}
                        {furniture === "Unfurnished" ? null : <option value="Unfurnished">Unfurnished</option>}
                </select>
            </label>
            <br />
            <label>
                Summary (max 50 words):
                    <textarea onChange={(e) => {
                        const summaryWords = e.target.value.split(/\s+/).filter(Boolean);
                        if (summaryWords.length <= 50) {
                            setSummary(e.target.value)
                        }
                    }}
                    value={summary} placeholder="Add a short summary about your property."/>
            </label>
            <>
                {summary ? summary.split(/\s+/).filter(Boolean).length : 0} / 50 words
            </>
            <br />
            <label>
                Detailed Description (max 250 words):
                <textarea onChange= {(e) => {
                    const detailwords = e.target.value.split(/\s+/).filter(Boolean); 
                    if (detailwords.length <= 250) {
                        setDetail(e.target.value)
                    }
                }}
                value={detail} placeholder="Add a detailed description of your property."/>
            </label>
            <>
                {detail ? detail.split(/\s+/).filter(Boolean).length : 0} / 250 words
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
                <p> You have reached the maximum number of photos.</p>
            )} 
            {excessPhotosMessage && <p>{excessPhotosMessage}</p>}
            {dataErrorMessage && !uploading && <p style={{color: "red"}}>{dataErrorMessage}</p>}
            {!uploading && !dataSuccessMessage && (
                <button onClick={addPropertyData}>Create your property!</button>
            )}
            {uploading && <p>Please wait while we add your property!</p>}
            {dataSuccessMessage && (
                <div>
                    <p style={{color: "green"}}>{dataSuccessMessage}</p>
                    <p style={{color: "green"}}> You will now be redirected to your properties.</p>
                </div>
            )}
        </div>
    );
}

export default DashboardPropertyAdd; 