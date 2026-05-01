import { BrowserRouter, Routes, Route,} from "react-router-dom";

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
import DashboardProfileEdit from "./components/dashboard/dashboard_profile_edit_comp";


function App() {

  return (
    <BrowserRouter>
      <div>
        <MainNavigationBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<PropertySearchPage />} /> 
            <Route path="/property/:id" element={<DetailedPropertyPage />} />             
            <Route path="/contact" element={<Inquiries />} />
            <Route path="/signIn" element={<SignInPage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/dashboard/:username/:ownerID" element={<DashboardMainPage />} />
            <Route path="/dashboard/property/edit/:username/:ownerID/:propID" element={<DashboardEditPropertyPage />} />
            <Route path="/dashboard/property/add/:username/:ownerID" element={<DashboardNewPropertyPage />} />
            <Route path="/dashboard/profile/edit/:username/:ownerID" element={<DashboardProfileEdit />} />
          </Routes>
      </div>
    </BrowserRouter>    
  )
}

export default App;
