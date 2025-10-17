import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import PageFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import TableBtn from "../../components/buttons/TableButtons";
import TabNavBar from "../../components/TabNavBar";
import "../../styles/Audits.css";
import scheduledAudit from "../../data/mockData/audits/scheduled-audit-mockup-data.json";


const filterConfig = [
  {
    type: "searchable",
    name: "asset",
    label: "Asset",
    options: [
      { value: "1", label: "Lenovo" },
      { value: "2", label: "Apple" },
      { value: "3", label: "Samsung" },
      { value: "4", label: "Microsoft" },
      { value: "5", label: "HP" },
    ],
  },
];

// TableHeader
function TableHeader() {
  return (
    <tr>
      <th>DUE DATE</th>
      <th>ASSET</th>
      <th>CREATED</th>
      <th>AUDIT</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
function TableItem({ item, onDeleteClick, onViewClick, navigate }) {
  return (
    <tr>
      <td>{item.date}</td>
      <td>{item.asset.displayed_id} - {item.asset.name}</td>
      <td>{new Date(item.created_at).toLocaleDateString()}</td>
      <td>
        <TableBtn
          type="audit"
          navigatePage="/audits/new"
          data={item}
          previousPage={location.pathname}
        />
      </td>
      <td>
        <ActionButtons
          showEdit
          showDelete
          showView
          editPath={`edit/${item.id}`}
          editState={{ item }}
          onDeleteClick={() => onDeleteClick(item.id)}
          onViewClick={onViewClick}
        />
      </td>
    </tr>
  );
}

export default function ScheduledAudits() {
  const navigate = useNavigate();
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  const data = scheduledAudit;

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = data.slice(startIndex, endIndex);

  // delete modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, id = single

  const openDeleteModal = (id = null) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    closeDeleteModal();
  };

  // outside click for export toggle
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportToggle &&
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setExportToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportToggle]);

  return (
    <>
      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          <section className="title-page-section">
            <h1>Asset Audits</h1>

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

          <section>
            <TabNavBar />
          </section>

          <PageFilter filters={filterConfig} />

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">Scheduled Audits ({data.length})</h2>
              <section className="table-actions">
                <input type="search" placeholder="Search..." className="search" />
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
              </section>
            </section>

            {exportToggle && (
              <section className="export-button-section" ref={exportRef}>
                <button>Download as Excel</button>
                <button>Download as PDF</button>
                <button>Download as CSV</button>
              </section>
            )}

            <section className="audit-table-section">
              <table>
                <thead>
                  <TableHeader />
                </thead>
                <tbody>
                  {paginatedActivity.length > 0 ? (
                    paginatedActivity.map((item) => (
                      <TableItem
                        key={item.id}
                        item={item}
                        onDeleteClick={openDeleteModal}
                        onViewClick={() => navigate(`/components/view/${item.id}`)}
                        navigate={navigate}
                        location={location}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Scheduled Audits Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={data.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </section>
        </main>
      </section>
    </>
  );
}
