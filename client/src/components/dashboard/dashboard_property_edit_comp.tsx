import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type property = {
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

type photo = {
    id: number;
    propID: number;
    photo_path: string;
}

function DashboardPropertyEdit() {
    const navigate = useNavigate();  
    const { propID } = useParams();
 
// Original Property Details vs  Property Details prevents unneccessary API calls when fields have not been updated. 

    const [ originalPropertyDetails, setOriginalPropertyDetails ] = useState<property | null>(null); 
    const [ propertyDetails, setPropertyDetails ] = useState<property | null>(null);
    const [ propertyPhotos, setPropertyPhotos ] = useState<photo[]>([]);

// Error Messages → PD = Photo Display, PE = Property Edit, PF = Photo Fetch, PU = Photo Upload

    const [ errorMessagePD, setErrorMessagePD ] = useState("");
    const [ errorMessagePF, setErrorMessagePF ] = useState("");

//  Error / Success message states required for styling purposes.

    const [ errorMessagePE, setErrorMessagePE ] = useState("");
    const [ successMessagePE, setSuccessMessagePE ] = useState("");
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
                    setErrorMessagePF(result.errorProp);
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
                setSuccessMessagePE("");
            }
        } 
            
        catch (error) {
            setErrorMessagePE("Something went wrong while updating your property. Please check your internet and try again.");
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
                setErrorMessagePU("You may only upload 10 photos!");
                return;
            }
        }
        
        try {
            setPhotoUploading(true);
            setSuccessMessagePU("");
            setErrorMessagePU("");

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
            setErrorMessagePU("Something went wrong while uploading your photos. Please check your internet and try again.");
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
            setErrorMessagePU("Something went wrong while deleting your photos, please check your internet and try again.")
        }
    }

    if (!propertyDetails) {
        return (
            <div>
                {errorMessagePF ? <h3> {errorMessagePF} </h3>
                :
                <h3>Loading...</h3>}
            </div>
        );
    }   

    return (
        <div>
            <div>
                <h3> Property Information </h3>
                <h5> Update your property details below.</h5>
                <label> 
                    Type:
                    <select onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})} value={propertyDetails.type}>
                        <option value={propertyDetails.type}>
                            {propertyDetails.type}
                        </option>
                        {propertyDetails.type === 'Apartment' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})} value='Apartment'>Apartment</option>}
                        {propertyDetails.type === 'Terraced' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})} value='Terraced'>Terraced</option>}
                        {propertyDetails.type === 'Semi-Detached' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})} value='Semi-Detached'>Semi-Detached</option>}
                        {propertyDetails.type === 'Detached' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})} value='Detached'>Detached</option>}
                        {propertyDetails.type === 'Bungalow' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, type: e.target.value})} value='Bungalow'>Bungalow</option>}
                    </select>  
                </label>
                <br />
                <label>
                    City:
                    <input type="text" onChange={(e) => setPropertyDetails({...propertyDetails, city: e.target.value})} value={propertyDetails.city} />
                </label>
                <br />
                <label>
                    Price (£):
                    <input type="number" onChange={(e) => setPropertyDetails({...propertyDetails, price: parseFloat(e.target.value)})} value={propertyDetails.price} />
                </label>
                <br />
                <label>
                    Bedrooms:
                    <input type="number" onChange={(e) => setPropertyDetails({...propertyDetails, no_bedrooms: parseInt(e.target.value)})} value={propertyDetails.no_bedrooms} />
                </label>
                <br />
                <label>
                    Bathrooms:
                    <input type="number" onChange={(e) => setPropertyDetails({...propertyDetails, no_bathrooms: parseInt(e.target.value)})} value={propertyDetails.no_bathrooms} />
                </label>
                <br />
                <label>
                    Size (m²):
                    <input type="number" onChange={(e) => setPropertyDetails({...propertyDetails, size: parseInt(e.target.value)})} value={propertyDetails.size} />
                </label>
                <br />
                <label>
                    Furniture:
                    <select onChange={(e) => setPropertyDetails({...propertyDetails, furniture: e.target.value})} value={propertyDetails.furniture}>
                        <option value={propertyDetails.furniture}>{propertyDetails.furniture}</option>
                        {propertyDetails.furniture === 'Furnished' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, furniture: e.target.value})} value = 'Furnished'> Furnished</option>}
                        {propertyDetails.furniture === 'Semi-furnished' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, furniture: e.target.value})} value = 'Semi-furnished'> Semi-Furnished</option>}
                        {propertyDetails.furniture === 'Unfurnished' ? null : <option onChange={(e) => setPropertyDetails({...propertyDetails, furniture: e.target.value})} value = 'Unfurnished'> Unfurnished</option>}        
                    </select>
                </label>
                <br />
                <label>
                    Summary:
                    <textarea
                        onChange={(e) => {
                            const words = e.target.value.split(/\s+/).filter(Boolean);
                            if (words.length <= 50) {
                                setPropertyDetails({ ...propertyDetails, summary: e.target.value });
                            }
                         }}
                    value={propertyDetails.summary}
                    />
                <>
                    {propertyDetails.summary ? propertyDetails.summary.split(/\s+/).filter(Boolean).length : 0} / 50 words
                </>
                </label>
                <br />
                <label>
                    Detailed Description:
                    <textarea
                        onChange={(e) => {
                            const words = e.target.value.split(/\s+/).filter(Boolean);
                            if (words.length <= 250) {
                                setPropertyDetails({ ...propertyDetails, detail: e.target.value });
                            }
                        }}
                    value={propertyDetails.detail}
                    />
                <>
                    {propertyDetails.detail ? propertyDetails.detail.split(/\s+/).filter(Boolean).length : 0} / 250 words
                </>
                </label>
                <br />
                <button onClick={propertyDetailsUpdate}> Update Property </button>
                {propertyUpdated && successMessagePE ?
                    <div>
                        <p style={{ color: "green" }}>{successMessagePE}</p>
                        <button onClick={() => {navigate(`/property/${propID}`)}}>Check your property out!</button>
                    </div>
                :
                errorMessagePE && <p style={{ color: "red" }}>{errorMessagePE}</p>}
            </div>
            <div>
                <h3> Property Photos </h3>
                <h5> Update your property photos below. </h5>
                {propertyPhotos.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {propertyPhotos.map((photo) => (
                            <li key={photo.id}>
                                <img src={photo.photo_path} alt="Property" style={{ width: "200px", height: "150px" }} />
                                <button onClick={(e) => photoDelete(photo.id, photo.photo_path, e)}> x </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: "red" }}>{errorMessagePD}</p>
                )}
                {propertyPhotos.length < 10 ? ( 
                    <div>
                        <input type="file" multiple accept="image/*" onChange={photoUpload} />
                        <p>Upload up to {10 - propertyPhotos.length} more {propertyPhotos.length === 9 ? "photo" : "photos"}.</p>
                    </div>
                ) : (
                    <p>You have reached the maximum number of photos.</p>
                )}
                {photoUploading && <p>Please wait while we upload your photos!</p>}
                {successMessagePU && <p style={{ color: "green" }}>{successMessagePU}</p>}
                {errorMessagePU && <p style={{ color: "red" }}>{errorMessagePU}</p>}
            </div>
        </div>
    );
}

export default DashboardPropertyEdit;