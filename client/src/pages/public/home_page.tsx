import HomePageSearchBar from "../../components/public/homepage_searchbar_comp";

import styles from "../public/home_page.module.css";
import homePagePhoto from "../../assets/home_page_photo.png"

function HomePage() {
  return (
      <div className={styles.main_page_container}>
        <HomePageSearchBar />        
        <img className={styles.home_page_photo} src={homePagePhoto}></img>      
      </div>
  )
}

export default HomePage;