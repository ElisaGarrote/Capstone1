import "../../styles/custom-colors.css";
import "../../styles/OverdueAudits.css";
import "../../styles/AuditTablesGlobal.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import Status from "../../components/Status";
import TabNavBar from "../../components/TabNavBar";
import { useLocation } from "react-router-dom";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import { useState, useEffect } from "react";
import ExportModal from "../../components/Modals/ExportModal";
import assetsService from "../../services/assets-service";
import { formatDate } from "../../utils/dateFormatter";

export default function OverdueAudits() {
  let notes = null;
  let assetId = 100028;
  let assetName = 'Macbook Pro 14"';
  const location = useLocation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [scheduleAuditData, setScheduleAuditData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  // Retrieve the "isDeleteSuccessFromEdit" value passed from the navigation state.
  // If the "isDeleteSuccessFromEdit" is not exist, the default value for this is "undifiend".
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;
  const isUpdateFromEdit = location.state?.isUpdateFromEdit;

  // Handle current date
  useEffect(() => {
    const today = new Date();
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options); // "en-CA" ensures YYYY-MM-DD format
    const formattedDate = formatter.format(today); // Format date in Philippines timezone
    setCurrentDate(formattedDate);
  }, []);

  // Set the setDeleteSuccess state to true when the isDeleteSuccessFromEdit is true.
  // And reset the setDeleteSucces state to false after 5 seconds.
  useEffect(() => {
    if (isDeleteSuccessFromEdit == true) {
      setDeleteSucess(true);
      setTimeout(() => {
        setDeleteSucess(false);
      }, 5000);
    }
  }, [isDeleteSuccessFromEdit]); // This will be executed every time the isDeleteSucessFromEdit changes.

  useEffect(() => {
    if (isUpdateFromEdit == true) {
      setUpdated(true);
      setTimeout(() => {
        setUpdated(false);
      }, 5000);
    }
  }, [isUpdateFromEdit]);

  // Retrieve all the schedule audits records.
  useEffect(() => {
    const fetchAllScheduleAudits = async () => {
      const fetchedData = await assetsService.fetchAllAuditSchedules();

      console.log("fetched:", fetchedData);

      setScheduleAuditData(fetchedData);
    };

    fetchAllScheduleAudits();
  }, []);

  useEffect(() => {
    if (scheduleAuditData.length > 0) {
      const filteredData = scheduleAuditData.filter((item) => {
        return item.date < currentDate;
      });

      setScheduleAuditData(filteredData);
    }
  }, []);

  // Set the isLoading state to false
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  return (
    <>
      {/* Handle the delete modal.
      Open this model if the isDeleteModalOpen state is true */}
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={() => {
            setDeleteSucess(true);
            setTimeout(() => {
              setDeleteSucess(false);
            }, 5000);
          }}
        />
      )}

      {/* Handle the display of the success alert.
       Display this if the isDeleteSuccess state is true */}
      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}

      {isUpdated && <Alert message="Update Successfully!" type="success" />}

      {isExportModalOpen && (
        <ExportModal closeModal={() => setExportModalOpen(false)} />
      )}

      <nav>
        <NavBar />
      </nav>
      <main className="overdue-audits-page">
        <section className="main-top">
          <h1>Asset Audits</h1>
          <div>
            <MediumButtons
              type="schedule-audits"
              navigatePage="/audits/schedule"
            />
            <MediumButtons type="perform-audits" navigatePage="/audits/new" />
          </div>
        </section>
        <section className="main-middle">
          <section>
            <TabNavBar />
          </section>
          {isLoading ? (
            "Loading..."
          ) : scheduleAuditData.length > 0 ? (
            <section className="container">
              <section className="top">
                <h2>Overdue for an Audits</h2>
                <div>
                  <form action="" method="post">
                    <input type="text" placeholder="Search..." />
                  </form>
                  <MediumButtons
                    type="export"
                    deleteModalOpen={() => setExportModalOpen(true)}
                  />
                </div>
              </section>
              <section className="middle">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" name="" id="" />
                      </th>
                      <th>DUE DATE</th>
                      <th>OVERDUE BY</th>
                      <th>ASSET</th>
                      <th>STATUS</th>
                      <th>AUDIT</th>
                      <th>EDIT</th>
                      <th>DELETE</th>
                      <th>VIEW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleAuditData.map((data, index) => {
                      // Calculate the day difference
                      const date1 = new Date(data.date).setHours(0, 0, 0, 0); // Normalize to midnight
                      const date2 = new Date(currentDate).setHours(0, 0, 0, 0); // Normalize to midnight
                      const dayDifference =
                        (date2 - date1) / (1000 * 60 * 60 * 24); // Difference in days

                      return (
                        <tr key={index}>
                          <td>
                            <input type="checkbox" name="" id="" />
                          </td>
                          <td>{formatDate(data.date)}</td>
                          <td>
                            {dayDifference} {dayDifference > 1 ? "days" : "day"}
                          </td>
                          <td>
                            {data.asset_info.displayed_id} -{" "}
                            {data.asset_info.name}
                          </td>
                          <td>
                            <Status
                              type="deployed"
                              name="Deployed"
                              personName="Mary Grace Piattos"
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="audit"
                              navigatePage="/audits/new"
                              previousPage={location.pathname}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="edit"
                              navigatePage={"/audits/edit"}
                              previousPage={location.pathname}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="delete"
                              showModal={() => {
                                setDeleteModalOpen(true);
                                setSelectedRowId(assetId);
                              }}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="view"
                              navigatePage="/audits/view"
                              previousPage={location.pathname}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
              <section></section>
            </section>
          ) : (
            "No Overdue for an Audit Found."
          )}
        </section>
      </main>
    </>
  );
}
