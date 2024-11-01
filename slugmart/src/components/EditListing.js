import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase-config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Navbar from './Navbar';
import { handleLogout } from '../authUtil/logOut';
import './ListingsPage.css';

function EditListing() {
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
    const [newImageUploads, setNewImageUploads] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    
    const listCategories = ["Books", "Clothing, Shoes, & Accessories", "Collectibles",
      "Electronics", "Crafts", "Dolls & Bears", "Home & Garden", "Motors", "Pet Supplies",
       "Sporting Goods", "Toys & Hobbies", "Antiques", "Computers/Tablets"];

    // Fetch listing based on id
    useEffect(() => {
        const fetchListingData = async () => {
            try {
                const listingRef = doc(db, 'listings', id);
                const listingDoc = await getDoc(listingRef);
                if (listingDoc.exists()) {
                    setListing(listingDoc.data());
                    setImagePreviews(listingDoc.data().images || []);  // Set current images
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

    // resize image
    const resizeImage = (file, maxWidth, maxHeight, callback) => {
        const img = document.createElement('img');
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(callback, file.type, 1);
            };
        };

        reader.readAsDataURL(file);
    };

    // let user upload multiple images
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imagePreviews.length > 5) {
            alert('You can only upload up to 5 images.');
            return;
        }

        const newImagePreviews = [];
        const newImageResized = [];

        files.forEach(file => {
            resizeImage(file, 400, 400, (blob) => {
                newImageResized.push(blob);
                newImagePreviews.push(URL.createObjectURL(blob));
                setNewImageUploads([...newImageUploads, ...newImageResized]);
                setImagePreviews([...imagePreviews, ...newImagePreviews]);
            });
        });
    };

    // update listing
    const handleUpdateListing = async (e) => {
        e.preventDefault();
        const listingRef = doc(db, 'listings', id);

        // Upload new images
        if (newImageUploads.length > 0) {
            const uploadedImages = await Promise.all(
                newImageUploads.map(async (file) => {
                    const storageRef = ref(storage, `listingsImages/${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);
                    await new Promise((resolve, reject) => {
                        uploadTask.on('state_changed', null, reject, resolve);
                    });
                    return getDownloadURL(uploadTask.snapshot.ref);
                })
            );

            const updatedImages = [...listing.images, ...uploadedImages].slice(0, 5);

            // Update listing with new images
            await updateDoc(listingRef, {
                ...listing,
                images: updatedImages,
            });

            alert('Listing updated with new images!');
        } else {
            
            await updateDoc(listingRef, {
                title: listing.title,
                description: listing.description,
                price: listing.price,
                category: listing.category
            });
            alert('Listing updated!');
        }

        navigate('/account');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setListing({ ...listing, [name]: value });
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar handleLogout={handleLogout(navigate)}/>
            <h1 className="edit-lisiting-title">Edit Listing</h1>
            <div className={isMobile ? "edit-listing-container-mobile" : "edit-listing-container"}>
                <div className="image-container">
                        <label className="form-label">Current Images:</label>
                        <div className="image-preview-container">
                            {imagePreviews.map((image, index) => (
                                <img key={index} src={image} alt="Preview" className="image-preview" />
                            ))}
                        </div>
                        {imagePreviews.length < 5 && (
                            <input 
                                type="file" 
                                onChange={handleImageChange} 
                                accept="image/*" 
                                multiple 
                                className="file-input" 
                            />
                        )}
                </div>
                <div className="add-listing-form">
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
                    <button type="submit" className='post-button'>Update Listing</button>
                    </form>
                </div>
            </div>
        </div>
        
    );
}

export default EditListing;
