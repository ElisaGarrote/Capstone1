import NavBar from "../../components/NavBar";
import "../../styles/MaintenanceRegistration.css";
import { redirect, useNavigate } from "react-router-dom";
import MediumButtons from "../../components/buttons/MediumButtons";
import CloseIcon from "../../assets/icons/close-icon.svg";
import { useState, useEffect } from "react";
import assetsService from "../../services/assets-service";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Skeleton from "react-loading-skeleton";
import dateRelated from "../../utils/dateRelated";
import { useForm, Controller } from "react-hook-form";
import contextsService from "../../services/contexts-service";
import LoadingButton from "../../components/LoadingButton";
import Alert from "../../components/Alert";

export default function RepairRegistration() {
  const navigate = useNavigate();
  const animatedComponents = makeAnimated();
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [allAssets, setAllAssets] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() =>
    dateRelated.getCurrentDate()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationFailed, setRegistrationFailed] = useState(null);

  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachmentFile(file);
    } else {
      setAttachmentFile(null);
    }
  };

  // Handle form
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "all",
  });

  const selectedAssetWatch = watch("asset");

  // console.log("selected asset watch:", selectedAssetWatch);

  const selectedAsset = allAssets?.assets?.find(
    (item) => item.id === selectedAssetWatch?.value
  );
  // console.log("selected asset:", selectedAsset);

  // Handle form submission
  const submission = async (data) => {
    setIsSubmitting(true);
    console.log("data to be submitted:", data);

    // POST repair
    const repairResponse = await assetsService.postRepair(
      data.asset.value,
      data.type.value,
      data.maintenanceName,
      data.startDate,
      data.endDate,
      data.cost,
      data.notes
    );

    // If repair is successfully created, create repair file
    if (repairResponse) {
      console.log("repair response:", repairResponse);
      const repairId = repairResponse.id;

      // POST repair file
      if (attachmentFile != null) {
        console.log("creating repair file...");
        const repairFileResponse = await assetsService.postRepairFile(
          repairId,
          attachmentFile
        );

        if (!repairFileResponse) {
          setRegistrationFailed(true);
        }

        // Navigate to the maintenance page.
        navigate("/dashboard/Repair/Maintenance", {
          state: { isAddSuccess: true },
        });
        setIsSubmitting(false);
      }

      // Navigate to the maintenance page.
      navigate("/dashboard/Repair/Maintenance", {
        state: { isAddSuccess: true },
      });
      setIsSubmitting(false);
    } else {
      setRegistrationFailed(true);
    }
  };

  // Clear isRegistrationFailed state
  useEffect(() => {
    if (isRegistrationFailed === true) {
      setTimeout(() => {
        setRegistrationFailed(null);
      }, 5000);
    }
  }, [isRegistrationFailed]);

  // Fetch all assets and suppliers
  useEffect(() => {
    const fetchAllAssetsAndSuppliers = async () => {
      // Fetch all assets
      const assetsResponse = await assetsService.fetchAllAssets();
      setAllAssets(assetsResponse || []);

      // Fetch all suppliers
      const suppliersResponse = await contextsService.fetchAllSupplierNames();
      setAllSuppliers(suppliersResponse?.suppliers || []);
      setLoading(false);
    };

    fetchAllAssetsAndSuppliers();
  }, []);

  // console.log("all suppliers fetched:", allSuppliers);

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

  const allAssetsOption = allAssets?.assets?.map((item) => {
    return {
      value: item.id,
      label: item.displayed_id + " - " + item.name,
    };
  });

  const maintenanceTypeOptions = [
    { value: "software", label: "Software" },
    { value: "maintenance", label: "Maintenance" },
    { value: "upgrade", label: "Upgrade" },
    { value: "hardware", label: "Hardware" },
    { value: "repair", label: "Repair" },
  ];

  return (
    <>
      {isRegistrationFailed && (
        <Alert message="Registration failed. Please try again." type="danger" />
      )}

      <div className="maintenance-page-container">
        <NavBar />

        <div className="maintenance-page-content">
          <div className="breadcrumb">
            <span
              className="root-link"
              onClick={() => navigate("/dashboard/Repair/Maintenance")}
            >
              Asset Repairs
            </span>
            <span className="separator">/</span>
            <span className="current-page">New Repair</span>
          </div>

          <h1 className="page-title">New Repair</h1>

          <div className="form-container">
            <form onSubmit={handleSubmit(submission)}>
              <div className="form-field">
                <label htmlFor="asset">Asset *</label>
                <div className="select-wrapper">
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
                          options={allAssetsOption}
                          styles={customStylesDropdown}
                          placeholder="Select asset..."
                          {...field}
                        />
                      )}
                    />
                  )}

                  {errors.asset && (
                    <span className="error-message">
                      {errors.asset.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="supplier">Supplier</label>
                <div className="select-wrapper">
                  {isLoading && <Skeleton height={40} borderRadius={10} />}

                  {selectedAsset ? (
                    <div className="disabled-dropdown">
                      {
                        Array.from(allSuppliers).find(
                          (item) => item.id === selectedAsset.supplier_id
                        ).name
                      }
                    </div>
                  ) : (
                    !isLoading && (
                      <div className="disabled-dropdown">
                        Please select asset to set the supplier...
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="type">Maintenance Type *</label>
                <div className="select-wrapper">
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Maintenance Type is required" }}
                    render={({ field }) => (
                      <Select
                        components={animatedComponents}
                        options={maintenanceTypeOptions}
                        styles={customStylesDropdown}
                        placeholder="Select maintenance type..."
                        {...field}
                      />
                    )}
                  />

                  {errors.type && (
                    <span className="error-message">{errors.type.message}</span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="maintenanceName">Maintenance Name *</label>
                <input
                  type="text"
                  name="maintenanceName"
                  id="maintenanceName"
                  placeholder="Maintenance Name"
                  maxLength="100"
                  {...register("maintenanceName", {
                    required: "Maintenance Name is required",
                  })}
                />

                {errors.maintenanceName && (
                  <span className="error-message">
                    {errors.maintenanceName.message}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="startDate">Start Date *</label>
                <div className="date-picker-wrapper">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    defaultValue={currentDate}
                    {...register("startDate", {
                      required: "Start Date is required",
                    })}
                  />

                  {errors.startDate && (
                    <span className="error-message">
                      {errors.startDate.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="endDate">End Date</label>
                <div className="date-picker-wrapper">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    min={currentDate}
                    {...register("endDate")}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="cost">Cost *</label>
                <div className="cost-input">
                  <span className="currency">PHP</span>
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    step="0.01"
                    defaultValue={null}
                    onInput={(e) => {
                      // Prevent entering more than 2 decimal places
                      const value = e.target.value;
                      const parts = value.split(".");
                      if (parts[1] && parts[1].length > 2) {
                        e.target.value =
                          parts[0] + "." + parts[1].substring(0, 2);
                      }
                    }}
                    {...register("cost", {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Cost must be a non-negative number",
                      },
                      required: "Cost is required",
                    })}
                  />
                </div>

                {errors.cost && (
                  <span className="error-message">{errors.cost.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="notes">Notes</label>
                <textarea
                  name="notes"
                  id="notes"
                  maxLength="500"
                  rows="6"
                  {...register("notes")}
                ></textarea>
              </div>

              <div className="form-field">
                <label>Attachments</label>
                <div className="attachments-container">
                  <button
                    className="choose-file-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("attachment").click();
                    }}
                  >
                    Choose File
                  </button>
                  <Controller
                    name="attachment"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (
                          value &&
                          value[0] &&
                          value[0].size > 10 * 1024 * 1024
                        ) {
                          return "File size must be less than 10MB";
                        }
                        return true;
                      },
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <input
                        type="file"
                        id="attachment"
                        style={{ display: "none" }}
                        accept=".pdf, .docx, .xlsx, .jpg, .jpeg, .png"
                        onChange={(e) => {
                          // Handle react-hook-form
                          onChange(e.target.files);
                          // Handle your custom logic
                          handleFileSelection(e);
                        }}
                        {...field}
                        value={undefined} // Important: file inputs should not have a value prop
                      />
                    )}
                  />
                  {attachmentFile ? (
                    <div className="file-selected">
                      <p>{attachmentFile.name}</p>
                      <button
                        className="remove-file-btn"
                        onClick={(event) => {
                          event.preventDefault();
                          setAttachmentFile(null);
                          document.getElementById("attachment").value = "";
                        }}
                      >
                        <img
                          src={CloseIcon}
                          alt="Remove file"
                          style={{ background: "red" }}
                        />
                      </button>
                    </div>
                  ) : (
                    <span className="no-file">No file chosen</span>
                  )}

                  {errors.attachment && (
                    <span className="error-message">
                      {errors.attachment.message}
                    </span>
                  )}

                  {!attachmentFile && !errors.attachment && (
                    <p className="file-size-limit">
                      Maximum file size must be 10MB
                    </p>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-btn"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting && <LoadingButton />}
                  {!isSubmitting ? "Save" : "Saving..."}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
