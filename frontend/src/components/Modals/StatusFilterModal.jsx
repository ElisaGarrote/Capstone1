import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/ContextFilterModal.css";

export default function StatusFilterModal({ isOpen, onClose, onApplyFilter, initialFilters = {} }) {

  const [filters, setFilters] = useState({
    name: "",
    type: null,
  });

  // Status type options
  const typeOptions = [
    { value: "asset", label: "Asset" },
    { value: "component", label: "Component" },
  ];

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
  const handleSelectChange = (field, value) => {
    const selectedOption = typeOptions.find(opt => opt.value === value);
    setFilters((prev) => ({
      ...prev,
      [field]: selectedOption || null,
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      name: "",
      type: null,
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
    <div className="status-modal-overlay" onClick={handleOverlayClick}>
      <div className="status-filter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="status-modal-header">
          <h2>Filter Statuses</h2>
          <button className="status-modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="status-filter-modal-body">
          <div className="status-filter-grid">
            {/* Status Name */}
            <fieldset>
              <label htmlFor="name">Status Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter Status Name"
                value={filters.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </fieldset>

            {/* Status Type */}
            <fieldset>
              <label htmlFor="type">Status Type</label>
              <select
                id="type"
                value={filters.type?.value || ""}
                onChange={(e) => handleSelectChange("type", e.target.value)}
              >
                <option value="">Select Type</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="status-modal-footer">
          <button className="status-modal-cancel-btn" onClick={handleReset}>
            Reset Filter
          </button>
          <button className="status-modal-save-btn" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

