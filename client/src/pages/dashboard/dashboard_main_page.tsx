import DashboardMain from "../../components/dashboard/dashboard_main_comp";
import styles from "../dashboard/dashboard_main_page.module.css";

function DashboardMainPage() {

return (
    <div className={styles.main_container}>
        <DashboardMain /> 
    </div>    
    )   
}

export default DashboardMainPage;