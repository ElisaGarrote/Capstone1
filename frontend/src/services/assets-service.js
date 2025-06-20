import dateRelated from "../utils/dateRelated";

const API_URL = "https://assets-service-production.up.railway.app/";
// const API_URL = "http://127.0.0.1:8003/";

class AssetsService {
  // Helper to normalize array responses
  normalizeResponseArray(data, key) {
    if (data && data[key]) return data;
    if (Array.isArray(data)) return { [key]: data };
    if (data && typeof data === "object") return { [key]: [data] };
    return { [key]: [] };
  }

  // PRODUCTS
  // Retrieve all products
  async fetchAllProducts() {
    try {
      const response = await fetch(API_URL + "products/");

      if (!response.ok) {
        console.warn(
          "Failed to fetch products, status:",
          response.status
        );
        return { products: [] };
      }

      const data = await response.json();
      console.log("Data for all products fetched:", data);

      return this.normalizeResponseArray(data, "products");
    } catch (error) {
      console.error("Error occurred while fetching all products:", error);
      return { products: [] };
    }
  }

  // Fetch product registration contexts
  async fetchProductContexts() {
    try {
      const response = await fetch(API_URL + "products/contexts/");

      if (!response.ok) {
        console.warn("Failed to fetch product contexts, status:", response.status);
        return { categories: [], depreciations: [] };
      }

      const data = await response.json();
      console.log("Data for contexts fetched:", data);

      // Return with defaults for missing properties
      return {
        categories: data.categories || [],
        depreciations: data.depreciations || [],
      };
    } catch (error) {
      console.error("Error occurred while fetching product contexts!", error);
      return { categories: [], depreciations: [] };
    }
  }

  // Retrieve a product by id
  async fetchProductById(id) {
    try {
      const response = await fetch(API_URL + `products/${id}/`);

      if (!response.ok) {
        console.warn("Failed to fetch product by ID, status:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Product data fetched:", data);

      // Return product object if wrapped, else data directly
      return data && data.product ? data.product : data;
    } catch (error) {
      console.error(`Error occurred while fetching product with ID ${id}:`, error);
      return null;
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
        console.warn("Failed to create product, status:", response.status);
        return false;
      }

      const data = await response.json();
      console.log("Data for creating product:", data);
      return data;
    } catch (error) {
      console.error("Error occurred while creating product!", error);
      return false;
    }
  }

  // Update Product
  async updateProduct(id, formData) {
    try {
      // Log formData entries for debugging
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch(API_URL + `products/${id}/update/`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        console.warn("Failed to update product, status:", response.status);
        return false;
      }

      const data = await response.json();
      console.log("Data for updating product:", data);
      return data;
    } catch (error) {
      console.error("Error occurred while updating product!", error);
      return false;
    }
  }

  // Get all product names to check for existing product before registration
  async fetchProductNames() {
    try {
      const response = await fetch(API_URL + "products/names/all/");

      if (!response.ok) {
        console.warn("Failed to fetch product names, status:", response.status);
        return { products: [] };
      }

      const data = await response.json();
      console.log("Product names fetched:", data);

      return this.normalizeResponseArray(data, "products");
    } catch (error) {
      console.error("Error occurred while fetching product names!", error);
      return { products: [] };
    }
  }

  // ASSETS
  // Fetch all assets
  async fetchAllAssets() {
    try {
      const response = await fetch(API_URL + "assets/");

      if (!response.ok) {
        console.warn("Failed to fetch all assets, status:", response.status);
        return { assets: [] };
      }

      const data = await response.json();
      // Normalize to always return { assets: [...] }
      return this.normalizeResponseArray(data, "assets");
    } catch (error) {
      console.error("Error occurred while fetching all assets!", error);
      return { assets: [] };
    }
  }

