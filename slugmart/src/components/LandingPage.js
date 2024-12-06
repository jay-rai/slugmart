import React, { useEffect, useState } from "react";
import "./LandingPage.css";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Directly call the function within the event handler to ensure it's synchronous
    const authProvider = new GoogleAuthProvider();
    signInWithPopup(auth, authProvider)
      .then((result) => {
        const user = result.user;
        if (user.email.endsWith("@ucsc.edu")) {
          addUserToDatabase(user);
          setUser(user);
        } else {
          console.log("User not from ucsc");
          navigate("/bad-email");
        }
      })
      .catch((error) => {
        console.error("Error Signing in: ", error);
        if (error.code === "auth/popup-closed-by-user") {
          alert("Sign-in popup was closed. Please try again.");
        }
      });
  };

  const addUserToDatabase = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        picture: user.photoURL,
      });
    } catch (error) {
      console.error("Error adding user to database", error);
    }
  };

  useEffect(() => {
    const listener = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith("@ucsc.edu")) {
        setUser(user);
        navigate("/account");
      } else {
        setUser(null);
      }
    });

    document.body.classList.add("noScroll");
    return () => {
      document.body.classList.remove("noScroll");
      listener();
    };
  }, [navigate]);

  return (
    <div className="landing-wrapper">
      <div className="landingContainer">
        <div className="flexContainer">
          <div className="fbLogo">
            <h1>slugmart</h1>
            <p>Buy, sell, trade with slugs on Slugmart.</p>
          </div>
        </div>
        <div className="landingContent">
          <button onClick={handleGoogleLogin} className="bananaSlugButton">
            sign up / sign in
          </button>
          <p className="ucscWarning">must have @ucsc.edu email</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
