import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/PageTable.css';
import '../../styles/GlobalTableStyles.css';
import '../../styles/ViewSupplier.css';
import '../../styles/TableButtons.css';
import '../../styles/SupplierURLFix.css';
import '../../styles/SupplierColumnSpacingFix.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import SupplierTableDetails from './SupplierTableDetails';
import Alert from "../../components/Alert";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import DefaultImage from "../../assets/img/default-image.jpg";
import { fetchAllCategories } from '../../services/contexts-service';


export default function ViewSupplier() {
  const location = useLocation();
  const [isLoading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const allChecked = checkedItems.length === suppliers.length;
  const navigate = useNavigate();

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const contextServiceUrl = "https://contexts-service-production.up.railway.app";
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const suppRes = await fetchAllCategories();
        const mapped = (suppRes || []).map(supp => ({
          id: supp.id,
          name: supp.name,
          address: supp.address,
          city: supp.city,
          zip: supp.zip,
          contactName: supp.contact_name,
          phoneNumber: supp.phone_number,
          email: supp.email,
          url: supp.URL,
          notes: supp.notes,
          logo: supp.logo,
        }));
        const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
        setSuppliers(sorted);
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
    setCheckedItems(allChecked ? [] : suppliers.map((item) => item.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await contextsService.fetchAllSuppliers();
      const mapped = (res || []).map(supp => ({
        id: supp.id,
        name: supp.name,
        address: supp.address,
        city: supp.city,
        zip: supp.zip,
        contactName: supp.contact_name,
        phoneNumber: supp.phone_number,
        email: supp.email,
        url: supp.URL,
        notes: supp.notes,
      }));
      setSuppliers(mapped);
    } catch (e) {
      console.error("Error refreshing suppplier:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  // ----------------- Render -----------------
  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            await fetchSuppliers();
            setSuccessMessage("Supplier Deleted Successfully!");
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
      <main className="page">
        <div className="container">
          {isLoading ? (
            <SkeletonLoadingTable />
          ) : (
            <>
              <section className="top">
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0', color: '#545f71' }}>Suppliers ({suppliers.length})</h1>
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
                  <MediumButtons type="new" navigatePage="/More/SupplierRegistration" />
                </div>
              </section>
              <section className="middle">
                <table className="suppliers-table">
                  <thead>
                    <tr>
                      <th className="checkbox-header">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="name-header">NAME</th>
                      <th className="address-header">ADDRESS</th>
                      <th className="city-header">CITY</th>
                      <th className="country-header">ZIP</th>
                      <th className="contact-header">CONTACT</th>
                      <th className="phone-header">PHONE</th>
                      <th className="email-header">EMAIL</th>
                      <th className="url-header" style={{ textAlign: 'left', paddingLeft: '12px' }}>
                        <div style={{ textAlign: 'left', display: 'block' }}>URL</div>
                      </th>
                      <th className="action-header">EDIT</th>
                      <th className="action-header">DELETE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="supplier-row">
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(supplier.id)}
                            onChange={() => toggleItem(supplier.id)}
                          />
                        </td>
                        <td className="name-cell">
                          <div className="supplier-name-container">
                            {supplier.logo && (
                              <div className="supplier-logo">
                                <img src={`${contextServiceUrl}${supplier.logo}`} alt={supplier.name} />
                              </div>
                            )}
                            <span className="supplier-name" style={{ color: '#545f71' }}>{supplier.name}</span>
                          </div>
                        </td>
                        <td className="address-cell" style={{ color: '#545f71' }}>{supplier.address}</td>
                        <td className="city-cell" style={{ color: '#545f71' }}>{supplier.city}</td>
                        <td className="country-cell" style={{ color: '#545f71' }}>{supplier.zip}</td>
                        <td className="contact-cell" style={{ color: '#545f71' }}>{supplier.contactName}</td>
                        <td className="phone-cell" style={{ color: '#545f71' }}>{supplier.phoneNumber}</td>
                        <td className="email-cell" style={{ color: '#545f71' }} title={supplier.email}>{supplier.email}</td>
                        <td className="url-cell" style={{ color: '#545f71', textAlign: 'left', paddingLeft: '12px', paddingRight: '20px' }} title={supplier.url}>{supplier.url}</td>
                        <td className="action-cell" style={{ textAlign: 'center' }}>
                          <TableBtn
                            type="edit"
                            navigatePage={`/More/SupplierRegistration/${supplier.id}`}
                            data={supplier.id}
                          />
                        </td>
                        <td className="action-cell" style={{ textAlign: 'center' }}>
                          <TableBtn
                            type="delete"
                            showModal={() => {
                              setEndPoint(`${contextServiceUrl}/contexts/suppliers/${supplier.id}/delete/`);
                              setDeleteModalOpen(true);
                            }}
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
                  <button className="next-btn" disabled={filteredSuppliers.length <= itemsPerPage} style={{ color: '#545f71', border: '1px solid #dee2e6', background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Next</button>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}