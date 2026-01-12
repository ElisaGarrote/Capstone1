import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function DueBackFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  onResetFilter,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    checkoutdate: "",
    checkindate: "",
  });

  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (onResetFilter) {
      onResetFilter();
      onClose();
    } else {
      setFilters({ checkoutdate: "", checkindate: "" });
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
          <h2>Filter Due for Checkin</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        <div className="modal-body asset-filter-modal-body">
          <div className="filter-grid">
            <fieldset>
              <label htmlFor="checkoutdate">Checkout Date</label>
              <input
                id="checkoutdate"
                type="date"
                value={filters.checkoutdate}
                onChange={(e) => handleInputChange("checkoutdate", e.target.value)}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="checkindate">Checkin Date</label>
              <input
                id="checkindate"
                type="date"
                value={filters.checkindate}
                onChange={(e) => handleInputChange("checkindate", e.target.value)}
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
