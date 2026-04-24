import DashboardMain from "../components/dashboard_main";
import DashboardNav from "../components/dashboard_navigation";

function DashboardPage() {

return (
    <div>
        <div>
            <DashboardNav />
        </div>
        <div>
            <DashboardMain /> 
        </div>
    </div>    
)}

export default DashboardPage;