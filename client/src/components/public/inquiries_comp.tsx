import { useState } from "react";

type inquiryData = {
    name: string;
    email: string;
    propID?: number;
    messageTopic: string;
    message: string;
}

function Inquiries () {
    const [ data, setData ] = useState<inquiryData>({name: "", email: "", propID: undefined, messageTopic: "", message: ""}); 
    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ successMessage, setSuccessMessage ] = useState(""); 

    const submitInquiry = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();

            if (!res.ok){
                setErrorMessage(result.error);
                setSuccessMessage("");
            }
            
            else {
                setSuccessMessage(result.message);
                setErrorMessage(""); 
            }
        } 
    
        catch (error) {
            setErrorMessage("Failed to submit inquiry. Please check your internet and try again.")
        }
    }
   
    return (
        <div>
            <form onSubmit={submitInquiry}>
                <label> Name: </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange= {(e) => [
                            setData({...data, name: e.target.value}),
                            setErrorMessage(""),
                            setSuccessMessage("")
                        ]}   
                    />
                <br />
                <label> Email: </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => [
                            setData({...data, email: e.target.value}),
                            setErrorMessage(""),
                            setSuccessMessage("")
                        ]}   
                    />
                <br />
                <label> Topic: </label>
                    <input
                        type="text"
                        value={data.messageTopic}
                        onChange={(e) => [
                            setData({...data, messageTopic: e.target.value}),
                            setErrorMessage(""),
                            setSuccessMessage("")
                        ]}
                    />
                <br />
                <label> Message: </label>
                    <textarea
                        value={data.message}
                        onChange={(e) => [
                            setData({...data, message: e.target.value}),
                            setErrorMessage(""),
                            setSuccessMessage("")
                        ]}
                    />
                <br />
                <label> Property ID: </label>
                    {data.propID == 0 ?
                        <input
                            type="number"
                            value={""}
                            onChange={(e) => [
                                setData({...data, propID: Number(e.target.value)}),
                                setErrorMessage(""),
                                setSuccessMessage("")
                            ]}
                        />
                        :
                            <input
                                type="number" 
                                value={data.propID}
                                onChange={(e) => [
                                    setData({...data, propID: Number(e.target.value)}),
                                    setErrorMessage(""),
                                    setSuccessMessage("")
                                ]}
                            />
                        }
                <br />
                <button type="submit">Submit Inquiry</button>
            </form>
            {errorMessage && <h3>{errorMessage}</h3>}
            {successMessage && <h3>{successMessage}</h3>}
        </div>
    );
}

export default Inquiries;
