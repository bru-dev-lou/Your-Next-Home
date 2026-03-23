import { BrowserRouter, Routes, Route,} from "react-router-dom"

import Results from "./pages/results"
import Home from "./pages/home"
import Contact from "./pages/contact"

import Nav from "./components/navBar"


function App() {

  return (
    <BrowserRouter>
      <div>
        <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Results />} /> 
            <Route path="/contact" element={<Contact />} />
          </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
