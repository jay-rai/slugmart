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
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const authProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;
      if (user.email.endsWith("@ucsc.edu")) {
        addUserToDatabase(user);
        setUser(user);
      } else {
        console.log("User not from ucsc");
        navigate("/bad-email");
      }
    } catch (error) {
      console.error("Error Signing in: ", error);
    }
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

    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
      listener();
    };
  }, [navigate]);

  return (
    <div className="landing-container">
      <div className="flex-container">
        <div className="fb-logo">
          <h1>slugmart</h1>
          <p>Buy, sell, trade with slugs on Slugmart.</p>
        </div>
      </div>
      <div className="landing-content">
        <button onClick={handleGoogleLogin} className="banana-slug-button">
          sign up / sign in
        </button>
        <p className="ucsc-warning">must have a @ucsc.edu email</p>
      </div>
    </div>
  );
}

export default LandingPage;
