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

type user = {
    username: string;
}

type info ={
    property: property;
    photos: photo[];
    user: user;
}

function DashboardPropertyEdit() {
    const { username, ownerID, propID } = useParams();
    const navigate = useNavigate(); 

    const [ data, setData ] = useState<info | null>(null);
    const [ propertyDetails, setPropertyDetails ] = useState<property | null>(null);
    const [ propertyPhotos, setPropertyPhotos ] = useState<photo[]>([]);
    const [ propertyUpdated, setPropertyUpdated ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ successMessage, setSuccessMessage ] = useState("");
    const [ photoUploading, setPhotoUploading] = useState(false); 
    const [ photoUploadSucessMessage, setPhotoUploadSuccessMessage ] = useState("");
    const [ photoUploadErrorMessage, setPhotoUploadErrorMessage ] = useState("");
    const [ excessPhotosMessage, setExcessPhotosMessage ] = useState("");




    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`/api/dashboard/property/edit/${username}/${ownerID}/${propID}`);
            const result = await res.json();
            console.log(result);
            setData(result);
            setPropertyDetails(result.property);
            setPropertyPhotos(result.photos);
        }   
        fetchData();
    }, [username, ownerID, propID]);

    
    if (!data || !propertyDetails) {
        return <div>Loading...</div>;
    }

    async function photoDelete(photoID: number, photo_path: string, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
       try {
            const res = await fetch(`/api/dashboard/property/edit/${username}/${ownerID}/${propID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ photoID, photo_path })
            });

            const updatedPhotos = await res.json();
            console.log(updatedPhotos);
            setPropertyPhotos(propertyPhotos.filter(photo => photo.id !== photoID));
            setExcessPhotosMessage("");
            setPhotoUploadSuccessMessage("");
            setPhotoUploadErrorMessage("");
        }
        
        catch (error) {
            console.error("Error deleting property:", error);
        }
    }

    async function photoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        const files = e.target.files;
        const formData = new FormData();

        if (!files) {
            setPhotoUploadErrorMessage("No photos selected.");
            setPhotoUploadSuccessMessage("");
            return; 
        }

        for (const [index,  file] of Array.from(files).entries()) {
            if (propertyPhotos.length + index < 10 ) {
            formData.append("photos", file);
            setPhotoUploadSuccessMessage("");
            setExcessPhotosMessage("");
            }
            else {
                setExcessPhotosMessage("You may only upload 10 photos!");
                return;
            }
        }

        try {
            setPhotoUploading(true);

            const res = await fetch(`/api/dashboard/property/edit/${username}/${ownerID}/${propID}`, {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            console.log(result);
            
            if (res.ok) {
                setPropertyPhotos(result.newPhotos);
                setPhotoUploadSuccessMessage(result.message);
                setPhotoUploadErrorMessage("");
            }
            else {
                setPhotoUploadErrorMessage(result.error);
                setPhotoUploadSuccessMessage("");
            }
        }
        catch (error) {
            console.error("Error uploading photo:", error);
            setPhotoUploadErrorMessage("An error occurred while uploading the photo.");
            setPhotoUploadSuccessMessage("");
        }

        finally {
            setPhotoUploading(false)
        }
    }

    async function propertyDetailsUpdate(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        try {
            const res = await fetch(`/api/dashboard/property/edit/${username}/${ownerID}/${propID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(propertyDetails)
            });

            const newDetails = await res.json();
            console.log(newDetails);

            if (res.ok) {
                setPropertyUpdated(true);
                setSuccessMessage(newDetails.message);
                setErrorMessage("");
            } else {
                setErrorMessage(newDetails.error);
                setSuccessMessage("");
            }
        } 
            
        catch (error) {
            console.error("Error updating property:", error);
        }
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
                    Summary (max 50 words):
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
                    Detailed Description (max 250 words):
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
                <button onClick={propertyDetailsUpdate}> Update Property Details </button>
                {propertyUpdated && !errorMessage &&
                    <div>
                        <p style={{ color: "green" }}>{successMessage}</p>
                        <button onClick={() => {navigate(`/property/${propID}`)}}>Check your property out!</button>
                    </div>
                }
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p> }
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
                    <p>No photos selected.</p>
                )}
                {propertyPhotos.length < 10 ? ( 
                    <div>
                        <input type="file" multiple accept="image/*" onChange={photoUpload} />
                        <p>Upload up to {10 - propertyPhotos.length} more photos.</p>
                    </div>
                ) : (
                    <p>You have reached the maximum number of photos.</p>
                )}
                {photoUploading && <p>Please wait while we upload your photos!</p>}
                {excessPhotosMessage && <p>{excessPhotosMessage}</p>}
                {photoUploadSucessMessage && <p style={{ color: "green" }}>{photoUploadSucessMessage}</p>}
                {photoUploadErrorMessage && <p style={{ color: "red" }}>{photoUploadErrorMessage}</p>}
            </div>
        </div>
    );
}

export default DashboardPropertyEdit;