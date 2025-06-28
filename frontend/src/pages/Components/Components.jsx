import "../../styles/custom-colors.css";
import "../../styles/Components.css";
import "../../styles/StandardizedButtons.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import MediumButtons from "../../components/buttons/MediumButtons";
import authService from "../../services/auth-service";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";
import ComponentViewModal from "../../components/Modals/ComponentViewModal";
import SampleImage from "../../assets/img/default-image.jpg";

// Sample asset data
const sampleItems = [
  {
    id: 1,
    image: SampleImage,
    componentName: "Corsair Vengeance RAM",
    category: "RAM",
    manufacturer: "Corsair",
    supplier: "TechStore",
    location: "Main Warehouse",
    modelNumber: "CMK16GX4M2B3200C16",
    status: "Ready for Deployment",
    orderNumber: "ORD-2048",
    purchaseDate: "2024-06-15",
    purchaseCost: 120.99,
    quantity: 20,
    minimumQuantity: 5,
    notes: "High performance RAM module for gaming PCs",
  },
  {
    id: 2,
    image: SampleImage,
    componentName: "Intel Network Card",
    category: "Networking",
    manufacturer: "Intel",
    supplier: "NetSupplies",
    location: "Storage Room B",
    modelNumber: "I350-T4V2",
    status: "Deployed",
    orderNumber: "ORD-3090",
    purchaseDate: "2023-10-10",
    purchaseCost: 89.5,
    quantity: 15,
    minimumQuantity: 3,
    notes: "",
  },
];

export default function Components() {
  const [components, setComponents] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const navigate = useNavigate(); // Use useNavigate hook

  const allChecked = checkedItems.length === sampleItems.length;

  // Filter components based on search query
  const filteredComponents = sampleItems.filter(component => {
    return component.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           component.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           component.modelNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination logic
  const {
    currentPage,
    itemsPerPage,
    paginatedData,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredComponents, 20);

  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : components.map((component) => component.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    console.log(`Delete component with id: ${id}`);
    // Add delete logic here
  };

  const handleCheckInOut = (item) => {
    if (item.status === "Deployed") {
      navigate(`/components/checked-out-list/${item.id}`, {
        state: {
          id: item.id,
          name: item.componentName,
          category: item.category,
        },
      });
    } else {
      navigate(`/components/check-out/${item.id}`, {
        state: {
          id: item.id,
          image: item.image,
          name: item.componentName,
          category: item.category,
        },
      });
    }
  };

  const handleView = (component) => {
    setSelectedComponent(component);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedComponent(null);
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            await fetchComponents();
            setSuccessMessage("Asset Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}
      <nav>
        <NavBar />
      </nav>
      <main className="components-page">
        <div className="container">
          <section className="top">
            <h1>Components</h1>
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

              {authService.getUserInfo().role === "Admin" && (
                <MediumButtons
                  type="new"
                  navigatePage="/components/registration"
                />
              )}
            </div>
          </section>
          <section className="middle">
            <div className="table-wrapper">
              <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>IMAGE</th>
                  <th>NAME</th>
                  <th>AVAILABLE</th>
                  <th>CATEGORY</th>
                  <th>MODEL NUMBER</th>
                  <th>CHECKIN/CHECKOUT</th>
                  {authService.getUserInfo().role === "Admin" && <th>EDIT</th>}
                  <th>DELETE</th>
                  <th>VIEW</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-components-message">
                      <p>No components found. Please add some components.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                    </td>
                    <td>
                      <img
                        className="table-img"
                        src={item.image}
                        alt={item.product}
                      />
                    </td>
                    <td>{item.componentName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.category}</td>
                    <td>{item.modelNumber}</td>
                    <td>
                      <button
                        className={
                          item.status === "Deployed"
                            ? "check-in-btn"
                            : "check-out-btn"
                        }
                        onClick={() => handleCheckInOut(item)}
                      >
                        {item.status === "Deployed" ? "Check In" : "Check Out"}
                      </button>
                    </td>
                    {authService.getUserInfo().role === "Admin" && (
                      <td>
                        <ComponentsTableBtn
                          type="edit"
                          navigatePage={`/components/registration/${item.id}`}
                        />
                      </td>
                    )}
                    <td>
                      <ComponentsTableBtn
                        type="delete"
                        onClick={() => handleDelete(item.id)}
                      />
                    </td>
                    <td>
                      <ComponentsTableBtn
                        type="view"
                        onClick={() => handleView(item)}
                      />
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </section>

          {/* Pagination */}
          {filteredComponents.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[10, 20, 50, 100]}
            />
          )}
        </div>
      </main>

      {/* Component View Modal */}
      {isViewModalOpen && selectedComponent && (
        <ComponentViewModal
          component={selectedComponent}
          closeModal={closeViewModal}
        />
      )}
    </>
  );
}
