import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import { useForm } from "react-hook-form";

const sampleItems = [
  {
    id: 1,
    checkOutDate: '2023-10-01',
    returnDate: '2023-10-10',
    user: 'John Doe',
    asset: 'Dell XPS 13',
    notes: 'For software development',
    checkInDate: '',
  },
  {
    id: 2,
    checkOutDate: '2023-10-02',
    returnDate: '2023-10-05',
    user: 'Jane Smith',
    asset: 'Logitech Mouse',
    notes: 'For testing purposes',
    checkInDate: '',
  },
];

export default function CheckInComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ids } = location.state || {};  // Expecting an array of IDs
  const currentDate = new Date().toISOString().split("T")[0];
  
  // Find the item with the matching id
  const selectedItems = ids ? sampleItems.filter(item => ids.includes(item.id)) : [sampleItems[0]];
    
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    navigate("/components");
  };

  return (
    <>
      <nav><NavBar /></nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage="Check-In Component"
            rootNavigatePage="/components"
            title="Check-In Components"
          />
        </section>
        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Check-out Info</h2>
            {selectedItems.map((item) => (
              <div key={item.id}>
                <fieldset>
                  <label>Checked-Out To:</label>
                  <p>{item.user}</p>
                </fieldset>
                <fieldset>
                  <label>Asset:</label>
                  <p>{item.asset}</p>
                </fieldset>
                <fieldset>
                  <label>Check-Out Date:</label>
                  <p>{item.checkOutDate}</p>
                </fieldset>
                <fieldset>
                  <label>Expected Return Date:</label>
                  <p>{item.returnDate}</p>
                </fieldset>
                <fieldset>
                  <label>Notes:</label>
                  <p>{item.notes}</p>
                </fieldset>
              </div>
            ))}
          </section>

          <section className="checkin-form">
            <h2>Check-In Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label>Check-In Date *</label>
                <input
                  type="text"  // Use "text" instead of "date" to prevent date picker
                  readOnly
                  value={currentDate}  // Format: YYYY-MM-DD
                  className={errors.checkInDate ? 'input-error' : ''}
                  {...register("checkInDate")}
                />
              </fieldset>

              <fieldset>
                <label>Notes</label>
                <textarea {...register("notes")} maxLength="500" />
              </fieldset>

              <button type="submit" className="save-btn">Save</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}