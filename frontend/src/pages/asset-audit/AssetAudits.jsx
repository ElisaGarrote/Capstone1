import "../../styles/custom-colors.css";
import "../../styles/AssetAudits.css";
import "../../styles/AuditTablesGlobal.css";
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
import dateRelated from "../../utils/dateRelated";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";

export default function AssetAudits() {
  const location = useLocation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [isNewAuditAdded, setNewAuditAdded] = useState(false);
  const [isAddScheduleAuditSuccess, setAddScheduleAuditSuccess] =
    useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [scheduleAuditData, setScheduleAuditData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [endPoint, setEndPoint] = useState(null);

  // Retrieve the "isDeleteSuccessFromEdit" value passed from the navigation state.
  // If the "isDeleteSuccessFromEdit" is not exist, the default value for this is "undifiend".
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;
  const isUpdateFromEdit = location.state?.isUpdateFromEdit;
  const addedNewAudit = location.state?.addedNewAudit;
  const addedScheduleAudit = location.state?.addedScheduleAudit;

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

  useEffect(() => {
    if (addedNewAudit == true) {
      setNewAuditAdded(true);
      setTimeout(() => {
        setNewAuditAdded(false);
      }, 5000);
    }
  }, [addedNewAudit]);

  useEffect(() => {
    if (addedScheduleAudit == true) {
      setAddScheduleAuditSuccess(true);
      setTimeout(() => {
        setAddScheduleAuditSuccess(false);
      }, 5000);
    }
  }, [addedScheduleAudit]);

  // Retrieve all the schedule audits records.
  useEffect(() => {
    const fetchAllScheduleAudits = async () => {
      const fetchedData = await assetsService.fetchAllAuditSchedules();
      setScheduleAuditData(Array.from(fetchedData));
      setLoading(false);
    };

    fetchAllScheduleAudits();
  }, []);

  // For debugging only.
  // console.log(scheduleAuditData);
  // console.log("schedule audits:", scheduleAuditData);

  return (
    <>
      {/* Handle the delete modal.
      Open this model if the isDeleteModalOpen state is true */}
      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            // Refresh the data
            const refreshData = await assetsService.fetchAllAuditSchedules();
            setScheduleAuditData(Array.from(refreshData));

            setDeleteSucess(true);

            setTimeout(() => {
              setDeleteSucess(false);
            }, 5000);
          }}
          onDeleteFail={() => {
            setDeleteFailed(true);

            setTimeout(() => {
              setDeleteFailed(false);
            }, 5000);
          }}
        />
      )}

      {/* Handle the display of the success alert.
       Display this if the isDeleteSuccess state is true */}
      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}

      {deleteFailed && <Alert message="Deletion failed!" type="danger" />}

      {isUpdated && <Alert message="Update Successfully!" type="success" />}

      {isNewAuditAdded && <Alert message="New audit added!" type="success" />}

      {isAddScheduleAuditSuccess && (
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
          <h1>Asset Audit</h1>
          <div>
            <MediumButtons
              type="schedule-audits"
              navigatePage="/audits/schedule"
              previousPage={location.pathname}
            />
            <MediumButtons
              type="perform-audits"
              navigatePage="/audits/new"
              previousPage={location.pathname}
            />
          </div>
        </section>
        <section className="main-middle">
          <section>
            <TabNavBar />
          </section>
          <section className="container">
            <section className="top">
              <h2>Due to be Audited</h2>
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
              {/* Render loading skeleton while waiting to the response from the API request*/}
              {isLoading && <SkeletonLoadingTable />}

              {/* Render message if the scheduleAuditData is empty */}
              {!isLoading && scheduleAuditData.length == 0 && (
                <p className="table-message">No asset audits found.</p>
              )}

              {/* Render table if scheduleAuditData is not empty */}
              {scheduleAuditData.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" name="" id="" />
                      </th>
                      <th>DUE DATE</th>
                      <th>ASSET</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>AUDIT</th>
                      <th>EDIT</th>
                      <th>DELETE</th>
                      <th>VIEW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleAuditData.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <input type="checkbox" name="" id="" />
                          </td>
                          <td>{dateRelated.formatDate(data.date)}</td>
                          <td>
                            {data.asset_info.displayed_id} -{" "}
                            {data.asset_info.name}
                          </td>
                          <td>
                            <Status
                              type={data.asset_info.status_info.type}
                              name={data.asset_info.status_info.name}
                            />
                          </td>
                          <td>{dateRelated.formatDate(data.created_at)}</td>
                          <td>
                            <TableBtn
                              type="audit"
                              navigatePage="/audits/new"
                              data={data}
                              previousPage={location.pathname}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="edit"
                              navigatePage={"/audits/edit"}
                              data={data}
                              previousPage={location.pathname}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="delete"
                              isDisabled={
                                data.audit_info == null ? false : true
                              }
                              showModal={() => {
                                setEndPoint(
                                  assetsService.softDeleteAuditSchedEndpoint(
                                    data.id
                                  )
                                );
                                setDeleteModalOpen(true);
                              }}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="view"
                              navigatePage="/audits/view"
                              data={data}
                              previousPage={location.pathname}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
            <section></section>
          </section>
        </section>
      </main>
    </>
  );
}
