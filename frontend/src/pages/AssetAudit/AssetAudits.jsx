import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import TableBtn from "../../components/buttons/TableButtons";
import Status from "../../components/Status";
import TabNavBar from "../../components/TabNavBar";
import dueAudit from "../../data/mockData/audits/due-audit-mockup-data.json";
import Footer from "../../components/Footer";
import DueAuditFilterModal from "../../components/Modals/DueAuditFilterModal";
import "../../styles/Table.css";
import "../../styles/AssetAudits/Audits.css";
import { exportToExcel } from "../../utils/exportToExcel";

function TableHeader() {
  return (
    <tr>
      <th>Due Date</th>
      <th>Asset</th>
      <th>Status</th>
      <th>Created At</th>
      <th>AUDIT</th>
      <th>ACTION</th>
    </tr>
  );
}

function TableItem({ item, onDeleteClick, onViewClick }) {
  return (
    <tr>
      <td>{item.date}</td>
      <td>{item.asset.displayed_id} - {item.asset.name}</td>
      <td>
        <Status type={item.status || "pending"} name={item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || "Pending"} />
      </td>
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
          editState={{ item, previousPage: "/audits" }}
          onDeleteClick={() => onDeleteClick(item.id)}
          onViewClick={onViewClick}
        />
      </td>
    </tr>
  );
}

export default function AssetAudits() {
  const data = dueAudit;

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setFilteredData(data);
  }, []);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = (filteredData && filteredData.length > 0 ? filteredData : data).slice(startIndex, endIndex);

  // delete modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const confirmDelete = () => {
    console.log("Deleting ID:", deleteId);
    closeDeleteModal();
  };

  // Add navigation for asset view page
  const navigate = useNavigate();

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...data];

    // Filter by Due Date
    if (filters.dueDate && filters.dueDate.trim() !== "") {
      filtered = filtered.filter((audit) => {
        const auditDate = new Date(audit.date);
        const filterDate = new Date(filters.dueDate);
        return auditDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by Asset
    if (filters.asset && filters.asset.trim() !== "") {
      filtered = filtered.filter((audit) =>
        audit.asset?.name?.toLowerCase().includes(filters.asset.toLowerCase())
      );
    }

    // Filter by Created
    if (filters.created && filters.created.trim() !== "") {
      filtered = filtered.filter((audit) => {
        const createdDate = new Date(audit.created_at);
        const filterDate = new Date(filters.created);
        return createdDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by Audit
    if (filters.audit && filters.audit.trim() !== "") {
      filtered = filtered.filter((audit) =>
        audit.notes?.toLowerCase().includes(filters.audit.toLowerCase())
      );
    }

    return filtered;
  };

  const applyFiltersAndSearch = (filters, searchTerm) => {
    let filtered = applyFilters(filters);

    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((audit) =>
        (audit.asset?.name && audit.asset.name.toLowerCase().includes(term)) ||
        (audit.asset?.displayed_id && audit.asset.displayed_id.toLowerCase().includes(term)) ||
        (audit.notes && audit.notes.toLowerCase().includes(term)) ||
        (audit.status && audit.status.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  // Handle filter apply
  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFiltersAndSearch(filters, searchTerm);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setAppliedFilters({});
    const filtered = applyFiltersAndSearch({}, searchTerm);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const baseData = data;
    const dataToExport = filteredData.length > 0 ? filteredData : baseData;
    exportToExcel(dataToExport, "Due_Audits.xlsx");
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    const filtered = applyFiltersAndSearch(appliedFilters, term);
    setFilteredData(filtered);
  };

  return (
    <>
      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}

      {/* Due Audit Filter Modal */}
      <DueAuditFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="audit-title-page-section">
            <h1>Asset Audits</h1>

            <div>
              <MediumButtons
                type="schedule-audits"
                navigatePage="/audits/schedule"
                previousPage="/audits"
              />
              <MediumButtons
                type="perform-audits"
                navigatePage="/audits/new"
                previousPage="/audits"
              />
            </div>
          </section>

          <section>
            <TabNavBar />
          </section>

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">Due to be Audited ({(filteredData && filteredData.length > 0 ? filteredData : data).length})</h2>
              <section className="table-actions">
                <input 
                  type="search" 
                  placeholder="Search..." 
                  className="search"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  Filter
                </button>
                <MediumButtons
                  type="export"
                  onClick={handleExport}
                />
              </section>
            </section>

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
                        onViewClick={() => navigate(`/assets/view/${item.asset.id}`)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="no-data-message">
                        No Due Audits Found.
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
        <Footer />
      </section>
    </>
  );
}