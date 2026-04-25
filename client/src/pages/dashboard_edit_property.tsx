import DashboardPropertyEdit from "../components/dashboard_property_edit";
import DashboardNav from "../components/dashboard_navigation";

function DashboardEditPropertyPage () {
    return (
        <div>
            <div> 
                <DashboardNav />
            </div>
            <div>
                <DashboardPropertyEdit />
            </div>
        </div>
    )   
}

export default DashboardEditPropertyPage; 