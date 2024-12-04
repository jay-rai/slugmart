// helper functions for AddListing and EditListing components

// move item in array
export const moveItem = (fromIndex, toIndex, image, setImage) => {
  const updatedImage = [...image];
  const [movedItem] = updatedImage.splice(fromIndex, 1);
  updatedImage.splice(toIndex, 0, movedItem);
  setImage(updatedImage);
};

// delete image from array
export const deleteImage = (
  index,
  images,
  imagePreviews,
  setImages,
  setImagePreviews,
  setCurrentIndex
) => {
  const newImages = images.filter((_, i) => i !== index);
  const newPreviews = imagePreviews.filter((_, i) => i !== index);
  setImages(newImages);
  setImagePreviews(newPreviews);
  setCurrentIndex(newPreviews.length > 0 ? 0 : -1);
};

// move carousel to previous image
// https://stackoverflow.com/questions/77412887/the-counter-between-the-slide-and-the-buttons-below-isn-t-the-same-in-react-com
export const beforeImage = (
  currentIndex,
  setCurrentIndex,
  setSelectedThumbnailIndex,
  imagePreviews
) => {
  setCurrentIndex((prevIndex) => {
    const newIndex = prevIndex === 0 ? imagePreviews.length - 1 : prevIndex - 1;
    setSelectedThumbnailIndex(newIndex);
    return newIndex;
  });
};

// move carousel to next image
export const afterImage = (
  currentIndex,
  setCurrentIndex,
  setSelectedThumbnailIndex,
  imagePreviews
) => {
  setCurrentIndex((prevIndex) => {
    const newIndex = prevIndex === imagePreviews.length - 1 ? 0 : prevIndex + 1;
    setSelectedThumbnailIndex(newIndex);
    return newIndex;
  });
};

// select thumbnail image to drag and drop
export const selectThumbnail = (
  index,
  setSelectedThumbnailIndex,
  setCurrentIndex
) => {
  setSelectedThumbnailIndex(index);
  setCurrentIndex(index);
};

// prevent non-numeric input in price fields
export const onlyNumbers = (event, currentVal) => {
  // Rejects non numericals
  if (
    isNaN(event.key) &&
    event.key !== "Backspace" &&
    event.key !== "ArrowLeft" &&
    event.key !== "ArrowRight"
  ) {
    event.preventDefault();
  }
  
  // Rejects if >9 digits
  if (
    currentVal.length >= 9 && 
    event.key !== "Backspace" && 
    !isNaN(event.key)
  ) {
    event.preventDefault();
  }
};

// caps length of item titles and descriptions
export const setLetterLimit = (event, text, cap) => {
  if (
    text.length >= cap && 
    event.key !== "Backspace" && 
    event.key != "Delete"
  ) {
    event.preventDefault();
  }
};

// Validates pasted content so it doesn't violate our rules
export const validatePaste = (event, setPrice, currentPrice) => {
  const pastedData = event.clipboardData.getData("Text");
  
  // rejects if pasted data is not numerical only
  if (!/^\d{1,9}$/.test(pastedData)) {
    event.preventDefault();
    return;
  }

  const combinedLength = currentPrice.length + pastedData.length;

  // Checks if current Price + pasted digits are <9 digits
  if (combinedLength > 9) {
    event.preventDefault();
  } else {
    setPrice(combinedLength);
  }
};
