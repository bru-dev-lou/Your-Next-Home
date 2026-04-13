import { BrowserRouter, Routes, Route,} from "react-router-dom";

import Nav from "./components/nav_bar";
import Home from "./pages/home_page";
import PropertySearch from "./pages/property_search_page";
import DetailedProperty from "./pages/detailed_property_page";
import Contact from "./pages/contact_page";
import Registration from "./pages/registration_page";
import SignInPage from "./pages/sign_in_page"; 
import DashboardPage from "./pages/dashboard_page";



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
          </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
