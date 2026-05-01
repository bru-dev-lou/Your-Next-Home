import DashboardNavigation from "../../components/dashboard/dashboard_navigation_comp";
import DashboardProfileEdit from "../../components/dashboard/dashboard_profile_edit_comp";

function DashboardProfileEditPage () {
    return (
        <div>
            <div>
                <DashboardNavigation />
            </div>
            <div>
                <DashboardProfileEdit />
            </div>
        </div>
    ) 
}

export default DashboardProfileEditPage;