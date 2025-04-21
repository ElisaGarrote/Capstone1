import NavBar from "../../components/NavBar";
import "../../styles/ScheduleRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";

export default function ScheduleRegistration() {
  const [currentDate, setCurrentDate] = useState("");

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
      <nav>
        <NavBar />
      </nav>
      <main className="schedule-registration-page">
        <section className="top">
          <TopSecFormPage
            root="Audits"
            currentPage="Schedule Audits"
            rootNavigatePage="/audits"
            title="Schedule Audits"
          />
        </section>
        <section className="schedule-registration-form">
          <form action="" method="post">
            <fieldset>
              <label htmlFor="asset">Select Asset *</label>
              <select name="asset" id="asset">
                <option value="asset1">Asset 1</option>
                <option value="asset2">Asset 2</option>
                <option value="asset3">Asset 3</option>
              </select>
            </fieldset>
            <fieldset>
              <label htmlFor="audit-due-date">Audit Due Date *</label>
              <input
                type="date"
                name="audit-due-date"
                id="audit-due-date"
                min={currentDate}
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea name="notes" id="notes" maxLength="2000"></textarea>
            </fieldset>
            <button type="submit" className="save-btn">
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
