import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import DefaultImage from "../../assets/img/default-image.jpg";
import "../../styles/Manufacturer.css";

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          name="checkbox-manufacturer"
          id="checkbox-manufacturer"
        />
      </th>
      <th>NAME</th>
      <th>URL</th>
      <th>SUPPORT URL</th>
      <th>PHONE NUMBER</th>
      <th>EMAIL</th>
      <th>NOTES</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ manufacturer, onDeleteClick }) {
  const navigate = useNavigate();

  return (
    <tr>
      <td>
        <div className="checkbox-manufacturer">
          <input type="checkbox" name="" id="" />
        </div>
      </td>
      <td>
        <div className="manufacturer-name">
          <img
            src={manufacturer.logo ? manufacturer.logo : DefaultImage}
            alt={manufacturer.logo}
          />
          <span>{manufacturer.name}</span>
        </div>
      </td>
      <td>{manufacturer.url || "-"}</td>
      <td>{manufacturer.supportUrl || "-"}</td>
      <td>{manufacturer.phone || "-"}</td>
      <td>{manufacturer.email || "-"}</td>
      <td>{manufacturer.notes || "-"}</td>
      <td>
        <section className="action-button-section">
          <button title="View" className="action-button">
            <i className="fas fa-eye"></i>
          </button>
          <button
            title="Edit"
            className="action-button"
            onClick={() =>
              navigate(`/More/ManufacturerRegistration/${manufacturer.id}`, {
                state: { manufacturer },
              })
            }
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            title="Delete"
            className="action-button"
            onClick={onDeleteClick}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </section>
      </td>
    </tr>
  );
}

export default function ViewManuDraft() {
  const location = useLocation();
  const [isLoading, setLoading] = useState(true);
  const [manufacturers, setManufacturers] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const allChecked = checkedItems.length === manufacturers.length;
  const navigate = useNavigate();

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const contextServiceUrl =
    "https://contexts-service-production.up.railway.app";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const manufacturerRes = await fetchAllCategories();
        const mapped = (manufacturerRes || []).map((manu) => ({
          id: manu.id,
          name: manu.name,
          url: manu.manu_url,
          supportUrl: manu.support_url,
          phone: manu.support_phone,
          email: manu.support_email,
          notes: manu.notes,
          logo: manu.logo,
        }));
        const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
        setManufacturers(sorted);
      } catch (error) {
        console.error("Fetch error:", error);
        setErrorMessage("Failed to load data.");
        setTimeout(() => setErrorMessage(""), 5000);
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }

    fetchData();
  }, [location]);

  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : manufacturers.map((item) => item.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const fetchManufacturers = async () => {
    setLoading(true);
    try {
      const res = await contextsService.fetchAllManufacturers();
      const mapped = (res || []).map((manu) => ({
        id: manu.id,
        name: manu.name,
        url: manu.manu_url,
        supportUrl: manu.support_url,
        phone: manu.support_phone,
        email: manu.support_email,
        notes: manu.notes,
        logo: manu.logo,
      }));
      setManufacturers(mapped);
    } catch (e) {
      console.error("Error refreshing manufacturers:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredManufacturers = manufacturers.filter((manufacturer) =>
    manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedManufacturer = filteredManufacturers.slice(
    startIndex,
    endIndex
  );

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          actionType={"delete"}
          confirmDelete={async () => {
            await fetchManufacturers();
            setSuccessMessage("Manufacturer Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">
                Manufacturers ({filteredManufacturers.length})
              </h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search"
                />
                <MediumButtons
                  type="new"
                  navigatePage="/More/ManufacturerRegistration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="manufacturer-page-table-section">
              <table>
                <thead>
                  <TableHeader />
                </thead>
                <tbody>
                  {paginatedManufacturer.length > 0 ? (
                    paginatedManufacturer.map((manufacturer, index) => (
                      <TableItem
                        key={index}
                        manufacturer={manufacturer}
                        onDeleteClick={() => {
                          setEndPoint(
                            `${contextServiceUrl}/contexts/manufacturers/${manufacturer.id}/delete/`
                          );
                          setDeleteModalOpen(true);
                        }}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="no-data-message">
                        No manufacturer found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Table pagination */}
            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={paginatedManufacturer.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </section>
        </main>
      </section>
    </>
  );
}
