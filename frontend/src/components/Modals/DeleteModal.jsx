import { useEffect, useState } from "react";
import LoadingButton from "../LoadingButton";
import "../../styles/DeleteModal.css";
import {
  deleteProduct,
  bulkDeleteProducts,
  deleteAsset,
  bulkDeleteAssets,
} from "../../services/assets-service";

export default function ConfirmationModal({
  closeModal,
  isOpen,
  actionType,      // "delete", "bulk-delete", "activate", etc.
  entityType,      // "product", "asset"
  targetId,        // single ID for delete
  targetIds,       // array of IDs for bulk-delete
  selectedCount,   // optional explicit count to show in modal
  onSuccess,       // callback after successful delete (receives deleted id(s))
  onError,         // callback on error (receives error)
  // Optional parent-driven confirm flow: some pages pass `onConfirm` which
  // performs the API call and returns { ok: true } or { ok: false, data: ... }
  onConfirm,
  // Optional parent-side bulk failure handler
  onDeleteFail,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    if (closeModal) closeModal();
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // If parent provided an `onConfirm` callback, defer the action to it.
      if (typeof onConfirm === "function") {
        const result = await onConfirm();
        // Parent is expected to return { ok: true } on success
        if (result && result.ok) {
          if (onSuccess) onSuccess(result.data ?? (Array.isArray(targetIds) ? targetIds : targetId));
        } else {
          // allow parent to handle bulk-skipped/reporting via onDeleteFail
          if (typeof onDeleteFail === "function") {
            onDeleteFail(result?.data ?? result);
          } else if (onError) {
            onError(result?.data ?? result);
          }
        }
        return;
      }

      // Fallback: modal performs the API action directly (legacy behavior)
      if (actionType === "delete" && targetId) {
        // Single delete
        if (entityType === "product") {
          await deleteProduct(targetId);
        } else if (entityType === "asset") {
          await deleteAsset(targetId);
        }
        if (onSuccess) onSuccess(targetId);
        } else if (actionType === "bulk-delete" && targetIds?.length > 0) {
        // Bulk delete
        if (entityType === "product") {
          const res = await bulkDeleteProducts({ ids: targetIds });
          // New backend response: { deleted_count, skipped_count, deleted_ids, failed }
          const skippedCount = res?.skipped_count ?? res?.skipped ?? 0;
          const failedList = res?.failed ?? (res?.failed_ids ? res.failed_ids : []);
          const deletedIds = res?.deleted_ids ?? (skippedCount ? [] : targetIds);

          if (skippedCount > 0 || (Array.isArray(failedList) && failedList.length > 0)) {
            if (typeof onDeleteFail === "function") {
              onDeleteFail(res);
            } else if (onError) {
              onError({ response: { data: res } });
            }
          } else {
            if (onSuccess) onSuccess(deletedIds.length ? deletedIds : targetIds);
          }
        } else if (entityType === "asset") {
          const res = await bulkDeleteAssets({ ids: targetIds });
          const skippedCount = res?.skipped_count ?? res?.skipped ?? 0;
          const failedList = res?.failed ?? (res?.failed_ids ? res.failed_ids : []);
          const deletedIds = res?.deleted_ids ?? (skippedCount ? [] : targetIds);

          if (skippedCount > 0 || (Array.isArray(failedList) && failedList.length > 0)) {
            if (typeof onDeleteFail === "function") {
              onDeleteFail(res);
            } else if (onError) {
              onError({ response: { data: res } });
            }
          } else {
            if (onSuccess) onSuccess(deletedIds.length ? deletedIds : targetIds);
          }
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
      if (onError) onError(error);
    } finally {
      setIsProcessing(false);
      handleClose();
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
            {actionType === "bulk-delete" ? (
              <>Are you sure you want to delete these {selectedCount ?? (targetIds?.length || 0)} {entityType || 'item'}(s)? This action cannot be undone.</>
            ) : (
              <>Are you sure you want to delete this {entityType || 'item'}? This action cannot be undone.</>
            )}
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