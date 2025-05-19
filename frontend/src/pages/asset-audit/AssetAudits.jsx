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
import { formatDate } from "../../utils/dateFormatter";

export default function AssetAudits() {
  let notes = "sdfsdfsdfdfdfdfdfdfdfsdfsdfsdf";
  let assetId = 100019;
  let assetName = 'Macbook Pro 16"';
  const location = useLocation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [isNewAuditAdded, setNewAuditAdded] = useState(false);
  const [isAddScheduleAuditSuccess, setAddScheduleAuditSuccess] =
    useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [scheduleAuditData, setScheduleAuditData] = useState([]);
  const [isLoading, setLoading] = useState(true);

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
      setScheduleAuditData(fetchedData);
    };

    fetchAllScheduleAudits();
  }, []);

  // Set the isLoading state to false
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  // For debugging only.
  console.table(scheduleAuditData);

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
                          <td>{formatDate(data.date)}</td>
                          <td>
                            {data.asset_info.displayed_id} -{" "}
                            {data.asset_info.name}
                          </td>
                          <td>
                            <Status type="deployable" name="Ready to Deploy" />
                          </td>
                          <td>December 30, 2025</td>
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
                              data={data}
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
            "No records available."
          )}
        </section>
      </main>
    </>
  );
}
