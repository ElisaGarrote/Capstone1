import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import Alert from "../../components/Alert";
import "../../styles/reports/AssetReport.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useForm } from "react-hook-form";

// Services
import {
  fetchAllCategories,
  fetchAllSuppliers,
  fetchAllManufacturers,
  fetchAllStatuses,
} from "../../services/contexts-service";
import { fetchAllLocations } from "../../services/integration-help-desk-service";
import {
  fetchAllProducts,
  downloadAssetReportExcel,
} from "../../services/assets-service";

// FilterForm component for handling filter selections
function FilterForm({
  title,
  placeholder,
  options,
  onSelectionChange,
  filterKey,
}) {
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

  // Handle selection change - pass first selected value to parent
  const handleChange = (selectedOptions) => {
    if (onSelectionChange && filterKey) {
      // For single filter, take the first selected value
      const value =
        selectedOptions && selectedOptions.length > 0
          ? selectedOptions[0].value
          : null;
      onSelectionChange(filterKey, value);
    }
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
        onChange={handleChange}
      />
    </div>
  );
}

export default function AssetReport() {
  const animatedComponents = makeAnimated();
  const [selectAll, setSelectAll] = useState(true);
  const [hasTemplateName, setHasTemplateName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Alert states
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    suppliers: [],
    products: [],
    manufacturers: [],
    categories: [],
    statuses: [],
  });

  // State for selected filter values
  const [selectedFilters, setSelectedFilters] = useState({
    location: null,
    supplier: null,
    category: null,
    status: null,
  });

  // Handle filter selection change
  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

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

  // Fetch filter options from backend on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoading(true);
      try {
        const [
          locations,
          suppliers,
          products,
          manufacturers,
          categories,
          statuses,
        ] = await Promise.all([
          fetchAllLocations().catch(() => []),
          fetchAllSuppliers().catch(() => []),
          fetchAllProducts().catch(() => []),
          fetchAllManufacturers().catch(() => []),
          fetchAllCategories().catch(() => []),
          fetchAllStatuses().catch(() => []),
        ]);

        setFilterOptions({
          locations: (locations || []).map((l) => ({
            value: l.id,
            label: l.name,
          })),
          suppliers: (suppliers || []).map((s) => ({
            value: s.id,
            label: s.name,
          })),
          products: (products || []).map((p) => ({
            value: p.id,
            label: p.name,
          })),
          manufacturers: (manufacturers || []).map((m) => ({
            value: m.id,
            label: m.name,
          })),
          categories: (categories || []).map((c) => ({
            value: c.id,
            label: c.name,
          })),
          statuses: (statuses || []).map((s) => ({
            value: s.id,
            label: s.name,
          })),
        });
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Build filters config from loaded options
  const filters = [
    {
      title: "Location",
      placeholder: "Select Locations",
      options: filterOptions.locations,
      filterKey: "location",
    },
    {
      title: "Supplier",
      placeholder: "Select Suppliers",
      options: filterOptions.suppliers,
      filterKey: "supplier",
    },
    {
      title: "Product",
      placeholder: "Select Products",
      options: filterOptions.products,
      filterKey: "product",
    },
    {
      title: "Manufacturer",
      placeholder: "Select Manufacturers",
      options: filterOptions.manufacturers,
      filterKey: "manufacturer",
    },
    {
      title: "Category",
      placeholder: "Select Categories",
      options: filterOptions.categories,
      filterKey: "category",
    },
    {
      title: "Status",
      placeholder: "Select Statuses",
      options: filterOptions.statuses,
      filterKey: "status",
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

  // Handle download report from backend
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    // Clear any previous messages
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Build filter params from selected filters
      const filterParams = {};
      if (selectedFilters.status)
        filterParams.status_id = selectedFilters.status;
      if (selectedFilters.category)
        filterParams.category_id = selectedFilters.category;
      if (selectedFilters.supplier)
        filterParams.supplier_id = selectedFilters.supplier;
      if (selectedFilters.location)
        filterParams.location_id = selectedFilters.location;

      // Generate filename
      const name = templateName.trim() || "AssetReport";
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "_");
      const dateGenerated = getFormattedDate();
      const token = generateToken();
      const fileName = `${sanitizedName}_${dateGenerated}_${token}.xlsx`;

      // Download from backend
      await downloadAssetReportExcel(filterParams, fileName);

      // Show success message
      setSuccessMessage("Report downloaded successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error downloading report:", error);

      // Build error message
      let message = "Failed to download report. Please try again.";

      if (error.code === "ECONNABORTED") {
        message =
          "Request timed out. The report may be too large. Please try with more specific filters.";
      } else if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === "string") {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        }
      } else if (error.message) {
        message = error.message;
      }

      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Alert Messages */}
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

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
              {isLoading ? (
                <p>Loading filters...</p>
              ) : (
                filters.map((filter, index) => {
                  return (
                    <FilterForm
                      key={index}
                      title={filter.title}
                      placeholder={filter.placeholder}
                      options={filter.options}
                      filterKey={filter.filterKey}
                      onSelectionChange={handleFilterChange}
                    />
                  );
                })
              )}
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
              <button
                className="primary-button"
                onClick={handleDownloadReport}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download Report"}
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
