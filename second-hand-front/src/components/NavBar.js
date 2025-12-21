// npm i @mui/material @emotion/react @emotion/styled @mui/icons-material
import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "../constants";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function NavBar({ handleLogout }) {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    if (handleLogout) handleLogout();
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#7cf26cff", // light blue?
        color: "#000000ff",
        borderBottom: "1px solid #bbdefb",
      }}
    >
      <Toolbar sx={{ borderBottom: "3px solid #fa7a3fff" }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/items"
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 700,
          }}
        >
          Second-Hand Platform
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Button component={RouterLink} to="/mylistings" color="inherit">
          My Listings
        </Button>

        <Button variant="outlined" onClick={onLogout} sx={{ ml: 1 }}>
          Log out
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
