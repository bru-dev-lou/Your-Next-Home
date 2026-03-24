import { useState } from "react";


function Inquiries () {
    const [ name, setName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ propID, setPropID ] = useState("");
    const [ messageTopic, setMessageTopic ] = useState("");
    const [ message, setMessage ] = useState("");
   
const submitInquiry = async () => {
    const data = {
        name,
        email,
        propID,
        messageTopic,
        message
    };

    try {
        const res = await fetch("http://localhost:3000/contact", {
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
            <form action="/api/contact" method="POST">
                <label>
                    Name
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange= {(e) => setName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Email
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Property ID (if any)
                    <input
                        type="text"
                        placeholder="Leave blank if not applicable"
                        value={propID}
                        onChange={(e) => setPropID(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Inquiry Topic
                    <input
                        type="text"
                        placeholder="What's your inquiry about?"
                        value={messageTopic}
                        onChange={(e) => setMessageTopic(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Message
                    <textarea
                        placeholder="Tells us more about your inquiry!"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </label>
                <br />
                <button type="button" onClick={submitInquiry}>Submit Inquiry</button>
            </form>
        </div>
    );
}

export default Inquiries;
