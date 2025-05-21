import "../../styles/DeleteModal.css";
import DeleteIcon from "../../assets/icons/delete-red.svg";
import CloseIcon from "../../assets/icons/close-icon.svg";


export default function DeleteModal({ closeModal, confirmDelete, endPoint, onDeleteFail, isOpen, onConfirm, onCancel }) {
  // Handle compatibility with different prop patterns
  const handleClose = closeModal || onCancel;
  const handleConfirm = async () => {
    if (confirmDelete) {
      const success = await handleDelete(endPoint);
      if (success) {
        await confirmDelete();
        if (closeModal) closeModal();
      } else if (onDeleteFail) {
        onDeleteFail();
      }
    } else if (onConfirm) {
      onConfirm();
    }
  };
  const handleDelete = async (endPoint) => {
    try {
      const response = await fetch(endPoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error("Delete failed");
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  };

  return (
    <main className="delete-modal">
      <div className="overlay" onClick={handleClose}></div>
      <div className="content">
        <button className="close-button" onClick={handleClose}>
          <img src={CloseIcon} alt="Close" />
        </button>
        <img src={DeleteIcon} alt="Delete" />
        <h3>Delete</h3>
        <p>Are you sure you want to delete?</p>
        <div>
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="confirm-button"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </main>
  );
}
