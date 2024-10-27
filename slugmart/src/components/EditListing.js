import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase-config'; // Import Firebase config
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Navbar from './Navbar';
import { handleLogout } from '../authUtil/logOut';
import './ListingsPage.css';


function EditListing(){
    //get listing id
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        images: [],
    });
    const [newImageUpload, setNewImageUpload] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const listCategories = ["Books", "Clothing, Shoes, & Accessories", "Collectibles",
      "Electronics", "Crafts", "Dolls & Bears", "Home & Garden", "Motors", "Pet Supplies",
       "Sporting Goods", "Toys & Hobbies", "Antiques", "Computers/Tablets"];

    // fetch listing based on id
    useEffect(() => {
        const fetchListingData = async () => {
        try {
            const listingRef = doc(db, 'listings', id);
            const listingDoc = await getDoc(listingRef);
            if (listingDoc.exists()) {
            setListing(listingDoc.data());
            // set image to current preview
            setImagePreview(listingDoc.data().images[0]);
            } else {
            console.error('Listing not found!');
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
        }
        setLoading(false);
        };
        fetchListingData();
    }, [id]);

    // update listing submission
    const handleUpdateListing = async (e) => {
        e.preventDefault();
        const listingRef = doc(db, 'listings', id);

        if (newImageUpload) {
        // If the user uploaded a new image, handle the image upload
        const storageRef = ref(storage, `listingsImages/${newImageUpload.name}`);
        const uploadTask = uploadBytesResumable(storageRef, newImageUpload);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
            // upload progress
            },
            (error) => {
            console.error('Error uploading new image:', error);
            },
            async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(listingRef, {
                ...listing,
                images: [downloadURL],
            });
            alert('Listing updated with new image!');
            navigate('/account');
            }
        );
        } else {

        await updateDoc(listingRef, {
            title: listing.title,
            description: listing.description,
            price: listing.price,
            category: listing.category
        });
        alert('Listing updated!');
        navigate('/account'); 
        }
    };

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setListing({ ...listing, [name]: value });
    };

    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewImageUpload(file);
        setImagePreview(URL.createObjectURL(file)); 
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
        <Navbar handleLogout={handleLogout(navigate)}/>
        <div className="edit-listing-container">
            <h1>Edit Listing</h1>
            <form onSubmit={handleUpdateListing}>
            <div>
                <label className="form-label">Title:</label>
                <input
                type="text"
                name="title"
                value={listing.title}
                onChange={handleInputChange}
                className="form-input"
                required
                />
            </div>

            <div>
                <label className="form-label">Price:</label>
                <input
                type="number"
                name="price"
                value={listing.price}
                onChange={handleInputChange}
                className="form-input"
                required
                />
            </div>

            <div>
                <label className="form-label">Description:</label>
                <textarea
                name="description"
                value={listing.description}
                onChange={handleInputChange}
                className="form-input"
                required
                />
            </div>

            <div>
              <label className="form-label">Category: </label>
              <select 
                // className="select-categories"
                value={listing.category} 
                name="category"
                onChange={handleInputChange} 
                className="select-categories"
                required>

                <option value="" disabled>Select a Category</option>
                {listCategories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Image Upload Section */}
            <div>
                <label className="form-label">Current Image:</label>
                {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100px' }} />}
                <input type="file" onChange={handleImageChange} accept="image/*" />
            </div>

            <button type="submit">Update Listing</button>
            </form>
        </div>
        </div>
    );

}

export default EditListing