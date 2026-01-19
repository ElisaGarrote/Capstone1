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
    // Do not show numeric ID in header; keep subtitle empty for now
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
    // Support common timestamp keys returned by various backends
    createdAt:
      supplier.createdAt ||
      supplier.created_at ||
      supplier.created ||
      supplier.created_on ||
      supplier.creation_date ||
      null,
    updatedAt:
      supplier.updatedAt ||
      supplier.updated_at ||
      supplier.updated ||
      supplier.modified ||
      supplier.modified_on ||
      supplier.update_date ||
      null,
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

