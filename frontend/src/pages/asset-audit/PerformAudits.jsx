import NavBar from "../../components/NavBar";
import "../../styles/PerformAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";

export default function PerformAudits() {
  const [currentDate, setCurrentDate] = useState("");
  const [previewImages, setPreviewImages] = useState([]);

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
      <main className="perform-audit-page">
        <section className="top">
          <TopSecFormPage
            root="Audits"
            currentPage="Perform Audits"
            rootNavigatePage="/audits"
            title="Perform Audits"
          />
        </section>
        <section className="perform-audit-form">
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
              <label htmlFor="location">Location *</label>
              <select name="location" id="location" required>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </fieldset>
            <fieldset>
              <label htmlFor="perform-by">Perform by *</label>
              <select name="perform-by" id="perform-by" required>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </fieldset>
            <fieldset>
              <label htmlFor="audit-date">Audit Date *</label>
              <input
                type="date"
                name="audit-date"
                id="audit-date"
                defaultValue={currentDate}
                max={currentDate}
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="next-audit-date">Next Audit Date *</label>
              <input
                type="date"
                name="next-audit-date"
                id="next-audit-date"
                min={currentDate}
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea name="notes" id="notes" maxLength="2000"></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor="attachments">Attachments</label>
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
                  name="attachments"
                  id="attachments"
                  accept=".pdf, .docx, .xlsx, .jpg, .jpeg, .img, .png"
                  multiple
                  onChange={handleImagesSelection}
                  style={{ display: "none" }}
                />
              </div>
              <label htmlFor="attachments" className="upload-image-btn">
                {previewImages.length == 0
                  ? "Choose Files"
                  : "Change Attachements"}
              </label>
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
