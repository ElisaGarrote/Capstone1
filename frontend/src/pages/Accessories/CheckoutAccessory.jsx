import NavBar from "../../components/NavBar";
import "../../styles/CheckoutAccessories.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import PersonIcon from "../../assets/icons/person.svg";
import LocationIcon from "../../assets/icons/location.svg";

export default function CheckoutAccessory() {
  const location = useLocation();
  const { id } = location.state || {}; // Retrieve the data that pass from the previous page. Set this empty if the id state is undefined or null.
  const [currentDate, setCurrentDate] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [checkoutTo, setCheckoutTo] = useState("employee");
  const [checkoutDate, setCheckoutDate] = useState("");

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
    setCheckoutDate(formattedDate);
  }, []);

  const handleImagesSelection = (event) => {
    const selectedFiles = Array.from(event.target.files); // Convert the FileList to Array
    if (selectedFiles.length > 0) {
      const imagesArray = selectedFiles.map((file) => {
        return URL.createObjectURL(file);
      });

      setPreviewImages(imagesArray);
    } else {
      setPreviewImages([]);
    }
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="checkout-accessories-page">
        <section className="top">
          <TopSecFormPage
            root="Accessory"
            currentPage="Checkout Accessory"
            rootNavigatePage="/accessories"
            title={id}
          />
        </section>
        <section className="checkout-form">
          <h2>Check-Out Form</h2>
          <form action="" method="post">
            <fieldset>
              <label htmlFor="checkout-to">Check-Out to *</label>
              <div>
                <section
                  className="employee-radio-container"
                  onClick={() => setCheckoutTo("employee")}
                >
                  <input
                    type="radio"
                    name="checkout-to"
                    id="radio-employee"
                    checked={checkoutTo == "employee" ? true : false}
                    onClick={() => setCheckoutTo("employee")}
                  />
                  <img src={PersonIcon} alt="person-icon" />
                  <label htmlFor="employee">Employee</label>
                </section>
                <section
                  className="location-radio-container"
                  onClick={() => setCheckoutTo("location")}
                >
                  <input
                    type="radio"
                    name="checkout-to"
                    id="radio-location"
                    checked={checkoutTo == "location" ? true : false}
                    onClick={() => setCheckoutTo("location")}
                  />
                  <img src={LocationIcon} alt="location-icon" />
                  <label htmlFor="location">Location</label>
                </section>
              </div>
            </fieldset>
            {checkoutTo == "employee" ? (
              <fieldset>
                <label htmlFor="employee">Employee *</label>
                <select name="employee" id="employee">
                  <option value="employee1">Employee 1</option>
                  <option value="employee2">Employee 2</option>
                  <option value="employee3">Employee 3</option>
                </select>
              </fieldset>
            ) : (
              <fieldset>
                <label htmlFor="location">Location *</label>
                <select name="location" id="location">
                  <option value="location1">Location 1</option>
                  <option value="location2">Location 2</option>
                  <option value="location3">Location 3</option>
                </select>
              </fieldset>
            )}
            <fieldset>
              <label htmlFor="checkout-date">Check-Out Date *</label>
              <input
                type="date"
                name="checkout-date"
                id="checkout-date"
                defaultValue={currentDate}
                required
                onChange={(e) => setCheckoutDate(e.target.value)}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="expected-return-date">Expected Return Date</label>
              <input
                type="date"
                name="expected-return-date"
                id="expected-return-date"
                min={checkoutDate}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="condition">Condition *</label>
              <select name="condition" id="condition" required>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </fieldset>
            <fieldset>
              <label htmlFor="upload-images">Photos</label>
              <div className="images-container">
                {previewImages &&
                  previewImages.map((image, index) => {
                    return (
                      <div key={image} className="image-selected">
                        <img src={image} alt="" />
                        <button
                          onClick={() =>
                            setPreviewImages(
                              previewImages.filter((e) => e !== image)
                            )
                          }
                        >
                          <img src={CloseIcon} alt="" />
                        </button>
                      </div>
                    );
                  })}
                <input
                  type="file"
                  name="images"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImagesSelection}
                  style={{ display: "none" }}
                />
              </div>
              <label htmlFor="images" className="upload-image-btn">
                {previewImages.length == 0 ? "Choose Image" : "Change Image"}
              </label>
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea name="notes" id="notes" maxLength="500"></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor="confirmation-email-notes">
                Confirmation Email Notes
              </label>
              <textarea name="notes" id="notes" maxLength="500"></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor="location">Location *</label>
              <select name="location" id="location" required>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
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
