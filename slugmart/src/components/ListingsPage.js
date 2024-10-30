import React, { useState, useEffect } from 'react';
import { db } from "../config/firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Navbar from './Navbar';
import { handleLogout } from '../authUtil/logOut';
import { useNavigate } from 'react-router-dom';
import './ListingsPage.css';
function ListingsPage() {

    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    // states for searching
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredListings, setFilteredListings] = useState([]);
    const [filterCategory, setFilterCategory] = useState("");
    const [activeCategory, setActiveCategory] = useState("");

    const listCategories = ["Books", "Clothing, Shoes, & Accessories",
      "Collectibles", "Electronics", "Crafts", "Dolls & Bears", "Home & Garden",
      "Motors", "Pet Supplies", "Sporting Goods", "Toys & Hobbies", "Antiques",
      "Computers/Tablets"];

    const fetchListings = async () => {
        const listingsCollection = collection(db, 'listings');
        const listingSnapshot = await getDocs(listingsCollection);
        
        const listingsList = await Promise.all(listingSnapshot.docs.map(async (listingDoc) => {
        const data = listingDoc.data();
        const ownerRef = doc(db, 'users', data.ownerId); // Correct Firestore doc reference
        const ownerDoc = await getDoc(ownerRef);
        const ownerData = ownerDoc.exists() ? ownerDoc.data() : null;
        return { id: listingDoc.id, ...data, owner: ownerData };
        }));

        setListings(listingsList);
    };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    const filtered = listings.filter((listing) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower)) &&
        (filterCategory == "" || listing.category == filterCategory)
      );
    });
    setFilteredListings(filtered);
  }, [searchQuery, listings, filterCategory]);

  const handleCategoryClick = (category) => {
    setFilterCategory(category);
    setActiveCategory(category);
  }

  return (
    <div>
      <Navbar handleLogout={handleLogout(navigate)} />
      <div className="browse-container">
        <h1>Browse Listings</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <button 
            className={`category-button ${activeCategory == "" ? 'active' : ''}`}
            onClick={() => handleCategoryClick("")}>Show All</button>
          {listCategories.map((category) => (
            <button 
              key={category}
              className={`category-button ${activeCategory == category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}>
              {category}
            </button>
          ))}
        </div>

        <div className="listings-grid">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="listing-card" onClick={() => navigate(`/view-listing/${listing.id}`)}>
            <img src={listing.images[0]} alt={listing.title} className="listing-image" />
            <h3>{listing.title}</h3>
            <p><strong>Price:</strong> ${listing.price}</p>
            <p><strong>Category:</strong> {listing.category}</p>
            <p>{listing.description}</p>
          </div>
          ))}
        </div>
      </div>
    </div>
  );

}

export default ListingsPage;