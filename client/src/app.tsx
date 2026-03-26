import { BrowserRouter, Routes, Route,} from "react-router-dom"

import PropertySearch from "./pages/property-search-page"
import Home from "./pages/home-page"
import Contact from "./pages/contact-page"

import Nav from "./components/nav-bar"


function App() {

  return (
    <BrowserRouter>
      <div>
        <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<PropertySearch />} /> 
            <Route path="/contact" element={<Contact />} />
          </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
