import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function ActivityFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  onResetFilter,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    type: "",
    event: "",
    user: "",
    tofrom: "",
  });

  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleSelectChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleInputChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleReset = () => {
    if (onResetFilter) {
      onResetFilter();
      onClose();
    } else {
      setFilters({ type: "", event: "", user: "", tofrom: "" });
    }
  };

  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-container asset-filter-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Filter Activity Report</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        <div className="modal-body asset-filter-modal-body">
          <div className="filter-grid">
            <fieldset>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => handleSelectChange("type", e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="accessory">Accessory</option>
                <option value="asset">Asset</option>
                <option value="audit">Audit</option>
                <option value="component">Component</option>
                <option value="consumable">Consumable</option>
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor="event">Event</label>
              <select
                id="event"
                value={filters.event}
                onChange={(e) => handleSelectChange("event", e.target.value)}
              >
                <option value="">Select Event</option>
                <option value="checkin">Checkin</option>
                <option value="checkout">Checkout</option>
                <option value="create">Create</option>
                <option value="delete">Delete</option>
                <option value="failed">Failed</option>
                <option value="passed">Passed</option>
                <option value="repair">Repair</option>
                <option value="schedule">Schedule</option>
                <option value="update">Update</option>
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor="user">User</label>
              <input
                id="user"
                type="text"
                placeholder="Enter user"
                value={filters.user}
                onChange={(e) => handleInputChange("user", e.target.value)}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="tofrom">To/From</label>
              <input
                id="tofrom"
                type="text"
                placeholder="Enter To/From"
                value={filters.tofrom}
                onChange={(e) => handleInputChange("tofrom", e.target.value)}
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
