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
import "../../styles/AuditsOverdue.css";
import overdueAudit from "../../data/mockData/audits/overdue-audit-mockup-data.json";
import View from "../../components/Modals/View";


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
      <th>OVERDUE BY</th>
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
      <td>{item.overdue_by} day/s</td>
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
          editState={{ item, previousPage: "/audits/overdue" }}
          onDeleteClick={() => onDeleteClick(item.id)}
          onViewClick={() => onViewClick(item)}
        />
      </td>
    </tr>
  );
}

export default function OverdueAudits() {
  const navigate = useNavigate();

  const data = overdueAudit;

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = data.slice(startIndex, endIndex);

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
    // perform delete action here (API or filter)
    closeDeleteModal();
  };

  // Add state for view modal
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Add view handler
  const handleViewClick = (item) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedItem(null);
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

      {isViewModalOpen && selectedItem && (
        <View
          title={`${selectedItem.asset.name} : ${selectedItem.overdue_by} day/s overdue`}
          data={[
            { label: "Due Date", value: selectedItem.date },
            { label: "Overdue By", value: `${selectedItem.overdue_by} day/s` },
            { label: "Asset", value: `${selectedItem.asset.displayed_id} - ${selectedItem.asset.name}` },
            { label: "Created At", value: selectedItem.created_at },
            { label: "Notes", value: selectedItem.notes },
          ]}
          closeModal={closeViewModal}
        />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="audit-title-page-section">
            <h1>Asset Audits</h1>

            <div>
              <MediumButtons
                type="schedule-audits"
                navigatePage="/audits/schedule"
                previousPage="/audits/overdue"
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
              <h2 className="h2">Overdue for Audits ({data.length})</h2>
              <section className="table-actions">
                <input type="search" placeholder="Search..." className="search" />
              </section>
            </section>

            <section className="overdue-audit-table-section">
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
                        onViewClick={handleViewClick}
                        navigate={navigate}
                        location={location}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Overdue Audits Found.
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
