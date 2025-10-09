import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import ViewPage from "../../components/View/Viewpage";
import Status from "../../components/Status";
import DefaultImage from "../../assets/img/default-image.jpg";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";
import "../../styles/AssetViewPage.css";
import MediumButtons from "../../components/buttons/MediumButtons";
import DeleteModal from "../../components/Modals/DeleteModal";

function AssetViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [asset, setAsset] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [endPoint, setEndPoint] = useState(null);

  useEffect(() => {
    // Find asset from mockup data
    const foundAsset = MockupData.find((a) => a.id === parseInt(id));
    if (foundAsset) {
      setAsset(foundAsset);
    }
  }, [id]);

  if (!asset) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Asset not found</h2>
        </div>
      </>
    );
  }

  const imageSrc = asset.image
    ? `https://assets-service-production.up.railway.app${asset.image}`
    : DefaultImage;

  // Sidebar content
  const sidebarContent = (
    <>
      <div className="view-info-item">
        <label>Category:</label>
        <p>{asset.category || "-"}</p>
      </div>
      <div className="view-info-item">
        <label>Min. QTY:</label>
        <p>-</p>
      </div>
      <div className="view-info-item">
        <label>Manufacturer:</label>
        <p>https://www.dell.com</p>
      </div>
      <div className="view-info-item">
        <label>Supplier:</label>
        <p>
          <a href="https://www.dell.com/support" target="_blank" rel="noopener noreferrer">
            https://www.dell.com/support
          </a>
        </p>
      </div>
      <div className="view-info-item">
        <label>Model #:</label>
        <p>544 541</p>
      </div>
      <div className="view-info-item">
        <label>Model Name:</label>
        <p>4531794+19629</p>
      </div>
      <div className="view-info-item">
        <label>Depreciation:</label>
        <p>Laptop (4 months)</p>
      </div>
      <div className="view-info-item">
        <label>EOL:</label>
        <p>5 months</p>
      </div>
      <div className="view-info-item">
        <label>Created At:</label>
        <p>2025-08-14 19:09:01 PM</p>
      </div>
      <div className="view-info-item">
        <label>Created By:</label>
        <p>Elias Gamboa</p>
      </div>
    </>
  );

  // Action buttons
  const actionButtons = (
    <>
      <button className="view-action-btn edit" onClick={() => navigate(`/assets/registration/${asset.id}`)}>
        Edit
      </button>
      <button
        className="view-action-btn delete"
        onClick={() => {
          setEndPoint(`https://assets-service-production.up.railway.app/assets/${asset.id}/delete/`);
          setDeleteModalOpen(true);
        }}
      >
        Delete
      </button>
    </>
  );

  return (
    <>
      <NavBar />
      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={() => {
            setDeleteModalOpen(false);
            navigate("/assets");
          }}
          onDeleteFail={() => {
            setDeleteModalOpen(false);
          }}
        />
      )}
      <ViewPage
        breadcrumbRoot="Assets"
        breadcrumbCurrent="Show Asset"
        breadcrumbRootPath="/assets"
        title={`${asset.displayed_id} - ${asset.name}`}
        sidebarContent={sidebarContent}
        actionButtons={actionButtons}
      >
        {/* Main Content - Asset Table */}
        <div className="asset-view-content">
          {/* Top Actions */}
          <div className="asset-view-header">
            <div className="asset-view-tabs">
              <span className="asset-tab-text">Assets (1)</span>
            </div>
            <div className="asset-view-actions">
              <input type="search" placeholder="Search..." className="asset-search" />
            </div>
          </div>

          {/* Asset Table */}
          <div className="asset-view-table-wrapper">
            <table className="asset-view-table">
              <thead>
                <tr>
                  <th>IMAGE</th>
                  <th>ASSET ID</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>LOCATION</th>
                  <th>CHECKED OUT TO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <img src={imageSrc} alt={asset.name} className="asset-thumbnail" onError={(e) => { e.target.src = DefaultImage; }} />
                  </td>
                  <td>{asset.displayed_id}</td>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>
                    <Status type={asset.status.toLowerCase()} name={asset.status} />
                  </td>
                  <td>{asset.location}</td>
                  <td>{asset.checkoutRecord?.requestor || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="asset-view-pagination">
            <span>Showing 1 to 1 of 1 rows</span>
          </div>
        </div>
      </ViewPage>
    </>
  );
}

export default AssetViewPage;