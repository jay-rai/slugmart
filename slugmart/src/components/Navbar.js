import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Navbar.css";
import logo from "../images/slugmartLogo.png";

function Navbar({ handleLogout }) {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Slugmart Logo" />
      </div>
      <div className="slugmart">slugmart</div>
      <ul className={isMobile ? "nav-links-mobile" : "nav-links"}>
        <li className="nav-item">
          <NavLink to="/browse">Browse</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/add-listing">Sell</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/account">
            <i className="fas fa-user"></i>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/edit-account">
            <i className="fas fa-gears"></i>
          </NavLink>
        </li>
        <li className="nav-item">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-right-to-bracket"></i>
          </button>
        </li>
      </ul>
      <button
        className="mobile-menu-icon"
        onClick={() => setIsMobile(!isMobile)}
      >
        {isMobile ? (
          <i className="fas fa-times"></i>
        ) : (
          <i className="fas fa-bars"></i>
        )}
      </button>
    </nav>
  );
}

export default Navbar;
