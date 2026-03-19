import SearchBar from "../components/SearchBar"
import Results from "../components/search-results"
import { BrowserRouter,Routes, Route } from "react-router-dom"

function Home() {

  return (
    <BrowserRouter>
      <div className="Home">

            <Routes>
            <Route path="/" element={
                <>
                    <h1>Welcome to my React App!</h1>
                    <p>This is a simple React application.</p>
                    <SearchBar />
                </> } />
            <Route path="/search" element={<Results />} />
        </Routes>
      </div>
    </BrowserRouter>  
)
}

export default Home;