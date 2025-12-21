import React, { useState, useEffect } from "react";

import Main from "./Main";
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
      //setIsLoggedIn(true); modify this after testing
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsLoggedIn(false);
  };


  return (
    <div className="app">
      <Main
        isLoggedIn={isLoggedIn}
        handleLoggedIn={handleLoggedIn}
        //handleLogout={handleLogout}
      />
    </div>
  );
}

export default App;
