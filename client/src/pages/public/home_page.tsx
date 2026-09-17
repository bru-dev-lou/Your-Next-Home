import { useState } from "react";
import HomePageSearchBar from "../../components/public/homepage_searchbar_comp";

import styles from "../public/home_page.module.css";
import homePagePhoto from "../../assets/home_page_photo.png"

function HomePage() {
  const [ locationErrorMessage, setLocationErrorMessage ] = useState("");
  
  return (
      <div className={styles.main_page_container}>
        <div className={styles.search_box_container}>
          {locationErrorMessage ? 
          <h2 
            role="alert"
            className={styles.error_message}
          >
            {locationErrorMessage}
          </h2>
          :
          <h2 className={styles.h2_font}>Your journey starts here!</h2>
          }
          <HomePageSearchBar setLocationErrorMessage={setLocationErrorMessage} />        
        </div>
        <img className={styles.home_page_photo} src={homePagePhoto}></img>      
      </div>
  )
}

export default HomePage;