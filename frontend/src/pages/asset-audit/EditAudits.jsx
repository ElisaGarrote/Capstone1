import NavBar from "../../components/NavBar";
import "../../styles/PerformAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import DeleteModal from "../../components/Modals/DeleteModal";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditAudits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccessFromEdit, setDeleteSucces] = useState(false);

  // Retrieve the "id" value passed from the navigation state.
  // If the "id" is not exist, the default value for this is "undifiend".
  const id = location.state?.id;
  const previousPage = location.state?.previousPage;

  // Function to assign the appropriate value for the root props in TopSecFormPage component
  const assignRoot = () => {
    if (previousPage == "/audits") {
      return "Audits";
    } else if (previousPage == "/audits/overdue") {
      return "Overdue Audit";
    } else if (previousPage == "/audits/scheduled") {
      return "Scheduled Audit";
    } else {
      return "Completed Audits";
    }
  };

  // Handle current date
  useEffect(() => {
    const today = new Date();
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options); // "en-CA" ensures YYYY-MM-DD format
    const formattedDate = formatter.format(today); // Format date in Philippines timezone
    setCurrentDate(formattedDate);
  }, []);

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={() => setDeleteSucces(true)}
        />
      )}

      {isDeleteSuccessFromEdit &&
        navigate(previousPage, { state: { isDeleteSuccessFromEdit } })}

      <nav>
        <NavBar />
      </nav>
      <main className="perform-audit-page fix-scrollbar">
        <section className="top">
          <TopSecFormPage
            root={assignRoot()}
            currentPage="Edit Audit"
            rootNavigatePage={previousPage}
            title={id}
            buttonType="delete"
            deleteModalOpen={() => setDeleteModalOpen(true)}
          />
        </section>
        <section className="perform-audit-form">
          <form action="" method="post">
            <fieldset>
              <label htmlFor="audit-date">Audit Due Date *</label>
              <input
                type="date"
                name="audit-due-date"
                id="audit-due-date"
                defaultValue={currentDate}
                max={currentDate}
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea name="notes" id="notes" maxLength="2000"></textarea>
            </fieldset>
          </form>
          {/* Place this button inside the form when working on the backend. */}
          <button
            type="submit"
            className="save-btn"
            onClick={() => {
              navigate(previousPage, {
                state: { isUpdateFromEdit: true },
              }); // navigate to audits page and pass the isUpdate as state
            }}
          >
            Update
          </button>
        </section>
      </main>
    </>
  );
}
