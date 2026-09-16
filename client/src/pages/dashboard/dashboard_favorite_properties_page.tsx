import DashboardFavoriteProperties from "../../components/dashboard/dashboard_property_favorites_comp";
import styles from "../dashboard/dashboard_favorite_properties_page.module.css";

function DashboardFavoritePropertiesPage () {
    return (
        <div className={styles.main_container}>
            <DashboardFavoriteProperties />
        </div>
    )
}

export default DashboardFavoritePropertiesPage;