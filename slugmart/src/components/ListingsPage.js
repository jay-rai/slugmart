import React, { useState, useEffect } from "react";
import { db } from "../config/firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import { handleLogout } from "../authUtil/logOut";
import { useNavigate } from "react-router-dom";
import "./ListingsPage.css";

function ListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  // states for searching
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredListings, setFilteredListings] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const listCategories = [
    "Books",
    "Clothing, Shoes, & Accessories",
    "Collectibles",
    "Electronics",
    "Crafts",
    "Dolls & Bears",
    "Home & Garden",
    "Motors",
    "Pet Supplies",
    "Sporting Goods",
    "Toys & Hobbies",
    "Antiques",
    "Computers/Tablets",
  ];

  const fetchListings = async () => {
    const listingsCollection = collection(db, "listings");
    const listingSnapshot = await getDocs(listingsCollection);

    const listingsList = await Promise.all(
      listingSnapshot.docs.map(async (listingDoc) => {
        const data = listingDoc.data();
        const ownerRef = doc(db, "users", data.ownerId); // Correct Firestore doc reference
        const ownerDoc = await getDoc(ownerRef);
        const ownerData = ownerDoc.exists() ? ownerDoc.data() : null;
        return { id: listingDoc.id, ...data, owner: ownerData };
      })
    );

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
  };

  return (
    <div>
      <Navbar handleLogout={handleLogout(navigate)} />
      <div className="ListingsPage-browse-container">
        <h1>Browse Listings</h1>
        <div className="ListingsPage-search-bar">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <button
            className={`ListingsPage-category-button ${
              activeCategory == "" ? "ListingsPage-category-button--active" : ""
            }`}
            onClick={() => handleCategoryClick("")}
          >
            Show All
          </button>
          {listCategories.map((category) => (
            <button
              key={category}
              className={`ListingsPage-category-button ${
                activeCategory == category
                  ? "ListingsPage-category-button--active"
                  : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="ListingsPage-listings-grid">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="ListingsPage-listing-card"
              onClick={() => navigate(`/view-listing/${listing.id}`)}
            >
              <div className="ListingsPage-listing-image-container">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="ListingsPage-listing-image"
                />
              </div>
              <div className="ListingsPage-listing-price">
                <strong>$ {listing.price}</strong>
              </div>
              <div className="ListingsPage-listing-title">{listing.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ListingsPage;
