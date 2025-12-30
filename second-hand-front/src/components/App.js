import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"; 
import Main from "./Main";
import MyListings from "./MyListings";
import Sell from "./Sell"; 

import { TOKEN_KEY } from "../constants";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem(TOKEN_KEY) ? true : false
  );

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    setIsLoggedIn(token ? true : false);
  }, []);

  const handleLoggedIn = (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsLoggedIn(false);
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/*" element={
          <Main
            isLoggedIn={isLoggedIn}
            handleLoggedIn={handleLoggedIn}
          />
        } />
        
        <Route path="/mylistings" element={<MyListings />} />
        <Route path="/sell" element={<Sell />} />
      </Routes>
    </div>
  );
}

export default App;
