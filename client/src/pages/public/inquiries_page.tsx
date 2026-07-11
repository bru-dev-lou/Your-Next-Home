import Inquiries from "../../components/public/inquiries_comp";
import inquiriesPhoto from "../../assets/inquiries_page_photo.jpg";
import styles from "../public/inquiries_page.module.css";

function InquiriesPage () {
    return (
        <div className={styles.main_container}>
            <Inquiries />   
            <img className={styles.inquiries_photo} src={inquiriesPhoto}></img>
        </div> 
    )
}

export default InquiriesPage;
