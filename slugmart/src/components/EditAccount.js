import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { handleLogout } from "../authUtil/logOut";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase-config";
import "./EditAccount.css";

function EditAccount() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // New state for image URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (uid) => {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setLocation(userData.location || '');
            setImageUrl(userData.imageUrl || ''); // Fetch the saved image URL
        }
    };

    useEffect(() => {
        const listener = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                await fetchUserData(authUser.uid);
                setLoading(false);
            } else {
                navigate('/');
            }
        });
        return () => listener();
    }, [navigate]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('No user logged in');
            return;
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { location, imageUrl }, { merge: true }); // Save both location and imageUrl
            alert('Profile updated!');
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar handleLogout={handleLogout(navigate)} />
            <div className="edit-account-container">
                <form onSubmit={handleFormSubmit} className="edit-account-form">
                    <div>
                        <label htmlFor="location" className="edit-account-label">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Where are you? (College Name/Off Campus)"
                            className="edit-account-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="edit-account-label">
                            Set Custom Profile Picture
                        </label>
                        <input
                            type="text"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Enter an image URL to use for your new profile"
                            className="edit-account-input"
                        />
                    </div>
                    <button type="submit" className="edit-account-button">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditAccount;
