import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase-config';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Navbar from './Navbar';
import './AccountPage.css';

function AccountPage(){

    const [user, setUser] = useState(null);
    const [location, setLocation] = useState('');
    const [looading, setLoading] = useState(true);
    const navigate = useNavigate();

    // fetch data from datbase
    const fetchUserData  = async (uid) => {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setLocation(userData.location || '');
        }
        setLoading(false);
    }

    useEffect(() => {
        const listener = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                await fetchUserData(authUser.uid);
            } else {
                navigate('/')
            }
        });
        return () => listener();

    }, [navigate]);

    // logging user out
    const handleLogout = async () => {
        try{
            await signOut(auth)
            console.log("User signed out");
            navigate('/');
        } catch (error) {
            console.log("error logging out:", error);
        }
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { location }, { merge: true});
            alert('Profile updated!');
        } catch (error) {
            console.error("error updating profile", error)
        }
    }

    return (
        <div>
            <Navbar handleLogout={handleLogout} /> {/* Navbar with logout */}
        <div className="account-container">
            <h1>Your Account</h1>
            <div className="profile-section">
            {/* Display user image, name, and email */}
            {user && (
                <>
                <img
                    src={user.photoURL}
                    alt="Profile"
                    className="profile-image"
                />
                <h2>{user.displayName}</h2>
                <p>{user.email}</p>
                <p>{location}</p>
                </>
            )}
            </div>
            <form onSubmit={handleFormSubmit} className="profile-form">
            <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you located? (College Name/Off Campus)"
                className="form-input"
                />
            </div>
            <button type="submit" className="submit-button">
                Save Changes
            </button>
            </form>
        </div>
        </div>
    );

}

export default AccountPage;