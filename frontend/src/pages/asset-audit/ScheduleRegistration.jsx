import NavBar from "../../components/NavBar";
import "../../styles/ScheduleRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import Select from "react-select";

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

  const assetOptions = [
    { value: "100000 - XPS 13", label: "100000 - XPS 13" },
    { value: "100001 - ThinkPad E15 G4", label: "100001 - ThinkPad E15 G4" },
    { value: '100008 - Macbook Pro 16"', label: '100008 - Macbook Pro 16"' },
    {
      value: "100036 - Microsoft Surface Pro 11",
      label: "100036 - Microsoft Surface Pro 11",
    },
  ];

  const customStylesDropdown = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      borderRadius: "10px",
      fontSize: "0.875rem",
      padding: "3px 8px",
    }),
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "grey",
      fontSize: "0.875rem",
    }),
  };

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
              <Select
                options={assetOptions}
                styles={customStylesDropdown}
                placeholder="Select locatioin..."
              />
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
