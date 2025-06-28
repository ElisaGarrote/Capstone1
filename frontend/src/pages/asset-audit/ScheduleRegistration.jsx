import NavBar from "../../components/NavBar";
import "../../styles/ScheduleRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useNavigate, useLocation } from "react-router-dom";
import assetsService from "../../services/assets-service";
import { useForm, Controller } from "react-hook-form";
import dateRelated from "../../utils/dateRelated";
import Skeleton from "react-loading-skeleton";
import LoadingButton from "../../components/LoadingButton";

export default function ScheduleRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const animatedComponents = makeAnimated();
  const [currentDate, setCurrentDate] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);

  // Retrieve the "previousPage" value passed from the navigation state.
  // If the "previousPage" is not exist, the value for this is "null".
  const previousPage = location.state?.previousPage || null;

  // Get all the assets that have not yet been scheduled or audited.
  useEffect(() => {
    const filteredAssets = async () => {
      const fetchedData = await assetsService.filterAssetsForAudit();
      setFilteredAssets(fetchedData);
      setLoading(false);
    };

    filteredAssets();
  }, []);

  // Get the current date and assign it to the currentDate state.
  useEffect(() => {
    setCurrentDate(dateRelated.getCurrentDate());
  }, []);

  const assetOptions = filteredAssets;

  // Handle form
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
  });

  const submission = async (data) => {
    setSubmitting(true);
    const success = await assetsService.postScheduleAudit(
      data.asset,
      data.auditDueDate,
      data.notes
    );

    if (success) {
      navigate("/audits/scheduled", { state: { addedScheduleAudit: true } });
      setSubmitting(false);
    } else {
      console.log("Failed to create schedule audit!");
    }
  };

  const customStylesDropdown = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      borderRadius: "25px",
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

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="schedule-registration-page">
        <section className="top">
          <TopSecFormPage
            root={getRootPage()}
            currentPage="Schedule Audits"
            rootNavigatePage={previousPage}
            title="Schedule Audits"
          />
        </section>
        <section className="schedule-registration-form">
          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label htmlFor="asset">Select Asset <span style={{color: 'red'}}>*</span></label>

              {isLoading ? (
                <Skeleton height={40} borderRadius={25} />
              ) : (
                <Controller
                  name="asset"
                  control={control}
                  rules={{ required: "Asset is required" }}
                  render={({ field }) => (
                    <Select
                      components={animatedComponents}
                      options={assetOptions}
                      styles={customStylesDropdown}
                      placeholder="Select assets..."
                      {...field}
                      isMulti
                    />
                  )}
                />
              )}

              {errors.asset && <span className='error-message'>{errors.asset.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="audit-due-date">Audit Due Date <span style={{color: 'red'}}>*</span></label>
              <input
                type="date"
                name="audit-due-date"
                id="audit-due-date"
                min={currentDate}
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
                maxLength="500"
                placeholder="Notes..."
                {...register("notes")}
              ></textarea>
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
