import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Categories.css';
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
    <div className="categories-page">
      <NavBar />
      <div className="content-container">
        <div className="page-header">
          <h1>Categories ({categories.length})</h1>
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
              <MediumButtons type="new" navigatePage="/More/CategoryRegistration" />
        </div>

        <div className="categories-table">
          <table>
            <thead>
              <tr>
                <th className="checkbox-col"><input type="checkbox" /></th>
                <th className="name-col">NAME</th>
                <th className="type-col">TYPE</th>
                <th className="quantity-col">QUANTITY</th>
                <th className="edit-col">EDIT</th>
                <th className="delete-col">DELETE</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="checkbox-col"><input type="checkbox" /></td>
                  <td className="name-col">
                    <div className="category-name">
                      <div className="category-icon">
                        <img src={category.icon} alt={category.name} />
                      </div>
                      <span>{category.name}</span>
                    </div>
                  </td>
                  <td className="type-col">{category.type}</td>
                  <td className="quantity-col">
                    <div className="quantity-icon">
                      {category.type === "Accessory" ? (
                        <span className="accessory-icon"></span>
                      ) : category.type === "License" ? (
                        <span className="license-icon"></span>
                      ) : (
                        <span className="consumable-icon"></span>
                      )}
                      {category.quantity}
                    </div>
                  </td>
                  <td className="edit-col">
                    <button 
                      className="edit-button" 
                      onClick={() => handleEditCategory(category.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <TableBtn type="edit" />
                    </button>
                  </td>
                  <td className="delete-col">
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteClick(category.id)}
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
            <button className="next-btn" disabled={filteredCategories.length <= itemsPerPage}>Next</button>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteModal 
            isOpen={showDeleteModal}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            title="Delete Category"
            message="Are you sure you want to delete this category? This action cannot be undone."
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
    </div>
  );
}