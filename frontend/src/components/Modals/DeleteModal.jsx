import { useEffect, useState } from "react";
import LoadingButton from "../LoadingButton";
import "../../styles/DeleteModal.css";

export default function ConfirmationModal({
  closeModal,
  onConfirm, 
  isOpen,
  actionType,      // "delete", "bulk delete", "activate", etc.
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    if (closeModal) closeModal();
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsProcessing(true);
      try {
        await onConfirm(); // parent handles API call
      } catch (error) {
        console.error("Action failed:", error);
      } finally {
        setIsProcessing(false);
        handleClose();
      }
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case "delete":
      case "bulk-delete":
        return "Delete";
      case "activate":
        return "Activate";
      case "deactivate":
        return "Deactivate";
      case "recover":
        return "Recover";
      default:
        return "Confirm";
    }
  };

  const getProcessingText = () => {
    switch (actionType) {
      case "delete":
      case "bulk-delete":
        return "Deleting...";
      case "activate":
        return "Activating...";
      case "deactivate":
        return "Deactivating...";
      case "recover":
        return "Recovering...";
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
        <div className="content" onClick={(e) => e.stopPropagation()}>
          <h2 className="modal-title">{getActionText()} Confirmation</h2>
          <p className="modal-message">
            Are you sure you want to {getActionText().toLowerCase()}{" "}
            {actionType === "bulk-delete" ? "selected items" : "this item"}? 
            This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </button>
            <button
              className={`confirm-action-btn ${actionType}-btn`}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? <LoadingButton /> : getActionText()}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}