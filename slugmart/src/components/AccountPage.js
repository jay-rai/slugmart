import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase-config";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { handleLogout } from "../authUtil/logOut";
import Navbar from "./Navbar";
import "./AccountPage.css";
import Popup from "./Popup";

function AccountPage() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // New state for the saved image URL
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch user data from database
  const fetchUserData = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setLocation(userData.location || "");
      setImageUrl(userData.imageUrl || ""); // Fetch and set the saved image URL
    }
    setLoading(false);
  };

  const fetchUserListings = async (uid) => {
    const listingsCollection = collection(db, "listings"); 
    const q = query(listingsCollection, where("ownerId", "==", uid)); // Query where ownerId matches user's uid
    const querySnapshot = await getDocs(q);
    const userListings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
        navigate("/");
      }
    });
    return () => listener();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleMarkAsSold = async (listingId) => {
    try {
      const listingRef = doc(db, "listings", listingId);
      await updateDoc(listingRef, { status: "sold" });
      setPopupMessage("Listing marked as sold!");
      setPopupVisible(true);
      await fetchUserListings(user.uid);
    } catch (error) {
      console.error("Error marking listing as sold", error);
    }
  };

  const handleRemoveListing = async (listingId) => {
    try {
      const listingRef = doc(db, "listings", listingId);
      await deleteDoc(listingRef);
      setPopupMessage("Listing removed!");
      setPopupVisible(true);
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
        {popupVisible && (
          <Popup
            message={popupMessage}
            onClose={() => {
              setPopupVisible(false);
            }}
          />
        )}
        <h1>My Account</h1>
        <div className="profile-section">
          {user && (
            <>
              <img
                src={imageUrl || user.photoURL} // Fallback to user.photoURL if imageUrl is not set
                alt="Profile"
                className="profile-image"
              />
              <h2>{user.displayName}</h2>
              <p>{user.email}</p>
              <p>{location}</p>
            </>
          )}
        </div>

        <h2>My Listings:</h2>
        <div className="account-listing-grid">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <div key={listing.id} className="account-listing-card">
                <div className="account-listing-image-container">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="account-listing-image"
                  />
                </div>
                <div className="account-listing-price">
                  <strong>${listing.price}</strong>
                </div>
                <div className="account-listing-title">{listing.title}</div>
                <div className="account-listing-status">
                  <strong>Status:</strong> {listing.status || "available"}
                </div>
                <div className="account-listing-actions">
                  <button
                    onClick={() => handleMarkAsSold(listing.id)}
                    className="account-listing-button action-button sold"
                  >
                    Mark as Sold
                  </button>
                  <button
                    onClick={() => handleEditListing(listing.id)}
                    className="account-listing-button action-button sold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveListing(listing.id)}
                    className="account-listing-button action-button remove"
                  >
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
