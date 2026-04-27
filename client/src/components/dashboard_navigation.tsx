import { useParams, Link } from "react-router-dom";

function DashboardNav () {
    const { username, ownerID } = useParams(); 

    return (
        <div>
            <nav id="dashboard_navigation">
                <Link to={`/dashboard/${username}/${ownerID}`}> My Properties</Link>
                <Link to={`/dashboard/profile/edit/${username}/${ownerID}`}>My Profile</Link>   
                <Link to={`/dashboard/property/favorites/${username}/${ownerID}`}> Favorite Properties</Link>
                <Link to={`/search`}>Search Properties</Link>
            </nav>
        </div>
    )
}

export default DashboardNav;