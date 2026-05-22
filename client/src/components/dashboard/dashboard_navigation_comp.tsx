import {Link } from "react-router-dom";

function DashboardNavigation () {

    return (
        <div>
            <nav id="dashboard_navigation">
                <Link to={`/dashboard`}> My Properties</Link>
                <Link to={`/dashboard/profile/edit`}>My Profile</Link>   
                <Link to={`/dashboard/property/favorites`}> Favorite Properties</Link>
                <Link to={`/search`}>Search Properties</Link>
            </nav>
        </div>
    )
}

export default DashboardNavigation;