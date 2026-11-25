import Inquiries from "../../components/public/inquiries_comp";

import inquiriesPhoto from "../../assets/inquiries_page_photo.jpg";
import styles from "../public/inquiries_page.module.css";

function InquiriesPage () {
    return (
        <div className={styles.main_container}>
            <h1 className={styles.sr_content}>Inquiries Page</h1>
            <Inquiries />   
            <img className={styles.inquiries_photo} src={inquiriesPhoto} alt=""/>
        </div> 
    )
}

export default InquiriesPage;
