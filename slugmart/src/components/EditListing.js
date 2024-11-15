import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../config/firebase-config";
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
import "./AddEditListing.css";

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);

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

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const listingRef = doc(db, "listings", id);
        const listingDoc = await getDoc(listingRef);
        if (listingDoc.exists()) {
          const listingData = listingDoc.data();
          setTitle(listingData.title);
          setDescription(listingData.description);
          setPrice(listingData.price);
          setCategory(listingData.category);
          setCondition(listingData.condition);
          setImages(listingData.images || []);
          setImagePreviews(listingData.images || []);
          setCurrentIndex(0);
        } else {
          console.error("Listing not found!");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
      setLoading(false);
    };
    fetchListingData();
  }, [id]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/jpg": [] },
    maxFiles: 5 - images.length,
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
      const newPreviews = newImages.map((file) =>
        typeof file === "string" ? file : URL.createObjectURL(file)
      );
      setImages(newImages);
      setImagePreviews(newPreviews);
      setCurrentIndex(0);
    },
  });

  const handleListingSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image of the item.");
      return;
    }

    const listingRef = doc(db, "listings", id);

    setUploading(true);

    const newImageUrls = [];
    for (let i = 0; i < images.length; i++) {
      if (typeof images[i] === "string" && images[i].startsWith("http")) {
        newImageUrls.push(images[i]);
      } else {
        const storageRef = ref(storage, `listingsImages/${images[i].name}`);
        const uploadTask = uploadBytesResumable(storageRef, images[i]);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => {
              console.error("Error uploading image:", error);
              setUploading(false);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              newImageUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }
    }

    await updateDoc(listingRef, {
      title,
      description,
      price,
      category,
      condition,
      images: newImageUrls,
    });

    alert("Listing updated!");
    setUploading(false);
    navigate("/account");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Navbar handleLogout={handleLogout(navigate)} />
      <div className="add-listing-container">
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

export default EditListing;
