import NavBar from "../../components/NavBar";
import "../../styles/ScheduleRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import assetsService from "../../services/assets-service";
import { useForm, Controller } from "react-hook-form";
import dateRelated from "../../utils/dateRelated";
import Skeleton from "react-loading-skeleton";

export default function ScheduleRegistration() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [allAssets, setAllAssets] = useState([]);
  const [assetAndName, setAssetAndName] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // Get the current date and assign it to the currentDate state.
  useEffect(() => {
    setCurrentDate(dateRelated.getCurrentDate());
  }, []);

  // Fetch all assets
  useEffect(() => {
    const asset = async () => {
      try {
        const dataFetched = await assetsService.fetchAllAssets();

        if (dataFetched) {
          console.log("Schedule Audits fetch all assets: ", dataFetched);
          setAllAssets(dataFetched);
          setLoading(false);
        }
      } catch (error) {
        console.log("Error whilte fetching all assets!", error);
      }
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

        // Filter asset to get only all assets that is not yet scheduled and audited

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
      value: item.id,
      label: item.displayed_id + " - " + item.name,
    }));

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
    console.log(data);

    const success = await assetsService.postScheduleAudit(
      data.asset,
      data.auditDueDate,
      data.notes
    );

    if (success) {
      console.log("Schedule audit successfully created!");
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

              <Controller
                name="asset"
                control={control}
                rules={{ required: "Asset is required" }}
                render={({ field }) => (
                  <Select
                    options={assetOptions}
                    styles={customStylesDropdown}
                    placeholder="Select location..."
                    {...field}
                    isMulti
                  />
                )}
              />

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
