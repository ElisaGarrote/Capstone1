// styles
import "../styles/FilterPanel.css";

// react
import { useState } from "react";

export default function FilterPanel({ filters = [], onReset }) {
  const [showFilter, setShowFilter] = useState(false);
  const [values, setValues] = useState({});

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setValues({});
    onReset?.(); // optional callback for parent
  };

  return (
    <div className="filterPanel">
      <div className="fpShowFilter" onClick={() => setShowFilter(!showFilter)}>
        <span>{showFilter ? "Hide Filter" : "Show Filter"}</span>
      </div>

      {showFilter && (
        <div className="filterPanelCont">
          {filters.map((filter) => (
            <div key={filter.name} className="filterGroup">
              <label htmlFor={filter.name}>{filter.label}</label>

              {/* Dropdown */}
              {filter.type === "select" && (
                <select
                  name={filter.name}
                  className="dropdown"
                  value={values[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                >
                  <option value="">Select {filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Date */}
              {filter.type === "date" && (
                <input
                  type="date"
                  name={filter.name}
                  className="dateTime"
                  value={values[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                />
              )}

              {/* Number */}
              {filter.type === "number" && (
                <input
                  type="number"
                  name={filter.name}
                  className="numberInput"
                  value={values[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                  min={1}
                  max={filter.max ?? undefined}
                  step={filter.step ?? 1}
                />
              )}

              {/* Text */}
              {filter.type === "text" && (
                <input
                  type="text"
                  name={filter.name}
                  className="textInput"
                  value={values[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                />
              )}
            </div>
          ))}

          {/* Reset Button */}
          <div className="filterActions">
            <button type="button" className="resetButton" onClick={handleReset}>
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
