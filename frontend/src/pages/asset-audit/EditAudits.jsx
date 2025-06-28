import NavBar from "../../components/NavBar";
import "../../styles/PerformAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function EditAudits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState("");

  // Retrieve the data passed from the navigation state
  const auditData = location.state?.data || null;
  const id = location.state?.id;
  const previousPage = location.state?.previousPage;

  // Form handling
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    mode: "all",
    defaultValues: {
      auditDueDate: '',
      notes: ''
    }
  });

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

  // Set form values when audit data is available
  useEffect(() => {
    if (auditData) {
      // Set the original audit due date (could be 'date' or 'due_date' depending on data structure)
      const dueDate = auditData.date || auditData.due_date;
      if (dueDate) {
        setValue("auditDueDate", dueDate);
      }
      // Set the original notes
      if (auditData.notes) {
        setValue("notes", auditData.notes);
      }
    }
  }, [auditData, setValue]);

  // Form submission handler
  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    navigate(previousPage, {
      state: { isUpdateFromEdit: true },
    });
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="perform-audit-page fix-scrollbar">
        <section className="top">
          <TopSecFormPage
            root={assignRoot()}
            currentPage="Edit Audit"
            rootNavigatePage={previousPage}
            title={auditData ? `${auditData.asset_info?.displayed_id || ''} - ${auditData.asset_info?.name || 'Edit Audit'}` : (id || 'Edit Audit')}
          />
        </section>
        <section className="perform-audit-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label htmlFor="audit-due-date">Audit Due Date <span style={{color: 'red'}}>*</span></label>
              <input
                type="date"
                name="audit-due-date"
                id="audit-due-date"
                {...register("auditDueDate", {
                  required: "Audit due date is required",
                })}
              />
              {errors.auditDueDate && (
                <span className='error-message'>{errors.auditDueDate.message}</span>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                id="notes"
                maxLength="2000"
                placeholder="Notes..."
                {...register("notes")}
              ></textarea>
            </fieldset>
            <button
              type="submit"
              className="save-btn"
              disabled={!isValid}
            >
              Update
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
