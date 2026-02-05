import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function AssetFilterModal({ isOpen, onClose, onApplyFilter, initialFilters = {}, allAssets = [] }) {

  const [filters, setFilters] = useState({
    assetId: "",
    name: "",
    serial: "",
    status: null,
    warranty: "",
    endOfLife: "",
    checkInCheckOut: null,
  });

  // Status options - Mapped to actual database values
  const statusOptions = [
    { value: "deployable", label: "Ready to Deploy" },
    { value: "deployed", label: "Available" },
    { value: "repair", label: "Under Repair" },
    { value: "broken", label: "Broken" },
    { value: "pending", label: "Pending Approval" },
    { value: "in_transit", label: "In Transit" },
    { value: "retired", label: "Retired" },
    { value: "lost", label: "Lost or Stolen" },
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
    { value: "archived", label: "Archived" },
    { value: "undeployable", label: "Undeployable" },
    { value: "for_audit", label: "For Audit" },
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

  // Reset all filters
  const handleReset = () => {
    const resetFilters = {
      assetId: "",
      name: "",
      serial: "",
      status: null,
      warranty: "",
      endOfLife: "",
      checkInCheckOut: null,
    };
    setFilters(resetFilters);
    onApplyFilter(resetFilters);
    onClose();
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
            {/* Asset ID */}
            <fieldset>
              <label htmlFor="assetId">Asset ID</label>
              <input
                type="text"
                id="assetId"
                placeholder="Enter Asset ID"
                value={filters.assetId}
                onChange={(e) => handleInputChange("assetId", e.target.value)}
              />
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

