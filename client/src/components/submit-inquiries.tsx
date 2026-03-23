import { useState } from "react";
import { useNavigate } from "react-router-dom";


function inquiries () {
    const [ name, setName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ propID, setPropID ] = useState("");
    const [ messageTopic, setMessageTopic ] = useState("");
    const [ message, setMessage ] = useState("");
   
    const navigate  = useNavigate();

const submitInquiry = () => {
    navigate(`/contact?name=${name}&email=${email}&propID=${propID}&messageTopic=${messageTopic}&message=${message}`);
}

/// TODO: Add form for submitting inquiries, and connect to backend
/// Use search-bar as a reference for how to connect to backend and submit form data

    
    return (<h1>Submit Inquiry</h1>);
}

export default inquiries;
