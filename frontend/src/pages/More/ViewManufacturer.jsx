import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/PageTable.css';
import '../../styles/GlobalTableStyles.css';
import '../../styles/ViewManufacturer.css';
import '../../styles/TableButtons.css';
import '../../styles/ManufacturersButtons.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import CanonLogo from '../../assets/img/Canon.png';

export default function ViewManufacturers() {
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState([
    {
      id: 1,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/1200px-Adobe_Systems_logo_and_wordmark.svg.png',
      name: "Adobe",
      url: "https://adobe.com",
      supportUrl: "https://helpx.adobe.com",
      phone: "1-800-585-0774",
      email: "support@adobe.com",
      notes: "-"
    },
    {
      id: 2,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png',
      name: "Apple",
      url: "https://apple.com",
      supportUrl: "https://support.apple.com",
      phone: "1-800-275-2273",
      email: "support@apple.com",
      notes: "-"
    },
    {
      id: 3,
      logo: CanonLogo,
      name: "Canon",
      url: "https://canon.com",
      supportUrl: "https://canon.com/support",
      phone: "1-800-385-2155",
      email: "support@canon.com",
      notes: "-"
    },
    {
      id: 4,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/1200px-Dell_logo_2016.svg.png',
      name: "Dell",
      url: "https://dell.com",
      supportUrl: "https://dell.com/support",
      phone: "1-877-289-3355",
      email: "support@dell.com",
      notes: "Remember to always purchase..."
    },
    {
      id: 5,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/1200px-HP_logo_2012.svg.png',
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
    console.log(`/More/ManufacturerEdit/${manufacturerId}`);
    navigate(`/More/ManufacturerEdit/${manufacturerId}`);
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
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="page">
        <div className="container">
          <section className="top">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0', color: '#545f71' }}>Manufacturers ({manufacturers.length})</h1>
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
              <MediumButtons type="new" navigatePage="/More/ManufacturerRegistration" />
            </div>
          </section>
          <section className="middle">
            <table className="assets-table" style={{ borderRadius: '0', overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" />
                  </th>
                  <th style={{ width: '20%' }}>NAME</th>
                  <th style={{ width: '15%' }}>URL</th>
                  <th style={{ width: '15%' }}>SUPPORT URL</th>
                  <th style={{ width: '10%' }}>PHONE</th>
                  <th style={{ width: '15%' }}>EMAIL</th>
                  <th style={{ width: '15%' }}>NOTES</th>
                  <th style={{ width: '40px', textAlign: 'center', paddingLeft: '12px', paddingRight: '12px' }}>EDIT</th>
                  <th style={{ width: '40px', textAlign: 'center', paddingLeft: '12px', paddingRight: '12px' }}>DELETE</th>
                </tr>
              </thead>
              <tbody>
                {filteredManufacturers.map((manufacturer) => (
                  <tr key={manufacturer.id}>
                    <td style={{ width: '40px' }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ width: '20%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '0' }}>
                          <img
                            src={manufacturer.logo}
                            alt={manufacturer.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40x40?text=' + manufacturer.name.charAt(0);
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                              backgroundColor: '#f8f9fa'
                            }}
                          />
                        </div>
                        <span style={{ color: '#545f71' }}>{manufacturer.name}</span>
                      </div>
                    </td>
                    <td style={{ width: '15%', color: '#545f71' }}>{manufacturer.url}</td>
                    <td style={{ width: '15%', color: '#545f71' }}>{manufacturer.supportUrl}</td>
                    <td style={{ width: '10%', color: '#545f71' }}>{manufacturer.phone}</td>
                    <td style={{ width: '15%', color: '#545f71' }}>{manufacturer.email}</td>
                    <td style={{ width: '15%', color: '#545f71' }}>{manufacturer.notes}</td>
                    <td style={{ width: '40px', textAlign: 'center', paddingLeft: '12px', paddingRight: '12px' }}>
                      <TableBtn
                        type="edit"
                        navigatePage={`/More/ManufacturerEdit/${manufacturer.id}`}
                      />
                    </td>
                    <td style={{ width: '40px', textAlign: 'center', paddingLeft: '12px', paddingRight: '12px' }}>
                      <TableBtn
                        type="delete"
                        showModal={() => handleDeleteClick(manufacturer.id)}
                      />
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
              <button className="next-btn" disabled={filteredManufacturers.length <= itemsPerPage} style={{ color: '#545f71', border: '1px solid #dee2e6', background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Next</button>
            </div>
          </section>

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
      </main>
    </>
  );
}