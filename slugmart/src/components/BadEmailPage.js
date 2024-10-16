import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BadEmailPage.css';

function BadEmailPage() {
  const navigate = useNavigate();

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="bad-email-container">
      <h1>Access Restricted</h1>
      <p>Only UCSC email accounts (@ucsc.edu) are allowed to access this platform.</p>
      <button onClick={handleBackToLanding} className="back-button">
        Go Back to Landing Page
      </button>
    </div>
  );
}

export default BadEmailPage;