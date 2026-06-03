import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type PropertyDetails = {
    type?: string;
    city?: string;
    price?: number;
    no_bedrooms?: number;
    no_bathrooms?: number;
    size?: number;
    furniture?: string;
    summary?: string;
    detail?: string
};

type PropertyPhotos = {
    id: number;
    photo_path: string;
}

function DashboardPropertyEdit() {
    const navigate = useNavigate();  
    const { propID } = useParams();
 
// Original Property Details vs  Property Details prevents unneccessary API calls when fields have not been updated. 

    const [ originalPropertyDetails, setOriginalPropertyDetails ] = useState<PropertyDetails | null>(null); 
    const [ propertyDetails, setPropertyDetails ] = useState<PropertyDetails | null>(null);

    const [ propertyPhotos, setPropertyPhotos ] = useState<PropertyPhotos[]>([]);
    
// Error Messages → PD = Photo Display, PE = Property Edit, PF = Photo Fetch, PU = Photo Upload

    const [ errorMessagePD, setErrorMessagePD ] = useState("");
    const [ errorMessagePF, setErrorMessagePF ] = useState("");

//  Error / Success message states required for styling purposes.

    const [ errorMessagePE, setErrorMessagePE ] = useState("");
    const [ successMessagePE, setSuccessMessagePE ] = useState("");
    const [ propertyMissingField, setPropertyMissingField ] = useState("");
    const [ propertyUpdated, setPropertyUpdated ] = useState(false);

    const [ errorMessagePU, setErrorMessagePU ] = useState(""); 
    const [ successMessagePU, setSuccessMessagePU ] = useState("");
    const [ photoUploading, setPhotoUploading] = useState(false); 



    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/dashboard/property/edit/${propID}`);
                const result = await res.json();

                if (!res.ok) {
                    setErrorMessagePF(result.errorProperty);
                }

                else if (result.errorPhotos) {
                    setErrorMessagePD(result.errorPhotos);
                    setOriginalPropertyDetails(result.property);
                    setPropertyDetails(result.property); 
                }

                else {
                    setOriginalPropertyDetails(result.property);
                    setPropertyDetails(result.property);
                    setPropertyPhotos(result.photos);           
                    setErrorMessagePF("");
                    setErrorMessagePD("");
                }
            }
            
            catch (error) {
                setErrorMessagePF("Something went wrong while fetching your property. Please check your internet and refresh the page."); 
            }
        }   
        fetchData();
    }, []);

    async function propertyDetailsUpdate(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        setPropertyUpdated(false);
        setPropertyMissingField("");

        if (JSON.stringify(propertyDetails) === JSON.stringify(originalPropertyDetails)) {
            setErrorMessagePE("Please update at least one field.");
            return;
        } 

        try {
            const res = await fetch(`/api/dashboard/property/edit/${propID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(propertyDetails)
            });

            const result = await res.json();

            if (res.ok) {
                setPropertyUpdated(true);
                setOriginalPropertyDetails(propertyDetails); 
                setSuccessMessagePE(result.message);
                setErrorMessagePE("");
            } 
            
            else {
                setErrorMessagePE(result.error);
                setPropertyMissingField(result.name);
                setSuccessMessagePE("");
            }
        } 
            
        catch (error) {
            setErrorMessagePE("Failed to update property. Please check your internet and try again.");
        }
    }

    async function photoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        
        const files = e.target.files;
        const formData = new FormData();
        
        if (!files) {
            return; 
        }

        for (const [index,  file] of Array.from(files).entries()) {
            if (propertyPhotos.length + index < 10 ) {
                formData.append("photos", file);
                setErrorMessagePU("");
            }
            
            else {
                setErrorMessagePU("You may only upload 10 photos.");
                setSuccessMessagePU("");
                return;
            }
        }
        
        try {
            setPhotoUploading(true);
            setSuccessMessagePU("");
            setErrorMessagePU("");
            setErrorMessagePE("");
            setSuccessMessagePE("");

            const res = await fetch(`/api/dashboard/property/edit/${propID}`, {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            
            if (res.ok) {
                setPropertyPhotos(result.newPhotos);
                setSuccessMessagePU(result.message);  
                setErrorMessagePU("");          
            }

            else {
                setErrorMessagePU(result.error);
                setSuccessMessagePU("");
            }
        }

        catch (error) {
            setErrorMessagePU("Failed to upload new photos. Please check your internet and try again.");
        }

        finally {
            setPhotoUploading(false)
        }
    }

    async function photoDelete(photoID: number, photo_path: string, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        
        try {
            const res = await fetch(`/api/dashboard/property/edit/${propID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ photoID, photo_path })
            });
            

            if (!res.ok) {
                const result = await res.json();
                setErrorMessagePU(result.error);
            }

            else {
                setPropertyPhotos(propertyPhotos.filter(photo => photo.id !== photoID));
                setSuccessMessagePU(""); 
                setErrorMessagePU("");
            }
        }
        
        catch (error) { 
            setErrorMessagePU("Failed to delete photo. Please check your internet and try again.")
        }
    }

    if (!propertyDetails) {
        return (
            <div>
                {errorMessagePF ? <h3 role="alert"> {errorMessagePF} </h3>
                :
                <h3 role="status">Loading...</h3>}
            </div>
        );
    }   

    return (
        <div>
            <div>
                <h3> Property Information </h3>
                <h5> Update your property details below.</h5>
                <label htmlFor="property_type"> Type: </label>
                    <select 
                        id="property_type"
                        value={propertyDetails.type}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, type: e.target.value});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }}
                        required
                        aria-invalid={propertyMissingField === "type"}
                    >
                    <option value={propertyDetails.type}>{propertyDetails.type}</option>
                    {propertyDetails.type !== "Apartment" && <option value="Apartment">Apartment</option>}
                    {propertyDetails.type !== "Terraced" && <option value="Terraced" >Terraced</option>}
                    {propertyDetails.type !== "Semi-Detached" && <option value="Semi-Detached" >Semi-Detached</option>}
                    {propertyDetails.type !== "Detached" && <option value="Detached" >Detached</option>}
                    {propertyDetails.type !== "Bungalow" && <option value="Bungalow" >Bungalow</option>}
                    </select>  
                <br />
                <label htmlFor="location"> City: </label>
                    <input 
                        id="location"
                        type="text" 
                        value={propertyDetails.city}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, city: e.target.value});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }}
                        required
                        aria-invalid={propertyMissingField === "city"}
                    />
                <br />
                <label htmlFor="rent"> Rate (£): </label>
                    <input 
                        id="rent"
                        type="number" 
                        value={propertyDetails.price ?? ""}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, price: e.target.value === "" ? undefined : parseFloat(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }}
                        required
                        aria-invalid={propertyMissingField === "price"} 
                     />
                <br />
                <label htmlFor="bedrooms"> Bedrooms: </label>
                    <input 
                        id="bedrooms"
                        type="number" 
                        value={propertyDetails.no_bedrooms ?? ""}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, no_bedrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }} 
                        required
                        aria-invalid={propertyMissingField === "bedrooms"}
                    />
                <br />
                <label htmlFor="bathrooms"> Bathrooms: </label>
                    <input 
                        id="bathrooms"
                        type="number" 
                        value={propertyDetails.no_bathrooms ?? ""}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, no_bathrooms: e.target.value === "" ? undefined : parseInt(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }}
                        required
                        aria-invalid={propertyMissingField === "bathrooms"}
                    />
                <br />
                <label htmlFor="property_size"> Size (m²): </label>
                    <input 
                        id="property_size"
                        type="number" 
                        value={propertyDetails.size ?? ""}    
                        onChange={(e) => { 
                            setPropertyDetails({...propertyDetails, size: e.target.value === "" ? undefined : parseInt(e.target.value)});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }} 
                        required
                        aria-invalid={propertyMissingField === "size"}
                    />
                <br />
                <label htmlFor="furniture"> Furniture: </label>
                    <select 
                        id="furniture"
                        value={propertyDetails.furniture}
                        onChange={(e) => {
                            setPropertyDetails({...propertyDetails, furniture: e.target.value});
                            setErrorMessagePE("");
                            setSuccessMessagePE("");
                        }}
                        required
                        aria-invalid={propertyMissingField === "furniture"}
                    >
                        <option value={propertyDetails.furniture}>{propertyDetails.furniture}</option>
                        {propertyDetails.furniture !== "Furnished" && <option value = "Furnished"> Furnished</option>}
                        {propertyDetails.furniture !== "Semi-furnished" && <option value = "Semi-furnished"> Semi-Furnished</option>}
                        {propertyDetails.furniture !== "Unfurnished" && <option value = "Unfurnished"> Unfurnished</option>}        
                    </select>
                <br />
                <label htmlFor="summary"> Summary: </label>
                    <textarea
                        id="summary"
                        value={propertyDetails.summary}
                        onChange={(e) => {
                            const words = e.target.value.split(/\s+/).filter(Boolean);
                            if (words.length <= 50) {
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                                setPropertyDetails({ ...propertyDetails, summary: e.target.value });
                            }
                        }}
                        required
                        aria-invalid={propertyMissingField === "summary"}
                    />
                <span 
                    aria-live="polite"
                    aria-describedby="summary_word_count">
                        {propertyDetails.summary ? propertyDetails.summary.split(/\s+/).filter(Boolean).length : 0} / 50 words
                </span>
                <span id="summary_word_count" className="hidden-content">The first number is the number of words typed. The second number is the word limit.</span>
                <br />
                <label htmlFor="description"> Property Description: </label>
                    <textarea
                        id="description"
                        value={propertyDetails.detail}
                        onChange={(e) => {
                            const words = e.target.value.split(/\s+/).filter(Boolean);
                            if (words.length <= 250) {
                                setErrorMessagePE("");
                                setSuccessMessagePE("");
                                setPropertyDetails({ ...propertyDetails, detail: e.target.value });
                            }
                        }}
                        required
                        aria-invalid={propertyMissingField === "description"}
                    />
                <span 
                    aria-live="polite"
                    aria-describedby="description_word_count">
                        {propertyDetails.detail ? propertyDetails.detail.split(/\s+/).filter(Boolean).length : 0} / 250 words
                </span>
                <span id="description_word_count" className="hidden-content">The first number is the number of words typed. The second number is the word limit.</span>
                <br />
                <button onClick={propertyDetailsUpdate}> Update Property </button>
                {propertyUpdated && successMessagePE ?
                    <div>
                        <p 
                            style={{ color: "green" }}
                            role="status">
                                {successMessagePE}
                        </p>
                        <button 
                            onClick={() => {navigate(`/property/${propID}`)}}
                            aria-describedby="navigation_hint">Check your property out!
                        </button>
                        <span id="navigation_hint" className="hidden-content">Clicking this button will navigate you to the detailed property page.</span>
                    </div>
                :
                errorMessagePE && 
                    <p 
                        style={{ color: "red" }}
                        role="alert">
                            {errorMessagePE}
                    </p>
                }
            </div>
            <div>
                <h3> Property Photos </h3>
                <h5> Update your property photos below. </h5>
                {propertyPhotos.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {propertyPhotos.map((photo, index) => (
                            <li key={photo.id}>
                                <img src={photo.photo_path} 
                                    alt={`Photo number ${index+1} of property number ${propID}`} 
                                    style={{ width: "200px", height: "150px" }} 
                                />
                                <button 
                                    aria-label={`Delete photo number ${index+1}`}
                                    onClick={(e) => photoDelete(photo.id, photo.photo_path, e)}> 
                                    x 
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p 
                        style={{ color: "red" }}
                        role="alert">
                            {errorMessagePD}
                    </p>
                )}
                {propertyPhotos.length < 10 ? ( 
                    <div>
                        <label htmlFor="photo_upload"> Uoload Property Photos</label>
                        <input 
                            id="photo_upload"
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={photoUpload} />
                        <p>Upload up to {10 - propertyPhotos.length} more {propertyPhotos.length === 9 ? "photo" : "photos"}.</p>
                    </div>
                ) : (
                    <p>You have reached the maximum number of photos.</p>
                )}
                {photoUploading && <p role="status">Please wait while we upload your photos!</p>}
                {successMessagePU && 
                    <p style={{ color: "green" }}
                    role="status">
                        {successMessagePU}
                    </p>
                }
                {errorMessagePU && 
                    <p 
                        style={{ color: "red" }}
                        role="alert">
                            {errorMessagePU}
                    </p>
                }
            </div>
        </div>
    );
}

export default DashboardPropertyEdit;