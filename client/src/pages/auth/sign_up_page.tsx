import SignUp from "../../components/auth/sign_up_comp";;

import styles from "../auth/sign_up_page.module.css";

function SignUpPage () {

    return (
        <div className={styles.main_container}>
            <SignUp />
        </div>
    )
}

export default SignUpPage;