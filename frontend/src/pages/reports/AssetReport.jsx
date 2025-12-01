import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import "../../styles/reports/AssetReport.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useForm, Controller } from "react-hook-form";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// FilterForm component for handling filter selections
function FilterForm({ title, placeholder, options }) {
  const animatedComponents = makeAnimated();
  const [hasSelectedOptions, setHasSelectedOptions] = useState(false);

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
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      position: "absolute",
      width: "100%",
      backgroundColor: "white",
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
      overflowY: "auto",
      padding: "0",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "grey",
      fontSize: "0.875rem",
      padding: "8px 12px",
      backgroundColor: state.isSelected
        ? "#007bff"
        : state.isFocused
        ? "#f8f9fa"
        : "white",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    }),
  };

  // Validation
  const { register, watch, control } = useForm({
    mode: "all",
  });

  const selectedOption = watch("selectedOption", "");

  useEffect(() => {
    if (selectedOption.length > 0) {
      setHasSelectedOptions(true);
    } else {
      setHasSelectedOptions(false);
    }
  }, [selectedOption]);

  return (
    <div className="filter-form">
      <label htmlFor={`filter-${title}`}>{title}</label>
      <Controller
        name="selectedOption"
        control={control}
        render={({ field }) => (
          <Select
            components={animatedComponents}
            options={options}
            placeholder={placeholder}
            styles={customStylesDropdown}
            isMulti
            {...field}
          />
        )}
      />
    </div>
  );
}

export default function AssetReport() {
  const animatedComponents = makeAnimated();
  const [selectAll, setSelectAll] = useState(true);
  const [hasTemplateName, setHasTemplateName] = useState(false);

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

  // Mock data for filters fields
  const filters = [
    {
      title: "Location",
      placeholder: "Select Locations",
      options: [
        { value: "makati", label: "Makati" },
        { value: "pasig", label: "Pasig" },
        { value: "marikina", label: "Marikina" },
        { value: "quezon_city", label: "Quezon City" },
        { value: "manila", label: "Manila" },
        { value: "taguig", label: "Taguig" },
        { value: "remote", label: "Remote" },
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

  // Mock data for saved templates
  const savedTemplate = [
    { value: "template1", label: "Template 1" },
    { value: "template2", label: "Template 2" },
    { value: "template3", label: "Template 3" },
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
    { id: "product_data", label: "Product Data", checked: true },
  ]);

  const [rightColumns, setRightColumns] = useState([
    { id: "category_data", label: "Category Data", checked: true },
    { id: "manufacturer_data", label: "Manufacturer Data", checked: true },
    { id: "status_data", label: "Status Data", checked: true },
    { id: "supplier_data", label: "Supplier Data", checked: true },
    { id: "location_data", label: "Location Data", checked: true },
    { id: "depreciation_data", label: "Depreciation Data", checked: true },
    { id: "checked_out_to", label: "Checked Out To", checked: true },
    {
      id: "last_next_audit_date",
      label: "Last and Next Audit Date",
      checked: true,
    },
    { id: "picture_data", label: "Picture Data", checked: true },
    { id: "created_at", label: "Created At", checked: true },
    { id: "updated_at", label: "Updated At", checked: true },
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

  // Validation
  const { register, watch } = useForm({
    mode: "all",
  });

  const templateName = watch("templateName", "");

  useEffect(() => {
    if (templateName.length > 0) {
      setHasTemplateName(true);
    } else {
      setHasTemplateName(false);
    }
  }, [templateName]);

  // Generate a random 7-character alphanumeric token
  const generateToken = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 7; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  // Format current date as YYYYMMDD
  const getFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // Handle download report
  const handleDownloadReport = () => {
    // Get selected columns (excluding select_all)
    const selectedLeftColumns = leftColumns
      .filter((c) => c.id !== "select_all" && c.checked)
      .map((c) => c.id);
    const selectedRightColumns = rightColumns
      .filter((c) => c.checked)
      .map((c) => c.id);
    const selectedColumns = [...selectedLeftColumns, ...selectedRightColumns];

    // Mock data for the report (in real implementation, this would come from API)
    const mockReportData = [
      {
        asset_id: "AST-001",
        asset_name: "MacBook Pro 16",
        purchase_date: "2023-01-15",
        purchase_cost: 2499.99,
        currency: "USD",
        order_number: "ORD-12345",
        serial_number: "SN-ABC123",
        warranty_expiration: "2026-01-15",
        notes: "Executive laptop",
        created_at: "2023-01-10",
        updated_at: "2023-11-20",
        product_data: "MacBook Pro 16-inch",
        category_data: "Laptops",
        manufacturer_data: "Apple",
        status_data: "Deployed",
        supplier_data: "Apple Store",
        location_data: "Makati Office",
        depreciation_data: "3 Years",
        checked_out_to: "John Doe",
        last_next_audit_date: "2024-01-15",
        picture_data: "image.jpg",
      },
    ];

    // Filter data to only include selected columns
    const filteredData = mockReportData.map((row) => {
      const filteredRow = {};
      selectedColumns.forEach((col) => {
        if (row[col] !== undefined) {
          // Convert column id to readable header
          const header = col
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
          filteredRow[header] = row[col];
        }
      });
      return filteredRow;
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Report");

    // Generate filename: [TemplateName]_[DateGenerated]_[7DigitToken].xlsx
    const name = templateName.trim() || "AssetReport";
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "_");
    const dateGenerated = getFormattedDate();
    const token = generateToken();
    const fileName = `${sanitizedName}_${dateGenerated}_${token}.xlsx`;

    // Write and download the file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="page-layout">
        <section className="title-page-section">
          <h1>Asset Report</h1>
        </section>
        <section className="asset-report-content">
          <section className="asset-report-left-card">
            <section className="asset-report-filter">
              <h2>Select Filter</h2>
              {filters.map((filter, index) => {
                return (
                  <FilterForm
                    key={index}
                    title={filter.title}
                    placeholder={filter.placeholder}
                    options={filter.options}
                  />
                );
              })}
            </section>
            <section className="asset-report-column">
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
            </section>
          </section>
          <section className="asset-report-right-card">
            <section className="asset-report-download">
              <button className="primary-button" onClick={handleDownloadReport}>
                Download Report
              </button>
            </section>
            <section className="top-section">
              <h2>Open Saved Template</h2>
              <Select
                components={animatedComponents}
                options={savedTemplate}
                placeholder="Select a Template"
                styles={customStylesDropdown}
              />
            </section>
            <section className="middle-section">
              <h2>Template Name</h2>
              <input
                type="text"
                name="templateName"
                id="templateName"
                className="input-field"
                placeholder="Enter template name"
                {...register("templateName")}
              />
              <button className="primary-button" disabled={!hasTemplateName}>
                Save Template
              </button>
            </section>
            <section className="bottom-section">
              <h2>About Saved Templates</h2>
              <p>
                Select your options, then enter the name of your template in the
                box above and click the 'Save Template' button. Use the dropdown
                to select a previously saved template.
              </p>
            </section>
          </section>
        </section>
      </main>
    </>
  );
}
