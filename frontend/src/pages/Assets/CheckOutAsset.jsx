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
import { fetchTicketById } from "../../services/integration-ticket-tracking-service";

export default function CheckOutAsset() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Ticket data fetched from API
  const [ticket, setTicket] = useState(null);

  // Extract from navigation state
  const ticketId = state?.ticketId;
  const fromAsset = state?.fromAsset || false;

  // Form handling
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      employeeName: '',
      empLocation: '',
      checkoutDate: '',
      expectedReturnDate: '',
      status: '',
      condition: '',
      notes: '',
    },
  });

  // Initialize: fetch ticket and dropdowns
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Fetch ticket details
        if (ticketId) {
          const ticketData = await fetchTicketById(ticketId);
          setTicket(ticketData);

          // Fill form with ticket data (read-only fields)
          setValue("employeeName", ticketData.requestor_details?.name || "Unknown");
          setValue("empLocation", ticketData.location_details?.city || "Unknown");
          setValue("checkoutDate", ticketData.checkout_date || "");
          setValue("expectedReturnDate", ticketData.return_date || "");
        }

        // Fetch status dropdown
        const dropdowns = await fetchAllDropdowns("status", {
          category: "asset",
          types: "deployed",
        });
        setStatuses(dropdowns.statuses || []);
      } catch (error) {
        console.error("Error initializing checkout form:", error);
        setErrorMessage("Failed to load form data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [ticketId, setValue]);

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
        { value: 'deployed', label: 'Deployed' },
      ],
      validation: { required: 'Status Type is required' }
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

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Required fields
      formData.append('ticket_id', ticketId);
      formData.append('status', data.status);
      formData.append("condition", data.condition);

      // Optional fields
      formData.append('revenue', data.revenue || 0);
      formData.append('notes', data.notes || '');

      // Append attachment files if any
      attachmentFiles.forEach((file, index) => {
        formData.append("attachments", file);
      });

      console.log("FINAL FORM DATA:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
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

  // Get asset display info from ticket
  const assetDisplayId = ticket?.asset_details?.asset_id || "";
  const assetName = ticket?.asset_details?.name || "";
  const pageTitle = assetName ? `${assetDisplayId} - ${assetName}` : assetDisplayId;

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav><NavBar /></nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root={fromAsset ? "Assets" : "Tickets"}
            currentPage="Check-Out Asset"
            rootNavigatePage={fromAsset ? "/assets" : "/approved-tickets"}
            title={pageTitle}
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
                {...register("employeeName")}
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
                type="text"
                id="returnDate"
                readOnly
                {...register("returnDate")}
              />
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
    </>
  );
}