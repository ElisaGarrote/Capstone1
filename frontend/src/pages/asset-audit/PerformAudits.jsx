import NavBar from "../../components/NavBar";
import "../../styles/PerformAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect, use } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import assetsService from "../../services/assets-service";
import dateRelated from "../../utils/dateRelated";

export default function PerformAudits() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [assetAndName, setAssetAndName] = useState([]);

  // Handle current date
  useEffect(() => {
    setCurrentDate(dateRelated.getCurrentDate());
  }, []);

  const handleImagesSelection = (event) => {
    const fileList = event.target.files;
    setFileList(fileList);

    const selectedFiles = Array.from(event.target.files); // Convert the FileList to Array

    if (selectedFiles.length > 0) {
      const imagesArray = selectedFiles.map((file) => {
        return URL.createObjectURL(file);
      });

      console.log("Selected Images:", imagesArray);
      setPreviewImages(imagesArray);
    } else {
      setPreviewImages([]);
    }
  };

  console.log("File list:", fileList);

  // Fetch all assets
  useEffect(() => {
    const asset = async () => {
      const dataFetched = await assetsService.fetchAllAssets();
      setAllAssets(dataFetched);
    };

    asset();
  }, []);

  // Retrieve all the schedule audits records and get only the displayed_id and asset name.
  useEffect(() => {
    const fetchAllScheduleAudits = async () => {
      const allAuditSchedule = await assetsService.fetchAllAuditSchedules();

      // Get only the displayed_id of the asset and asset name.
      if (allAuditSchedule) {
        console.log(allAuditSchedule);

        const asset = allAuditSchedule.map((item) => ({
          displayedId: item.asset_info.displayed_id,
          name: item.asset_info.name,
        }));
        setAssetAndName(asset);
      }
    };

    fetchAllScheduleAudits();
  }, []);

  const assetOptions = Array.from(allAssets)
    .filter(
      (item) =>
        !assetAndName.some(
          (existing) => existing.displayedId === item.displayed_id
        )
    )
    .map((item) => ({
      id: item.id,
      value: item.id,
      label: item.displayed_id + " - " + item.name,
    }));

  const locationOptions = [
    { value: "Makati", label: "Makati" },
    { value: "Pasig", label: "Pasig" },
    { value: "Marikina", label: "Marikina" },
  ];

  const performByOptions = [
    { value: "Fernando Tempura", label: "Fernando Tempura" },
    { value: "May Pamana", label: "May Pamana" },
    { value: "Mary Grace Piattos", label: "Mary Grace Piattos" },
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

  // Handle form
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      performBy: { value: "Mary Grace Piattos", label: "Mary Grace Piattos" },
      auditDate: "",
      files: null,
    },
  });

  // Set the default valule for the auditDate every time the currentDate has changes.
  useEffect(() => {
    if (currentDate) {
      setValue("auditDate", currentDate);
    }
  }, [currentDate, setValue]);

  // Create schedule audit

  // Handle form submission
  const submission = async (data) => {
    console.table(data);
    console.table(fileList);

    // Extract neccessary data.
    const { nextAuditDate, notes, auditDate } = data;
    const assetId = data.asset.id;
    const location = data.location.value;
    const userId = 1;
    console.log("nextAuditDate: ", nextAuditDate);

    // POST schedule audit
    const scheduleAuditResponse = await assetsService.postScheduleAudit(
      assetId,
      nextAuditDate,
      notes
    );

    const auditScheduleId = scheduleAuditResponse.id;

    if (scheduleAuditResponse) {
      console.log("Successfully created schedule audit!");
      console.table(scheduleAuditResponse);

      // POST audit
      const auditDataResponse = await assetsService.postAudit(
        location,
        userId,
        notes,
        auditScheduleId,
        auditDate,
        nextAuditDate
      );

      if (auditDataResponse) {
        console.log("Successfully created audit!");

        if (fileList) {
          // POST file for the created audit
          const success = await assetsService.postAuditFiles(
            auditDataResponse.id,
            fileList
          );

          if (success) {
            console.log("Successfully created files for audit!");

            // Navigate to the audit page.
            navigate("/audits", { state: { addedNewAudit: true } });
          } else {
            console.log("Failed to create files for created audit!");
          }
        }
      } else {
        console.log("Failed to create audit!");
      }
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
          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label htmlFor="asset">Select Asset *</label>

              <Controller
                name="asset"
                control={control}
                rules={{ required: "Asset is required" }}
                render={({ field }) => (
                  <Select
                    // options={assetOptions}
                    options={assetOptions}
                    styles={customStylesDropdown}
                    placeholder="Select asset..."
                    {...field}
                  />
                )}
              />

              {errors.asset && <span>{errors.asset.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="location">Location *</label>

              <Controller
                name="location"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <Select
                    options={locationOptions}
                    styles={customStylesDropdown}
                    placeholder="Select locatioin..."
                    {...field}
                  />
                )}
              />

              {errors.location && <span>{errors.location.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="perform-by">Perform by *</label>

              <Controller
                name="performBy"
                control={control}
                rules={{ required: "Perform by is required" }}
                render={({ field }) => (
                  <Select
                    options={performByOptions}
                    styles={customStylesDropdown}
                    placeholder="Select user..."
                    defaultValue={{
                      value: "mary grace piattos",
                      label: "Mary Grace Piattos",
                    }}
                    {...field}
                  />
                )}
              />

              {errors.performBy && <span>{errors.performBy.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="audit-date">Audit Date *</label>
              <input
                type="date"
                name="audit-date"
                id="audit-date"
                max={currentDate}
                {...register("auditDate", {
                  required: "Audit date is required",
                })}
              />

              {errors.auditDate && <span>{errors.auditDate.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="next-audit-date">Next Audit Date *</label>
              <input
                type="date"
                name="next-audit-date"
                id="next-audit-date"
                min={currentDate}
                {...register("nextAuditDate", {
                  required: "Next audit date is required",
                })}
              />

              {errors.nextAuditDate && (
                <span>{errors.nextAuditDate.message}</span>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                id="notes"
                maxLength="2000"
                {...register("notes")}
              ></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor="attachments">Attachments</label>
              <div className="images-container">
                {previewImages &&
                  previewImages.map((image, index) => {
                    return (
                      <div key={image} className="image-selected">
                        <img src={image} alt="" key={index} />
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
                  // onChange={(event) => {
                  //   handleImagesSelection(event); // Call your custom function
                  //   setValue("files", event.target.files); // Update react-hook-form state
                  // }}
                  // ref={(e) => {
                  //   register("files").ref(e); // Attach react-hook-form's ref
                  // }}
                  // style={{ display: "none" }}
                  // {...register("files")}
                />
              </div>
              <label htmlFor="attachments" className="upload-image-btn">
                {previewImages.length == 0
                  ? "Choose Files"
                  : "Change Attachements"}
              </label>
            </fieldset>
            <button
              type="submit"
              className="save-btn"
              disabled={!isValid}
              // onClick={() =>
              //   navigate("/audits", { state: { addedNewAudit: true } })
              // }
            >
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
