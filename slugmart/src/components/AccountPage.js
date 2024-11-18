import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase-config';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { handleLogout } from '../authUtil/logOut';
import Navbar from './Navbar';
import './AccountPage.css';

function AccountPage(){

    const [user, setUser] = useState(null);
    const [location, setLocation] = useState('');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const fetchUserListings = async (uid) => {
        const listingsCollection = collection(db, 'listings');
        const q = query(listingsCollection, where('ownerId', '==', uid)); // Query where ownerId matches user's uid
        const querySnapshot = await getDocs(q);
        const userListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListings(userListings);
    };

    useEffect(() => {
        const listener = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                await fetchUserData(authUser.uid);
                await fetchUserListings(authUser.uid); // Fetch user's listings after login
                setLoading(false);
            } else {
                navigate('/');
            }
        });
        return () => listener();
    }, [navigate]);


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

    if (loading) {
        return <p>Loading...</p>;
    }

    const handleMarkAsSold = async (listingId) => {
        try {
            const listingRef = doc(db, 'listings', listingId);
            await updateDoc(listingRef, { status: 'sold' });
            alert('Listing marked as sold!');
            await fetchUserListings(user.uid);
        } catch (error) {
            console.error("Error marking listing as sold", error);
        }
    };

    const handleRemoveListing = async (listingId) => {
        try {
            const listingRef = doc(db, 'listings', listingId);
            await deleteDoc(listingRef);
            alert('Listing removed!');
            await fetchUserListings(user.uid);
        } catch (error) {
            console.error("Error removing listing", error);
        }
    };

    const handleEditListing = (listingId) => {
        navigate(`/edit-listing/${listingId}`);
    };

    return (
        <div>
            <Navbar handleLogout={handleLogout(navigate)} />
            <div className="account-container">
                <h1>Your Account</h1>
                <div className="profile-section">
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
                

                <h2>Your Listings:</h2>
                <div className="account-listing-grid">
                    {listings.length > 0 ? (
                        listings.map(listing => (
                            <div key={listing.id} className="account-listing-card" onClick={() => handleEditListing(listing.id)}>
                                <img src={listing.images[0]} alt={listing.title} className="account-listing-image" />
                                <h3>{listing.title}</h3>
                                <p>{listing.description}</p>
                                <p><strong>Price:</strong> ${listing.price}</p>
                                <p><strong>Category:</strong> {listing.category}</p>
                                <p><strong>Status:</strong> {listing.status || 'available'}</p>
                                
                                <div className="account-listing-actions">
                                    <button onClick={() => handleMarkAsSold(listing.id)} className="account-listing-button action-button sold">
                                        Mark as Sold
                                    </button>
                                    <button onClick={() => handleRemoveListing(listing.id)} className="account-listing-button action-button remove">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>You have no listings yet.</p>
                    )}
                </div>
            </div>
        </div>
    );

}

export default AccountPage;