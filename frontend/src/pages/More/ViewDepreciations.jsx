import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/PageTable.css';
import '../../styles/GlobalTableStyles.css';
import '../../styles/ViewManufacturer.css';
import '../../styles/TableButtons.css';
import '../../styles/ViewDepreciations.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";

export default function ViewDepreciations() {
  const navigate = useNavigate();
  const [depreciations, setDepreciations] = useState([
    {
      id: 1,
      name: "iPhone Depreciation",
      duration: "24 months",
      minimumValue: "PHP 2,000"
    },
    {
      id: 2,
      name: "Laptop Depreciation",
      duration: "36 months",
      minimumValue: "PHP 5,000"
    }
  ]);

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [depreciationToDelete, setDepreciationToDelete] = useState(null);

  useEffect(() => {
    console.log("ViewDepreciations component mounted with navigate:", navigate);
  }, [navigate]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to edit page
  const handleEditDepreciation = (depreciationId) => {
    console.log(`/More/DepreciationEdit/${depreciationId}`);
    navigate(`/More/DepreciationEdit/${depreciationId}`);
  };

  // Show delete modal
  const handleDeleteClick = (depreciationId) => {
    console.log(`Opening delete modal for depreciation ${depreciationId}`);
    setDepreciationToDelete(depreciationId);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const confirmDelete = () => {
    if (depreciationToDelete) {
      setDepreciations(depreciations.filter(depreciation => depreciation.id !== depreciationToDelete));
      setShowDeleteModal(false);
      setDepreciationToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDepreciationToDelete(null);
  };

  // Filter depreciations based on search query
  const filteredDepreciations = depreciations.filter(depreciation =>
    depreciation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="page">
        <div className="container">
          <section className="top depreciation-top-section">
            <h1 className="depreciation-page-header">
              Depreciation's ({depreciations.length})
            </h1>
            <div className="depreciation-top-section-actions">
              <form action="" method="post" className="depreciation-search-form">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input depreciation-search-input"
                />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/More/DepreciationRegistration" />
            </div>
          </section>
          <section className="middle">
            <div className="depreciation-table-wrapper">
              <table className="depreciation-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" />
                    </th>
                    <th style={{ width: '40%' }}>NAME</th>
                    <th style={{ width: '25%' }}>DURATION</th>
                    <th style={{ width: '25%' }}>MINIMUM VALUE</th>
                    <th style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>EDIT</th>
                    <th style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>DELETE</th>
                  </tr>
                </thead>
              <tbody>
                {filteredDepreciations.map((depreciation) => (
                  <tr key={depreciation.id}>
                    <td style={{ width: '40px' }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ width: '40%', color: '#495057', fontWeight: '500' }}>{depreciation.name}</td>
                    <td style={{ width: '25%', color: '#6c757d' }}>{depreciation.duration}</td>
                    <td style={{ width: '25%', color: '#6c757d', fontWeight: '500' }}>{depreciation.minimumValue}</td>
                    <td style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>
                      <TableBtn
                        type="edit"
                        navigatePage={`/More/DepreciationEdit/${depreciation.id}`}
                      />
                    </td>
                    <td style={{ width: '60px', textAlign: 'center', paddingLeft: '8px', paddingRight: '8px' }}>
                      <TableBtn
                        type="delete"
                        showModal={() => handleDeleteClick(depreciation.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
              <div className="depreciation-pagination-container">
                <div className="depreciation-pagination-left">
                  <span className="depreciation-pagination-text">Show</span>
                  <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="depreciation-pagination-select">
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="depreciation-pagination-text">items per page</span>
                </div>
                <div className="depreciation-pagination-right">
                  <button className="prev-btn depreciation-prev-btn" disabled={currentPage === 1}>Prev</button>
                  <span className="page-number depreciation-page-number">{currentPage}</span>
                  <button className="next-btn depreciation-next-btn" disabled={filteredDepreciations.length <= itemsPerPage}>Next</button>
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
              title="Delete Depreciation"
              message="Are you sure you want to delete this depreciation? This action cannot be undone."
            />
          )}
        </div>
      </main>
    </>
  );
}
