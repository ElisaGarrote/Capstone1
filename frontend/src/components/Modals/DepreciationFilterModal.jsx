import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function DepreciationFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  onResetFilter,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    status: null,
    depreciation: null,
    durationMonths: "",
    monthsLeft: "",
  });

  const statusOptions = [
    { value: "beingrepaired", label: "Being Repaired" },
    { value: "broken", label: "Broken" },
    { value: "deployed", label: "Deployed" },
    { value: "lostorstolen", label: "Lost or Stolen" },
    { value: "pending", label: "Pending" },
    { value: "readytodeploy", label: "Ready to Deploy" },
  ];

  const depreciationOptions = [
    { value: "iPhone Depreciation", label: "iPhone Depreciation" },
    { value: "Laptop Depreciation", label: "Laptop Depreciation" },
    { value: "Tablet Depreciation", label: "Tablet Depreciation" },
  ];

  // Initialize filters from props
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field, selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      [field]: selectedOption,
    }));
  };

  // Reset all filters
  const handleReset = () => {
    if (onResetFilter) {
      onResetFilter();
      onClose();
    } else {
      setFilters({
        status: null,
        depreciation: null,
        durationMonths: "",
        monthsLeft: "",
      });
    }
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
      <div
        className="modal-container asset-filter-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Filter Depreciation Report</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        <div className="modal-body asset-filter-modal-body">
          <div className="filter-grid">
            <fieldset>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={filters.status?.value || ""}
                onChange={(e) => {
                  const selectedOption = statusOptions.find(
                    (opt) => opt.value === e.target.value
                  );
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

            <fieldset>
              <label htmlFor="depreciation">Depreciation</label>
              <select
                id="depreciation"
                value={filters.depreciation?.value || ""}
                onChange={(e) => {
                  const selectedOption = depreciationOptions.find(
                    (opt) => opt.value === e.target.value
                  );
                  handleSelectChange("depreciation", selectedOption || null);
                }}
              >
                <option value="">Select Depreciation</option>
                {depreciationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor="durationMonths">Duration Months</label>
              <input
                type="number"
                id="durationMonths"
                placeholder="Enter duration"
                value={filters.durationMonths}
                onChange={(e) =>
                  handleInputChange("durationMonths", e.target.value)
                }
                min="0"
                step="1"
              />
            </fieldset>

            <fieldset>
              <label htmlFor="monthsLeft">Months Left</label>
              <input
                type="number"
                id="monthsLeft"
                placeholder="Enter months left"
                value={filters.monthsLeft}
                onChange={(e) => handleInputChange("monthsLeft", e.target.value)}
                min="0"
                step="1"
              />
            </fieldset>
          </div>
        </div>

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

