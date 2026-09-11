import DashboardProfileEdit from "../../components/dashboard/dashboard_profile_edit_comp";
import styles from "../dashboard/dashboard_profile_edit_page.module.css";

function DashboardProfileEditPage () {
    return (
        <div className={styles.main_container}>
            <DashboardProfileEdit />
        </div>
    ) 
}

export default DashboardProfileEditPage;