import { useNavigate } from "react-router-dom";
import "../styles/ActionButtons.css";

export default function ActionButtons({
  showEdit = false,
  showDelete = false,
  showView = false,
  editPath = "",
  editState = {},
  onDeleteClick = null,
  onViewClick = null,
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
    </section>
  );
}
