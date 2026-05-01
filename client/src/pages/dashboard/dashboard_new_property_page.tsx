import DashboardPropertyAdd from "../../components/dashboard/dashboard_property_add_comp";
import DashboardNavigation from "../../components/dashboard/dashboard_navigation_comp";

function DashboardNewPropertyPage () {
    return (
        <div>
            <div> 
                <DashboardNavigation />
            </div>
            <div>
                <DashboardPropertyAdd />
            </div>
        </div>
    )   
}

export default DashboardNewPropertyPage; 