import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/PageTable.css';
import '../../styles/GlobalTableStyles.css';
import '../../styles/ViewManufacturer.css';
import '../../styles/TableButtons.css';
import '../../styles/ViewStatus.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";

export default function ViewStatus() {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState([
    {
      id: 1,
      name: "Deployable",
      type: "Asset",
      notes: "Ready to be deployed to users",
      count: 15
    },
    {
      id: 2,
      name: "Deployed",
      type: "Asset", 
      notes: "Currently in use by a user",
      count: 8
    },
    {
      id: 3,
      name: "Pending",
      type: "Asset",
      notes: "Awaiting approval or processing",
      count: 3
    },
    {
      id: 4,
      name: "Archived",
      type: "Asset",
      notes: "No longer in active use",
      count: 2
    },
    {
      id: 5,
      name: "Undeployable",
      type: "Asset",
      notes: "Cannot be deployed due to issues",
      count: 1
    }
  ]);

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);

  useEffect(() => {
    console.log("ViewStatus component mounted with navigate:", navigate);
  }, [navigate]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to edit page
  const handleEditStatus = (statusId) => {
    console.log(`/More/StatusEdit/${statusId}`);
    navigate(`/More/StatusEdit/${statusId}`);
  };

  // Show delete modal
  const handleDeleteClick = (statusId) => {
    console.log(`Opening delete modal for status ${statusId}`);
    setStatusToDelete(statusId);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const confirmDelete = () => {
    if (statusToDelete) {
      setStatuses(statuses.filter(status => status.id !== statusToDelete));
      setShowDeleteModal(false);
      setStatusToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStatusToDelete(null);
  };

  // Filter statuses based on search query
  const filteredStatuses = statuses.filter(status =>
    status.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="page">
        <div className="container">
          <section className="top status-top-section">
            <h1 className="status-page-header">Statuses ({statuses.length})</h1>
            <div className="status-top-section-actions">
              <form action="" method="post" className="status-search-form">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input status-search-input"
                />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/More/StatusRegistration" />
            </div>
          </section>
          <section className="middle">
            <div className="status-table-wrapper">
              <table className="status-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" />
                    </th>
                    <th style={{ width: '25%' }}>NAME</th>
                    <th style={{ width: '15%' }}>TYPE</th>
                    <th style={{ width: '30%' }}>NOTES</th>
                    <th style={{ width: '10%' }}>USED</th>
                    <th style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>MORE</th>
                    <th style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>EDIT</th>
                    <th style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>DELETE</th>
                  </tr>
                </thead>
              <tbody>
                {filteredStatuses.map((status) => (
                  <tr key={status.id}>
                    <td style={{ width: '40px' }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ width: '25%', color: '#495057', fontWeight: '500' }}>
                      {status.name}
                    </td>
                    <td style={{ width: '15%', color: '#6c757d' }}>{status.type}</td>
                    <td style={{ width: '30%', color: '#6c757d' }}>{status.notes}</td>
                    <td style={{ width: '10%', color: '#6c757d', fontWeight: '500' }}>{status.count}</td>
                    <td style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>
                      <TableBtn
                        type="view"
                        navigatePage={`/More/StatusDetails/${status.id}`}
                      />
                    </td>
                    <td style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>
                      <TableBtn
                        type="edit"
                        navigatePage={`/More/StatusEdit/${status.id}`}
                      />
                    </td>
                    <td style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>
                      <TableBtn
                        type="delete"
                        showModal={() => handleDeleteClick(status.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
              <div className="status-pagination-container">
                <div className="status-pagination-left">
                  <span className="status-pagination-text">Show</span>
                  <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="status-pagination-select">
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="status-pagination-text">items per page</span>
                </div>
                <div className="status-pagination-right">
                  <button className="prev-btn status-prev-btn" disabled={currentPage === 1}>Prev</button>
                  <span className="page-number status-page-number">{currentPage}</span>
                  <button className="next-btn status-next-btn" disabled={filteredStatuses.length <= itemsPerPage}>Next</button>
                </div>
              </div>
            </div>
          </section>

          {/* Delete Modal */}
          {showDeleteModal && (
            <DeleteModal
              isOpen={showDeleteModal}
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
              title="Delete Status"
              message="Are you sure you want to delete this status? This action cannot be undone."
            />
          )}
        </div>
      </main>
    </>
  );
}