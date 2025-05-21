import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import SupplierTableDetails from './SupplierTableDetails';

export default function ViewSupplier() {
  const navigate = useNavigate();

  // ----------------- State -----------------
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      logo: '',
      name: "Amazon",
      address: "410 Terry Ave N",
      city: "Seattle",
      state: "Washington",
      zip: "98109",
      country: "United States",
      contact: "James Peterson",
      phone: "1-800-383-2839",
      email: "contact@amazon.com",
      url: "https://amazon.com",
      notes: "Always use the corporate account"
    },
    {
      id: 2,
      logo: '',
      name: "Newegg",
      address: "17560 Rowland St",
      city: "City of Industry",
      state: "California",
      zip: "91745",
      country: "United States",
      contact: "Bob Anderson",
      phone: "1-800-930-1119",
      email: "contact@newegg.com",
      url: "https://newegg.com",
      notes: "-"
    },
    {
      id: 3,
      logo: '',
      name: "Staples",
      address: "500 8th Ave",
      city: "New York",
      state: "New York",
      zip: "10018",
      country: "United States",
      contact: "Julie Henderson",
      phone: "1-800-413-8571",
      email: "contact@staples.com",
      url: "https://staples.com",
      notes: "Shop from the store in Manhattan"
    },
    {
      id: 4,
      logo: '',
      name: "WHSmith",
      address: "115 Buckingham Palace Rd",
      city: "London",
      state: "-",
      zip: "SW1V 1JT",
      country: "United Kingdom",
      contact: "Vicky Butlerson",
      phone: "+442079320805",
      email: "contact@whsmith.com",
      url: "https://www.whsmith.co.uk/",
      notes: "-"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // ----------------- Effects -----------------
  useEffect(() => {
    console.log("ViewSupplier mounted.");
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
    <div className="suppliers-page">
      <NavBar />

      <div className="content-container">
        {/* Header Section */}
        <div className="page-header">
          <h1>Suppliers ({suppliers.length})</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <MediumButtons type="export" />
          <MediumButtons type="new" navigatePage="/More/SupplierRegistration" />
        </div>

        {/* Table Section */}
        <div className="suppliers-table">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>NAME</th>
                <th>ADDRESS</th>
                <th>CITY</th>
                <th>COUNTRY</th>
                <th>CONTACT</th>
                <th>PHONE</th>
                <th>EMAIL</th>
                <th>URL</th>
                <th>EDIT</th>
                <th>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td><input type="checkbox" /></td>
                  <td onClick={() => handleSupplierClick(supplier)} className="clickable-name">
                    {supplier.logo && (
                      <div className="supplier-logo">
                        <img src={supplier.logo} alt={supplier.name} />
                      </div>
                    )}
                    <span>{supplier.name}</span>
                  </td>
                  <td>{supplier.address}</td>
                  <td>{supplier.city}</td>
                  <td>{supplier.country}</td>
                  <td>{supplier.contact}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.url}</td>
                  <td>
                    <button className="table-icon" onClick={() => handleEditSupplier(supplier.id)}>
                      <TableBtn type="edit" />
                    </button>
                  </td>
                  <td>
                    <button className="table-icon" onClick={() => handleDeleteClick(supplier.id)}>
                      <TableBtn type="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="pagination">
          <div className="items-per-page">
            <span>Show</span>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>items per page</span>
          </div>
          <div className="page-navigation">
            <button className="prev-btn" disabled={currentPage === 1}>Prev</button>
            <span className="page-number">{currentPage}</span>
            <button className="next-btn" disabled={filteredSuppliers.length <= itemsPerPage}>Next</button>
          </div>
        </div>

        {/* Modals */}
        {showDeleteModal && (
          <DeleteModal
            isOpen={showDeleteModal}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            title="Delete Supplier"
            message="Are you sure you want to delete this supplier? This action cannot be undone."
          />
        )}

        {showDetailsModal && selectedSupplier && (
          <SupplierTableDetails
            isOpen={showDetailsModal}
            onClose={closeDetailsModal}
            supplier={selectedSupplier}
          />
        )}
      </div>
    </div>
  );
}
