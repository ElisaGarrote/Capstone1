import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import "../../styles/reports/AssetReport.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";

// FilterForm component for handling filter selections
function FilterForm({ title, placeholder, options }) {
  const animatedComponents = makeAnimated();

  const customStylesDropdown = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      borderRadius: "25px",
      fontSize: "0.875rem",
      padding: "3px 8px",
    }),
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "grey",
      fontSize: "0.875rem",
    }),
  };

  return (
    <div className="filter-form">
      <label htmlFor={`filter-${title}`}>{title}</label>
      <Select
        components={animatedComponents}
        options={options}
        placeholder={placeholder}
        styles={customStylesDropdown}
        isMulti
      />
    </div>
  );
}

export default function AssetReport() {
  const [selectAll, setSelectAll] = useState(true);

  const filters = [
    {
      title: "Location",
      placeholder: "Select Locations",
      options: [
        { value: "makati", label: "Makati" },
        { value: "pasig", label: "Pasig" },
        { value: "marikina", label: "Marikina" },
      ],
    },
    {
      title: "Supplier",
      placeholder: "Select Suppliers",
      options: [
        { value: "amazon", label: "Amazon" },
        { value: "tilt_supplier", label: "Tilt Supplier" },
        { value: "global_parts", label: "Global Parts" },
      ],
    },
    {
      title: "Product",
      placeholder: "Select Products",
      options: [
        { value: "macbook pro 16'", label: "Macbook Pro 16'" },
        { value: "swift go 14", label: "Swift Go 14" },
        { value: "iphone 17 pro max", label: "Iphone 17 Pro Max" },
      ],
    },
    {
      title: "Manufacturer",
      placeholder: "Select Manufacturers",
      options: [
        { value: "acer", label: "Acer" },
        { value: "hp", label: "HP" },
        { value: "apple", label: "Apple" },
      ],
    },
    {
      title: "Category",
      placeholder: "Select Categories",
      options: [
        { value: "laptops", label: "Laptops" },
        { value: "mobile phones", label: "Mobile Phones" },
        { value: "tables", label: "Tables" },
      ],
    },
    {
      title: "Status",
      placeholder: "Select Statuses",
      options: [
        { value: "archived", label: "Archived" },
        { value: "being repaired", label: "Being Repaired" },
        { value: "broken", label: "Broken" },
        { value: "deployed", label: "Deployed" },
        { value: "lost or stolen", label: "Lost or Stolen" },
        { value: "pending", label: "Pending" },
        { value: "ready to deploy", label: "Ready to Deploy" },
      ],
    },
  ];

  const [leftColumns, setLeftColumns] = useState([
    { id: "select_all", label: "Select All", checked: true },
    { id: "asset_id", label: "Asset ID", checked: true },
    { id: "asset_name", label: "Asset Name", checked: true },
    { id: "purchase_date", label: "Purchase Date", checked: true },
    { id: "purchase_cost", label: "Purchase Cost", checked: true },
    { id: "currency", label: "Currency", checked: true },
    { id: "order_number", label: "Order Number", checked: true },
    { id: "serial_number", label: "Serial Number", checked: true },
    {
      id: "warranty_expiration",
      label: "Warranty Expiration Date",
      checked: true,
    },
    { id: "notes", label: "Notes", checked: true },
    { id: "created_at", label: "Created At", checked: true },
    { id: "updated_at", label: "Updated At", checked: true },
    { id: "custom_fields", label: "Custom Fields", checked: true },
  ]);

  const [rightColumns, setRightColumns] = useState([
    { id: "product_data", label: "Product Data", checked: true },
    { id: "category_data", label: "Category Data", checked: true },
    { id: "manufacturer_data", label: "Manufacturer Data", checked: true },
    { id: "status_data", label: "Status Data", checked: true },
    { id: "supplier_data", label: "Supplier Data", checked: true },
    { id: "location_data", label: "Location Data", checked: true },
    { id: "department_data", label: "Department Data", checked: true },
    { id: "depreciation_data", label: "Depreciation Data", checked: true },
    { id: "checked_out_to", label: "Checked Out To", checked: true },
    {
      id: "last_next_audit_date",
      label: "Last and Next Audit Date",
      checked: true,
    },
    { id: "picture_data", label: "Picture Data", checked: true },
    { id: "paid_for_data", label: "Paid For Data", checked: true },
  ]);

  // Keep selectAll state in sync when columns change
  useEffect(() => {
    const allRightChecked = rightColumns.every((c) => c.checked === true);
    const allLeftChecked = leftColumns
      .filter((c) => c.id !== "select_all")
      .every((c) => c.checked === true);

    // If all columns on either side are checked, reflect that in selectAll
    const desired = allRightChecked && allLeftChecked;

    // Only update `select_all` entry in leftColumns when its value actually differs
    const currentSelectAll = leftColumns.find((c) => c.id === "select_all");
    if (currentSelectAll && currentSelectAll.checked !== desired) {
      setLeftColumns((prev) =>
        prev.map((c) =>
          c.id === "select_all" ? { ...c, checked: desired } : c
        )
      );
    }

    // Only update selectAll state when it actually changes
    setSelectAll((prev) => (prev === desired ? prev : desired));
  }, [rightColumns, leftColumns]);

  return (
    <div className="report-container">
      <NavBar />
      <main className="report-content">
        <h1>Asset Report</h1>

        <div className="report-card">
          <div className="report-sections">
            <div className="filters-section">
              <h2>Select Filter</h2>
              {filters.map((filter, index) => (
                <FilterForm
                  key={index}
                  title={filter.title}
                  placeholder={filter.placeholder}
                  options={filter.options}
                />
              ))}
            </div>

            <div className="columns-section">
              <h2>Select Columns</h2>
              <div className="columns-grid">
                <div className="column-left">
                  {leftColumns.map((column, idx) => (
                    <div key={column.id} className="column-checkbox">
                      <input
                        type="checkbox"
                        id={column.id}
                        checked={column.checked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          // If this is the select_all checkbox, explicitly update all columns
                          if (column.id === "select_all") {
                            setSelectAll(checked);
                            setLeftColumns((prev) =>
                              prev.map((c) => ({
                                ...c,
                                checked:
                                  c.id === "select_all" ? checked : checked,
                              }))
                            );
                            setRightColumns((prev) =>
                              prev.map((c) => ({ ...c, checked }))
                            );
                            return;
                          }
                          setLeftColumns((prev) =>
                            prev.map((c) =>
                              c.id === column.id ? { ...c, checked } : c
                            )
                          );
                        }}
                      />
                      <label htmlFor={column.id}>{column.label}</label>
                    </div>
                  ))}
                </div>
                <div className="column-right">
                  {rightColumns.map((column) => (
                    <div key={column.id} className="column-checkbox">
                      <input
                        type="checkbox"
                        id={column.id}
                        checked={column.checked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRightColumns((prev) =>
                            prev.map((c) =>
                              c.id === column.id ? { ...c, checked } : c
                            )
                          );
                        }}
                      />
                      <label htmlFor={column.id}>{column.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button className="download-button">Download Report</button>
        </div>
      </main>
    </div>
  );
}
