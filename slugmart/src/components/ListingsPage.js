import React, { useState, useEffect } from "react";
import { db } from "../config/firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import { handleLogout } from "../authUtil/logOut";
import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";
import "./ListingsPage.css";

function ListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredListings, setFilteredListings] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [bottomPrice, setBottomPrice] = useState("");
  const [topPrice, setTopPrice] = useState("");
  const [newToOld, setNewToOld] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        const ownerRef = doc(db, "users", data.ownerId);
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
      const withinPrice =
        (bottomPrice === "" || +listing.price >= +bottomPrice) &&
        (topPrice === "" || +listing.price <= +topPrice);

      return (
        (listing.title.toLowerCase().includes(searchLower) ||
          listing.description.toLowerCase().includes(searchLower)) &&
        (filterCategory === "" || listing.category === filterCategory) &&
        withinPrice
      );
    });

    if (newToOld) setFilteredListings(filtered.reverse());
    else setFilteredListings(filtered);
  }, [searchQuery, listings, filterCategory, bottomPrice, topPrice, newToOld]);

  const onlyNumbers = (event) => {
    if (
      isNaN(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight"
    ) {
      event.preventDefault();
    }
  };

  const handleCategoryClick = (category) => {
    setFilterCategory(category);
    setActiveCategory(category);
    setSidebarOpen(false);
  };

  return (
    <div className="ListingsPage">
      <Navbar handleLogout={handleLogout(navigate)} />
      <div className="MainContent">
        {isMobile ? (
          <>
            <button
              className="ListingsPage-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "Close Filter" : "Open Filter"}
            </button>
            <div
              className={`ListingsPage-sidebar ${sidebarOpen ? "open" : ""}`}
            >
              <h1>Filters</h1>
              <div className="ListingsPage-search-bar">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="ListingsPage-price-container">
                <label>Filter By Price</label>
                <div className="ListingsPage-price-row">
                  <input
                    type="text"
                    value={bottomPrice}
                    placeholder="min"
                    onChange={(e) => setBottomPrice(e.target.value)}
                    onKeyDown={onlyNumbers}
                    className="ListingsPage-form-input"
                  />
                  <input
                    type="text"
                    value={topPrice}
                    placeholder="max"
                    onChange={(e) => setTopPrice(e.target.value)}
                    onKeyDown={onlyNumbers}
                    className="ListingsPage-form-input"
                  />
                </div>
                <button
                  className={`ListingsPage-category-button ${
                    newToOld ? "ListingsPage-category-button--active" : ""
                  }`}
                  onClick={() => setNewToOld(true)}
                >
                  Newest To Oldest
                </button>
                <button
                  className={`ListingsPage-category-button ${
                    !newToOld ? "ListingsPage-category-button--active" : ""
                  }`}
                  onClick={() => setNewToOld(false)}
                >
                  Oldest To Newest
                </button>
              </div>
              <strong>Categories</strong>
              <button
                className={`ListingsPage-category-button ${
                  activeCategory === ""
                    ? "ListingsPage-category-button--active"
                    : ""
                }`}
                onClick={() => handleCategoryClick("")}
              >
                Show All
              </button>
              {listCategories.map((category) => (
                <button
                  key={category}
                  className={`ListingsPage-category-button ${
                    activeCategory === category
                      ? "ListingsPage-category-button--active"
                      : ""
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="ListingsPage-sidebar open">
            <h1>Filters</h1>
            <div className="ListingsPage-search-bar">
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ListingsPage-price-container">
              <label>Filter By Price</label>
              <div className="ListingsPage-price-row">
                <input
                  type="text"
                  value={bottomPrice}
                  placeholder="min"
                  onChange={(e) => setBottomPrice(e.target.value)}
                  onKeyDown={onlyNumbers}
                  className="ListingsPage-form-input"
                />
                <input
                  type="text"
                  value={topPrice}
                  placeholder="max"
                  onChange={(e) => setTopPrice(e.target.value)}
                  onKeyDown={onlyNumbers}
                  className="ListingsPage-form-input"
                />
              </div>
              <button
                className={`ListingsPage-category-button ${
                  newToOld ? "ListingsPage-category-button--active" : ""
                }`}
                onClick={() => setNewToOld(true)}
              >
                Newest To Oldest
              </button>
              <button
                className={`ListingsPage-category-button ${
                  !newToOld ? "ListingsPage-category-button--active" : ""
                }`}
                onClick={() => setNewToOld(false)}
              >
                Oldest To Newest
              </button>
            </div>
            <strong>Categories</strong>
            <button
              className={`ListingsPage-category-button ${
                activeCategory === ""
                  ? "ListingsPage-category-button--active"
                  : ""
              }`}
              onClick={() => handleCategoryClick("")}
            >
              Show All
            </button>
            {listCategories.map((category) => (
              <button
                key={category}
                className={`ListingsPage-category-button ${
                  activeCategory === category
                    ? "ListingsPage-category-button--active"
                    : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        <div className="ListingsPage-content">
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
                  <strong>${listing.price}</strong>
                </div>
                <div className="ListingsPage-listing-title">
                  {listing.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingsPage;
