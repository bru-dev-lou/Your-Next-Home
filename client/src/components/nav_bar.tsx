import { Link } from "react-router-dom"

function Nav (){
    return (
        <nav id="navigation">
            <header>
                <Link to="/"> Home</Link>
                <Link to="/search"> Rentals</Link>
                <Link to="/contact"> Contact Us</Link>
                <Link to="/signIn"> Sign In</Link>
            </header>
        </nav>
    );
}

export default Nav;