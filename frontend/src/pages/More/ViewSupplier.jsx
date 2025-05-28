import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/PageTable.css';
import '../../styles/GlobalTableStyles.css';
import '../../styles/ViewSupplier.css';
import '../../styles/TableButtons.css';
import '../../styles/SupplierURLFix.css';
import '../../styles/SupplierColumnSpacingFix.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import SupplierTableDetails from './SupplierTableDetails';
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";

export default function ViewSupplier() {
  const navigate = useNavigate();

  // ----------------- State -----------------
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // ----------------- Effects -----------------
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/suppliers/');
        const data = await response.json();
        setSuppliers(data.suppliers);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

  fetchSuppliers();
}, []);

  // ----------------- Handlers -----------------
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleEditSupplier = (id) => navigate('/More/SupplierEdit');

  const handleDeleteClick = (id) => {
    setSupplierToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDelete));
    setShowDeleteModal(false);
    setSupplierToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSupplierToDelete(null);
  };

  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSupplier(null);
  };


  // ----------------- Computed -----------------
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
    
  );

  
  // ----------------- Render -----------------
  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="page">
        <div className="container">
          <section className="top">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0', color: '#545f71' }}>Suppliers ({suppliers.length})</h1>
            <div>
              <form action="" method="post" style={{ marginRight: '10px' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/More/SupplierRegistration" />
            </div>
          </section>
          <section className="middle">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th className="checkbox-header">
                    <input type="checkbox" />
                  </th>
                  <th className="name-header">NAME</th>
                  <th className="address-header">ADDRESS</th>
                  <th className="city-header">CITY</th>
                  <th className="country-header">COUNTRY</th>
                  <th className="contact-header">CONTACT</th>
                  <th className="phone-header">PHONE</th>
                  <th className="email-header">EMAIL</th>
                  <th className="url-header" style={{ textAlign: 'left', paddingLeft: '12px' }}>
                    <div style={{ textAlign: 'left', display: 'block' }}>URL</div>
                  </th>
                  <th className="action-header">EDIT</th>
                  <th className="action-header">DELETE</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="supplier-row">
                    <td className="checkbox-cell">
                      <input type="checkbox" />
                    </td>
                    <td className="name-cell" onClick={() => handleSupplierClick(supplier)}>
                      <div className="supplier-name-container">
                        {supplier.logo && (
                          <div className="supplier-logo">
                            <img src={supplier.logo} alt={supplier.name} />
                          </div>
                        )}
                        <span className="supplier-name" style={{ color: '#545f71' }}>{supplier.name}</span>
                      </div>
                    </td>
                    <td className="address-cell" style={{ color: '#545f71' }}>{supplier.address}</td>
                    <td className="city-cell" style={{ color: '#545f71' }}>{supplier.city}</td>
                    <td className="country-cell" style={{ color: '#545f71' }}>{supplier.country}</td>
                    <td className="contact-cell" style={{ color: '#545f71' }}>{supplier.contact}</td>
                    <td className="phone-cell" style={{ color: '#545f71' }}>{supplier.phone}</td>
                    <td className="email-cell" style={{ color: '#545f71' }} title={supplier.email}>{supplier.email}</td>
                    <td className="url-cell" style={{ color: '#545f71', textAlign: 'left', paddingLeft: '12px', paddingRight: '20px' }} title={supplier.url}>{supplier.url}</td>
                    <td className="action-cell" style={{ textAlign: 'center' }}>
                      <button
                        className="table-action-btn edit-btn"
                        onClick={() => handleEditSupplier(supplier.id)}
                        style={{ margin: '0 auto' }}
                      >
                        <TableBtn type="edit" />
                      </button>
                    </td>
                    <td className="action-cell" style={{ textAlign: 'center' }}>
                      <button
                        className="table-action-btn delete-btn"
                        onClick={() => handleDeleteClick(supplier.id)}
                        style={{ margin: '0 auto' }}
                      >
                        <TableBtn type="delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="bottom" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 34px', borderTop: '1px solid #d3d3d3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#545f71' }}>
              <span style={{ color: '#545f71' }}>Show</span>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} style={{ color: '#545f71' }}>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span style={{ color: '#545f71' }}>items per page</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="prev-btn" disabled={currentPage === 1} style={{ color: '#545f71', border: '1px solid #dee2e6', background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Prev</button>
              <span className="page-number" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', fontSize: '14px' }}>{currentPage}</span>
              <button className="next-btn" disabled={filteredSuppliers.length <= itemsPerPage} style={{ color: '#545f71', border: '1px solid #dee2e6', background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Next</button>
            </div>
          </section>

          {/* Delete Modal */}
          {showDeleteModal && (
            <DeleteModal
              closeModal={cancelDelete}
              confirmDelete={confirmDelete}
            />
          )}

          {/* Supplier Details Modal */}
          {showDetailsModal && selectedSupplier && (
            <SupplierTableDetails
              isOpen={showDetailsModal}
              onClose={closeDetailsModal}
              supplier={selectedSupplier}
            />
          )}
        </div>
      </main>
    </>
  );
}