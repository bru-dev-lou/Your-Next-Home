import SignIn from "../../components/auth/sign_in_comp";
import sign_in_photo from "../../assets/sign_in_photo.jpg";
import styles from "../auth/sign_in_page.module.css";

function SignInPage () {

    return (
        <div className={styles.main_container}>
            <SignIn />
            <img src={sign_in_photo} className={styles.sign_in_photo}></img>
        </div>
    )
}

export default SignInPage;