import dateRelated from "../utils/dateRelated";

const API_URL = "http://127.0.0.1:8003/";

class AssetsService {
  // ASSETS
  // Retrieve all assets
  async fetchAllAssets() {
    try {
      const response = await fetch(API_URL + "all-asset/", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all assets is here.",
          response.status
        );
        return false;
      }

      const data = await response.json();
      console.log("Data for all assets fetched: ", data);
      return data;
    } catch (error) {
      console.log("Error occur while fetching all assets!", error);
    }
  }

  // PRODUCTS

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
        } catch {
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
}

const assetsService = new AssetsService(); // Create object for Assets Service.

export default assetsService;
