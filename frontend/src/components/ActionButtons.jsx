import { useNavigate } from "react-router-dom";
import "../styles/ActionButtons.css";

export default function ActionButtons({
  showEdit = false,
  showDelete = false,
  showView = false,
  editPath = "",
  editState = {},
  showRecover = false,
  showCheck = false, 
  statusType = "",
  onDeleteClick = null,
  onViewClick = null,
  onRecoverClick = null,
  onCheckClick = null, 
}) {
  const navigate = useNavigate();

  return (
    <section className="action-button-section">
      {showEdit && (
        <button
          title="Edit"
          className="action-button"
          onClick={() => navigate(editPath, { state: editState })}
        >
          <i className="fas fa-edit"></i>
        </button>
      )}

      {showDelete && (
        <button
          title="Delete"
          className="action-button"
          onClick={onDeleteClick}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      )}

      {showView && (
        <button
          title="View"
          className="action-button"
          onClick={onViewClick}
        >
          <i className="fas fa-eye"></i>
        </button>
      )}

      {showRecover && (
        <button
          title="Recover"
          className="action-button action-button-recover"
          onClick={onRecoverClick}
        >
          <i className="fas fa-undo"></i>
        </button>
      )}

      {showCheck && statusType && (
        <button
          title={statusType === "deployable" ? "Check Out" : "Check In"}
          className={`action-button ${
            statusType === "deployable"
              ? "action-button-checkout"
              : "action-button-checkin"
          }`}
          onClick={onCheckClick}
        >
          <i
            className={
              statusType === "deployable"
                ? "fas fa-sign-out-alt"
                : "fas fa-sign-in-alt"
            }
          ></i>
        </button>
      )}
    </section>
  );
}
