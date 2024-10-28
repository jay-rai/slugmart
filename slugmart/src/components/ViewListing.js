import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import Navbar from './Navbar';
import { handleLogout } from '../authUtil/logOut';

function ViewListing() {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null); // Separate state for owner info
  
  const fetchListing = async () => {
    try {
      const listingRef = doc(db, 'listings', listingId);
      const listingDoc = await getDoc(listingRef);
      if (listingDoc.exists()) {
        const listingData = listingDoc.data();
        setListing(listingData);

        // Fetch owner information if available
        if (listingData.ownerId) {
          const ownerRef = doc(db, 'users', listingData.ownerId);
          const ownerDoc = await getDoc(ownerRef);
          if (ownerDoc.exists()) {
            setOwner(ownerDoc.data());
          }
        }
      } else {
        console.error('Listing not found!');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!listing) {
    return <p>Listing not found</p>;
  }

  return (
    <div>
      <Navbar handleLogout={handleLogout} />
      <div className="view-listing-container">
        <div className="image-slider">
          {/* Display multiple images in a sliding view */}
          {listing.images && listing.images.length > 0 ? (
            listing.images.map((imageUrl, index) => (
              <img key={index} src={imageUrl} alt={`Listing Image ${index}`} className="listing-image" />
            ))
          ) : (
            <p>No images available for this listing.</p>
          )}
        </div>
        <h1>{listing.title}</h1>
        <p><strong>Price:</strong> ${listing.price}</p>
        <p><strong>Description:</strong> {listing.description}</p>
        <p><strong>Category:</strong> {listing.category}</p>
        <p><strong>Condition:</strong> {listing.condition}</p>

        {owner && (
          <div className="seller-info-container">
            <div className="seller-img">
              {/* Placeholder for user image */}
              {owner.picture ? (
                <img src={owner.picture} alt="Seller" className="seller-img" />
              ) : (
                <span>USER IMG</span>
              )}
            </div>
            <div className="seller-details">
              <p className="seller-name">{owner.name}</p>
              <p className="seller-location">{owner.location}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewListing;
