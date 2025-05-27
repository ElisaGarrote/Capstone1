import NavBar from "../../components/NavBar";
import "../../styles/ScheduleRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useNavigate } from "react-router-dom";
import assetsService from "../../services/assets-service";
import { useForm, Controller } from "react-hook-form";
import dateRelated from "../../utils/dateRelated";
import Skeleton from "react-loading-skeleton";

export default function ScheduleRegistration() {
  const navigate = useNavigate();
  const animatedComponents = makeAnimated();
  const [currentDate, setCurrentDate] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [filteredAssets, setFilteredAssets] = useState([]);

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
    const success = await assetsService.postScheduleAudit(
      data.asset,
      data.auditDueDate,
      data.notes
    );

    if (success) {
      navigate("/audits/scheduled", { state: { addedScheduleAudit: true } });
    } else {
      console.log("Failed to create schedule audit!");
    }
  };

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
          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label htmlFor="asset">Select Asset *</label>

              {isLoading ? (
                <Skeleton height={40} borderRadius={10} />
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
                      placeholder="Select location..."
                      {...field}
                      isMulti
                    />
                  )}
                />
              )}

              {errors.asset && <span>{errors.asset.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="audit-due-date">Audit Due Date *</label>
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
                <span>{errors.auditDueDate.message}</span>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                id="notes"
                maxLength="500"
                {...register("notes")}
              ></textarea>
            </fieldset>
            <button type="submit" className="save-btn" disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
