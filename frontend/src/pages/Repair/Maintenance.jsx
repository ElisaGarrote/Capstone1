import "../../styles/custom-colors.css";
import "../../styles/AssetRepairs.css";
import "../../styles/AssetRepairsButtons.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import { useLocation } from "react-router-dom";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import { useState, useEffect } from "react";

export default function AssetRepairs() {
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
      id: "100011",
      name: "iPad Pro",
      type: "Software",
      maintenanceName: "Fixed keyboard",
      startDate: "May 2, 2025",
      endDate: "-",
      cost: "USD 355.0",
      supplier: "Amazon",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100013",
      name: "Galaxy S24 Ultra",
      type: "Maintenance",
      maintenanceName: "Changed screen",
      startDate: "May 2, 2025",
      endDate: "-",
      cost: "USD 23.0",
      supplier: "WHSmith",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100020",
      name: "Surface Laptop 5",
      type: "Upgrade",
      maintenanceName: "Upgraded software",
      startDate: "May 2, 2025",
      endDate: "-",
      cost: "USD 406.0",
      supplier: "Staples",
      notes: "-",
      attachments: "-"
    },
    {
      id: "100018",
      name: "Galaxy S24 Ultra",
      type: "Upgrade",
      maintenanceName: "Replaced hard drive",
      startDate: "May 1, 2025",
      endDate: "-",
      cost: "USD 317.0",
      supplier: "Staples",
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

      <nav>
        <NavBar />
      </nav>

      <main className="page">
        <div className="container">
          <section className="top">
            <h1>Asset Repairs</h1>
            <div>
              <form action="" method="post">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/dashboard/Repair/MaintenanceRegistration" />
            </div>
          </section>
          <section className="middle">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={() => {}}
                    />
                  </th>
                  <th title="ASSET">ASSET</th>
                  <th title="TYPE">TYPE</th>
                  <th title="NAME">NAME</th>
                  <th title="START DATE">START DATE</th>
                  <th title="END DATE">END DATE</th>
                  <th title="COST">COST</th>
                  <th title="SUPPLIER">SUPPLIER</th>
                  <th title="NOTES">NOTES</th>
                  <th title="ATTACHMENTS">ATTACHMENTS</th>
                  <th title="EDIT" className="action-column">EDIT</th>
                  <th title="DELETE" className="action-column">DELETE</th>
                  <th title="VIEW" className="action-column">VIEW</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        onChange={() => {}}
                      />
                    </td>
                    <td className="asset-column">
                      <span title={`${item.id} - ${item.name}`} style={{color: '#007bff', textAlign: 'left'}}>{item.id} - {item.name}</span>
                    </td>
                    <td title={item.type}>{item.type}</td>
                    <td title={item.maintenanceName}>{item.maintenanceName}</td>
                    <td title={item.startDate}>{item.startDate}</td>
                    <td title={item.endDate}>{item.endDate}</td>
                    <td title={item.cost}>{item.cost}</td>
                    <td title={item.supplier}>{item.supplier}</td>
                    <td title={item.notes}>{item.notes}</td>
                    <td title={item.attachments}>{item.attachments}</td>
                    <td className="action-column">
                      <TableBtn
                        type="edit"
                        navigatePage="/dashboard/Repair/EditMaintenance"
                        id={`${item.id} - ${item.name}`}
                        previousPage={location.pathname}
                      />
                    </td>
                    <td className="action-column">
                      <TableBtn
                        type="delete"
                        showModal={() => {
                          setDeleteModalOpen(true);
                          setSelectedRowId(item.id);
                        }}
                      />
                    </td>
                    <td className="action-column">
                      <TableBtn
                        type="view"
                        navigatePage="/dashboard/Repair/ViewMaintenance"
                        id={`${item.id} - ${item.name}`}
                        previousPage={location.pathname}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* We'll remove the pagination for consistency with other pages */}
          <section className="bottom"></section>
        </div>
      </main>
    </div>
  );
}