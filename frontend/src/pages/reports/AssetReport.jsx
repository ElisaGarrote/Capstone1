import React from 'react';
import NavBar from "../../components/NavBar";
import FilterForm from "../../components/FilterForm";
import "../../styles/reports/AssetReport.css";

export default function AssetReport() {
  const filters = [
    {
      title: "Location",
      placeholder: "All Locations",
      options: []
    },
    {
      title: "Supplier",
      placeholder: "All Suppliers",
      options: []
    },
    {
      title: "Product",
      placeholder: "All Products",
      options: []
    },
    {
      title: "Manufacturer",
      placeholder: "All Manufacturers",
      options: []
    },
    {
      title: "Category",
      placeholder: "All Categories",
      options: []
    },
    {
      title: "Status",
      placeholder: "All Statuses",
      options: []
    }
  ];

  const columns = [
    { id: "asset_id", label: "Asset ID", checked: true },
    { id: "asset_name", label: "Asset Name", checked: true },
    { id: "purchase_date", label: "Purchase Date", checked: true },
    { id: "purchase_cost", label: "Purchase Cost", checked: true },
    { id: "currency", label: "Currency", checked: true },
    { id: "order_number", label: "Order Number", checked: true },
    { id: "serial_number", label: "Serial Number", checked: true },
    { id: "warranty_expiration", label: "Warranty Expiration Date", checked: true },
    { id: "notes", label: "Notes", checked: true },
    { id: "created_at", label: "Created At", checked: true },
    { id: "updated_at", label: "Updated At", checked: true },
    { id: "custom_fields", label: "Custom Fields", checked: true },
    { id: "product_data", label: "Product Data", checked: true },
    { id: "category_data", label: "Category Data", checked: true },
    { id: "manufacturer_data", label: "Manufacturer Data", checked: true },
    { id: "status_data", label: "Status Data", checked: true },
    { id: "supplier_data", label: "Supplier Data", checked: true },
    { id: "location_data", label: "Location Data", checked: true },
    { id: "department_data", label: "Department Data", checked: true },
    { id: "depreciation_data", label: "Depreciation Data", checked: true },
    { id: "checked_out_to", label: "Checked Out To", checked: true },
    { id: "last_next_audit_date", label: "Last and Next Audit Date", checked: true },
    { id: "picture_data", label: "Picture Data", checked: true },
    { id: "paid_for_data", label: "Paid For Data", checked: true }
  ];

  return (
    <div className="report-container">
      <NavBar />
      <main className="report-content">
        <h1>Asset Report</h1>
        
        <div className="report-section">
          <div className="filter-columns-wrapper">
            <div className="filters-section">
              <h2>Select Filter</h2>
              {filters.map((filter, index) => (
                <FilterForm
                  key={index}
                  title={filter.title}
                  placeholder={filter.placeholder}
                  options={filter.options}
                  onChange={(e) => console.log(filter.title, e.target.value)}
                />
              ))}
            </div>

            <div className="columns-section">
              <h2>Select Columns</h2>
              <div className="columns-grid">
                {columns.map((column) => (
                  <div key={column.id} className="column-checkbox">
                    <input
                      type="checkbox"
                      id={column.id}
                      defaultChecked={column.checked}
                    />
                    <label htmlFor={column.id}>{column.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="download-button">
            Download Report
          </button>
        </div>
      </main>
    </div>
  );
} 