import { useState, useEffect } from "react";
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
import { createAssetCheckoutWithStatus } from "../../services/assets-service";
import { fetchAllDropdowns, createStatus } from "../../services/contexts-service";

export default function CheckOutAsset() {
  const location = useLocation();
  const passedState = location.state;
  const currentDate = new Date().toISOString().split("T")[0];
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

  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Status dropdown state
  const [statuses, setStatuses] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Only allow deployed status type for checkout
  const CHECKOUT_STATUS_TYPES = "deployed";

  useEffect(() => {
    if (passedState) {
      console.log("Received state:", passedState);
    } else {
      console.warn("No state was passed!");
    }
  }, [passedState]);

  const {
    id,
    image,
    assetId,
    product,
    empId,
    employee,
    empLocation,
    checkoutDate,
    returnDate,
    ticketId,
    fromAsset,
    fromTicket,
  } = passedState || {};

  console.log({
    id,
    image,
    assetId,
    product,
    empId,
    employee,
    empLocation,
    checkoutDate,
    returnDate,
    ticketId,
    fromAsset,
    fromTicket
  });


  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      employee: employee || "",
      empLocation: empLocation || "",
      checkoutDate: checkoutDate || "",
      expectedReturnDate: returnDate || "",
      status: "",
      condition: "",
      notes: ""
    },
  });

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      console.log("passedState:", passedState);
      try {
        setValue("employee", passedState.employee || "");
        setValue("empLocation", passedState.empLocation || "");
        setValue("checkoutDate", passedState.checkoutDate || "");
        setValue("expectedReturnDate", passedState.returnDate || "");

        // Fetch deployed statuses only
        const dropdowns = await fetchAllDropdowns("status", {
          category: "asset",
          types: CHECKOUT_STATUS_TYPES
        });
        setStatuses(dropdowns.statuses || []);
      } catch (error) {
        console.error("Error initializing:", error);
        setErrorMessage("Failed to initialize data");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [passedState, setValue]);

  // Handle file selection
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        setErrorMessage(`${file.name} exceeds 5MB and was not added.`);
        setTimeout(() => setErrorMessage(""), 5000);
      } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrorMessage(`${file.name} is not a valid image format. Only .jpeg and .png are allowed.`);
        setTimeout(() => setErrorMessage(""), 5000);
      } else {
        validFiles.push(file);
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };




  // Modal field configurations - only allow deployed status type for checkout
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
      type: 'hidden',
      defaultValue: 'deployed'
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

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Required fields
      formData.append('asset', id);
      formData.append('ticket_id', ticketId);
      formData.append('status', data.status);

      const conditionValue = parseInt(data.condition, 10);
      if (!isNaN(conditionValue)) {
        formData.append('condition', conditionValue);
      }

      // Optional fields
      formData.append('notes', data.notes || '');

      // Append image files as attachments
      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      for (let pair of formData.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      await createAssetCheckoutWithStatus(formData);

      // Navigate to approved tickets after successful checkout
      navigate(`/approved-tickets`, {
        state: {
          successMessage: "Asset has been checked out successfully!"
        }
      });

    } catch (error) {
      console.error("Error occurred while checking out the asset:", error);

      let message = "An error occurred while checking out the asset.";
      if (error.response && error.response.data) {
        const data = error.response.data;
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

  if (isLoading) {
    console.log("isLoading triggered — showing loading screen");
    return <SystemLoading />;
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav><NavBar /></nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root={passedState?.fromAsset ? "Assets" : "Tickets"}
            currentPage="Check-Out Asset"
            rootNavigatePage={passedState?.fromAsset ? "/assets" : "/tickets"}
            title={assetId}
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
              Checkout To
            </h2>

            {/* Employee */}
            <fieldset>
              <label htmlFor="employee">Employee <span style={{color: 'red'}}>*</span></label>
              <input
                type="text"
                id="employee"
                readOnly
                {...register("employee")}
              />
            </fieldset>

            {/* Location */}
            <fieldset>
              <label htmlFor="empLocation">Location <span style={{color: 'red'}}>*</span></label>
              <input
                type="text"
                id="empLocation"
                readOnly
                {...register("empLocation")}
              />
            </fieldset>

            {/* Check-Out Date */}
            <fieldset>
              <label htmlFor="checkoutDate">Check-Out Date <span style={{color: 'red'}}>*</span></label>
              <input
                type="text"
                id="checkoutDate"
                readOnly
                {...register("checkoutDate")}
              />
            </fieldset>

            {/* Expected Return Date */}
            <fieldset>
              <label htmlFor="returnDate">Expected Return Date <span style={{color: 'red'}}>*</span></label>
              <input
                type="date"
                id="returnDate"
                className={errors.returnDate ? 'input-error' : ''}
                {...register("returnDate", { required: "Expected return date is required" })}
                defaultValue={passedState?.returnDate || ""}
                min={currentDate}
              />
              {errors.returnDate && (
                <span className="error-message">{errors.returnDate.message}</span>
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

            {/* Image Upload */}
            <fieldset>
              <label>Image Upload</label>
              <div className="attachments-wrapper">
                {/* Left column: Upload button & info */}
                <div className="upload-left">
                  <label htmlFor="images" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="images"
                      accept=".jpeg,.jpg,.png"
                      onChange={handleFileSelection}
                      style={{ display: "none" }}
                      multiple
                    />
                  </label>
                  <small className="file-size-info">
                    Maximum file size must be 5MB
                  </small>
                </div>

                {/* Right column: Uploaded files */}
                <div className="upload-right">
                  {selectedFiles.map((file, index) => (
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
    </>
  );
}