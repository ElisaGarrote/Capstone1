import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import Alert from "../../components/Alert";
import SystemLoading from "../../components/Loading/SystemLoading";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import { createAssetCheckin } from "../../services/assets-service";
import { fetchAllDropdowns, createStatus } from "../../services/contexts-service";
import { fetchAllLocations, createLocation } from "../../services/integration-help-desk-service";

export default function CheckInAsset() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Form state
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // Dropdowns state
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);
  // Modal states for adding new entries
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  // File upload state
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Extract data from state, store in variables
  const ticket = state?.ticket || {};
  const checkout = state?.checkout || {};
  const fromAsset = state?.fromAsset || false;

  // Declare variables for destructuring
  const {
    id: ticketId,
    checkin_date: checkinDate,
    ticket_number: ticketNumber,
  } = ticket;
  const { checkout_date: checkoutDate } = checkout;
  const currentDate = new Date().toISOString().split("T")[0];

  // Form handling initializations
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    mode: "all",
    defaultValues: {
      checkinDate: ticket.checkin_date || currentDate,
      status: '',
      condition: '',
      location: ticket.location || '',
      notes: '',
    }
  });

  //Only allow asset statuses with these types for checkin (excludes 'deployed')
  const CHECKIN_STATUS_TYPES = "deployable,undeployable,pending,archived";

  // Initialize dropdowns
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      console.log("states:", state);
      try {
        const dropdowns = await fetchAllDropdowns("status", { 
          category: "asset", 
          types: CHECKIN_STATUS_TYPES 
        });
        setStatuses(dropdowns.statuses || []);

        const locations = await fetchAllLocations();
        setLocations(locations || []);
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
        setErrorMessage("Failed to load dropdowns. Please try again.");
      } finally {
        setIsLoading(false);  // <-- release loading after ALL awaits
      }
    };

    initialize();
  }, []);

  const conditionOptions = [
      { value: "1", label: "1 - Unserviceable" },
      { value: "2", label: "2 - Poor" },
      { value: "3", label: "3 - Needs Maintenance" },
      { value: "4", label: "4 - Functional" },
      { value: "5", label: "5 - Fair" },
      { value: "6", label: "6 - Good" },
      { value: "7", label: "7 - Very Good" },
      { value: "8", label: "8 - Excellent" },
      { value: "9", label: "9 - Like New" },
      { value: "10", label: "10 - Brand New" }
    ];
  
  if (isLoading) {
    console.log("isLoading triggered — showing loading screen");
    return <SystemLoading />;
  }
  
  // Modal field configurations - only allow checkin-valid status types (excludes 'deployed')
  const statusFields = [
    {
      name: 'name',
      label: 'Status Label',
      type: 'text',
      placeholder: 'Status Label',
      required: true,
      maxLength: 100,
      validation: { required: 'Status Label is required' }
    },
    {
      name: 'category',
      type: 'hidden',
      defaultValue: 'asset'
    },
    {
      name: 'type',
      label: 'Status Type',
      type: 'select',
      placeholder: 'Select Status Type',
      required: true,
      options: [
        { value: 'deployable', label: 'Deployable' },
        { value: 'undeployable', label: 'Undeployable' },
        { value: 'pending', label: 'Pending' },
        { value: 'archived', label: 'Archived' }
      ],
      validation: { required: 'Status Type is required' }
    }
  ];

  const locationFields = [
    {
      name: 'city',
      label: 'Location City',
      type: 'text',
      placeholder: 'Location City',
      required: true,
      maxLength: 100,
      validation: { required: 'Location City is required' }
    }
  ];

  const handleSaveStatus = async (data) => {
    try {
      const newStatus = await createStatus(data);
      setStatuses([...statuses, newStatus]);
      setShowStatusModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error('Error creating status:', error);

      let message = "Failed to create status";

      if (error.response && error.response.data) {
        const data = error.response.data;

        // Aggregate all error messages
        const messages = [];
        Object.values(data).forEach((value) => {
          if (Array.isArray(value)) messages.push(...value);
          else if (typeof value === "string") messages.push(value);
        });

        if (messages.length > 0) {
          message = messages.join(" ");
        }
      }

      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSaveLocation = async (data) => {
    try {
      const newLocation = await createLocation(data);
      setLocations(prev => [...prev, newLocation]);
      setShowLocationModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error('Error creating location:', error);

      let message = "Failed to create location";

      if (error.response && error.response.data) {
        const data = error.response.data;

        // Aggregate all error messages
        const messages = [];
        Object.values(data).forEach((value) => {
          if (Array.isArray(value)) messages.push(...value);
          else if (typeof value === "string") messages.push(value);
        });

        if (messages.length > 0) {
          message = messages.join(" ");
        }
      }

      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // File upload
  // Handle file selection
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 300 * 1024 * 1024; // 300MB

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is larger than 300MB and was not added.`);
        return false;
      }
      return true;
    });

    setAttachmentFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove file from selection
  const removeFile = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      console.log("FINAL FORM DATA:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Required fields
      formData.append("asset_checkout", checkout.id);
      formData.append("checkin_date", data.checkinDate);
      formData.append("status", data.status);
      formData.append("condition", data.condition);
      formData.append("location", data.location);

      // Optional fields
      formData.append("ticket_id", ticketId || "");
      formData.append("notes", data.notes || "");

      // Append attachment files if any
      attachmentFiles.forEach((file, index) => {
        formData.append("attachments", file);
      });

      await createAssetCheckin(formData)

      // Navigate to asset view page after successful check-in
      navigate(`/approved-tickets`, {
        state: { successMessage: "Asset has been checked in successfully!" }
      });
    } catch (error) {
        console.error("Error checking in asset:", error);

        let message = "An error occurred while checking in the asset.";

        if (error.response && error.response.data) {
          const data = error.response.data;

          // Collect all errors from all keys
          const messages = [];

          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              messages.push(...value);
            } else if (typeof value === "string") {
              messages.push(value);
            }
          });

          if (messages.length > 0) {
            message = messages.join(" ");
          }
        }

        setErrorMessage(message);
        setTimeout(() => setErrorMessage(""), 5000);
      }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav><NavBar /></nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root={fromAsset ? "Assets" : "Tickets"}
            currentPage="Check-In Asset"
            rootNavigatePage={fromAsset ? "/assets" : "/approved-tickets"}
            title={ticketNumber}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Form Header */}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--secondary-text-color)',
              marginBottom: '10px',
              borderBottom: '1px solid #d3d3d3',
              paddingBottom: '10px'
            }}>
              Check-In Details
            </h2>

            {/* Check-In Date */}
            <fieldset>
              <label htmlFor="checkinDate">Check-In Date <span style={{color: 'red'}}>*</span></label>
              <input
                type="date"
                id="checkinDate"
                className={errors.checkinDate ? 'input-error' : ''}
                {...register("checkinDate", { 
                  required: "Check-in date is required",
                  validate: (value) =>
                    new Date(value) >= new Date(checkoutDate) ||
                    "Check-in date cannot be earlier than checkout date."
                })}
                min={checkoutDate}
                defaultValue={checkinDate || currentDate}
              />
              {errors.checkinDate && (
                <span className="error-message">{errors.checkinDate.message}</span>
              )}
            </fieldset>

            {/* Status Dropdown with + button */}
            <fieldset>
              <label htmlFor='status'>Asset Status <span style={{color: 'red'}}>*</span></label>
              <div className="dropdown-with-add">
                <select
                  id="status"
                  {...register("status", { required: "Status is required" })}
                  className={errors.status ? 'input-error' : ''}
                >
                  <option value="">Select Asset Status</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setShowStatusModal(true)}
                  title="Add new status"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.status && <span className='error-message'>{errors.status.message}</span>}
            </fieldset>

            {/* Condition */}
            <fieldset>
              <label htmlFor="condition">Condition <span style={{color: 'red'}}>*</span></label>
              <select
                id="condition"
                {...register("condition", {required: "Condition is required"})}
                className={errors.condition ? 'input-error' : ''}
              >
                <option value="">Select Condition</option>
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.condition && <span className='error-message'>{errors.condition.message}</span>}
            </fieldset>

            {/* Location Dropdown with + button */}
            <fieldset>
              <label htmlFor='location'>Location <span style={{color: 'red'}}>*</span></label>
              <div className="dropdown-with-add">
                <select
                  id="location"
                  {...register("location", { required: "Location is required" })}
                  className={errors.location ? 'input-error' : ''}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.city}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setShowLocationModal(true)}
                  title="Add new location"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.location && <span className='error-message'>{errors.location.message}</span>}
            </fieldset>

            {/* Notes */}
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                placeholder="Enter notes"
                {...register("notes")}
                rows="3"
                maxLength="500"
              ></textarea>
            </fieldset>

            {/* Attachments */}
            <fieldset>
              <label htmlFor="attachments">Upload File</label>

              <div className="attachments-wrapper">
                {/* Left column: Upload button & info */}
                <div className="upload-left">
                  <label htmlFor="attachments" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="attachments"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelection}
                      style={{ display: "none" }}
                      multiple
                    />
                  </label>
                  <small className="file-size-info">
                    Maximum file size must be 300MB
                  </small>
                </div>

                {/* Right column: Uploaded files */}
                <div className="upload-right">
                  {attachmentFiles.map((file, index) => (
                    <div className="file-uploaded" key={index}>
                      <span title={file.name}>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <button type="submit" className="primary-button" disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
      <Footer />

      <AddEntryModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSave={handleSaveStatus}
        title="New Status Label"
        fields={statusFields}
        type="status"
      />

      <AddEntryModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={handleSaveLocation}
        title="New Location"
        fields={locationFields}
        type="location"
      />
    </>
  );
}