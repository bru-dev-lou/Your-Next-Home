import SignIn from "../../components/auth/sign_in_comp";

import styles from "../auth/sign_in_page.module.css"

function SignInPage () {

    return (
        <div className={styles.main_container}>
            <SignIn />
        </div>
    )
}

export default SignInPage;