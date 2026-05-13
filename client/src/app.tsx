import { BrowserRouter, Routes, Route,} from "react-router-dom";

import { UserProvider } from "./context/user_context";

import MainNavigationBar from "./components/public/main_navigation_bar_comp";

import HomePage from "./pages/public/home_page";
import PropertySearchPage from "./pages/public/property_search_page";
import DetailedPropertyPage from "./pages/public/detailed_property_page";
import Inquiries from "./pages/public/inquiries_page";

import SignInPage from "./pages/auth/sign_in_page"; 
import SignUpPage from "./pages/auth/sign_up_page";

import DashboardMainPage from "./pages/dashboard/dashboard_main_page";
import DashboardEditPropertyPage from "./pages/dashboard/dashboard_edit_property_page"; 
import DashboardNewPropertyPage from "./pages/dashboard/dashboard_new_property_page";
import DashboardProfileEditPage from "./pages/dashboard/dashboard_profile_edit_page";
import DashboardFavoritePropertiesPage from "./pages/dashboard/dashboard_favorite_properties_page";

function App() {

  return (
    <BrowserRouter>
      <div>
      <UserProvider>
        <MainNavigationBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<PropertySearchPage />} /> 
            <Route path="/property/:propID" element={<DetailedPropertyPage />} />             
            <Route path="/inquiries" element={<Inquiries />} />
            <Route path="/signIn" element={<SignInPage />} />
            <Route path="/signUp" element={<SignUpPage />} />
            <Route path="/dashboard" element={<DashboardMainPage />} />
            <Route path="/dashboard/property/edit/:propID" element={<DashboardEditPropertyPage />} />
            <Route path="/dashboard/property/add" element={<DashboardNewPropertyPage />} />
            <Route path="/dashboard/profile/edit/:username/:ownerID" element={<DashboardProfileEditPage />} />
            <Route path="/dashboard/property/favorites/:username/:ownerID" element={<DashboardFavoritePropertiesPage />} />
          </Routes>
        </UserProvider>
      </div>
    </BrowserRouter>    
  )
}

export default App;
