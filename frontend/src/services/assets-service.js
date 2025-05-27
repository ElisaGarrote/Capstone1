import dateRelated from "../utils/dateRelated";

const API_URL = "https://assets-service-production.up.railway.app/";

class AssetsService {
  // PRODUCTS
  // Retrieve all products
  async fetchAllProducts() {
    try {
      const response = await fetch(API_URL + "products/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all products is here.",
          response.status
        );
        return { products: [] };  // Return consistent structure
      }

      const data = await response.json();
      console.log("Data for all products fetched: ", data);
      
      // Ensure we always return an object with products property
      if (data && data.products) {
        return data; // Already in correct format
      } else if (Array.isArray(data)) {
        return { products: data }; // Convert array to object with property
      } else if (data && typeof data === 'object') {
        return { products: [data] }; // Single object to array in property
      } else {
        return { products: [] }; // Default empty result
      }
    } catch (error) {
      console.log("Error occur while fetching all products!", error);
      return { products: [] };  // Return consistent structure
    }
  }

  // Fetch product registration contexts
  async fetchProductContexts() {
    try {
      const response = await fetch(API_URL + "products/contexts/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching product contexts is here.",
          response.status
        );
        return { 
          categories: [],
          depreciations: []
        };
      }

      const data = await response.json();
      console.log("Product contexts fetched: ", data);
      
      // Return the data with default empty arrays for any missing properties
      return {
        categories: data.categories || [],
        depreciations: data.depreciations || []
      };
    } catch (error) {
      console.log("Error occurred while fetching product contexts!", error);
      return { 
        categories: [],
        depreciations: []
      };
    }
  }

  // Retrieve a product by id
  async fetchProductById(id) {
    try {
      const response = await fetch(API_URL + `products/${id}/`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching product by ID is here.",
          response.status
        );
        return null;  // Return null for not found
      }

      const data = await response.json();
      console.log("Product data fetched: ", data);
      
      // Return the product data
      if (data && data.product) {
        return data.product; // Return the product object if it's wrapped
      } else {
        return data; // Return the data directly if it's not wrapped
      }
    } catch (error) {
      console.log(`Error occurred while fetching product with ID ${id}:`, error);
      return null;  // Return null on error
    }
  }

  // Create Product
  async createProduct(formData) {
    try {
      const response = await fetch(API_URL + "products/registration/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.log(
          "The status of the response for creating product is here.",
          response.status
        );
        return false;
      }

      const data = await response.json();
      console.log("Data for creating product: ", data);
      return data;
    } catch (error) {
      console.log("Error occur while creating product!", error);
    }
  }

  // Update Product
  async updateProduct(id, formData) {
    try {
      // Log the form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await fetch(API_URL + `products/${id}/update/`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        console.log(
          "The status of the response for updating product is here.",
          response.status
        );
        return false;
      }

      const data = await response.json();
      console.log("Data for updating product: ", data);
      return data;
    } catch (error) {
      console.log("Error occurred while updating product!", error);
      return false;
    }
  }

  // Get all product names to check for existing product before registration
  async fetchProductNames() {
    try {
      const response = await fetch(API_URL + "products/names/all/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching product names is here.",
          response.status
        );
        return { products: [] };  // Return consistent structure
      }

      const data = await response.json();
      console.log("Product names fetched: ", data);
      
      // Ensure we always return an object with products property
      if (data && data.products) {
        return data; // Already in correct format
      } else if (Array.isArray(data)) {
        return { products: data }; // Convert array to object with property
      } else if (data && typeof data === 'object') {
        return { products: [data] }; // Single object to array in property
      } else {
        return { products: [] }; // Default empty result
      }
    } catch (error) {
      console.log("Error occurred while fetching product names!", error);
      return { products: [] };  // Return consistent structure
    }
  }

  // ASSETS
  // Retrieve all assets
  async fetchAllAssets() {
    try {
      const response = await fetch(API_URL + "assets/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all assets is here.",
          response.status
        );
        return { assets: [] };
      }

      const data = await response.json();
      console.log("Data for all assets fetched: ", data);
      
      // Ensure we always return an object with assets property
      if (data && data.assets) {
        return data; // Already in correct format
      } else if (Array.isArray(data)) {
        return { assets: data }; // Convert array to object with property
      } else if (data && typeof data === 'object') {
        return { assets: [data] }; // Single object to array in property
      } else {
        return { assets: [] }; // Default empty result
      }
    } catch (error) {
      console.log("Error occur while fetching all assets!", error);
      return { assets: [] };  // Return consistent structure
    }
  }

  // Fetch asset registration contexts, products and statuses
  async fetchAssetContexts() {
    try {
      const response = await fetch(API_URL + "assets/contexts/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching asset contexts is here.",
          response.status
        );
        return { 
          products: [],
          statuses: []
        };
      }

      const data = await response.json();
      console.log("Asset contexts fetched: ", data);
      
      // Return the data with default empty arrays for any missing properties
      return {
        products: data.products || [],
        statuses: data.statuses || [] // Fix the typo here - it was "statues" instead of "statuses"
      };
    } catch (error) {
      console.log("Error occurred while fetching asset contexts!", error);
      return { 
        products: [],
        statuses: []
      };
    }
  }

  // Retrieve an asset by id
  async fetchAssetById(id) {
    try {
      const response = await fetch(API_URL + `assets/${id}/`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching asset by ID is here.",
          response.status
        );
        return null;  // Return null for not found
      }

      const data = await response.json();
      console.log("Asset data fetched: ", data);
      
      // Return the asset data
      if (data && data.asset) {
        return data.asset; // Return the asset object if it's wrapped
      } else {
        return data; // Return the data directly if it's not wrapped
      }
    } catch (error) {
      console.log(`Error occurred while fetching asset with ID ${id}:`, error);
      return null;  // Return null on error
    }
  }

  // Get next asset ID (for display purposes only) (not yet working)
  async getNextAssetId() {
    try {
      const response = await fetch(API_URL + "assets/next-id/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log("Error fetching next asset ID:", response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error fetching next asset ID:", error);
      return null;
    }
  }

  // AUDITS
  // Create Audit
  async postAudit(
    location,
    userId,
    notes,
    auditScheduleId,
    auditDate,
    nextAuditDate
  ) {
    console.log("service received nextAuditDate: ", nextAuditDate);
    try {
      const response = await fetch(API_URL + "audits/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          location: location,
          user_id: userId,
          notes: notes,
          audit_schedule: auditScheduleId,
          audit_date: auditDate,
          next_audit_date: nextAuditDate,
        }),
      });

      if (response.status !== 201) {
        // Attempt to parse and log the response body for details
        const errorDetails = await response.json();
        console.log("Failed creating audit. Status:", response.status);
        console.log("Error details:", errorDetails);
        return false;
      }

      const data = await response.json();
      console.log("data:", data);
      return data;
    } catch (error) {
      console.error("Error occur while creating audit!", error);
    }
  }

  // Create Audit Files
  async postAuditFiles(auditId, files) {
    try {
      Array.from(files).forEach(async (file) => {
        const formData = new FormData();
        formData.append("audit", auditId);
        formData.append("file", file);

        try {
          const response = await fetch(API_URL + "audits/add/files/", {
            method: "POST",
            body: formData,
          });

          if (response.status !== 201) {
            const errorDetails = await response.json();
            console.log("Failed creating audit file. Status:", response.status);
            console.log("Error details:", errorDetails);
            return false;
          }

          const data = await response.json();
          console.log("File uploaded successfully:", data);
        } catch (error) {
          console.error("Error occur while creating audit files!", error);
        }
      });

      console.log("All files uploaded successfully.");
      return true;
    } catch (error) {
      console.error("Error occur while creating audit file!", error);
    }
  }

  // Create Schedule Audit
  async postScheduleAudit(assetId, date, notes) {
    console.log("asset id passed", assetId);
    let isSuccess = false;

    console.log("type of asset id", typeof assetId);

    try {
      /*
       - Execute the if statement if the data type of the assetId is an object
       which indciate this assetId is from the multiple selection asset.
       - Otherwise, execute the else statement which indicate this assetId is 
       from the single selection asset.
       */
      if (typeof assetId === "object") {
        for (const item of assetId) {
          const response = await fetch(API_URL + "audits/create-schedule/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              asset: item.value,
              date,
              notes,
            }),
          });

          if (response.status !== 201) {
            console.log("failed creating schedule audit.");
            continue;
          }

          const data = await response.json();
          console.log("Successfully added schedule audit", data);
          isSuccess = true; // Set isSuccess to true if any of the loop successfully created new record.
        }

        return isSuccess;
      } else {
        const response = await fetch(API_URL + "audits/create-schedule/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            asset: assetId,
            date,
            notes,
          }),
        });

        if (response.status !== 201) {
          console.log("failed creating schedule audit.");
          return false;
        }

        const data = await response.json();
        console.log("Successfully added schedule audit", data);
        return data;
      }
    } catch (error) {
      console.error("Error occur while creating schedule audit!", error);
      throw error;
    }
  }

  // Retrieve all audit records
  async fetchAllAudits() {
    try {
      const response = await fetch(API_URL + "audits/all/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all audits is here.",
          response.status
        );
        return false;
      }

      const data = await response.json();
      console.log("Data for all audit fetched: ", data);
      return data;
    } catch (error) {
      console.log("Error occur while fetching all audit schedules!", error);
    }
  }

  // Retrieve all audit schedules
  async fetchAllAuditSchedules() {
    try {
      const response = await fetch(API_URL + "audits/all/schedules/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all audit schedules is here.",
          response.status
        );
        return false;
      }

      const data = await response.json();
      console.log("Data for all audit schedules fetched: ", data);
      return data;
    } catch (error) {
      console.log("Error occur while fetching all audit schedules!", error);
    }
  }

  // Retrieve all overdue for audits
  async fetchAllOverdueAudits() {
    const fetchAllScheduleAudits = await this.fetchAllAuditSchedules();
    const currentDate = dateRelated.getCurrentDate();

    // Filter the fetched data to get only the overdue audits.
    const filteredData = fetchAllScheduleAudits.filter((item) => {
      return item.date < currentDate;
    });

    return filteredData;
  }

  // Count all the overdue for audits
  async countAllOverdueAudits() {
    const numOfOverdueAudits = await this.fetchAllOverdueAudits();
    return numOfOverdueAudits.length;
  }

  // Count all the schedule audits
  async countAllScheduleAudits() {
    const numOfScheduleAudits = await this.fetchAllAuditSchedules();
    return numOfScheduleAudits.length;
  }

  // Count all the audits
  async countAllAudits() {
    const numOfAudits = await this.fetchAllAudits();
    return numOfAudits.length;
  }

  // Generate url for audit files.
  auditFileUrl(file) {
    return API_URL + file;
  }

  // Filtered Assets for schedule and perform audit
  async filterAssetsForAudit() {
    const allAssets = await this.fetchAllAssets();
    const allAuditSchedule = await this.fetchAllAuditSchedules();

    console.log("all assets:", allAssets);
    console.log("all audit schedules:", allAuditSchedule);
  }
}

const assetsService = new AssetsService(); // Create object for Assets Service.

export default assetsService;
