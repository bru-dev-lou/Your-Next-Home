import HomePageSearchBar from "../../components/public/homepage_searchbar_comp";
import homePagePhoto from "../../assets/home_page_photo.png"
import styles from "../public/home_page.module.css";

function HomePage() {

  return (
      <div className={styles.main_page_container}>
        <div className={styles.search_box_container}>
          <h2 className={styles.h2_font}>Your journey starts here!</h2>
          <HomePageSearchBar />
        </div>
        <img className={styles.home_page_photo} src={homePagePhoto}></img>
      </div>
  )
}

export default HomePage;