import NavBar from "../../components/NavBar";
import "../../styles/PerformAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

export default function PerformAudits() {
  const navigate = useNavigate();
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

  const assetOptions = [
    { value: "100000 - XPS 13", label: "100000 - XPS 13" },
    { value: "100001 - ThinkPad E15 G4", label: "100001 - ThinkPad E15 G4" },
    { value: '100008 - Macbook Pro 16"', label: '100008 - Macbook Pro 16"' },
    {
      value: "100036 - Microsoft Surface Pro 11",
      label: "100036 - Microsoft Surface Pro 11",
    },
  ];

  const locationOptions = [
    { value: "makati", label: "Makati" },
    { value: "pasig", label: "Pasig" },
    { value: "marikina", label: "Marikina" },
  ];

  const performByOptions = [
    { value: "fernando tempura", label: "Fernando Tempura" },
    { value: "may pamana", label: "May Pamana" },
    { value: "mary grace piattos", label: "Mary Grace Piattos" },
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
              <Select
                options={assetOptions}
                styles={customStylesDropdown}
                placeholder="Select asset..."
              />
            </fieldset>
            <fieldset>
              <label htmlFor="location">Location *</label>
              <Select
                options={locationOptions}
                styles={customStylesDropdown}
                placeholder="Select locatioin..."
              />
            </fieldset>
            <fieldset>
              <label htmlFor="perform-by">Perform by *</label>
              <Select
                options={performByOptions}
                styles={customStylesDropdown}
                placeholder="Select user..."
                defaultValue={{
                  value: "mary grace piattos",
                  label: "Mary Grace Piattos",
                }}
              />
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
          </form>
          {/* Place this button inside the form when working on the backend. */}
          <button
            type="submit"
            className="save-btn"
            onClick={() =>
              navigate("/audits", { state: { addedNewAudit: true } })
            }
          >
            Save
          </button>
        </section>
      </main>
    </>
  );
}
