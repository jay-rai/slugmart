import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import Navbar from "./Navbar";
import { handleLogout } from "../authUtil/logOut";
import "./ViewListing.css";
import { auth } from "../config/firebase-config";

function ViewListing() {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const navigate = useNavigate();

  const fetchListing = useCallback(async () => {
    try {
      const listingRef = doc(db, "listings", listingId);
      const listingDoc = await getDoc(listingRef);
      if (listingDoc.exists()) {
        const listingData = listingDoc.data();
        setListing(listingData);

        if (listingData.ownerId) {
          const ownerRef = doc(db, "users", listingData.ownerId);
          const ownerDoc = await getDoc(ownerRef);
          if (ownerDoc.exists()) {
            setOwner({ uid: ownerDoc.id, ...ownerDoc.data() });
          }
        }
      } else {
        console.error("Listing not found!");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching listing:", error);
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListing();
    auth.onAuthStateChanged((user) => setCurrentUser(user));
  }, [fetchListing]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!listing) {
    return <p>Listing not found</p>;
  }

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex =
        prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1;
      setSelectedThumbnailIndex(newIndex);
      return newIndex;
    });
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex =
        prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1;
      setSelectedThumbnailIndex(newIndex);
      return newIndex;
    });
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    setSelectedThumbnailIndex(index);
  };

  const handleMessageSeller = () => {
    if (currentUser?.uid === owner?.uid) {
      alert("You cannot message yourself.");
      return;
    }
    navigate("/messages", {
      state: {
        recipientId: owner.uid,
        listingId: listingId,
        listingTitle: listing.title,
        listingImage: listing.images ? listing.images[0] : null,
        listingDescription: listing.description,
        listingPrice: listing.price,
      },
    });
  };

  return (
    <div>
      <Navbar handleLogout={handleLogout(navigate)} />
      <div className="view-listing-container">
        <div className="carousel">
          <button className="carousel-button prev" onClick={handlePrevClick}>
            &#8249;
          </button>
          <div className="image-preview-box">
            <img
              src={listing.images[currentIndex]}
              alt="Preview"
              className="listing-image"
            />
          </div>
          <button className="carousel-button next" onClick={handleNextClick}>
            &#8250;
          </button>
        </div>
        <div className="image-thumbnails">
          {listing.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Thumbnail ${index + 1}`}
              className={`image-thumbnail ${
                index === selectedThumbnailIndex ? "selected" : ""
              }`}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
        <h1 className="listing-title">{listing.title}</h1>
        <p className="listing-price">
          <strong>Price:</strong> ${listing.price}
        </p>
        <p>
          <strong>Description:</strong> {listing.description}
        </p>
        <p>
          <strong>Category:</strong> {listing.category}
        </p>
        <p>
          <strong>Condition:</strong> {listing.condition}
        </p>

        {owner && (
          <div className="seller-info-container">
            <div className="seller-img">
              {owner.picture ? (
                <img src={owner.picture} alt="Seller" className="seller-img" />
              ) : (
                <span>USER IMG</span>
              )}
            </div>
            <div className="seller-details">
              <p className="seller-name">{owner.name}</p>
              <p className="seller-location">{owner.location}</p>
              <button
                className="message-seller-button"
                onClick={handleMessageSeller}
              >
                Message Seller
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewListing;
