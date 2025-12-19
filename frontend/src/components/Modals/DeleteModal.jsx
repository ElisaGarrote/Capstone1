import { useEffect, useState } from "react";
import LoadingButton from "../LoadingButton";

import "../../styles/DeleteModal.css";

export default function ConfirmationModal({
  closeModal,
  confirmDelete,
  endPoint,
  onDeleteFail,
  isOpen,
  onConfirm,
  onCancel,
  actionType,
  selectedCount,
}) {
  /*
  Action Type includes the following:
    - delete
    - activate
    - deactivate
    - recover
  */

  const [isDeleting, setDeleting] = useState(false);
  

  // Handle compatibility with different prop patterns
  const handleClose = closeModal || onCancel;
  const handleConfirm = async () => {
    // Prefer the modern `onConfirm` callback (page provides deletion logic)
    if (onConfirm) {
      setDeleting(true);
      try {
        const result = await onConfirm();
        // If the handler returns a structured result, show server message and keep modal open on failure
        if (result && (result.ok === false || (result.data && result.data.skipped && Object.keys(result.data.skipped).length))) {
          const payload = result.data || result;
          if (onDeleteFail) onDeleteFail(payload);
          if (closeModal) closeModal();
          return;
        }
        // success path: close modal
        if (closeModal) closeModal();
      } catch (err) {
        console.error("onConfirm failed", err);
        if (onDeleteFail) onDeleteFail(err?.response?.data || err);
        if (closeModal) closeModal();
      } finally {
        setDeleting(false);
      }
      return;
    }

    // Backwards-compat: if a confirmDelete prop exists, call it and interpret structured result
    if (confirmDelete) {
      setDeleting(true);
      try {
        const result = await confirmDelete();
        if (result && (result.ok === false || (result.data && result.data.skipped && Object.keys(result.data.skipped).length))) {
          const payload = result.data || result;
          if (onDeleteFail) onDeleteFail(payload);
          if (closeModal) closeModal();
          return;
        }
        if (closeModal) closeModal();
      } catch (err) {
        console.error("confirmDelete failed", err);
        if (onDeleteFail) onDeleteFail(err?.response?.data || err);
        if (closeModal) closeModal();
      } finally {
        setDeleting(false);
      }
      return;
    }

    // Last resort: attempt to call the endpoint directly only if provided
    if (!endPoint) {
      setServerMessage("No endpoint provided for delete action.");
      return;
    }
    setDeleting(true);
    try {
      const success = await handleDelete(endPoint);
      if (success) {
        if (closeModal) closeModal();
      } else {
        setServerMessage("Delete failed");
        if (onDeleteFail) onDeleteFail();
      }
    } catch (err) {
      console.error("handleConfirm fallback failed", err);
      setServerMessage(err?.message || "Delete failed");
      if (onDeleteFail) onDeleteFail(err);
    } finally {
      setDeleting(false);
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
      case "recover":
        return "Recover";
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
            {((selectedCount || 0) > 1)
              ? `Are you sure you want to ${getActionText().toLowerCase()} these ${selectedCount} items? This action cannot be undone.`
              : <>Are you sure you want to {getActionText().toLowerCase()} this {actionType != "activate" && actionType != "deactivate" ? "item" : "user"}? This action cannot be undone.</>
            }
          </p>
          {/* Server messages are shown via the page-level Alert; hide inside modal */}
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
