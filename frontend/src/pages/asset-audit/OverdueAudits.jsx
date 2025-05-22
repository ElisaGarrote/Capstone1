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
import dateRelated from "../../utils/dateRelated";

export default function OverdueAudits() {
  const location = useLocation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [overdueAuditsData, setOverdueAuditsData] = useState([]);

  // Retrieve the "isDeleteSuccessFromEdit" value passed from the navigation state.
  // If the "isDeleteSuccessFromEdit" is not exist, the default value for this is "undifiend".
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;
  const isUpdateFromEdit = location.state?.isUpdateFromEdit;

  // Handle current date
  useEffect(() => {
    setCurrentDate(dateRelated.getCurrentDate());
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

  // Retrieve all the overdue audits records.
  useEffect(() => {
    const fetchListOverdueAudits = async () => {
      const fetchedData = await assetsService.fetchAllOverdueAudits();

      setOverdueAuditsData(fetchedData);
    };

    fetchListOverdueAudits();
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
          ) : (
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
                {overdueAuditsData.length > 0 ? (
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
                      {overdueAuditsData.map((data, index) => {
                        // Calculate the day difference
                        const date1 = new Date(data.date).setHours(0, 0, 0, 0); // Normalize to midnight
                        const date2 = new Date(currentDate).setHours(
                          0,
                          0,
                          0,
                          0
                        ); // Normalize to midnight
                        const dayDifference =
                          (date2 - date1) / (1000 * 60 * 60 * 24); // Difference in days

                        return (
                          <tr key={index}>
                            <td>
                              <input type="checkbox" name="" id="" />
                            </td>
                            <td>{dateRelated.formatDate(data.date)}</td>
                            <td>
                              {dayDifference}{" "}
                              {dayDifference > 1 ? "days" : "day"}
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
                                data={data}
                                previousPage={location.pathname}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data-message">
                    No Overdue for an Audit Found.
                  </p>
                )}
              </section>
              <section></section>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
