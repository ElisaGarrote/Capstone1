import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function EndOfLifeWarrantyFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    status: null,
    checkoutDate: "",
    checkinDate: "",
    warrantyExpirationDate: "",
  });

  const statusOptions = [
    { value: "beingrepaired", label: "Being Repaired" },
    { value: "broken", label: "Broken" },
    { value: "deployed", label: "Deployed" },
    { value: "lostorstolen", label: "Lost or Stolen" },
    { value: "pending", label: "Pending" },
    { value: "readytodeploy", label: "Ready to Deploy" },
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
    setFilters({
      status: null,
      checkoutDate: "",
      checkinDate: "",
      warrantyExpirationDate: "",
    });
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
          <h2>Filter End of Life & Warranty Report</h2>
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
              <label htmlFor="checkoutDate">Checkout Date</label>
              <input
                type="date"
                id="checkoutDate"
                value={filters.checkoutDate}
                onChange={(e) => handleInputChange("checkoutDate", e.target.value)}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="checkinDate">Checkin Date</label>
              <input
                type="date"
                id="checkinDate"
                value={filters.checkinDate}
                onChange={(e) => handleInputChange("checkinDate", e.target.value)}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="warrantyExpirationDate">Warranty Expiration Date</label>
              <input
                type="date"
                id="warrantyExpirationDate"
                value={filters.warrantyExpirationDate}
                onChange={(e) => handleInputChange("warrantyExpirationDate", e.target.value)}
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
