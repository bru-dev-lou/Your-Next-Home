import DashboardPropertyAdd from "../../components/dashboard/dashboard_property_add_comp";
import styles from "../dashboard/dashboard_new_property_page.module.css";

function DashboardNewPropertyPage () {
    return (
        <div className={styles.main_container}>
            <DashboardPropertyAdd />
        </div>
    )   
}

export default DashboardNewPropertyPage; 