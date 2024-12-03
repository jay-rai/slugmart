import React from "react";
import "./Popup.css";

// Popup component to display a message w/ button.
function Popup({ message, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        <div className="popup-button">
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default Popup;
