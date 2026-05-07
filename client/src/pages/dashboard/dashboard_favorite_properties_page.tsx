import DashboardNavigation from "../../components/dashboard/dashboard_navigation_comp";
import DashboardFavoriteProperties from "../../components/dashboard/dashboard_property_favorites_comp";

function DashboardFavoritePropertiesPage () {
    return (
        <div>
            <div>
                <DashboardNavigation />
            </div>
            <div>   
                <DashboardFavoriteProperties />
            </div>
        </div>
    )
}

export default DashboardFavoritePropertiesPage;