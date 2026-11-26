import { useEffect, useState } from "react";
import styles from "../../components/public/inquiries_comp.module.css";

type InquiryData = {
    name: string;
    email: string;
    messageTopic: string;
    message: string;
    propID?: string;
}

function Inquiries () {
    const [ data, setData ] = useState<InquiryData>({name: "", email: "", messageTopic: "", message: "", propID: undefined}); 

    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ errorMessageSE, setErrorMessageSE ] = useState("");    
    const [ invalidField, setInvalidField ] = useState(""); 
    const [ successMessage, setSuccessMessage ] = useState(""); 

    // WAI-ARIA states for live region updates on word count for messageTopic and message fields.

    const [ announceTopicWordCount, setAnnounceTopicWordCount ] = useState(0); 
    const topicWordCount = data?.messageTopic ? data.messageTopic.split(/\s+/).filter(Boolean).length : 0;

    const [ announceMessageWordCount, setAnnounceMessageWordCount ] = useState(0); 
    const messageWordCount = data?.message ? data.message.split(/\s+/).filter(Boolean).length : 0;

    const submitInquiry = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearFeedback();

        // Empty field checks 

        const fieldCheck = [
            {field: data.name, error: "Please include your name.", name: "name"},
            {field: data.email, error: "Please include your email so we can get back to you.", name: "email"},
            {field: data.messageTopic, error: "Please add a message topic.", name: "topic"},
            {field: data.message, error: "Please include a message describing your inquiry.", name: "message"}
        ]

        for (const{field, error, name} of fieldCheck) {
            if(!field) {
                setErrorMessage(error);
                setInvalidField(name);
                setSuccessMessage("");
                return;
            }
        }

        // Name validation 
        
        const nameHasLetters = /\p{L}/u.test(data.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(data.name);

        if (data.name.length < 5 || data.name.length > 25) {
            setErrorMessage("Name must be between 5 and 25 characters long.");
            setInvalidField("name");
            return;
        }

        if (!nameHasLetters || !nameIsValidFormat) {
            setErrorMessage("Name must only have letters.");
            setInvalidField("name");
            return;
        } 

        // Email validation 

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

        if (data.email.length > 50) {
            setErrorMessage("Email must be less than 50 characters.");
            setInvalidField("email");
            return;
        }        

        if (!isValidEmail) {
            setErrorMessage("Please include a valid email address.");
            setInvalidField("email");
            return;
        } 

        if (topicWordCount < 5 || topicWordCount > 25) {
            setErrorMessage("Topic must be between 5 and 25 words long.");
            setInvalidField("topic");
            return; 
        }

        if (messageWordCount < 25 || messageWordCount > 250) {
            setErrorMessage("Message must be between 25 and 250 words long.");
            setInvalidField("message");
            return; 
        }

        //  PROPID validation and fallback value 

        const propID = data.propID || "PROP0000";

        const validPropID = /^[a-zA-Z0-9]+$/.test(propID);
    
        if (propID.length > 11 || !validPropID)  {
            setErrorMessage("Invalid Prop ID.");
            setInvalidField("propID");
            return; 
        }

        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({...data, propID})
            });
            
            const result = await res.json();

            if (result.server_error) {
                setErrorMessageSE(result.server_error);
                setTimeout(() => {
                    setErrorMessageSE("");
                }, 5000);
                setSuccessMessage("");
                setErrorMessage("");
            }

            else if (result.error){
                setErrorMessage(result.error);
                setInvalidField(result.name);
                setSuccessMessage("");
                setErrorMessageSE("");
            }
                    
            else {
                setSuccessMessage(result.message);
                setErrorMessage(""); 
                setErrorMessageSE("");
                setData({name: "", email: "", propID: undefined, messageTopic: "", message: ""});
                setTimeout(function() {
                    setSuccessMessage("");
                }, 4000);
            }
        } 
    
        catch (error) {
            console.error(error);
            setErrorMessage("Please check your internet and refresh the page.");
        }
    }

    // useEffects for WAI-ARIA word count announcements (messageTopic, message), 1500ms debounce

    useEffect(() => {
        const topicWordCountTimeout = setTimeout (() => {
            setAnnounceTopicWordCount(topicWordCount);
        }, 1500);
    
        return () => clearTimeout(topicWordCountTimeout);
    }, [topicWordCount]); 

    useEffect(() => {
        const messageWordCountTimeout = setTimeout (() => {
            setAnnounceMessageWordCount(messageWordCount);
        }, 1500);
    
        return () => clearTimeout(messageWordCountTimeout);
    }, [messageWordCount]); 

    // Clear feedback messages function so ARIA-INVALID resets and reduce verbose in JSX return

    const clearFeedback = () => {
        setSuccessMessage("");
        setInvalidField("");
        setErrorMessage("");
    }

    return (
        <form 
            onSubmit={submitInquiry}
            noValidate
            className={styles.main_container}
        >
                <h2 className={styles.main_title}>How can we help?</h2>
                <div className={styles.container_format}>
                    <label htmlFor="name" className={styles.label_font}> Name: </label>
                    <input
                        id="name"
                        type="text"
                        maxLength={25}
                        value={data.name}
                        onChange= {(e) => {
                            setData({...data, name: e.target.value});
                            clearFeedback();
                        }}
                        required
                        aria-invalid={invalidField === "name"}
                        className={styles.input_format}   
                    />
                </div>
                <div className={styles.container_format}>
                    <label htmlFor="email" className={styles.label_font}> Email: </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        maxLength={50}
                        onChange={(e) => {
                            setData({...data, email: e.target.value});
                            clearFeedback();
                        }}
                        required
                        aria-invalid={invalidField === "email"}
                        className={styles.input_format}
                    />
                </div>
                <div className={styles.container_format}>
                    <label htmlFor="topic" className={styles.label_font}> Topic: </label>
                    <div className={styles.word_count_wrapper}>
                        <input
                            id="topic"
                            type="text"
                            value={data.messageTopic}
                            onChange={(e) => {
                                const topicWords = e.target.value.split(/\s+/).filter(Boolean); 
                                if (topicWords.length <= 25) { 
                                setData({...data, messageTopic: e.target.value});
                                clearFeedback();
                            }}}
                            required
                            aria-describedby="topic_hint"
                            aria-invalid={invalidField === "topic"}
                            className={styles.input_format_custom}
                        />
                        <span 
                            id="topic_hint" 
                            className={styles.sr_content}
                        >
                            Add a topic name to your inquiry.
                        </span>
                        <span className={styles.word_count_format}>{topicWordCount} / 25 </span>
                        <span
                            aria-live="polite"
                            className={styles.sr_content}
                        >
                            {announceTopicWordCount > 0 && `${announceTopicWordCount} out of 25 words used.`}    
                        </span>
                    </div>
                </div> 
                <div className={styles.container_format}>
                    <label htmlFor="message" className={`${styles.label_font} ${styles.message_label}`} > Message: </label>
                    <div className={styles.word_count_wrapper}>
                        <textarea
                            id="message"
                            value={data.message}
                            onChange={(e) => {
                                const messageWords = e.target.value.split(/\s+/).filter(Boolean);
                                if (messageWords.length <= 250) {
                                setData({...data, message: e.target.value});
                                clearFeedback();
                                }}}
                            required
                            aria-describedby="message_hint"
                            aria-invalid={invalidField === "message"}
                            className={styles.textarea_format}
                        />
                        <span id="message_hint" className={styles.sr_content}>Provide a description regarding your inquiry. 250 words max.</span>
                        <span className={styles.word_count_format}>{messageWordCount} / 250 </span>
                        <span
                            aria-live="polite"
                            className={styles.sr_content}
                        >
                            {announceMessageWordCount > 0 && `${announceMessageWordCount} out of 250 words used.`}    
                        </span>
                    </div> 
                </div>
                <div className={styles.container_format}> 
                    <label htmlFor="property_id" className={styles.label_font}> Prop ID: </label>
                    <input
                        id="property_id"
                        type="text"
                        value= {data.propID || ""}
                        onChange={(e) => {
                            setData({...data, propID: e.target.value});
                            clearFeedback();
                        }}
                        placeholder="Property ID - Optional"
                        aria-describedby="property_id_hint"
                        aria-invalid={invalidField === "propID"}
                        className={styles.input_format}
                    />
                    <span id="property_id_hint" className={styles.sr_content}>Include a property ID if your inquiry is regarding a listed property. This field is optional.</span>
                </div>
                <div className={styles.update_container}>
                    {errorMessage && <span role="alert" className={styles.result_message}>{errorMessage}</span>}
                    {errorMessageSE && <span role="alert" className={styles.server_error_message}>{errorMessageSE}</span>}
                    {successMessage && <span role="status" className={styles.success_message}>{successMessage}</span>}
                    {!errorMessage && !errorMessageSE && !successMessage && 
                        <button 
                            type="submit" 
                            className={styles.button_format} 
                        >
                            Submit Inquiry
                        </button>
                    }
                </div>
        </form>
    );
}

export default Inquiries;