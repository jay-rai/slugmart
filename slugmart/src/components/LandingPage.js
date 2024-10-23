import React from 'react';
import './LandingPage.css';
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';


function LandingPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate()

  // handling login
  const handleGoogleLogin = async () => {
    const authProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, authProvider);
      const credentials = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;

      // checking if user apart of ucsc
      if (user.email.endsWith('@ucsc.edu')){
        console.log('User from ucsc', user);
        addUserToDatabase(user); // add user to databse if they are ucsc user
        setUser(user);
      } else {
        console.log('User not from ucsc');
      }
    } catch (error) {
      console.error('Error Signing in: ', error);
    }
  }

  // adding users to database
  const addUserToDatabase = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        picture: user.photoURL,
      });
    } catch (error) {
      console.error('Error adding user to database', error);
    }
  }


  useEffect(() => {
    const listener = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@ucsc.edu')) {
        console.log('User already logged in:', user);
        setUser(user);
        navigate('/account')
      } else {
        setUser(null);
      }
    });
    return () => listener();
  }, []);

  return (
    <div className="landing-container">
      <div className="flex-container">
        <div className="flex-box">
          <i className="fas fa-shopping-cart"></i> {/* Buy Icon */}
          <h3>Buy</h3>
          <p>See what other slugs are selling.</p>
        </div>
        <div className="flex-box">
          <i className="fas fa-dollar-sign"></i> {/* Sell Icon */}
          <h3>Sell</h3>
          <p>Sell your unused goods to fellow Slugs.</p>
        </div>
        <div className="flex-box">
          <i className="fas fa-exchange-alt"></i> {/* Trade Icon */}
          <h3>Trade</h3>
          <p>Exchange items with slugs and get what you need.</p>
        </div>
      </div>
      <div className='landing-content'>
        <h1>
            Welcome to Slug Mart!
        </h1>
        <button onClick={handleGoogleLogin} className='banana-slug-button'>Sign Up / Sign In</button>
        <p className='ucsc-warning'>
            must have a @ucsc.edu email to sign up/in
        </p>
      </div>
      </div>
    
  );
}

export default LandingPage;
