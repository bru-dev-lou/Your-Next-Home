import HomePageSearchBar from "../../components/public/homepage_searchbar_comp";

import styles from "../public/home_page.module.css";
import homePagePhoto from "../../assets/home_page_photo.png"

function HomePage() {
  return (
      <div className={styles.main_page_container}>
        <h1 className={styles.sr_content}>Homepage</h1>
        <HomePageSearchBar />        
        <img className={styles.home_page_photo} src={homePagePhoto} alt=""/>      
      </div>
  )
}

export default HomePage;