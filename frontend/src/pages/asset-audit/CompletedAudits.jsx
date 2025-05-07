import "../../styles/custom-colors.css";
import "../../styles/CompletedAudits.css";
import "../../styles/AuditTablesGlobal.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import Status from "../../components/Status";
import { data, useLocation } from "react-router-dom";
import TabNavBar from "../../components/TabNavBar";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import { useState, useEffect } from "react";
import ExportModal from "../../components/Modals/ExportModal";
import assetsService from "../../services/assets-service";

export default function CompletedAudits() {
  const location = useLocation();
  let assetId = 123880;
  let assetName = "Microsoft Surface Pro 11";
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // Retrieve all the audit data.
  useEffect(() => {
    const fetchAllAudit = async () => {
      const dataResponse = await assetsService.fetchAllAudits();

      if (dataResponse) {
        setAuditData(dataResponse);
      }
    };

    fetchAllAudit();
  }, []);

  // Set the isLoading state to true
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

      {isExportModalOpen && (
        <ExportModal closeModal={() => setExportModalOpen(false)} />
      )}

      <nav>
        <NavBar />
      </nav>
      <main className="completed-audits-page">
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
          ) : auditData.length > 0 ? (
            <section className="container">
              <section className="top">
                <h2>Completed Audits</h2>
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
                      <th>AUDIT DATE</th>
                      <th>ASSET</th>
                      <th>STATUS</th>
                      <th>LOCATION</th>
                      <th>PERFORM BY</th>
                      <th>DELETE</th>
                      <th>VIEW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <input type="checkbox" name="" id="" />
                          </td>
                          <td>{data.audit_date}</td>
                          <td>
                            {data.audit_schedule_info.asset_info.displayed_id} -{" "}
                            {data.audit_schedule_info.asset_info.name}
                          </td>
                          <td>
                            <Status type="undeployable" name="Being Repaired" />
                          </td>
                          <td>{data.location}</td>
                          <td>Pia Piatos-Lim</td>
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
