// Supplier Details Data - Contains all hardcoded supplier information for DetailedViewPage
// This file maps supplier data to detailed view properties

/**
 * Get detailed supplier information for the DetailedViewPage
 * @param {Object} supplier - The base supplier object from MockupData
 * @returns {Object} - Complete supplier details object
 */
export const getSupplierDetails = (supplier) => {
  if (!supplier) return null;

  return {
    // Breadcrumb and Title
    breadcrumbRoot: "Suppliers",
    breadcrumbCurrent: "Show Supplier",
    breadcrumbRootPath: "/More/ViewSupplier",
    title: supplier.name,
    // Hide supplier ID subtitle to avoid exposing internal IDs in the UI
    subtitle: "",
    
    // Image (using default for suppliers)
    assetImage: null,
    
    // Supplier Information
    supplierName: supplier.name || "N/A",
    address: supplier.address || "N/A",
    city: supplier.city || "N/A",
    state: supplier.state || "N/A",
    zip: supplier.zip || "N/A",
    country: supplier.country || "N/A",
    
    // Contact Information
    contactName: supplier.contactName || "N/A",
    phoneNumber: supplier.phoneNumber || "N/A",
    email: supplier.email || "N/A",
    url: supplier.url || "N/A",
    
    // Additional Information
    notes: supplier.notes || supplier.note || "N/A",
    createdAt: supplier.createdAt || supplier.created_at || "N/A",
    updatedAt: supplier.updatedAt || supplier.updated_at || "N/A",
  };
};

/**
 * Get tabs configuration for Supplier DetailedViewPage
 * @returns {Array} - Array of tab objects
 */
export const getSupplierTabs = () => {
  return [
    { label: "About" },
    { label: "Assets" },
    { label: "Components" }
  ];
};

