import React from "react";
import { NavLink } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Navbar.css';

function Navbar({ handleLogout }) {
    
    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li>
                    <NavLink to="/browse" className="nav-item">
                        Browse
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/sell" className="nav-item">
                        Sell
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/account" className="nav-item">
                        <i className="fas fa-user"></i>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings" className="nav-item">
                        <i className="fas fa-gears"></i>
                    </NavLink>
                </li>
                <li>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <i className="fas fa-right-to-bracket"></i>
                    </button>
                </li>
            </ul>
    </nav>
  );
}

export default Navbar;