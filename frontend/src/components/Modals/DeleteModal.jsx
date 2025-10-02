import "../../styles/DeleteModal.css";
import DeleteIcon from "../../assets/icons/delete-red.svg";
import CloseIcon from "../../assets/icons/close-icon.svg";
import { useEffect, useState } from "react";
import LoadingButton from "../LoadingButton";

export default function ConfirmationModal({
  closeModal,
  confirmDelete,
  endPoint,
  onDeleteFail,
  isOpen,
  onConfirm,
  onCancel,
  actionType,
}) {
  /*
  Action Type includes the following:
    - delete
    - activate
    - deactivate
  */

  const [isDeleting, setDeleting] = useState(false);

  // Handle compatibility with different prop patterns
  const handleClose = closeModal || onCancel;
  const handleConfirm = async () => {
    if (confirmDelete) {
      setDeleting(true);
      const success = await handleDelete(endPoint);
      if (success) {
        await confirmDelete();
        if (closeModal) closeModal();
      } else {
        if (onDeleteFail) onDeleteFail();
        if (closeModal) closeModal(); // Always close the modal even on failure
      }
    } else if (onConfirm) {
      onConfirm();
    }
  };
  const handleDelete = async (endPoint) => {
    try {
      const response = await fetch(endPoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Delete failed");
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case "delete":
        return "Delete";
      case "activate":
        return "Activate";
      case "deactivate":
        return "Deactivate";
      default:
        return "Confirm";
    }
  };

  const getProcessingText = () => {
    switch (actionType) {
      case "delete":
        return "Deleting...";
      case "activate":
        return "Activating...";
      case "deactivate":
        return "Deactivating...";
      default:
        return "Processing...";
    }
  };

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  return (
    <section className="delete-modal">
      <div className="overlay" onClick={handleClose}>
        <div className="content">
          <h2 className="modal-title">{getActionText()} Confirmation</h2>
          <p className="modal-message">
            Are you sure you want to {getActionText().toLowerCase()} this{" "}
            {actionType != "activate" && actionType != "deactivate"
              ? "item"
              : "user"}
            ? This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button
              className={`confirm-action-btn ${actionType}-btn`}
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <LoadingButton />}
              {!isDeleting ? getActionText() : getProcessingText()}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
