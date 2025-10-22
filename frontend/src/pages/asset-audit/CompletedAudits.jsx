import { useState } from "react";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import PageFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import TabNavBar from "../../components/TabNavBar";
import "../../styles/AuditsCompleted.css";
import completedAudit from "../../data/mockData/audits/completed-audit-mockup-data.json";
import View from "../../components/Modals/View";
import Footer from "../../components/Footer";

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
      <th>AUDIT DATE</th>
      <th>ASSET</th>
      <th>LOCATION</th>
      <th>PERFOMED BY</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
function TableItem({ item, onViewClick }) {
  return (
    <tr>
      <td>{item.audit_date}</td>
      <td>{item.audit_schedule.asset.displayed_id} - {item.audit_schedule.asset.name}</td>
      <td>{item.location}</td>
      <td>{item.performed_by}</td>
      <td>
        <ActionButtons
          showView
          onViewClick={() => onViewClick(item)}
        />
      </td>
    </tr>
  );
}

export default function CompletedAudits() {
  const data = completedAudit;

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = data.slice(startIndex, endIndex);

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
      {isViewModalOpen && selectedItem && (
        <View
          title={`${selectedItem.audit_schedule.asset.name} : ${selectedItem.audit_date}`}
          data={[
            { label: "Asset", value: `${selectedItem.audit_schedule.asset.displayed_id} - ${selectedItem.audit_schedule.asset.name}` },
            { label: "Location", value: selectedItem.location },
            { label: "Performed By", value: selectedItem.performed_by },
            { label: "Audit Date", value: selectedItem.audit_date },
            { label: "Next Audit Date", value: selectedItem.next_audit_date },
            { label: "Created At", value: selectedItem.created_at },
            { label: "Notes", value: selectedItem.notes },
            { label: "Files", value: selectedItem.files.map(f => f.file).join(", ") },
          ]}
          closeModal={closeViewModal}
        />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="completed-audit-title-page-section">
            <h1>Asset Audits</h1>

            <div>
              <MediumButtons
                type="schedule-audits"
                navigatePage="/audits/schedule"
                previousPage="/audits/completed"
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
              <h2 className="h2">Completed Audits ({data.length})</h2>
              <section className="table-actions">
                <input type="search" placeholder="Search..." className="search" />
              </section>
            </section>

            <section className="completed-audit-table-section">
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
                        onViewClick={handleViewClick}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Completed Audits Found.
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
