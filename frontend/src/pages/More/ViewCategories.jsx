import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/PageTable.css';
import '../../styles/GlobalTableStyles.css';
import '../../styles/Categories.css';
import '../../styles/Assets.css';
import '../../styles/CategoryQuantityFix.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import keyboardIcon from '../../assets/img/keyboard_Icon.png';
import chargerIcon from '../../assets/img/charger_Icon.png';
import cablesIcon from '../../assets/img/cables_Icon.png';
import paperprinterIcon from '../../assets/img/paperprinter_Icon.png';
import printerinkIcon from '../../assets/img/printerink_Icon.png';
import TableBtn from "../../components/buttons/TableButtons";

export default function ViewCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([
    {
      id: 1,
      icon: cablesIcon,
      name: "Cables",
      type: "Accessory",
      quantity: 2
    },
    {
      id: 2,
      icon: chargerIcon,
      name: "Charger",
      type: "Accessory",
      quantity: 1
    },
    {
      id: 3,
      icon: keyboardIcon,
      name: "Keyboards",
      type: "Accessory",
      quantity: 2
    },
    {
      id: 5,
      icon: paperprinterIcon,
      name: "Printer Paper",
      type: "Consumable",
      quantity: 262
    },
    {
      id: 6,
      icon: printerinkIcon,
      name: "Printer Ink",
      type: "Consumable",
      quantity: 95
    }
  ]);

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    console.log("Component mounted with navigate:", navigate);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to edit page
  const handleEditCategory = (categoryId) => {
    console.log("/More/CategoryEdit/${categoryId}");
    navigate("/More/CategoryEdit/");
  };

  // Show delete modal
  const handleDeleteClick = (categoryId) => {
    console.log(`Opening delete modal for category ${categoryId}`);
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(category => category.id !== categoryToDelete));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="page">
        <div className="container">
          <section className="top">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0', color: '#545f71' }}>Categories ({categories.length})</h1>
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
              <MediumButtons type="new" navigatePage="/More/CategoryRegistration" />
            </div>
          </section>
          <section className="middle">
            <table className="assets-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" />
                  </th>
                  <th style={{ width: '30%' }}>NAME</th>
                  <th style={{ width: '20%' }}>TYPE</th>
                  <th className="quantity-header" style={{ width: '20%', textAlign: 'left', paddingLeft: '12px' }}>
                    <div style={{ textAlign: 'left', display: 'block' }}>QUANTITY</div>
                  </th>
                  <th style={{ width: '60px', textAlign: 'center', padding: '0 12px' }}>EDIT</th>
                  <th style={{ width: '60px', textAlign: 'center', padding: '0 12px' }}>DELETE</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td style={{ width: '40px' }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ width: '30%' }}>
                      <div className="category-name">
                        <div className="category-icon">
                          <img src={category.icon} alt={category.name} />
                        </div>
                        <span style={{ color: '#545f71' }}>{category.name}</span>
                      </div>
                    </td>
                    <td style={{ width: '20%', color: '#545f71' }}>{category.type}</td>
                    <td style={{ width: '20%', textAlign: 'left', paddingLeft: '12px' }}>
                      <div className="quantity-icon" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#545f71', justifyContent: 'flex-start', marginLeft: '0' }}>
                        {category.type === "Accessory" ? (
                          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#007bff', borderRadius: '2px' }}></span>
                        ) : category.type === "License" ? (
                          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#6f42c1', borderRadius: '2px' }}></span>
                        ) : (
                          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#20c997', borderRadius: '2px' }}></span>
                        )}
                        <span style={{ textAlign: 'left', color: '#545f71' }}>{category.quantity}</span>
                      </div>
                    </td>
                    <td style={{ width: '60px', textAlign: 'center', padding: '0 12px' }}>
                      <button
                        className="edit-button"
                        onClick={() => handleEditCategory(category.id)}
                        style={{ margin: '0 auto', display: 'block' }}
                      >
                        <TableBtn type="edit" />
                      </button>
                    </td>
                    <td style={{ width: '60px', textAlign: 'center', padding: '0 12px' }}>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteClick(category.id)}
                        style={{ margin: '0 auto', display: 'block' }}
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
              <button className="next-btn" disabled={filteredCategories.length <= itemsPerPage} style={{ color: '#545f71', border: '1px solid #dee2e6', background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Next</button>
            </div>
          </section>

          {/* Delete Modal */}
          {showDeleteModal && (
            <DeleteModal
              closeModal={cancelDelete}
              confirmDelete={confirmDelete}
            />
          )}

          {/* Debug button to test modal */}
          <button
            onClick={() => {
              console.log("Manual modal trigger");
              setShowDeleteModal(true);
            }}
            style={{ display: 'none' }}
          >
            Test Modal
          </button>
        </div>
      </main>
    </>
  );
}