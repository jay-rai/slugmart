import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../config/firebase-config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Navbar from "./Navbar";
import { useDropzone } from "react-dropzone";
import { handleLogout } from "../authUtil/logOut";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile, isTablet } from "react-device-detect";
import {
  moveItem,
  deleteImage,
  beforeImage,
  afterImage,
  selectThumbnail,
} from "./AddEditListingHelpers";
import DragItem from "./DragItem";
import Popup from "./Popup";
import "./AddEditListing.css";

function AddListing() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);

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
  const [condition, setCondition] = useState("");
  const navigate = useNavigate();

  // https://react-dropzone.js.org/
  // https://stackoverflow.com/questions/53272513/async-image-gallery-in-react
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/jpg": [] },
    maxFiles: 5,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        alert("Only JPEG and PNG files are allowed.");
        return;
      }
      const filteredFiles = acceptedFiles.filter(
        (file) =>
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/jpg"
      );

      if (filteredFiles.length + images.length > 5) {
        alert("You can upload up to 5 images.");
        return;
      }

      const newImages = [...images, ...filteredFiles];
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImages(newImages);
      setImagePreviews(newPreviews);
      setCurrentIndex(0);
      setSelectedThumbnailIndex(0);
    },
  });

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("You need to be logged in to create a listing.");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one image of the item.");
      return;
    }

    setUploading(true);

    const imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const storageRef = ref(storage, `listingsImages/${images[i].name}`);
      const uploadTask = uploadBytesResumable(storageRef, images[i]);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Optional: progress tracking
          },
          (error) => {
            console.error("Error uploading image:", error);
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

    const listingRef = doc(db, "listings", `${Date.now()}_${user.uid}`);
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

    setUploading(false);
    setPopupVisible(true);
    setTimeout(() => {
      navigate("/browse");
    }, 3000); // Redirect after 3 seconds
  };
  return (
    <div>
      <Navbar handleLogout={handleLogout(navigate)} />
      <div className="add-listing-container">
        {popupVisible && (
          <Popup
            message="Listing added!"
            onClose={() => {
              setPopupVisible(false);
              navigate("/");
            }}
          />
        )}
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {imagePreviews.length < 5 && (
            <p>
              Drag & drop some files here, or click to select files (Max 5
              images)
            </p>
          )}
        </div>
        <div className="image-preview-container">
          {imagePreviews.length > 0 && (
            <div className="carousel">
              <button
                className="carousel-button prev"
                onClick={() =>
                  beforeImage(
                    currentIndex,
                    setCurrentIndex,
                    setSelectedThumbnailIndex,
                    imagePreviews
                  )
                }
              >
                &#8249;
              </button>
              <div className="image-preview-box">
                <img
                  src={imagePreviews[currentIndex]}
                  alt="Preview"
                  className="image-preview"
                />
                <button
                  onClick={() =>
                    deleteImage(
                      currentIndex,
                      images,
                      imagePreviews,
                      setImages,
                      setImagePreviews,
                      setCurrentIndex
                    )
                  }
                  className="delete-image-button"
                >
                  &times;
                </button>
              </div>
              <button
                className="carousel-button next"
                onClick={() =>
                  afterImage(
                    currentIndex,
                    setCurrentIndex,
                    setSelectedThumbnailIndex,
                    imagePreviews
                  )
                }
              >
                &#8250;
              </button>
            </div>
          )}
          <div className="image-thumbnails">
            <DndProvider
              backend={isMobile || isTablet ? TouchBackend : HTML5Backend}
            >
              {imagePreviews.map((preview, index) => (
                <DragItem
                  key={index}
                  id={index}
                  preview={preview}
                  index={index}
                  moveItem={(fromIndex, toIndex) =>
                    moveItem(
                      fromIndex,
                      toIndex,
                      imagePreviews,
                      setImagePreviews
                    )
                  }
                  selectThumbnail={(index) =>
                    selectThumbnail(
                      index,
                      setSelectedThumbnailIndex,
                      setCurrentIndex
                    )
                  }
                  selected={index === selectedThumbnailIndex}
                />
              ))}
            </DndProvider>
          </div>
        </div>
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
              max="1000000"
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
            <label className="form-label">Category:</label>
            <select
              className="select-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a Category
              </option>
              {listCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="condition-buttons">
            <button
              type="button"
              className={`condition-btn ${condition === "new" ? "active" : ""}`}
              onClick={() => setCondition("new")}
            >
              New
            </button>
            <button
              type="button"
              className={`condition-btn ${
                condition === "used" ? "active" : ""
              }`}
              onClick={() => setCondition("used")}
            >
              Used
            </button>
            <button
              type="button"
              className={`condition-btn ${
                condition === "other" ? "active" : ""
              }`}
              onClick={() => setCondition("other")}
            >
              Other
            </button>
          </div>
          <button type="submit" className="submit-button">
            {uploading ? "Uploading..." : "Update Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddListing;
