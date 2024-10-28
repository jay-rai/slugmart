import React, { useState, useEffect} from "react";
import Navbar from "./Navbar";
import { handleLogout } from "../authUtil/logOut";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, query, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase-config";



function EditAccount() {  // Accept user as a prop
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch data from Firestore
    const fetchUserData  = async (uid) => {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setLocation(userData.location || '');
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
            await setDoc(userRef, { location }, { merge: true });
            alert('Profile updated!');
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    return (
        <div>
            <Navbar handleLogout={handleLogout(navigate)} />
            <p>{user?.location}</p> {/* Make sure to handle the case where user is null */}
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
    );
}

export default EditAccount;