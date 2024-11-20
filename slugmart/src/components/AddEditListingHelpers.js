// listingHelpers.js

export const moveItem = (fromIndex, toIndex, image, setImage) => {
  const updatedImage = [...image];
  const [movedItem] = updatedImage.splice(fromIndex, 1);
  updatedImage.splice(toIndex, 0, movedItem);
  setImage(updatedImage);
};

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

export const selectThumbnail = (
  index,
  setSelectedThumbnailIndex,
  setCurrentIndex
) => {
  setSelectedThumbnailIndex(index);
  setCurrentIndex(index);
};
