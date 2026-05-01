import DashboardMain from "../../components/dashboard/dashboard_main_comp";
import DashboardNavigation from "../../components/dashboard/dashboard_navigation_comp";

function DashboardMainPage() {

return (
    <div>
        <div>
            <DashboardNavigation />
        </div>
        <div>
            <DashboardMain /> 
        </div>
    </div>    
    )   
}

export default DashboardMainPage;