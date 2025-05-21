import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/ViewManufacturer.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";

export default function ViewManufacturers() {
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState([
    { 
      id: 1, 
      logo: '/logos/adobe-logo.png', 
      name: "Adobe", 
      url: "https://adobe.com",
      supportUrl: "https://helpx.adobe.com",
      phone: "1-800-585-0774",
      email: "support@adobe.com",
      notes: "-"
    },
    { 
      id: 2, 
      logo: '/logos/apple-logo.png', 
      name: "Apple", 
      url: "https://apple.com",
      supportUrl: "https://support.apple.com",
      phone: "1-800-275-2273",
      email: "support@apple.com",
      notes: "-"
    },
    { 
      id: 3,
      logo: '/logos/canon-logo.png', 
      name: "Canon",
      url: "https://canon.com",
      supportUrl: "https://canon.com/support",
      phone: "1-800-385-2155",
      email: "support@canon.com",
      notes: "-"
    },
    { 
      id: 4, 
      logo: '/logos/dell-logo.png', 
      name: "Dell", 
      url: "https://dell.com",
      supportUrl: "https://dell.com/support",
      phone: "1-877-289-3355",
      email: "support@dell.com",
      notes: "Remember to always purchase..."
    },
    { 
      id: 5, 
      logo: '/logos/hp-logo.png', 
      name: "HP", 
      url: "https://hp.com",
      supportUrl: "https://support.hp.com",
      phone: "1-888-999-4747",
      email: "support@hp.com",
      notes: "-"
    }
  ]);

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [manufacturerToDelete, setManufacturerToDelete] = useState(null);

  useEffect(() => {
    console.log("Component mounted with navigate:", navigate);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to edit page
  const handleEditManufacturer = (manufacturerId) => {
    console.log('/More/ManufacturerEdit/${manufacturerId}');
    navigate('/More/ManufacturerEdit/');
  };

  // Show delete modal
  const handleDeleteClick = (manufacturerId) => {
    console.log(`Opening delete modal for manufacturer ${manufacturerId}`);
    setManufacturerToDelete(manufacturerId);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const confirmDelete = () => {
    if (manufacturerToDelete) {
      setManufacturers(manufacturers.filter(manufacturer => manufacturer.id !== manufacturerToDelete));
      setShowDeleteModal(false);
      setManufacturerToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setManufacturerToDelete(null);
  };

  // Filter manufacturers based on search query
  const filteredManufacturers = manufacturers.filter(manufacturer => 
    manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="manufacturers-page">
      <NavBar />
      <div className="content-container">
        <div className="page-header">
          <h1>Manufacturers ({manufacturers.length})</h1>
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
          <MediumButtons type="new" navigatePage="/More/ManufacturerRegistration" />
        </div>

        <div className="manufacturers-table">
          <table>
            <thead>
              <tr>
                <th className="checkbox-col"><input type="checkbox" /></th>
                <th className="name-col">NAME</th>
                <th className="url-col">URL</th>
                <th className="support-url-col">SUPPORT URL</th>
                <th className="phone-col">PHONE</th>
                <th className="email-col">EMAIL</th>
                <th className="notes-col">NOTES</th>
                <th className="edit-col">EDIT</th>
                <th className="delete-col">DELETE</th>
              </tr>
            </thead>
            <tbody>
              {filteredManufacturers.map((manufacturer) => (
                <tr key={manufacturer.id}>
                  <td className="checkbox-col"><input type="checkbox" /></td>
                  <td className="name-col">
                    <div className="manufacturer-name">
                      <div className="manufacturer-logo">
                        <img src={manufacturer.logo} alt={manufacturer.name} />
                      </div>
                      <span>{manufacturer.name}</span>
                    </div>
                  </td>
                  <td className="url-col">{manufacturer.url}</td>
                  <td className="support-url-col">{manufacturer.supportUrl}</td>
                  <td className="phone-col">{manufacturer.phone}</td>
                  <td className="email-col">{manufacturer.email}</td>
                  <td className="notes-col">{manufacturer.notes}</td>
                  <td className="edit-col">
                    <button 
                      className="edit-button" 
                      onClick={() => handleEditManufacturer(manufacturer.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <TableBtn type="edit" />
                    </button>
                  </td>
                  <td className="delete-col">
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteClick(manufacturer.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <TableBtn type="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
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
            <button className="next-btn" disabled={filteredManufacturers.length <= itemsPerPage}>Next</button>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteModal 
            isOpen={showDeleteModal}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            title="Delete Manufacturer"
            message="Are you sure you want to delete this manufacturer? This action cannot be undone."
          />
        )}
      </div>
    </div>
  );
}