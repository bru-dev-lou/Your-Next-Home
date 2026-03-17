import { useState, useEffect} from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function SearchBar () {
    const [currentStateValue, stateSetter] = useState("");
        return (
            <div>
                <form> 
                    <input type="text" placeholder="Enter your name" />
                    <button type="submit"> Submit </button>
                </form>
                <h3> SOmething here</h3>
            </div>
)}

export default SearchBar;
