import DashboardPropertyAdd from "../components/dashboard_property_add";
import DashboardNav from "../components/dashboard_navigation";

function DashboardAddPropertyPage () {
    return (
        <div>
            <div> 
                <DashboardNav />
            </div>
            <div>
                <DashboardPropertyAdd />
            </div>
        </div>
    )   
}

export default DashboardAddPropertyPage; 