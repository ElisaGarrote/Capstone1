import "../../styles/custom-colors.css";
import "../../styles/Maintenance.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import { useLocation } from "react-router-dom";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import { useState, useEffect } from "react";

export default function Maintenance() {
  const location = useLocation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSuccess] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Maintenance mock data
  const maintenanceItems = [
    {
      id: "100002",
      name: "iPhone 16 Pro Max",
      type: "Hardware",
      maintenanceName: "Serviced battery",
      startDate: "April 23, 2025",
      endDate: "-",
      cost: "PHP 902.0",
      supplier: "Newegg",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100016",
      name: "Surface Laptop 5",
      type: "Repair",
      maintenanceName: "Fixed keyboard",
      startDate: "April 23, 2025",
      endDate: "-",
      cost: "PHP 242.0",
      supplier: "WHSmith",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100007",
      name: "Yoga 7",
      type: "Hardware",
      maintenanceName: "Changed screen",
      startDate: "April 23, 2025",
      endDate: "-",
      cost: "PHP 152.0",
      supplier: "Staples",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100018",
      name: "Galaxy S24 Ultra",
      type: "Test",
      maintenanceName: "Replaced hard drive",
      startDate: "April 22, 2025",
      endDate: "-",
      cost: "PHP 566.0",
      supplier: "Amazon",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100017",
      name: "Galaxy S24 Ultra",
      type: "Repair",
      maintenanceName: "Fixed Speaker",
      startDate: "April 19, 2025",
      endDate: "April 20, 2025",
      cost: "PHP 199.0",
      supplier: "WHSmith",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100010",
      name: "Macbook Pro 16\"",
      type: "Hardware",
      maintenanceName: "Upgraded software",
      startDate: "April 18, 2025",
      endDate: "-",
      cost: "PHP 884.0",
      supplier: "WHSmith",
      notes: "-",
      attachments: "-"
    }
  ];

  // Retrieve success states from navigation
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;
  const isUpdateFromEdit = location.state?.isUpdateFromEdit;

  // Handle delete success message
  useEffect(() => {
    if (isDeleteSuccessFromEdit === true) {
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 5000);
    }
  }, [isDeleteSuccessFromEdit]);

  // Handle update success message
  useEffect(() => {
    if (isUpdateFromEdit === true) {
      setUpdated(true);
      setTimeout(() => {
        setUpdated(false);
      }, 5000);
    }
  }, [isUpdateFromEdit]);

  // Handle search functionality
  const filteredItems = maintenanceItems.filter(item => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(searchLower) ||
      item.name.toLowerCase().includes(searchLower) ||
      item.type.toLowerCase().includes(searchLower) ||
      item.maintenanceName.toLowerCase().includes(searchLower) ||
      item.supplier.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    setDeleteModalOpen(false);
    setDeleteSuccess(true);
    setTimeout(() => {
      setDeleteSuccess(false);
    }, 5000);
  };

  return (
    <div className="app-container">
      {/* Delete modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={handleDeleteConfirm}
        />
      )}

      {/* Success alerts */}
      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}

      {isUpdated && <Alert message="Updated Successfully!" type="success" />}

      <header className="app-header">
        <NavBar />
      </header>
      
      <main className="maintenance-page">
        <section className="main-top">
          <h1>Asset Maintenances / Repairs (7)</h1>
          <div className="actions-container">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </button>
            </div>
           
            <MediumButtons type="export" navigatePage="" />
            <MediumButtons type="new" navigatePage="/dashboard/Repair/MaintenanceRegistration" label="New" />
          </div>
        </section>
        
        <section className="maintenance-table-container">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input type="checkbox" />
                </th>
                <th>ASSET</th>
                <th>TYPE</th>
                <th>NAME</th>
                <th>START DATE</th>
                <th>END DATE</th>
                <th>COST</th>
                <th>SUPPLIER</th>
                <th>NOTES</th>
                <th>ATTACHMENTS</th>
                <th>EDIT</th>
                <th>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id}>
                  <td className="checkbox-column">
                    <input type="checkbox" />
                  </td>
                  <td className="asset-cell">
                    <span className="asset-id">{item.id}</span> - {item.name}
                  </td>
                  <td>{item.type}</td>
                  <td>{item.maintenanceName}</td>
                  <td>{item.startDate}</td>
                  <td>{item.endDate}</td>
                  <td>{item.cost}</td>
                  <td className="supplier-cell">{item.supplier}</td>
                  <td>{item.notes}</td>
                  <td>{item.attachments}</td>
                  <td className="action-cell">
                    <TableBtn
                      type="edit"
                      navigatePage="/dashboard/Repair/EditMaintenance"
                      id={`${item.id} - ${item.name}`}
                      previousPage={location.pathname}
                    />
                  </td>
                  <td className="action-cell">
                    <TableBtn
                      type="delete"
                      showModal={() => {
                        setDeleteModalOpen(true);
                        setSelectedRowId(item.id);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination-container">
            <div className="items-per-page">
              <span>Show</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="page-select"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>items per page</span>
            </div>
            
            <div className="pagination-controls">
              <button 
                onClick={goToPrevPage} 
                disabled={currentPage === 1}
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              >
                &lt; Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              >
                Next &gt;
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}