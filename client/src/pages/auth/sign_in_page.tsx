import SignIn from "../../components/auth/sign_in_comp";
import { Link } from "react-router-dom";

function SignInPage () {

    return (
        <div>
            <h2>Sign in and get started!</h2>
            <SignIn />
            <h5>Don't have an account? <Link to="/signUp">Register</Link> now, it's free!</h5>
        </div>
    )
}

export default SignInPage;