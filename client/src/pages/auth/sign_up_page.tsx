import SignUp from "../../components/auth/sign_up_comp";;
import register_account_photo from "../../assets/register_account_photo.jpg";
import styles from "../auth/sign_up_page.module.css";

function SignUpPage () {

    return (
        <div>
            <SignUp />
            <img src={register_account_photo} className={styles.main_photo}></img>
        </div>
    )
}

export default SignUpPage;