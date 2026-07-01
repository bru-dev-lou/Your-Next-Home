import HomePageSearchBar from "../../components/public/homepage_searchbar_comp";
import homePagePhoto from "../../assets/home_page_photo.png"
import "../public/home_page.css";

function HomePage() {

  return (
      <div className="main_page_container">
        <div className="search_box_container">
          <h2 className="h2_font">Your journey starts here!</h2>
          <HomePageSearchBar />
        </div>
        <img className="home_page_photo" src={homePagePhoto}></img>
      </div>
  )
}

export default HomePage;