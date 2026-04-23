import { BrowserRouter, Routes, Route,} from "react-router-dom";

import Nav from "./components/nav_bar";
import Home from "./pages/home_page";
import PropertySearch from "./pages/property_search_page";
import DetailedProperty from "./pages/detailed_property_page";
import Contact from "./pages/contact_page";
import Registration from "./pages/registration_page";
import SignInPage from "./pages/sign_in_page"; 
import DashboardPage from "./pages/dashboard_page";
import DashboardPropertyEdit from "./components/dashboard_property_edit"; 
import DashboardPropertyAdd from "./components/dashboard_property_add"



function App() {

  return (
    <BrowserRouter>
      <div>
        <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<PropertySearch />} /> 
            <Route path="/contact" element={<Contact />} />
            <Route path="/property/:id" element={<DetailedProperty />} /> 
            <Route path="/register" element={<Registration />} />
            <Route path="/signIn" element={<SignInPage />} />
            <Route path="/dashboard/:username/:id" element={<DashboardPage />} />
            <Route path="/dashboard/property/edit/:username/:propID" element={<DashboardPropertyEdit />} />
            <Route path="/dashboard/property/add/:username/:ownerID" element={<DashboardPropertyAdd />} />
          </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
