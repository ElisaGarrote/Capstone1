import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function AssetFilterModal({ isOpen, onClose, onApplyFilter, initialFilters = {}, allAssets = [] }) {

  const [filters, setFilters] = useState({
    assetId: [],
    name: "",
    serial: "",
    status: null,
    forAudit: null,
    warranty: "",
    endOfLife: "",
    checkInCheckOut: null,
  });

  const [assetIdInput, setAssetIdInput] = useState("");

  // Status options - Exact list provided by user
  const statusOptions = [
    { value: "ready_to_deploy", label: "Ready to Deploy" },
    { value: "available", label: "Available" },
    { value: "under_repair", label: "Under Repair" },
    { value: "broken", label: "Broken" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "in_transit", label: "In Transit" },
    { value: "retired", label: "Retired" },
    { value: "lost_or_stolen", label: "Lost or Stolen" },
    { value: "maintenance", label: "Maintenance" },
    { value: "reserved", label: "Reserved" },
    { value: "awaiting_calibration", label: "Awaiting Calibration" },
    { value: "calibration_due", label: "Calibration Due" },
    { value: "warranty", label: "Warranty" },
    { value: "out_for_service", label: "Out for Service" },
    { value: "quarantined", label: "Quarantined" },
    { value: "decommissioned", label: "Decommissioned" },
    { value: "replacement_pending", label: "Replacement Pending" },
    { value: "inspection_required", label: "Inspection Required" },
  ];

  // For Audit options
  const forAuditOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  // Check-In/Check-Out options
  const checkInCheckOutOptions = [
    { value: "checked_out", label: "Checked Out" },
    { value: "checked_in", label: "Checked In" },
  ];

  // Get available asset IDs from allAssets
  const availableAssetIds = allAssets.map(asset => asset.asset_id || asset.displayed_id).filter(Boolean);

  // Initialize filters from props
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (field, selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      [field]: selectedOption,
    }));
  };

  // Handle adding asset ID tag
  const handleAddAssetIdTag = () => {
    const trimmedInput = assetIdInput.trim().toUpperCase();
    if (trimmedInput && availableAssetIds.includes(trimmedInput) && !filters.assetId.includes(trimmedInput)) {
      setFilters((prev) => ({
        ...prev,
        assetId: [...prev.assetId, trimmedInput],
      }));
      setAssetIdInput("");
    }
  };

  // Handle removing asset ID tag
  const handleRemoveAssetIdTag = (id) => {
    setFilters((prev) => ({
      ...prev,
      assetId: prev.assetId.filter((tag) => tag !== id),
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      assetId: [],
      name: "",
      serial: "",
      status: null,
      forAudit: null,
      warranty: "",
      endOfLife: "",
      checkInCheckOut: null,
    });
    setAssetIdInput("");
  };

  // Apply filters
  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  // Close modal on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container asset-filter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Filter Assets</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body asset-filter-modal-body">
          <div className="filter-grid">
            {/* Asset ID with Tag Selection */}
            <fieldset>
              <label htmlFor="assetId">Asset ID</label>
              <div className="asset-id-input-group">
                <input
                  type="text"
                  id="assetId"
                  placeholder="Enter Asset ID"
                  value={assetIdInput}
                  onChange={(e) => setAssetIdInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleAddAssetIdTag()}
                  list="assetIdList"
                />
                <datalist id="assetIdList">
                  {availableAssetIds.filter(id => !filters.assetId.includes(id)).map((id) => (
                    <option key={id} value={id} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={handleAddAssetIdTag}
                  className="add-tag-btn"
                >
                  Add
                </button>
              </div>
              <div className="asset-id-tags">
                {filters.assetId.map((id) => (
                  <div key={id} className="asset-id-tag">
                    {id}
                    <button
                      type="button"
                      onClick={() => handleRemoveAssetIdTag(id)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Asset Name */}
            <fieldset>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter Asset Name"
                value={filters.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </fieldset>

            {/* Serial Number */}
            <fieldset>
              <label htmlFor="serial">Serial</label>
              <input
                type="text"
                id="serial"
                placeholder="Enter Serial Number"
                value={filters.serial}
                onChange={(e) => handleInputChange("serial", e.target.value)}
              />
            </fieldset>

            {/* Status */}
            <fieldset>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={filters.status?.value || ""}
                onChange={(e) => {
                  const selectedOption = statusOptions.find(opt => opt.value === e.target.value);
                  handleSelectChange("status", selectedOption || null);
                }}
              >
                <option value="">Select Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* For Audit */}
            <fieldset>
              <label htmlFor="forAudit">For Audit</label>
              <select
                id="forAudit"
                value={filters.forAudit !== null ? filters.forAudit : ""}
                onChange={(e) => {
                  if (e.target.value === "") {
                    handleSelectChange("forAudit", null);
                  } else {
                    const selectedOption = forAuditOptions.find(opt => String(opt.value) === e.target.value);
                    handleSelectChange("forAudit", selectedOption || null);
                  }
                }}
              >
                <option value="">Select Option</option>
                {forAuditOptions.map((option) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Warranty */}
            <fieldset>
              <label htmlFor="warranty">Warranty</label>
              <input
                type="date"
                id="warranty"
                value={filters.warranty}
                onChange={(e) => handleInputChange("warranty", e.target.value)}
              />
            </fieldset>

            {/* End of Life */}
            <fieldset>
              <label htmlFor="endOfLife">End of Life</label>
              <input
                type="date"
                id="endOfLife"
                value={filters.endOfLife}
                onChange={(e) => handleInputChange("endOfLife", e.target.value)}
              />
            </fieldset>

            {/* Check-In / Check-Out */}
            <fieldset>
              <label htmlFor="checkInCheckOut">Check-In / Check-Out</label>
              <select
                id="checkInCheckOut"
                value={filters.checkInCheckOut?.value || ""}
                onChange={(e) => {
                  const selectedOption = checkInCheckOutOptions.find(opt => opt.value === e.target.value);
                  handleSelectChange("checkInCheckOut", selectedOption || null);
                }}
              >
                <option value="">Select Option</option>
                {checkInCheckOutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={handleReset}>
            Reset Filter
          </button>
          <button className="modal-save-btn" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

