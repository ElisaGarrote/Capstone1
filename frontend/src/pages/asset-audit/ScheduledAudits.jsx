import "../../styles/custom-colors.css";
import "../../styles/AssetAudits.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import Status from "../../components/Status";
import { useLocation } from "react-router-dom";
import TabNavBar from "../../components/TabNavBar";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import { useState, useEffect } from "react";
import ExportModal from "../../components/Modals/ExportModal";
import assetsService from "../../services/assets-service";

export default function ScheduledAudits() {
  const location = useLocation();
  let notes = "sdfsdfsdfdfdfdfdfdfdfsdfsdfsdf";
  let assetId = 100897;
  let assetName = "Lenovo ThinkPad X1";
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [isScheduleAuditAdded, setScheduleAuditAdded] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [scheduleAuditData, setScheduleAuditData] = useState([]);
  const [assetsData, setAssetsData] = useState([]);
  const [addedScheduleAudit, setAddedScheduleAudit] = useState(
    location.state?.addedScheduleAudit
  );
  const [isLoading, setLoading] = useState(true);

  // Retrieve the "isDeleteSuccessFromEdit" value passed from the navigation state.
  // If the "isDeleteSuccessFromEdit" is not exist, the default value for this is "undifiend".
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;
  const isUpdateFromEdit = location.state?.isUpdateFromEdit;
  // const addedScheduleAudit = location.state?.addedScheduleAudit;

  console.log("is update from audit: ", isUpdateFromEdit);

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

  // Set the value for scheduleAuditAdded state.
  useEffect(() => {
    if (addedScheduleAudit == true) {
      setAddedScheduleAudit(false);
      setScheduleAuditAdded(true);
      setTimeout(() => {
        setScheduleAuditAdded(false);
      }, 5000);
    }
  }, [addedScheduleAudit]);

  // Retrieve all the schedule audits records.
  useEffect(() => {
    const fetchAllScheduleAudits = async () => {
      const fetchedData = await assetsService.fetchAllAuditSchedules();

      setScheduleAuditData(fetchedData);
    };

    fetchAllScheduleAudits();
  }, []);

  // Retrieve all the assets records.
  useEffect(() => {
    const fetchAllAssets = async () => {
      const fetchedData = await assetsService.fetchAllAssets();

      setAssetsData(fetchedData);
    };

    fetchAllAssets();
  }, []);

  // Set the isLoading state to false
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  console.table(scheduleAuditData);
  console.table(assetsData);

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

      {isScheduleAuditAdded && (
        <Alert message="New schedule audit added!" type="success" />
      )}

      {isExportModalOpen && (
        <ExportModal closeModal={() => setExportModalOpen(false)} />
      )}

      <nav>
        <NavBar />
      </nav>
      <main className="asset-audits-page">
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
          ) : (
            <section className="container">
              <section className="top">
                <h2>Scheduled Audits</h2>
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
                      <th>ASSET</th>
                      <th>STATUS</th>
                      <th className={notes == null ? "blank" : ""}>NOTES</th>
                      <th>CREATED</th>
                      <th>EDIT</th>
                      <th>DELETE</th>
                      <th>VIEW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleAuditData.length > 0 ? (
                      scheduleAuditData.map((data, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              <input type="checkbox" name="" id="" />
                            </td>
                            <td>{data.date}</td>
                            <td>
                              {data.asset_info.displayed_id} -{" "}
                              {data.asset_info.name}
                            </td>
                            <td>
                              <Status
                                type="deployed"
                                name="Deployed"
                                location="Makati"
                              />
                            </td>
                            <td className={data.notes == null ? "blank" : ""}>
                              {data.notes === null || data.notes == ""
                                ? "-"
                                : data.notes}
                            </td>
                            <td>December 31, 2025</td>
                            <td>
                              <TableBtn
                                type="edit"
                                navigatePage={"/audits/edit"}
                                id={`${assetId} - ${assetName}`}
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
                                id={`${assetId} - ${assetName}`}
                                previousPage={location.pathname}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <p>No records found!</p>
                    )}
                  </tbody>
                </table>
              </section>
              <section></section>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
