import "../../styles/DeleteModal.css";
import DeleteIcon from "../../assets/icons/delete-red.svg";
import CloseIcon from "../../assets/icons/close.svg";

export default function DeleteModal({ id, closeModal, confirmDelete }) {
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
            onClick={() => {
              confirmDelete(), closeModal();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </main>
  );
}
