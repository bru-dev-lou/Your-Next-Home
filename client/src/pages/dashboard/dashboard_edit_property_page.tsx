import DashboardPropertyEdit from "../../components/dashboard/dashboard_property_edit_comp";
import DashboardNavigation from "../../components/dashboard/dashboard_navigation_comp";

function DashboardEditPropertyPage () {
    return (
        <div>
            <div> 
                <DashboardNavigation />
            </div>
            <div>
                <DashboardPropertyEdit />
            </div>
        </div>
    )   
}

export default DashboardEditPropertyPage; 