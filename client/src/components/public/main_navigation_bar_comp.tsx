import { Link } from "react-router-dom"

function MainNavigationBar (){
    return (
        <nav>
            <header>
                <Link to="/">Home</Link>
                <Link to="/search">Rent</Link>
                <Link to="/inquiries">Contact Us</Link>
                <Link to="/signIn">Sign In</Link>
            </header>
        </nav>
    );
}

export default MainNavigationBar;