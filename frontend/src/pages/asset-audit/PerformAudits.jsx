import NavBar from "../../components/NavBar";
import "../../styles/PerformAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect, use } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import assetsService from "../../services/assets-service";
import dateRelated from "../../utils/dateRelated";
import Skeleton from "react-loading-skeleton";
import LoadingButton from "../../components/LoadingButton";
import authService from "../../services/auth-service";

export default function PerformAudits() {
  const navigate = useNavigate();
  const animatedComponents = makeAnimated();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  // Retrieve the "data" value passed from the navigation state.
  // If the "data" is not exist, the value for this is "null".
  const dataReceive = location.state?.data || null;
  const previousPage = location.state?.previousPage || null;

  // Get all the assets that have not yet been scheduled or audited.
  useEffect(() => {
    const fetchFilteredAssetsAndActiveUsers = async () => {
      // Fetch filter assets for audit
      const fetchedData = await assetsService.filterAssetsForAudit();
      setFilteredAssets(fetchedData);

      // Fetch all active users
      const fetchedUsers = await authService.getAllUsers();
      setActiveUsers(fetchedUsers);
      setLoading(false);
    };

    fetchFilteredAssetsAndActiveUsers();
  }, []);

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

      // console.log("Selected Images:", imagesArray);
      setPreviewImages(imagesArray);
    } else {
      setPreviewImages([]);
    }
  };

  // console.log("File list:", fileList);

  const assetOptions = filteredAssets;

  const locationOptions = [
    { value: "Makati", label: "Makati" },
    { value: "Pasig", label: "Pasig" },
    { value: "Marikina", label: "Marikina" },
  ];

  const performByOptions = activeUsers.map((user) => {
    return { value: user.id, label: user.full_name };
  });

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
    setSubmitting(true);
    // console.log("submission", data);
    // console.table(fileList);

    // Extract neccessary data.
    const { nextAuditDate, notes, auditDate } = data;
    const assetId = data.asset.value;
    const location = data.location.value;
    const userId = 1;
    // console.log("nextAuditDate: ", nextAuditDate);

    // POST schedule audit
    const scheduleAuditResponse = await assetsService.postScheduleAudit(
      assetId,
      nextAuditDate,
      notes
    );

    const auditScheduleId = scheduleAuditResponse.id;

    if (scheduleAuditResponse) {
      // console.log("Successfully created schedule audit!");
      // console.table(scheduleAuditResponse);

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
        // console.log("Successfully created audit!");

        // POST file fro the created audit if length of fileList is more than 0
        if (fileList.length > 0) {
          // POST file for the created audit
          const success = await assetsService.postAuditFiles(
            auditDataResponse.id,
            fileList
          );
        }

        // Navigate to the audit page.
        navigate("/audits", { state: { addedNewAudit: true } });
        setSubmitting(false);
      } else {
        console.log("Failed to create audit!");
      }
    }
  };

  // Update audit
  const update = async (data) => {
    setSubmitting(true);
    // console.log("Data for update:", data);

    // Update schedule audit by id
    const updateScheduleAuditResponse = await assetsService.updateAuditSchedule(
      dataReceive.id,
      Number(data.asset),
      data.nextAuditDate,
      data.notes
    );

    // Post audit if audit_info is null from the dataReceive and update schedule audit is successful.
    if (dataReceive.audit_info == null && updateScheduleAuditResponse) {
      // Post audit
      const postAuditResponse = await assetsService.postAudit(
        data.location.value,
        1,
        data.notes,
        dataReceive.id,
        data.auditDate,
        data.nextAuditDate
      );
      // const postAuditResponse = await postAudit(data);

      // Check if post audit is successfully created then navigate to audit page.
      if (postAuditResponse) {
        // POST audit file if the length of the fileList is more than 0.
        if (fileList.length > 0) {
          const success = await assetsService.postAuditFiles(
            postAuditResponse.id,
            fileList
          );

          // console.log("successfully created audit files?:", success);
        }

        // Navigate to the audit page.
        navigate("/audits", { state: { addedNewAudit: true } });
        setSubmitting(false);
      }
    }

    // Update audit if audit_info from dataReceive is not null
    if (dataReceive.audit_info != null) {
      // Soft delete audit files if audit_files from dataReceive is not null
      if (dataReceive.audit_info.audit_files.length > 0) {
        await assetsService.softDeleteAuditFiles(dataReceive.audit_info.id);
      }

      // Update audit
      const updateAuditResponse = await assetsService.updateAudit(
        dataReceive.audit_info.id,
        data.location.value,
        1,
        data.notes,
        dataReceive.id,
        data.auditDate,
        data.nextAuditDate
      );

      // Check if audit successfully updated then navigate to audit page.
      if (updateAuditResponse) {
        // POST audit file if the length of the fileList is more than 0.
        if (fileList.length > 0) {
          const success = await assetsService.postAuditFiles(
            dataReceive.audit_info.id,
            fileList
          );

          // console.log("successfully created audit files?:", success);
        }

        // Navigate to the audit page.
        navigate("/audits", { state: { addedNewAudit: true } });
        setSubmitting(false);
      }
    }
  };

  // Set the root of the page.
  const getRootPage = () => {
    switch (previousPage) {
      case "/audits":
        return "Audits";
      case "/audits/overdue":
        return "Overdue for Audits";
      case "/audits/scheduled":
        return "Schedule Audits";
      case "/audits/completed":
        return "Completed Audits";
    }
  };

  // For debugging only.
  // console.log("data received:", dataReceive);

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="perform-audit-page">
        <section className="top">
          <TopSecFormPage
            root={getRootPage()}
            currentPage="Perform Audits"
            rootNavigatePage={previousPage}
            title={
              dataReceive != null
                ? `${dataReceive.asset_info.displayed_id} - ${dataReceive.asset_info.name}`
                : "Perform Audits"
            }
          />
        </section>
        <section className="perform-audit-form">
          <form
            onSubmit={handleSubmit(dataReceive == null ? submission : update)}
          >
            <fieldset>
              <label htmlFor="asset">Select Asset *</label>

              {isLoading && dataReceive === null ? (
                <Skeleton height={40} borderRadius={10} />
              ) : (
                dataReceive === null && (
                  <Controller
                    name="asset"
                    control={control}
                    rules={{ required: "Asset is required" }}
                    render={({ field }) => (
                      <Select
                        components={animatedComponents}
                        options={assetOptions}
                        styles={customStylesDropdown}
                        placeholder="Select asset..."
                        {...field}
                      />
                    )}
                  />
                )
              )}

              {dataReceive != null && (
                <div className="asset">
                  <input
                    type="text"
                    value={`${dataReceive.asset_info.displayed_id} - ${dataReceive.asset_info.name}`}
                    disabled
                  />

                  {/* Hide input for the value of asset id */}
                  <input
                    type="hidden"
                    value={dataReceive.asset_info.id}
                    {...register("asset")}
                  />
                </div>
              )}

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
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting && <LoadingButton />}
              {!isSubmitting ? "Save" : "Saving..."}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
