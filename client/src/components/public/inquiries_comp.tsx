import { useState } from "react";

type inquiryData = {
    name: string;
    email: string;
    propID?: string;
    messageTopic: string;
    message: string;
}

function Inquiries () {
    const [ data, setData ] = useState<inquiryData>({name: "", email: "", propID: undefined, messageTopic: "", message: ""}); 

    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ missingField, setMissingField ] = useState(""); 
    const [ successMessage, setSuccessMessage ] = useState(""); 

    const submitInquiry = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setMissingField("");

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
                setMissingField(result.name);
                setSuccessMessage("");
            }
            
            else {
                setSuccessMessage(result.message);
                setErrorMessage(""); 
                setData({name: "", email: "", propID: undefined, messageTopic: "", message: ""});
                setTimeout(function() {
                    setSuccessMessage("");
                }, 4000);
            }
        } 
    
        catch (error) {
            setErrorMessage("Failed to submit inquiry. Please check your internet and try again.")
        }
    }
   
    return (
        <div>
            <form onSubmit={submitInquiry}>
                <label htmlFor="name"> Name: </label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange= {(e) => {
                            setData({...data, name: e.target.value});
                            setErrorMessage("");
                            setSuccessMessage("");
                        }}
                        aria-required="true"
                        aria-invalid={missingField === "name" ? "true" : "false"}   
                    />
                <br />
                <label htmlFor="email"> Email: </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => {
                            setData({...data, email: e.target.value});
                            setErrorMessage("");
                            setSuccessMessage("");
                        }}
                        aria-required="true"
                        aria-invalid={missingField === "email" ? "true" : "false"}
                    />
                <br />
                <label htmlFor="topic"> Topic: </label>
                    <input
                        id="topic"
                        type="text"
                        value={data.messageTopic}
                        onChange={(e) => {
                            const topicWords = e.target.value.split(/\s+/).filter(Boolean); 
                            if (topicWords.length <= 25) { 
                            setData({...data, messageTopic: e.target.value});
                            setErrorMessage("");
                            setSuccessMessage("");
                        }}}
                        aria-required="true"
                        aria-describedby="topic_hint"
                        aria-invalid={missingField === "topic" || errorMessage.includes("25") ? "true" : "false"}
                    />
                    <span id="topic_hint" className="hidden-content">Add a short topic to your inquiry. 25 words max.</span>
                <>
                    {data.messageTopic ? <>{data.messageTopic.split(/\s+/).filter(Boolean).length}</> : <>0</>} <>/ 25 </>
                </>
                <br />
                <label htmlFor="message"> Message: </label>
                    <textarea
                        id="message"
                        value={data.message}
                        onChange={(e) => {
                            const messageWords = e.target.value.split(/\s+/).filter(Boolean);
                            if (messageWords.length <= 250) {
                            setData({...data, message: e.target.value});
                            setErrorMessage("");
                            setSuccessMessage("");
                            }}}
                        aria-required="true"
                        aria-describedby="message_hint"
                        aria-invalid={missingField === "message" || errorMessage.includes("250") ? "true" : "false"}
                    />
                    <span id="message_hint" className="hidden-content">Provide a description regarding your inquiry. 250 words max.</span>
                <>
                    {data.message ?<>{data.message.split(/\s+/).filter(Boolean).length}</> : <>0</>} <>/ 250 </>
                </>
                <br />
                <label htmlFor="property_id"> Property ID: </label>
                        <input
                            id="property_id"
                            type="text"
                            value= {data.propID || "PROP0000"}
                            onChange={(e) => {
                                setData({...data, propID: e.target.value});
                                setErrorMessage("");
                                setSuccessMessage("");
                            }}
                            aria-describedby="property_id_hint"
                        />
                    <span id="property_id_hint" className="hidden-content">Include a property ID if your inquiry is regarding a listed property. This field is optional.</span>
                <br />
                <button type="submit">Submit Inquiry</button>
            </form>
            {errorMessage && <h3 role="alert">{errorMessage}</h3>}
            {successMessage && <h3 role="status">{successMessage}</h3>}
        </div>
    );
}

export default Inquiries;
