import React, { useState } from 'react';
import { auth, db, storage } from "../config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import './AddListing.css';
import Navbar from './Navbar';
import { handleLogout } from '../authUtil/logOut';
import { useNavigate } from 'react-router-dom';

function AddListing() {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]); // Change to array for multiple images
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('');

  const listCategories = ["Books", "Clothing, Shoes, & Accessories", "Collectibles", "Electronics", "Crafts", "Dolls & Bears", "Home & Garden", "Motors", "Pet Supplies", "Sporting Goods", "Toys & Hobbies", "Antiques", "Computers/Tablets"];
  const [condition, setCondition] = useState('');

  const navigate = useNavigate();

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert('You need to be logged in to create a listing.');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image of the item.');
      return;
    }

    setUploading(true);

    const imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const storageRef = ref(storage, `listingsImages/${images[i].name}`);
      const uploadTask = uploadBytesResumable(storageRef, images[i]);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Optional: progress tracking
          },
          (error) => {
            console.error('Error uploading image:', error);
            setUploading(false);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            imageUrls.push(downloadURL);
            resolve();
          }
        );
      });
    }

    const listingRef = doc(db, 'listings', `${Date.now()}_${user.uid}`);
    await setDoc(listingRef, {
      title,
      description,
      price,
      condition,
      category,
      images: imageUrls,
      ownerId: user.uid,
      createdAt: new Date(),
    });

    alert('Listing added!');
    setUploading(false);
    navigate('/');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('You can upload up to 5 images.');
      return;
    }

    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  return (
    <div>
      <Navbar handleLogout={handleLogout(navigate)} />
      <div className="add-listing-container">
        <div className="image-preview-container">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="image-preview-box">
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          ))}
          {imagePreviews.length < 5 && (
            <div className="plus-button-container" onClick={() => document.getElementById('imageUpload').click()}>
              <div className="plus-button">
                <i className="fas fa-plus"></i>
              </div>
            </div>
          )}
        </div>

        <input
          type="file"
          id="imageUpload"
          onChange={handleImageChange}
          accept="image/*"
          className="hidden-file-input"
          multiple
          required
        />

        <form onSubmit={handleListingSubmit} className="add-listing-form">
          <div>
            <label className="form-label">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Price:</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Category: </label>
            <select
              className="select-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select a Category</option>
              {listCategories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="condition-buttons">
            <button
              type="button"
              className={`condition-btn ${condition === 'new' ? 'active' : ''}`}
              onClick={() => setCondition('new')}
            >
              New
            </button>
            <button
              type="button"
              className={`condition-btn ${condition === 'used' ? 'active' : ''}`}
              onClick={() => setCondition('used')}
            >
              Used
            </button>
            <button
              type="button"
              className={`condition-btn ${condition === 'other' ? 'active' : ''}`}
              onClick={() => setCondition('other')}
            >
              Other
            </button>
          </div>

          <button type="submit" disabled={uploading} className="post-button">
            {uploading ? 'Uploading...' : 'Post It'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddListing;
