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
                        onChange={(e) => {
                            const topicWords = e.target.value.split(/\s+/).filter(Boolean); 
                            if (topicWords.length <= 25) { 
                            setData({...data, messageTopic: e.target.value}),
                            setErrorMessage(""),
                            setSuccessMessage("")
                        }}}
                    />
                <>
                    {data.messageTopic ? <>{data.messageTopic.split(/\s+/).filter(Boolean).length}</> : <>0</>} <>/ 25 </>
                </>
                <br />
                <label> Message: </label>
                    <textarea
                        value={data.message}
                        onChange={(e) => {
                            const messageWords = e.target.value.split(/\s+/).filter(Boolean);
                            if (messageWords.length <= 250) {
                            setData({...data, message: e.target.value}),
                            setErrorMessage(""),
                            setSuccessMessage("")
                            }}}
                    />
                <>
                    {data.message ?<>{data.message.split(/\s+/).filter(Boolean).length}</> : <>0</>} <>/ 250 </>
                </>
                <br />
                <label> Property ID: </label>
                        <input
                            type="text"
                            value= {data.propID || "PROP0000"}
                            onChange={(e) => [
                                setData({...data, propID: e.target.value}),
                                setErrorMessage(""),
                                setSuccessMessage("")
                            ]}
                        />
                <br />
                <button type="submit">Submit Inquiry</button>
            </form>
            {errorMessage && <h3>{errorMessage}</h3>}
            {successMessage && <h3>{successMessage}</h3>}
        </div>
    );
}

export default Inquiries;
