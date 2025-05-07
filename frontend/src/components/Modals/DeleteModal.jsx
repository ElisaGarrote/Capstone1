import "../../styles/DeleteModal.css";
import DeleteIcon from "../../assets/icons/delete-red.svg";
import CloseIcon from "../../assets/icons/close.svg";
 

export default function DeleteModal({ id, closeModal, confirmDelete, endPoint }) {
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
      <div className="overlay" onClick={closeModal}></div>
      <div className="content">
        <button className="close-button" onClick={closeModal}>
          <img src={CloseIcon} alt="" />
        </button>
        <img src={DeleteIcon} alt="" />
        <h3>Delete</h3>
        <p>Are you sure you want to delete?</p>
        <div>
          <button className="cancel-button" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="confirm-button"
            onClick={async () => {
              const success = await handleDelete(endPoint);
              if (success) {
                confirmDelete();  // triggers refresh + alert
                closeModal();
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </main>
  );
}
