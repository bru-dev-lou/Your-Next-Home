import {useState} from "react";
import {useParams, useNavigate} from "react-router-dom";

type Photos = {
    urls: string;
    file: File;
};

function DashboardPropertyAdd () {
    const { username, userID } = useParams();
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
    const [ photoSucessMessage, setPhotoSuccessMessage ] = useState("");
    const [ photoErrorMessage, setPhotoErrorMessage ] = useState("");
    const [ tempURLs, setTempURLs ] = useState<Photos[]>([]);
    const navigate = useNavigate(); 

    async function addPropertyData (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault;
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
        propertyData.append("ownerID", userID as string);
        propertyData.append("detail", detail);


        try {
            const res = await fetch(`/api/dashboard/property/add/${username}/${userID}`, {
            method: "POST",
            body: propertyData,
            });
            
            const result = await res.json();
            console.log(result); 

            if (res.ok) {
                setDataSuccessMessage("Your property has been created!");
                setDataErrorMessage("");
            }
        }

        catch (error) {
            console.error("Error creating property:", error);
            setDataErrorMessage("An error occurred while creating this property. Please try again.");
            setDataSuccessMessage("");
        }
    }

    async function displayNewPhotos(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault(); 
        const files = e.target.files;
        if (!files) {
            setPhotoErrorMessage("No photos selected, try again.");
            setPhotoSuccessMessage("");
            return;
        }

        for (const file of files) {
            const previewURL = URL.createObjectURL(file);
            setTempURLs(prev => [...prev, {urls: previewURL, file: file}])
        }
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
            {dataErrorMessage && <p style={{color: "red"}}>{dataErrorMessage}</p>}
            {dataSuccessMessage && <p style={{color: "green"}}>{dataSuccessMessage}</p>}

            <h4>Step 2: Upload up to 10 photos.</h4>

            /// Add input file with display photos function THEN map over tempURLs and display photos shown AND THEN create the submit button. 
            
        </div>
        
    );
}

export default DashboardPropertyAdd; 