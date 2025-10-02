import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/repairs/asset-repair-mockup-data.json";
import BinFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";

const filterConfig = [
  {
    type: "searchable",
    name: "category",
    label: "Cataegory",
    options: [
      { value: "1", label: "Laptops" },
      { value: "2", label: "Mobile Phones" },
      { value: "3", label: "Tablets" },
      { value: "4", label: "Desktops" },
      { value: "5", label: "Monitors" },
    ],
  },
  {
    type: "searchable",
    name: "manufacturer",
    label: "Manufacturer",
    options: [
      { value: "1", label: "Lenovo" },
      { value: "2", label: "Apple" },
      { value: "3", label: "Samsung" },
      { value: "4", label: "Microsoft" },
      { value: "5", label: "HP" },
    ],
  },
  {
    type: "searchable",
    name: "supplier",
    label: "Supplier",
    options: [
      { value: "1", label: "Amazon" },
      { value: "2", label: "WSI" },
      { value: "3", label: "Iontech Inc." },
      { value: "4", label: "Noventiq" },
    ],
  },
  {
    type: "searchable",
    name: "location",
    label: "Location",
    options: [
      { value: "1", label: "Makati" },
      { value: "2", label: "Pasig" },
      { value: "3", label: "Marikina" },
      { value: "4", label: "Quezon City" },
      { value: "5", label: "Remote" },
    ],
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
      <th>CATEGORY</th>
      <th>MANUFACTURER</th>
      <th>SUPPLIER</th>
      <th>LOCATION</th>
      <th>RECOVER</th>
      <th>DELETE</th>
    </tr>
  );
}

// TableItem
function TableItem({ item, isSelected, onRowChange, onDeleteClick, onRecoverClick }) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(item.id, e.target.checked)}
        />
      </td>
      <td>{item.name}</td>
      <td>{item.category}</td>
      <td>{item.manufacturer}</td>
      <td>{item.supplier}</td>
      <td>{item.location}</td>
      <td>
        <ActionButtons
          showDelete
          onDeleteClick={() => onDeleteClick(item.id)}
        />
      </td>
      <td>
        <ActionButtons
          showDelete
          onDeleteClick={() => onDeleteClick(item.id)}
        />
      </td>
    </tr>
  );
}

export default function RecycleBin() {
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

  // recover modal state
  const [isRecoverModalOpen, setRecoverModalOpen] = useState(false);
  const [recoverTarget, setRecoverTarget] = useState(null);

  const openRecoverModal = (id = null) => {
    setRecoverTarget(id);
    setRecoverModalOpen(true);
  };

  const closeRecoverModal = () => {
    setRecoverModalOpen(false);
    setRecoverTarget(null);
  };

  const confirmRecover = () => {
    if (recoverTarget) {
      console.log("Recovering single id:", recoverTarget);
      // API call or restore from mock
    } else {
      console.log("Recovering multiple ids:", selectedIds);
      setSelectedIds([]); // clear selection if bulk
    }
    closeRecoverModal();
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

      {isRecoverModalOpen && (
        <ConfirmationModal
          closeModal={closeRecoverModal}
          actionType="recover"
          onConfirm={confirmRecover}
        />
      )}

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          <section className="title-page-section">
            <h1>Recycle Bin</h1>
          </section>

          <BinFilter filters={filterConfig} />

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">Recycle Bin ({MockupData.length})</h2>
              <section className="table-actions">
                {/* Bulk recover button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="recover"
                    onClick={() => openRecoverModal(null)}
                  />
                )}

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
                    paginatedActivity.map((item) => (
                      <TableItem
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.includes(item.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                        onRecoverClick={openRecoverModal}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Deleted Items Found.
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