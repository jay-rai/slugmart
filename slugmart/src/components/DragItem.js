import React from "react";
import { useDrag, useDrop } from "react-dnd";

// DragItem component handles individual image thumbnails with drag-and-drop functionality
// https://react-dnd.github.io/react-dnd/docs/api/hooks-overview
const DragItem = ({
  id,
  preview,
  index,
  moveItem,
  selectThumbnail,
  selected,
}) => {
  // useDrag hook from react-dnd to make the item draggable
  const [, ref] = useDrag({
    type: "image",
    item: { id, index },
  });

  // useDrop hook from react-dnd to make the item droppable
  const [, drop] = useDrop({
    accept: "image",
    hover: (draggedItem) => {
      // If dragged item not the same as the current item
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <img
      // Ref to allow drag-and-drop functionality
      ref={(node) => ref(drop(node))}
      src={preview}
      alt={`Thumbnail ${index + 1}`}
      className={`image-thumbnail ${selected ? "selected" : ""}`}
      onClick={() => selectThumbnail(index)}
    />
  );
};

export default DragItem;
