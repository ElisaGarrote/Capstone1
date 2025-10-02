import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/more/asset-depreciation-mockup-data.json";
import RepairFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmatinModal from "../../components/Modals/DeleteModal";

const filterConfig = [
  {
    type: "searchable",
    name: "depreciation",
    label: "Depreciation",
    options: [
      { value: "1", label: "Laptop Depreciation" },
      { value: "2", label: "iPhone Depreciation" },
      { value: "3", label: "Tablet Depreciation" },
      { value: "4", label: "" },
      { value: "5", label: "" },
    ],
  },
  {
    type: "date",
    name: "duration",
    label: "Duration (in months)",
  },
];

// TableHeader
function TableHeader({ allSelected, onHeaderChange }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onHeaderChange}
        />
      </th>
      <th>NAME</th>
      <th>DURATION</th>
      <th> MINIMUM VALUE</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
function TableItem({ depreciation, isSelected, onRowChange, onDeleteClick }) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(depreciation.id, e.target.checked)}
        />
      </td>
      <td>{depreciation.name}</td>
      <td>{depreciation.duration}</td>
      <td>{depreciation.minimum_value}</td>
      <td>
        <ActionButtons
          showEdit
          showDelete
          editPath="DepreciationEdit"
          editState={{ depreciation }}
          onDeleteClick={() => onDeleteClick(depreciation.id)}
        />
      </td>
    </tr>
  );
}

export default function Depreciations() {
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = MockupData.slice(startIndex, endIndex);

  // selection
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected =
    paginatedActivity.length > 0 &&
    paginatedActivity.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedActivity.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedActivity.map((item) => item.id).includes(id))
      );
    }
  };

  const handleRowChange = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

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
    if (deleteTarget) {
      console.log("Deleting single id:", deleteTarget);
      // remove from mock data / API call
    } else {
      console.log("Deleting multiple ids:", selectedIds);
      // remove multiple
      setSelectedIds([]); // clear selection
    }
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
        <ConfirmatinModal
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
            <h1>Depreciations</h1>
          </section>

          <RepairFilter filters={filterConfig} />

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">Asset Depreciations ({MockupData.length})</h2>
              <section className="table-actions">
                {/* Bulk delete button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
                )}
                <input type="search" placeholder="Search..." className="search" />
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
                <MediumButtons
                  type="new"
                  navigatePage="/More/Depreciations/DepreciationRegistration"
                />
              </section>
            </section>

            {exportToggle && (
              <section className="export-button-section" ref={exportRef}>
                <button>Download as Excel</button>
                <button>Download as PDF</button>
                <button>Download as CSV</button>
              </section>
            )}

            <section className="table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedActivity.length > 0 ? (
                    paginatedActivity.map((depreciation) => (
                      <TableItem
                        key={depreciation.id}
                        depreciation={depreciation}
                        isSelected={selectedIds.includes(depreciation.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Depreciations Found.
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
                totalItems={MockupData.length}
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

