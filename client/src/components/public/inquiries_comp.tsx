import { useEffect, useState } from "react";
import styles from "../../components/public/inquiries_comp.module.css";

type InquiryData = {
    name: string;
    email: string;
    propID?: string;
    messageTopic: string;
    message: string;
}

function Inquiries () {
    const [ data, setData ] = useState<InquiryData>({name: "", email: "", propID: undefined, messageTopic: "", message: ""}); 

    const [ errorMessage, setErrorMessage ] = useState(""); 
    const [ missingField, setMissingField ] = useState(""); 
    const [ successMessage, setSuccessMessage ] = useState(""); 

    // WAI-ARIA states for live region updates on word count for messageTopic and message fields.

    const [ announceTopicWordCount, setAnnounceTopicWordCount ] = useState(0); 
    const topicWordCount = data?.messageTopic ? data.messageTopic.split(/\s+/).filter(Boolean).length : 0;

    const [ announceMessageWordCount, setAnnounceMessageWordCount ] = useState(0); 
    const messageWordCount = data?.message ? data.message.split(/\s+/).filter(Boolean).length : 0;

    const submitInquiry = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setMissingField("");

        // Name validation 

        if (data.name.length < 5 || data.name.length > 25) {
            setErrorMessage("Please include a name between 5 and 25 characters long.");
            return;
        }

        const nameHasLetters = /\p{L}/u.test(data.name);
        const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(data.name);

        if (!nameHasLetters || !nameIsValidFormat) {
            setErrorMessage("Please include a name with no numbers.");
            return;
        } 

        // Email validation 

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

        if (!isValidEmail) {
            setErrorMessage("Please include a valid email address.");
            return;
        }

        /*  
            For the next two if statements, do not change the error messages. 
            Changing these will affect aria-invalid for the relevant fields in the frontend. 
            Will add codes to the error responses in the future to avoid inference based on error message.
        */        

        if (topicWordCount < 5 || topicWordCount > 25) {
            setErrorMessage("Topic should be between 5 and 25 words long.");
            return; 
        }

        if (messageWordCount < 25 || messageWordCount > 250) {
            setErrorMessage("Message should be between 25 and 250 words long.");
            return; 
        }

        //  PROPID validation and fallback value 

        if (!data.propID) {
            data.propID =  "PROP0000";
        }        

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
            setErrorMessage("Failed to submit inquiry. Please check your internet and try again.");
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

    return (
        <div>
            <form 
                onSubmit={submitInquiry}
                noValidate
            >
                <div className={styles.main_container}>
                    <h2 className={styles.main_title}>How can we help?</h2>
                    <div className={styles.container_format}>
                        <label htmlFor="name" className={`${styles.label_font} ${styles.name_label_position}`}> Name: </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange= {(e) => {
                                setData({...data, name: e.target.value});
                                setErrorMessage("");
                                setSuccessMessage("");
                            }}
                            required
                            aria-invalid={missingField === "name"}
                            className={styles.input_format}   
                        />
                    </div>
                    <div className={styles.container_format}>
                        <label htmlFor="email" className={`${styles.label_font} ${styles.email_label_position}`}> Email: </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => {
                                setData({...data, email: e.target.value});
                                setErrorMessage("");
                                setSuccessMessage("");
                            }}
                            required
                            aria-invalid={missingField === "email"}
                            className={styles.input_format}
                        />
                    </div>
                    <div className={styles.container_format}>
                        <label htmlFor="topic" className={`${styles.label_font} ${styles.topic_label_position}`}> Topic: </label>
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
                            required
                            aria-describedby="topic_hint"
                            aria-invalid={missingField === "topic" || errorMessage.includes("25")}
                            className={styles.input_format}
                        />
                        <span 
                            id="topic_hint" 
                            className={styles.sr_content}
                        >
                            Add a topic name to your inquiry.
                        </span>
                        <span className={`${styles.word_count_25} ${styles.span_font}`}>{topicWordCount} / 25 </span>
                        <span
                            aria-live="polite"
                            className={styles.sr_content}
                        >
                            {announceTopicWordCount > 0 && `${announceTopicWordCount} out of 25 words used.`}    
                        </span>
                    </div> 
                    <div className={styles.container_format}>
                        <label htmlFor="message" className={`${styles.label_font} ${styles.message_label_position}`}> Message: </label>
                        <textarea
                            id="message"
                            value={data.message}
                            onChange={(e) => {
                                const messageWords = e.target.value.split(/\s+/).filter(Boolean);
                                if (messageWords.length >= 25 || messageWords.length <= 250) {
                                setData({...data, message: e.target.value});
                                setErrorMessage("");
                                setSuccessMessage("");
                                }}}
                            required
                            aria-describedby="message_hint"
                            aria-invalid={missingField === "message" || errorMessage.includes("250")}
                            className={styles.textarea_format}
                        />
                        <span id="message_hint" className={styles.sr_content}>Provide a description regarding your inquiry. 250 words max.</span>
                        <span className={`${styles.word_count_250} ${styles.span_font}`}>{messageWordCount} / 250 </span>
                        <span
                            aria-live="polite"
                            className={styles.sr_content}
                        >
                            {announceMessageWordCount > 0 && `${announceMessageWordCount} out of 250 words used.`}    
                        </span>
                    </div>
                    <div className={styles.container_format}> 
                        <label htmlFor="property_id" className={`${styles.label_font} ${styles.prop_label_position}`}> Prop ID: </label>
                        <input
                            id="property_id"
                            type="text"
                            value= {data.propID || ""}
                            onChange={(e) => {
                                setData({...data, propID: e.target.value});
                                setErrorMessage("");
                                setSuccessMessage("");
                            }}
                            placeholder="PROP0000"
                            aria-describedby="property_id_hint"
                            className={styles.input_format}
                        />
                        <span id="property_id_hint" className={styles.sr_content}>Include a property ID if your inquiry is regarding a listed property. This field is optional.</span>
                    </div>
                    <div className={styles.update_container}>
                        {errorMessage && <h3 role="alert" className={styles.result_message}>{errorMessage}</h3>}
                        {successMessage && <h3 role="status" className={styles.result_message}>{successMessage}</h3>}
                         <button 
                            type="submit" 
                            className={styles.button_format} 
                            style={{visibility: errorMessage || successMessage ? "hidden" : "visible"}}
                        >
                            Submit Inquiry
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Inquiries;