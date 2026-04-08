import SignIn from "../components/sign_in_component";
import { Link } from "react-router-dom";

function SignInPage () {

    return (
        <div>
        <h2>Sign in and get started!</h2>
        <SignIn />
        <h5>Don't have an account? <Link to="/register">Register</Link> now, it's free!</h5>
        </div>
    )
}

export default SignInPage;