import { useParams, Link } from "react-router-dom";

import DashboardMain from "../components/dashboard_main";

function DashboardPage() {
    const { username, id } = useParams();

return (
    <div>
        <div>
            <nav id="dashboard_navigation">
                <Link to={`/dashboard/${username}/${id}`}> My Properties</Link>
                <Link to={`/dashboard/${username}/${id}/profile`}>My Profile</Link>   
                <Link to={`/dashboard/${username}/${id}/favorites`}> Favorite Properties</Link>
                <Link to={`/search`}>Search Properties</Link>
            </nav>
        </div>
        <div>
            <DashboardMain /> 
        </div>
    </div>    
)}

export default DashboardPage;