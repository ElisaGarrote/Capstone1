import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ActionButtons.css";
import { getUserRole } from "../utils/user";
import { getUserFromToken } from "../api/TokenUtils";

export default function ActionButtons({
  showView = false,
  showEdit = false,
  showDelete = false,
  showRecover = false,
  showCheckout = false,
  showCheckin = false,

  disableCheckout = false,
  disableCheckin = false,

  onViewClick = null,
  editPath = "",
  editState = {},
  onDeleteClick = null,
  deleteDisabled = false,
  deleteTitle = "",
  onRecoverClick = null,
  onCheckoutClick = null,
  onCheckinClick = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserFromToken();

  const allowedPaths = [
    "/repairs",
    "/audits",
    "/audits/overdue",
    "/audits/scheduled",
    "/audits/completed",
  ];

  return (
    <section className="action-button-section">
      {showView && (
        <button
          title="View"
          className="action-button"
          onClick={onViewClick}
        >
          <i className="fas fa-eye"></i>
        </button>
      )}

      {showEdit &&
        allowedPaths.some((path) => location.pathname.includes(path)) &&
        getUserRole() === "operator" && (
          <button
            title="Edit"
            className="action-button"
            onClick={() => navigate(editPath, { state: editState })}
          >
            <i className="fas fa-edit"></i>
          </button>
        )}

      {showEdit && user.roles[0].role === "admin" && (
        <button
          title="Edit"
          className="action-button"
          onClick={() => navigate(editPath, { state: editState })}
        >
          <i className="fas fa-edit"></i>
        </button>
      )}

      {showDelete && user.roles[0].role === "admin" && (
        <button
          title={deleteTitle || "Delete"}
          className="action-button"
          onClick={() => !deleteDisabled && onDeleteClick?.()}
          disabled={deleteDisabled}
        >
          <i className="fas fa-trash-alt"></i>
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

      {showCheckout && (
        <button
          title={disableCheckout ? "Already Checked Out" : "Check Out"}
          className="action-button action-button-checkout"
          onClick={() => !disableCheckout && onCheckoutClick?.()}
          disabled={disableCheckout}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Check-Out</span>
        </button>
      )}

      {showCheckin && (
        <button
          title={disableCheckin ? "Already Checked In" : "Check In"}
          className="action-button action-button-checkin"
          onClick={() => !disableCheckin && onCheckinClick?.()}
          disabled={disableCheckin}
        >
          <i className="fas fa-sign-in-alt"></i>
          <span>Check-In</span>
        </button>
      )}
    </section>
  );
}
