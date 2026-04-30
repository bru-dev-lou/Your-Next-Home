import { BrowserRouter, Routes, Route,} from "react-router-dom";

import Nav from "./components/nav_bar";
import Home from "./pages/home_page";
import PropertySearch from "./pages/property_search_page";
import DetailedProperty from "./pages/detailed_property_page";
import Contact from "./pages/contact_page";
import Registration from "./pages/registration_page";
import SignInPage from "./pages/sign_in_page"; 
import DashboardPage from "./pages/dashboard_page";
import DashboardEditPropertyPage from "./pages/dashboard_edit_property"; 
import DashboardAddPropertyPage from "./pages/dashboard_new_property";
import DashboardProfileEdit from "./components/dashboard_profile_edit";


function App() {

  return (
    <BrowserRouter>
      <div>
        <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<PropertySearch />} /> 
            <Route path="/property/:id" element={<DetailedProperty />} />             
            <Route path="/contact" element={<Contact />} />
            <Route path="/signIn" element={<SignInPage />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/dashboard/:username/:ownerID" element={<DashboardPage />} />
            <Route path="/dashboard/property/edit/:username/:ownerID/:propID" element={<DashboardEditPropertyPage />} />
            <Route path="/dashboard/property/add/:username/:ownerID" element={<DashboardAddPropertyPage />} />
            <Route path="/dashboard/profile/edit/:username/:ownerID" element={<DashboardProfileEdit />} />
          </Routes>
      </div>
    </BrowserRouter>    
  )
}

export default App;
