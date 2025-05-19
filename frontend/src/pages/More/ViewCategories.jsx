import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import '../../styles/Categories.css';
import keyboardIcon from '../../assets/img/keyboard_Icon.png';
import chargerIcon from '../../assets/img/charger_Icon.png';
import cablesIcon from '../../assets/img/cables_Icon.png';
import paperprinterIcon from '../../assets/img/paperprinter_Icon.png';
import printerinkIcon from '../../assets/img/printerink_Icon.png';
import TableBtn from "../../components/buttons/TableButtons";



export default function ViewCategories() {
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
          <div className="action-buttons">
            <button className="bulk-edit-btn">Bulk Edit</button>
            <button className="columns-btn">Columns</button>
            <button className="sort-btn">Sort</button>
            <button className="filter-btn">Filter</button>
            <button className="export-btn">Export</button>
            <button className="add-btn">Add</button>
          </div>
        </div>

        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery} 
            onChange={handleSearchChange}
            className="search-input"
          />
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
                    <TableBtn type="edit" onClick={() => console.log('Edit', category.id)} />
                  </td>
                  <td className="delete-col">
                    <TableBtn type="delete" onClick={() => console.log('Delete', category.id)} />
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
      </div>
    </div>
  );
}