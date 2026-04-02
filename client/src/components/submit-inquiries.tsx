import { useState } from "react";


function Inquiries () {
    const [ name, setName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ propID, setPropID ] = useState("");
    const [ messageTopic, setMessageTopic ] = useState("");
    const [ message, setMessage ] = useState("");
   
const submitInquiry = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
        name,
        email,
        propID,
        messageTopic,
        message
    };

    try {
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log(result);
    } 
    
    catch (error) {
        console.error("Error submitting inquiry:", error);
    }
}
   
    return (
        <div>
            <form onSubmit={submitInquiry}>
                <label> Name </label>
                    <input
                        type="text"
                        placeholder="John Doe"  
                        value={name}
                        onChange= {(e) => setName(e.target.value)}
                    />
                <br />
                <label>Email</label>
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                <br />
                <label>Inquiry Topic</label>
                    <input
                        type="text"
                        placeholder="What's your inquiry about?"
                        value={messageTopic}
                        onChange={(e) => setMessageTopic(e.target.value)}
                    />
                <br />
                <label>Message</label>
                    <textarea
                        placeholder="Tells us more about your inquiry!"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                <br />
                <label>Property ID</label>
                    <input
                        type="text"
                        placeholder="Leave blank if not applicable"
                        value={propID}
                        onChange={(e) => setPropID(e.target.value)}
                    />
                <br />
                <button type="submit">Submit Inquiry</button>
            </form>
        </div>
    );
}

export default Inquiries;