  // Fetch asset registration contexts, products and statuses
  async fetchAssetContexts() {
    try {
      const response = await fetch(API_URL + "assets/contexts/");

      if (!response.ok) {
        console.warn("Failed to fetch asset contexts, status:", response.status);
        return { products: [], statuses: [] };
      }

      const data = await response.json();
      console.log("Asset contexts fetched:", data);

      return {
        products: data.products || [],
        statuses: data.statuses || [],
      };
    } catch (error) {
      console.error("Error occurred while fetching asset contexts!", error);
      return { products: [], statuses: [] };
    }
  }

  // Retrieve an asset by id
  async fetchAssetById(id) {
    try {
      const response = await fetch(API_URL + `assets/${id}/`);

      if (!response.ok) {
        console.warn("Failed to fetch asset by ID, status:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Asset data fetched:", data);

      return data && data.asset ? data.asset : data;
    } catch (error) {
      console.error(`Error occurred while fetching asset with ID ${id}:`, error);
      return null;
    }
  }

  // Fetch product defaults by id
  async fetchProductDefaults(id) {
    try {
      const response = await fetch(API_URL + `assets/${id}/defaults/`);

      if (!response.ok) {
        console.warn("Failed to fetch product defaults, status:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Product defaults fetched:", data);

      return data && data.product ? data.product : data;
    } catch (error) {
      console.error(`Error occurred while fetching product defaults with ID ${id}:`, error);
      return null;
    }
  }

  // Get next asset ID
  async getNextAssetId() {
    try {
      const response = await fetch(API_URL + "assets/next-id/");

      if (!response.ok) {
        console.warn("Failed to get next asset ID, status:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Next asset ID data:", data);
      return data;
    } catch (error) {
      console.error("Error occurred while getting next asset ID!", error);
      return null;
    }
  }

  // Create Asset
  async createAsset(formData) {
    try {
      const response = await fetch(API_URL + "assets/registration/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.warn("Failed to create asset, status:", response.status);
        return false;
      }

      const data = await response.json();
      console.log("Data for creating asset:", data);
      return data;
    } catch (error) {
      console.error("Error occurred while creating asset!", error);
      return false;
    }
  }

  // Update Asset
  async updateAsset(id, formData) {
    try {
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(API_URL + `assets/${id}/update/`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        console.warn("Failed to update asset, status:", response.status);
        return false;
      }

      const data = await response.json();
      console.log("Data for updating asset:", data);
      return data;
    } catch (error) {
      console.error("Error occurred while updating asset!", error);
      return false;
    }
  }

  //ASSET CHECKOUTS
  // Create asset checkout record
  async createAssetCheckout(formData) {
    try {
      const response = await fetch(`${API_URL}assets/check-out/registration/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Create Asset Checkout Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating asset checkout:', error);
      throw error;
    }
  }

  // Create asset check-in record
  async createAssetCheckin(formData) {
    try {
      const response = await fetch(`${API_URL}assets/check-in/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Create Asset Check-In Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating asset check-in:', error);
      throw error;
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
    // console.log("service received nextAuditDate: ", nextAuditDate);
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
      // console.log("data:", data);
      return data;
    } catch (error) {
      console.error("Error occur while creating audit!", error);
    }
  }

  // Update audit
  async updateAudit(
    auditId,
    location,
    userId,
    notes,
    auditScheduleId,
    auditDate,
    nextAuditDate
  ) {
    try {
      const response = await fetch(API_URL + `audits/get/edit/${auditId}/`, {
        method: "PUT",
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

      if (!response.ok) {
        console.log(
          "The status of the response for updating audit is here.",
          response.status
        );
        return false;
      }

      return true;
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
          // console.log("File uploaded successfully:", data);
        } catch (error) {
          console.error("Error occur while creating audit files!", error);
        }
      });

      // console.log("All files uploaded successfully.");
      return true;
    } catch (error) {
      console.error("Error occur while creating audit file!", error);
    }
  }

  // Soft delete Audit files
  async softDeleteAuditFiles(auditId) {
    const response = await fetch(API_URL + `audits/file/${auditId}/delete/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.log(
        "The status of the response for soft deleting audit files is here.",
        response.status
      );
      return false;
    }

    return true;
  }

  // Create Schedule Audit
  async postScheduleAudit(assetId, date, notes) {
    // console.log("asset id passed", assetId);
    let isSuccess = false;

    // console.log("type of asset id", typeof assetId);

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
          // console.log("Successfully added schedule audit", data);
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
        // console.log("Successfully added schedule audit", data);
        return data;
      }
    } catch (error) {
      console.error("Error occur while creating schedule audit!", error);
      throw error;
    }
  }

  // Update Audit Schedule
  async updateAuditSchedule(id, assetId, date, notes) {
    try {
      const response = await fetch(
        API_URL + `audits/get/edit/schedule/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            asset: assetId,
            date,
            notes,
          }),
        }
      );

      if (!response.ok) {
        console.log(
          "The status of the response for updating audit schedule is here.",
          response.status
        );
        return false;
      }

      return true;
    } catch (error) {
      console.log("Error occur while updating audit schedules!", error);
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
      // console.log("Data for all audit fetched: ", data);

      // Sort data in descending order based on the audit_date.
      const sortedData = data.sort(
        (a, b) => new Date(b.audit_date) - new Date(a.audit_date)
      );

      return sortedData;
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
      // console.log("Data for all audit schedules fetched: ", data);

      // Sort data in ascending order based on the date.
      const sortedData = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      return sortedData;
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

  // Generate url for soft delete audit schedule.
  softDeleteAuditSchedEndpoint(id) {
    return API_URL + `audits/schedule/${id}/delete/`;
  }

  // Filter Assets for schedule and perform audit asset dropdown
  async filterAssetsForAudit() {
    const allAssets = await this.fetchAllAssets();
    const allAuditSchedule = await this.fetchAllAuditSchedules();

    // console.log("all assets service:", allAssets);
    // console.log("all audit schedules service:", allAuditSchedule);

    // Initialize filteredAssets
    let filteredAssets = [];

    // Filter Assets: Get all the assets that have not yet been scheduled or audited.
    if (allAuditSchedule.length > 0) {
      // Get only the fields of displayedId and asset name
      const assetAndName = allAuditSchedule.map((item) => ({
        displayedId: item.asset_info.displayed_id,
        name: item.asset_info.name,
      }));

      // console.log("asset and name service:", assetAndName);

      // Filter assets: Access the assets array from the response object
      filteredAssets = allAssets.assets
        .filter(
          (item) =>
            !assetAndName.some(
              (existing) => existing.displayedId === item.displayed_id
            )
        )
        .map((item) => ({
          value: item.id,
          label: item.displayed_id + " - " + item.name,
        }));

      // console.log("filtered asset:", filteredAssets);
    } else {
      // If no audit schedules exist, return all assets
      filteredAssets = allAssets.assets.map((item) => ({
        value: item.id,
        label: item.displayed_id + " - " + item.name,
      }));
    }

    return filteredAssets;
  }

  // COMPONENTS
  async fetchAllComponents() {
    try {
      const response = await fetch(API_URL + "components/");

      if (!response.ok) {
        console.warn("Failed to fetch components, status:", response.status);
        return null;
      }

      const data = await response.json();

      // Sort by name (A-Z), case-insensitive
      const sortedData = data.sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      return sortedData;

    } catch (error) {
      console.log("An error occurred while fetching all components!", error);
    }
  }

  async fetchComponentById(id) {
    try {
      const response = await fetch(`${API_URL}components/${id}/`);
      if (!response.ok) {
        console.warn(`Failed to fetch component with ID ${id}, status:`, response.status);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`An error occurred while fetching component with ID ${id}:`, error);
      return null;
    }
  }

  async createComponent(formData) {
    try {
      const response = await fetch(`${API_URL}components/registration/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Create Component Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  }

  async updateComponent(id, formData) {
    try {
      const response = await fetch(`${API_URL}components/${id}/update/`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Update Component Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating component with ID ${id}:`, error);
      throw error;
    }
  }
}

const assetsService = new AssetsService(); // Create object for Assets Service.

export default assetsService;
