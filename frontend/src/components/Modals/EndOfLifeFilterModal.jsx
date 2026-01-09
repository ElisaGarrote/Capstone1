import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function EndOfLifeFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    status: null,
    endoflifedate: "",
    warrantyexpirationdate: "",
  });

  const statusOptions = [
    { value: "beingrepaired", label: "Being Repaired" },
    { value: "broken", label: "Broken" },
    { value: "deployed", label: "Deployed" },
    { value: "lostorstolen", label: "Lost or Stolen" },
    { value: "pending", label: "Pending" },
    { value: "readytodeploy", label: "Ready to Deploy" },
  ];

  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleSelectChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleInputChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleReset = () =>
    setFilters({ status: null, endoflifedate: "", warrantyexpirationdate: "" });

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
          <h2>Filter End of Life & Warranty</h2>
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
                value={filters.status?.value || filters.status || ""}
                onChange={(e) => handleSelectChange("status", e.target.value)}
              >
                <option value="">Select Status</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor="endoflifedate">End of Life Date</label>
              <input
                id="endoflifedate"
                type="date"
                value={filters.endoflifedate}
                onChange={(e) => handleInputChange("endoflifedate", e.target.value)}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="warrantyexpirationdate">Warranty Expiration Date</label>
              <input
                id="warrantyexpirationdate"
                type="date"
                value={filters.warrantyexpirationdate}
                onChange={(e) => handleInputChange("warrantyexpirationdate", e.target.value)}
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
