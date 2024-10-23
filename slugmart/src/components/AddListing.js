import React, { useState } from 'react';
import { auth, db, storage } from "../config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import './ListingsPage.css';
import Navbar from './Navbar';
import { handleLogout } from '../authUtil/logOut';
import { useNavigate } from 'react-router-dom';

function AddListing() {

        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [price, setPrice] = useState('');
        const [imageUpload, setImageUpload] = useState(null);
        const [imagePreview, setImagePreview] = useState(null);
        const [uploading, setUploading] = useState(false);
        // CONDITION IS LIKE NEW USED OTHER
        const [condition, setCondition] = useState('');

        const navigate = useNavigate();

        const handleListingSubmit = async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
        
            if (!user) {
              alert('You need to be logged in to create a listing.');
              return;
            }
        
            if (!imageUpload) {
              alert('Please upload an image of the item.');
              return;
            }
        
            const storageRef = ref(storage, `listingsImages/${imageUpload.name}`);
            const uploadTask = uploadBytesResumable(storageRef, imageUpload);
        
            setUploading(true);
        
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                // Optional: progress tracking
              },
              (error) => {
                console.error('Error uploading image:', error);
                setUploading(false);
              },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const listingRef = doc(db, 'listings', `${Date.now()}_${user.uid}`);
                await setDoc(listingRef, {
                  title,
                  description,
                  price,  // Add price to the listing
                  condition,  // Add condition to the listing
                  images: [downloadURL],
                  ownerId: user.uid,
                  createdAt: new Date(),
                });
                alert('Listing added!');
                setUploading(false);
              }
            );
          };
        
          // Function to trigger file upload
          const handleImageClick = () => {
            document.getElementById('imageUpload').click(); // Trigger hidden file input
          };
        
          // Function to handle image preview
          const handleImageChange = (e) => {
            const file = e.target.files[0];
            setImageUpload(file);
            setImagePreview(URL.createObjectURL(file)); // Preview image in the div
          };
        
          return (
            <div>
              <Navbar handleLogout={handleLogout(navigate)}/>
              <div className="add-listing-container">
                <div className="plus-button-container" onClick={handleImageClick}>
                  <div className="plus-button" style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none' }}>
                    {!imagePreview && <i className="fas fa-plus"></i>} {/* Show plus sign only when no image */}
                  </div>
                </div>
        
                <input
                  type="file"
                  id="imageUpload"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden-file-input"
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
                  
                  {/* Price Field */}
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