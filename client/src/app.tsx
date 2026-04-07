import { BrowserRouter, Routes, Route,} from "react-router-dom";

import Nav from "./components/nav-bar";
import Home from "./pages/home-page";
import PropertySearch from "./pages/property-search-page";
import DetailedProperty from "./pages/detailed_property_page";
import Contact from "./pages/contact-page";
import Registration from "./pages/registration_page";
import SignIn from "./components/sign_in_component"; 




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
            <Route path="/signIn" element={<SignIn />} />
          </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
