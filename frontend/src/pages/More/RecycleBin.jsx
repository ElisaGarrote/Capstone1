import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/RecycleBin.css';
import '../../styles/AuditTablesGlobal.css';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";

export default function RecycleBin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Sample deleted data for different categories
  const deletedData = {
    assets: [],
    accessories: [],
    components: [],
    consumables: [
      {
        id: 1,
        name: 'Printer Paper A4',
        category: 'Office Supplies',
        deletedDate: '2024-01-15',
        deletedBy: 'Admin User'
      },
      {
        id: 2,
        name: 'Ink Cartridge HP',
        category: 'Printer Supplies',
        deletedDate: '2024-01-10',
        deletedBy: 'Admin User'
      },
      {
        id: 3,
        name: 'USB Cable Type-C',
        category: 'Cables',
        deletedDate: '2024-01-08',
        deletedBy: 'Admin User'
      }
    ]
  };

  const tabs = [
    { key: 'assets', label: 'Assets', count: deletedData.assets.length },
    { key: 'accessories', label: 'Accessories', count: deletedData.accessories.length },
    { key: 'components', label: 'Components', count: deletedData.components.length },
    { key: 'consumables', label: 'Consumables', count: deletedData.consumables.length }
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter data based on search query
  const filteredData = deletedData[activeTab].filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle restore action
  const handleRestore = (itemId) => {
    console.log(`Restoring ${activeTab} item with ID: ${itemId}`);
    // Here you would typically call an API to restore the item
  };

  // Handle permanent delete action
  const handlePermanentDelete = (itemId) => {
    console.log(`Permanently deleting ${activeTab} item with ID: ${itemId}`);
    // Here you would typically call an API to permanently delete the item
  };

  const renderTabContent = () => {
    if (filteredData.length === 0) {
      return (
        <div className="empty-state">
          No {tabs.find(tab => tab.key === activeTab)?.label} Found
        </div>
      );
    }

    return (
      <table>
        <thead>
          <tr>
            <th>
              <input type="checkbox" />
            </th>
            <th>NAME</th>
            <th>CATEGORY</th>
            <th>DELETED DATE</th>
            <th>DELETED BY</th>
            <th>RESTORE</th>
            <th>DELETE</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              <td>
                <input type="checkbox" />
              </td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.deletedDate}</td>
              <td>{item.deletedBy}</td>
              <td>
                <button
                  onClick={() => handleRestore(item.id)}
                  className="restore-button"
                >
                  Restore
                </button>
              </td>
              <td>
                <TableBtn
                  type="delete"
                  showModal={() => handlePermanentDelete(item.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="recycle-bin-page">
        <section className="main-top">
          <h1>Recycle Bin</h1>
        </section>

        {/* Tab Navigation */}
        <section className="tab-nav">
          <div className="tab-nav-container">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </section>

        <section className="container">
          {/* Tab Content Header */}
          <section className="top">
            <h2>
              {tabs.find(tab => tab.key === activeTab)?.label} ({filteredData.length})
            </h2>
            <div>
              <form action="" method="post">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>
              <MediumButtons type="export" />
            </div>
          </section>

          {/* Tab Content */}
          <section className="middle">
            {renderTabContent()}
          </section>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <section className="pagination">
              <div className="pagination-left">
                <span>Show</span>
                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>items per page</span>
              </div>
              <div className="pagination-right">
                <button disabled={currentPage === 1}>Prev</button>
                <span className="page-number">{currentPage}</span>
                <button disabled={filteredData.length <= itemsPerPage}>Next</button>
              </div>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
