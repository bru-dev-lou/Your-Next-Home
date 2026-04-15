import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function DashboardPropertyEdit() {
    const { username, propID } = useParams();

    type proeprty = {
        type: string;
        city: string;
        price: number;
        no_bedrooms: number;
        no_bathrooms: number;
        size: number;
        furniture: string;
        summary: string;
        detail: string
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
        property: proeprty;
        photos: photo[];
        user: user;
    }

    const [ data, setData ] = useState<info | null>(null);
    const [ propertyPhotos, setPropertyPhotos ] = useState<photo[]>([]);


    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`/api/dashboard/property/edit/${username}/${propID}`);
            const result = await res.json();
            console.log(result);
            setData(result);
            setPropertyPhotos(result.photos);
        }
        fetchData();
    }, [username, propID]);

    if (!data) {
        return <div>Loading...</div>;
    }


    async function handleDelete(photoID: number, photo_path: string, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
       try {
            const res = await fetch(`/api/dashboard/property/edit/${username}/${propID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ photoID, photo_path })
            });

            const updatedPhotos = await res.json();
            console.log(updatedPhotos);
            setPropertyPhotos(propertyPhotos.filter(photo => photo.id !== photoID));

        } catch (error) {
            console.error("Error deleting property:", error);
        }
    }


    return (
        <div>
            <h3> Property Information </h3>
            <h5> Update your property details below.</h5>
            <label> 
                Type:
                <input type="text" placeholder={data.property.type} />
            </label>
            <br />
            <label>
                City:
                <input type="text" placeholder={data.property.city} />
            </label>
            <br />
            <label>
                Price:
                <input type="number" placeholder={`£${data.property.price.toString()}`} />
            </label>
            <br />
            <label>
                Bedrooms:
                <input type="number" placeholder={data.property.no_bedrooms.toString()} />
            </label>
            <br />
            <label>
                Bathrooms:
                <input type="number" placeholder={data.property.no_bathrooms.toString()} />
            </label>
            <br />
            <label>
                Size:
                <input type="number" placeholder={`${data.property.size.toString()}m²`} />
            </label>
            <br />
            <label>
                Furniture:
                <input type="text" placeholder={data.property.furniture} />
            </label>
            <br />
            <label>
                Summary (max 50 words):
                <textarea placeholder={data.property.summary} />
            </label>
            <br />
            <label>
                Detailed Description (max 250 words):
                <textarea placeholder={data.property.detail} />
            </label>
            <h3> Property Photos </h3>
            <h5> Update your property photos below. </h5>
            {propertyPhotos.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {propertyPhotos.map((photo) => (
                        <li key={photo.id}>
                            <img src={photo.photo_path} alt="Property" style={{ width: "200px", height: "150px" }} />
                            <button onClick={(e) => handleDelete(photo.id, photo.photo_path, e)}> x </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No photos available.</p>
            )}

        </div>
    );
}

export default DashboardPropertyEdit;