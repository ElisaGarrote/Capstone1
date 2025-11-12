// Product Details Data - Contains all hardcoded product information for DetailedViewPage
// This file maps product data to detailed view properties

/**
 * Get detailed product information for the DetailedViewPage
 * @param {Object} product - The base product object from MockupData
 * @param {Object} manufacturer - The manufacturer object
 * @returns {Object} - Complete product details object
 */
export const getProductDetails = (product, manufacturer) => {
  if (!product) return null;

  return {
    // Breadcrumb and Title
    breadcrumbRoot: "Asset Models",
    breadcrumbCurrent: "Show Asset Model",
    breadcrumbRootPath: "/products",
    title: product.name,
    subtitle: `Model: ${product.model || "N/A"}`,
    
    // Image
    assetImage: product.image,
    
    // Product Information
    productName: product.name || "N/A",
    model: product.model || "N/A",
    modelNo: product.model || "N/A",
    category: product.category || "N/A",
    manufacturer: manufacturer?.name || "N/A",
    
    // Depreciation and End of Life
    depreciationType: product.depreciation || "N/A",
    endOfLife: product.end_of_life || "N/A",
    
    // Purchase Information
    purchaseCost: product.purchase_cost || "N/A",
    
    // Additional Information
    notes: product.description || "N/A",
    createdAt: product.created_at || "N/A",
    updatedAt: product.updated_at || "N/A",
  };
};

/**
 * Get tabs configuration for DetailedViewPage
 * @returns {Array} - Array of tab objects
 */
export const getProductTabs = () => {
  return [
    { label: "About" },
    { label: "Products" }
  ];
};

