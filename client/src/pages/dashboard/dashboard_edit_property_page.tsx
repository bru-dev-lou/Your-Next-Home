import DashboardPropertyEdit from "../../components/dashboard/dashboard_property_edit_comp";
import styles from "../dashboard/dashboard_edit_property_page.module.css";

function DashboardEditPropertyPage () {
    return (
        <div className={styles.main_container}>
            <DashboardPropertyEdit />
        </div>
    )   
}

export default DashboardEditPropertyPage; 