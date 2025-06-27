import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/custom-colors.css';
import '../../styles/PageTable.css';
import '../../styles/GlobalTableStyles.css';
import '../../styles/ViewManufacturer.css';
import '../../styles/TableButtons.css';
import '../../styles/ManufacturerNotesFix.css';
import DeleteModal from '../../components/Modals/DeleteModal';
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import Alert from "../../components/Alert";
import contextsService from "../../services/contexts-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import DefaultImage from "../../assets/img/default-image.jpg";


export default function ViewManufacturers() {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const contextServiceUrl = "https://contexts-service-production.up.railway.app";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const manufacturerRes = await contextsService.fetchAllManufacturers();
        const mapped = (manufacturerRes || []).map(manu => ({
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
      const mapped = (res || []).map(manu => ({
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

  const filteredManufacturers = manufacturers.filter(manufacturer =>
    manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
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
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0', color: '#545f71' }}>
                  Manufacturers ({manufacturers.length})
                </h1>
                <div>
                  <form action="" method="post" style={{ marginRight: '10px' }}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="search-inpaut"
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
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th style={{ width: '20%' }}>NAME</th>
                      <th style={{ width: '15%' }}>URL</th>
                      <th style={{ width: '15%' }}>SUPPORT URL</th>
                      <th style={{ width: '10%' }}>PHONE</th>
                      <th style={{ width: '15%' }}>EMAIL</th>
                      <th className="notes-header" style={{ width: '15%', textAlign: 'left', paddingLeft: '12px' }}>
                        <div style={{ textAlign: 'left', display: 'block' }}>NOTES</div>
                      </th>
                      <th style={{ width: '40px', textAlign: 'center', paddingLeft: '12px', paddingRight: '12px' }}>EDIT</th>
                      <th style={{ width: '40px', textAlign: 'center', paddingLeft: '12px', paddingRight: '12px' }}>DELETE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredManufacturers.map((manufacturer) => (
                      <tr key={manufacturer.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(manufacturer.id)}
                            onChange={() => toggleItem(manufacturer.id)}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '0' }}>
                              <img
                                src={manufacturer.logo ? `${contextServiceUrl}${manufacturer.logo}` : DefaultImage}
                                alt={manufacturer.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = DefaultImage;
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
                        <td style={{ color: '#545f71' }}>{manufacturer.url}</td>
                        <td style={{ color: '#545f71' }}>{manufacturer.supportUrl}</td>
                        <td style={{ color: '#545f71' }}>{manufacturer.phone}</td>
                        <td style={{ color: '#545f71' }}>{manufacturer.email}</td>
                        <td style={{ color: '#545f71', textAlign: 'left', paddingLeft: '12px' }}>{manufacturer.notes}</td>
                        <td style={{ textAlign: 'center' }}>
                          <TableBtn
                            type="edit"
                            navigatePage={`/More/ManufacturerRegistration/${manufacturer.id}`}
                            data={manufacturer.id}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <TableBtn
                            type="delete"
                            showModal={() => {
                              setEndPoint(`${contextServiceUrl}/contexts/manufacturers/${manufacturer.id}/delete/`);
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
                  <span>Show</span>
                  <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>items per page</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="prev-btn" disabled={currentPage === 1}>Prev</button>
                  <span className="page-number" style={{ width: '30px', height: '30px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentPage}
                  </span>
                  <button className="next-btn" disabled={filteredManufacturers.length <= itemsPerPage}>Next</button>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
