import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import Alert from "../../components/Alert";
import SystemLoading from "../../components/Loading/SystemLoading";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import * as XLSX from "xlsx";
import {
  fetchAssetNames,
  fetchRepairById,
  createRepair,
  updateRepair
} from "../../services/assets-service";
import { fetchAllDropdowns, createSupplier, createStatus } from "../../services/contexts-service";

const RepairRegistration = () => {
  const [assets, setAssets] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Modal states for adding new entries
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;
  const currentDate = new Date().toISOString().split("T")[0];

  // Repair types (static choices matching backend)
  const repairTypes = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'test', label: 'Test' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      asset: "",
      status: "",
      supplier: "",
      repairType: "",
      repairName: "",
      startDate: "",
      endDate: "",
      cost: "",
      notes: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Initialize dropdowns and load repair data if editing
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        // Fetch dropdown options
        const assetsData = await fetchAssetNames({});
        setAssets(assetsData || []);

        const contextDropdowns = await fetchAllDropdowns("repair");
        setStatuses(contextDropdowns.statuses || []);
        setSuppliers(contextDropdowns.suppliers || []);

        // If editing, fetch repair data by ID
        if (id) {
          const repairData = await fetchRepairById(id);
          if (repairData) {
            setValue("asset", repairData.asset || "");
            setValue("status", repairData.status_id || "");
            setValue("supplier", repairData.supplier_id || "");
            setValue("repairType", repairData.type || "");
            setValue("repairName", repairData.name || "");
            setValue("startDate", repairData.start_date || "");
            setValue("endDate", repairData.end_date || "");
            setValue("cost", repairData.cost || "");
            setValue("notes", repairData.notes || "");
          }
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        setErrorMessage("Failed to load form data. Please try again.");
        setTimeout(() => setErrorMessage(""), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [id, setValue]);

  // Import system
  const EXPECTED_IMPORT_COLUMNS = [
    "Asset",
    "Supplier",
    "Repair Type",
    "Repair Name",
    "Start Date",
    "End Date",
    "Cost",
    "Notes",
  ];

  const normalizeExcelDate = (cell) => {
    if (cell === null || cell === undefined || cell === "") {
      return "";
    }

    if (typeof cell === "number") {
      try {
        return XLSX.SSF.format("yyyy-mm-dd", cell);
      } catch {
        return null;
      }
    }

    const value = String(cell).trim();

    if (!value) {
      return "";
    }

    const match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return null;
      }
      return parsed.toISOString().slice(0, 10);
    }

    const [, year, month, day] = match;
    const mm = month.padStart(2, "0");
    const dd = day.padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setErrorMessage("Please select a valid .xlsx file.");
      setTimeout(() => setErrorMessage(""), 5000);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rows || rows.length < 2) {
          setErrorMessage(
            "Import file must contain a header row and at least one data row."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        const headerRow = rows[0].map((cell) => String(cell || "").trim());
        const missingColumns = EXPECTED_IMPORT_COLUMNS.filter(
          (col) => !headerRow.includes(col)
        );

        if (missingColumns.length > 0) {
          setErrorMessage(
            `Invalid template. Missing column(s): ${missingColumns.join(", ")}.`
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        const dataRows = rows
          .slice(1)
          .filter((row) =>
            row.some(
              (cell) =>
                cell !== null &&
                cell !== undefined &&
                String(cell).trim() !== ""
            )
          );

        if (dataRows.length === 0) {
          setErrorMessage("No data rows found in the import file.");
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        if (dataRows.length > 1) {
          setErrorMessage(
            "Import file must contain exactly one data row for registration."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        const row = dataRows[0];
        const columnIndex = {};
        EXPECTED_IMPORT_COLUMNS.forEach((col) => {
          columnIndex[col] = headerRow.indexOf(col);
        });

        const getCell = (col) => row[columnIndex[col]];

        const assetCell = getCell("Asset");
        const supplierCell = getCell("Supplier");
        const repairTypeCell = getCell("Repair Type");
        const repairNameCell = getCell("Repair Name");
        const startDateCell = getCell("Start Date");
        const endDateCell = getCell("End Date");
        const costCell = getCell("Cost");
        const notesCell = getCell("Notes");

        const requiredErrors = [];
        if (!assetCell || String(assetCell).trim() === "") {
          requiredErrors.push("Asset is required.");
        }
        if (!repairTypeCell || String(repairTypeCell).trim() === "") {
          requiredErrors.push("Repair Type is required.");
        }
        if (!repairNameCell || String(repairNameCell).trim() === "") {
          requiredErrors.push("Repair Name is required.");
        }
        if (!startDateCell || String(startDateCell).trim() === "") {
          requiredErrors.push("Start Date is required.");
        }

        if (requiredErrors.length > 0) {
          setErrorMessage(requiredErrors.join(" "));
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        const startDateNormalized = normalizeExcelDate(startDateCell);
        if (!startDateNormalized) {
          setErrorMessage("Start Date in the import file is not a valid date.");
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        const endDateNormalized = normalizeExcelDate(endDateCell);
        if (endDateCell && !endDateNormalized) {
          setErrorMessage("End Date in the import file is not a valid date.");
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        if (
          endDateNormalized &&
          endDateNormalized !== "" &&
          endDateNormalized < startDateNormalized
        ) {
          setErrorMessage(
            "End Date in the import file cannot be earlier than Start Date."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        let costValue = "";
        if (
          costCell !== null &&
          costCell !== undefined &&
          String(costCell).trim() !== ""
        ) {
          const numericCost = Number(costCell);
          if (Number.isNaN(numericCost) || numericCost < 0) {
            setErrorMessage(
              "Cost in the import file must be a non-negative number."
            );
            setTimeout(() => setErrorMessage(""), 5000);
            return;
          }
          costValue = numericCost;
        }

        const notesValue =
          notesCell !== null && notesCell !== undefined
            ? String(notesCell).trim()
            : "";

        if (notesValue.length > 500) {
          setErrorMessage(
            "Notes in the import file must be at most 500 characters."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        setValue("asset", String(assetCell).trim());
        setValue("supplier", supplierCell ? String(supplierCell).trim() : "");
        setValue("repairType", String(repairTypeCell).trim());
        setValue("repairName", String(repairNameCell).trim());
        setValue("startDate", startDateNormalized);
        setValue("endDate", endDateNormalized || "");
        setValue("cost", costValue === "" ? "" : costValue);
        setValue("notes", notesValue);

        setImportFile(file);
        setErrorMessage("");
        e.target.value = "";
      } catch (error) {
        console.error("Error processing import file:", error);
        setErrorMessage("Unable to read the import file. Please check the format.");
        setTimeout(() => setErrorMessage(""), 5000);
      }
    };

    reader.readAsArrayBuffer(file);
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

  // Modal field configurations
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
      defaultValue: 'repair'
    }
  ];

  const supplierFields = [
    {
      name: 'name',
      label: 'Supplier Name',
      type: 'text',
      placeholder: 'Supplier Name',
      required: true,
      maxLength: 100,
      validation: { required: 'Supplier Name is required' }
    }
  ];

  // Modal save handlers
  const handleSaveStatus = async (data) => {
    try {
      const newStatus = await createStatus(data);
      setStatuses([...statuses, newStatus]);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error creating status:', error);
      setErrorMessage("Failed to create status");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSaveSupplier = async (data) => {
    try {
      const newSupplier = await createSupplier(data);
      setSuppliers([...suppliers, newSupplier]);
      setShowSupplierModal(false);
    } catch (error) {
      console.error('Error creating supplier:', error);
      setErrorMessage("Failed to create supplier");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const onSubmit = async (data) => {
    if (!data.asset || !data.repairType || !data.repairName || !data.startDate || !data.status) {
      setErrorMessage("Please fill in all required fields before saving.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      // Build payload matching backend Repair model
      const payload = {
        asset: parseInt(data.asset),
        supplier_id: data.supplier ? parseInt(data.supplier) : null,
        status_id: parseInt(data.status),
        type: data.repairType,
        name: data.repairName.trim(),
        start_date: data.startDate,
        end_date: data.endDate || null,
        cost: data.cost || 0,
        notes: data.notes || "",
      };

      let result;
      if (isEdit) {
        result = await updateRepair(id, payload);
      } else {
        result = await createRepair(payload);
      }

      if (!result) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} repair.`);
      }

      const successMessage = isEdit
        ? "Asset Repair updated successfully."
        : "Asset Repair successfully registered.";

      navigate("/repairs", { state: { successMessage } });
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} repair:`, error);

      let message = `An error occurred while ${isEdit ? 'updating' : 'creating'} the repair.`;

      if (error.response && error.response.data) {
        const errData = error.response.data;
        if (typeof errData === "object") {
          // Check for non_field_errors first
          if (errData.non_field_errors && errData.non_field_errors.length > 0) {
            message = errData.non_field_errors[0];
          } else {
            // Get first error from any field
            const firstKey = Object.keys(errData)[0];
            if (Array.isArray(errData[firstKey]) && errData[firstKey].length > 0) {
              message = errData[firstKey][0];
            } else if (typeof errData[firstKey] === "string") {
              message = errData[firstKey];
            }
          }
        }
      }

      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  if (isLoading) {
    return <SystemLoading />;
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}

      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Repairs"
            currentPage={isEdit ? "Update Repair" : "New Repair"}
            rootNavigatePage="/repairs"
            title={isEdit ? "Edit Repair" : "New Repair"}
            rightComponent={
              <div className="import-section">
                <label htmlFor="repairs-import-file" className="import-btn">
                  <img src={PlusIcon} alt="Import" />
                  Import
                  <input
                    type="file"
                    id="repairs-import-file"
                    accept=".xlsx"
                    onChange={handleImportFile}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            }
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset */}
            <fieldset>
              <label htmlFor="asset">
                Asset<span className="required-asterisk">*</span>
              </label>
              <select
                className={errors.asset ? "input-error" : ""}
                {...register("asset", {
                  required: "Asset is required",
                })}
              >
                <option value="">Select Asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_id} - {asset.name}
                  </option>
                ))}
              </select>
              {errors.asset && (
                <span className="error-message">
                  {errors.asset.message}
                </span>
              )}
            </fieldset>

            {/* Supplier */}
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <div className="dropdown-with-add">
                <select
                  className={errors.supplier ? "input-error" : ""}
                  {...register("supplier")}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setShowSupplierModal(true)}
                  title="Add new supplier"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
            </fieldset>

            {/* Status */}
            <fieldset>
              <label htmlFor="status">
                Status<span className="required-asterisk">*</span>
              </label>
              <div className="dropdown-with-add">
                <select
                  className={errors.status ? "input-error" : ""}
                  {...register("status", {
                    required: "Status is required",
                  })}
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
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
              {errors.status && (
                <span className="error-message">
                  {errors.status.message}
                </span>
              )}
            </fieldset>

            {/* Repair Type */}
            <fieldset>
              <label htmlFor="repairType">
                Repair Type<span className="required-asterisk">*</span>
              </label>
              <select
                className={errors.repairType ? "input-error" : ""}
                {...register("repairType", {
                  required: "Repair type is required",
                })}
              >
                <option value="">Select Repair Type</option>
                {repairTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.repairType && (
                <span className="error-message">
                  {errors.repairType.message}
                </span>
              )}
            </fieldset>

            {/* Repair Name */}
            <fieldset>
              <label htmlFor="repairName">
                Repair Name<span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter repair name"
                maxLength="100"
                className={errors.repairName ? "input-error" : ""}
                {...register("repairName", {
                  required: "Repair name is required",
                })}
              />
              {errors.repairName && (
                <span className="error-message">
                  {errors.repairName.message}
                </span>
              )}
            </fieldset>

            {/* Start Date */}
            <fieldset>
              <label htmlFor="startDate">
                Start Date<span className="required-asterisk">*</span>
              </label>
              <input
                type="date"
                className={errors.startDate ? "input-error" : ""}
                {...register("startDate", {
                  required: "Start date is required",
                })}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate.message}</span>
              )}
            </fieldset>

            {/* End Date (Optional) */}
            <fieldset>
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                {...register("endDate", {
                  validate: (value, formValues) => {
                    if (value && formValues.startDate && value < formValues.startDate) {
                      return "End date cannot be earlier than start date";
                    }
                    return true;
                  },
                })}
                min={watch("startDate") || ""}
              />
              {errors.endDate && (
                <span className="error-message">{errors.endDate.message}</span>
              )}
            </fieldset>

            {/* Cost */}
            <fieldset className="cost-field">
            <label htmlFor="cost">Cost</label>
            <div className="cost-input-group">
              <span className="cost-addon">PHP</span>
              <input
                type="number"
                id="cost"
                name="cost"
                placeholder="0.00"
                min="0"
                step="0.01"
                {...register("cost", { valueAsNumber: true })}
              />
            </div>
          </fieldset>

            {/* Notes */}
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                placeholder="Enter notes"
                rows="3"
                maxLength="500"
                {...register("notes", {
                  maxLength: {
                    value: 500,
                    message: "Notes must be at most 500 characters",
                  },
                })}
              ></textarea>
              {errors.notes && (
                <span className="error-message">{errors.notes.message}</span>
              )}
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
              {isEdit ? "Update Repair" : "Save"}
            </button>
          </form>
        </section>
      </main>
      <Footer />

      {/* Add Status Modal */}
      <AddEntryModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSave={handleSaveStatus}
        title="New Status Label"
        fields={statusFields}
        type="status"
      />

      {/* Add Supplier Modal */}
      <AddEntryModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSave={handleSaveSupplier}
        title="New Supplier"
        fields={supplierFields}
        type="supplier"
      />
    </>
  );
};

export default RepairRegistration;
