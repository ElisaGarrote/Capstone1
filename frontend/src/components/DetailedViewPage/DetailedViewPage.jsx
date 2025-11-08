import "../../styles/DetailedViewPage.css";
import Status from "../Status";
import DefaultProfile from "../../assets/img/default-profile.svg";
import DefaultImage from "../../assets/img/default-image.jpg";
import Pagination from "../Pagination";
import ActionButtons from "../ActionButtons";
import TableBtn from "../buttons/TableButtons";
import MediumButtons from "../buttons/MediumButtons";
import UploadButton from "../buttons/UploadButton";
import ConfirmationModal from "../Modals/DeleteModal";
import UploadModal from "../Modals/UploadModal";
import View from "../Modals/View";
import Footer from "../Footer";
import { useState, useEffect } from "react";
import { historyData, componentsData, repairsData, auditsDuplicateData, attachmentsData } from "../../data/detailedviewpage/mockData";

export default function DetailedViewPage({
  breadcrumbRoot,
  breadcrumbCurrent,
  breadcrumbRootPath,
  title,
  subtitle,
  assetImage,
  assetTag,
  status,
  statusType = "ready-to-deploy",
  company,
  checkoutDate,
  nextAuditDate,
  manufacturer,
  manufacturerUrl,
  supportUrl,
  supportPhone,
  category,
  model,
  modelNo,
  productName,
  serialNumber,
  assetType,
  supplier,
  depreciationType,
  fullyDepreciatedDate,
  location,
  warrantyDate,
  endOfLife,
  orderNumber,
  purchaseDate,
  purchaseCost,
  // Smartphone specific
  imeiNumber,
  connectivity,
  // Laptop specific
  ssdEncryptionStatus,
  cpu,
  gpu,
  operatingSystem,
  ram,
  screenSize,
  storageSize,
  notes,
  createdAt,
  updatedAt,
  tabs = [],
  activeTab = 0,
  actionButtons,
  checkedOutTo,
  onTabChange,
  children
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);
  const [activeAuditTab, setActiveAuditTab] = useState('pending');
  const [isAuditDeleteModalOpen, setAuditDeleteModalOpen] = useState(false);
  const [auditDeleteId, setAuditDeleteId] = useState(null);
  const [isAuditViewModalOpen, setAuditViewModalOpen] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  // Generate QR code when component mounts
  useEffect(() => {
    const generateQRCode = () => {
      try {
        // Create structured asset details for QR code
        const qrData = `Asset ID: ${assetTag}
Asset Serial Number: ${serialNumber || 'N/A'}
Asset Model: ${productName || model}
Category: ${category}
Supplier: ${supplier || 'N/A'}
Manufacturer: ${manufacturer}
Depreciation Type: ${depreciationType || 'N/A'}
Warranty: ${warrantyDate || 'N/A'}
End of Life: ${endOfLife || 'N/A'}
Order Number: ${orderNumber || 'N/A'}
Purchase Date: ${purchaseDate || 'N/A'}
Purchase Cost: ${purchaseCost || 'N/A'}${assetType === 'Smartphone' ? `
IMEI Number: ${imeiNumber || 'N/A'}
Connectivity: ${connectivity || 'N/A'}
Operating System: ${operatingSystem || 'N/A'}
Storage Size: ${storageSize || 'N/A'}` : ''}${assetType === 'Laptop' ? `
SSD Encryption Status: ${ssdEncryptionStatus || 'N/A'}
CPU: ${cpu || 'N/A'}
GPU: ${gpu || 'N/A'}
RAM: ${ram || 'N/A'}
Screen Size: ${screenSize || 'N/A'}
Operating System: ${operatingSystem || 'N/A'}
Storage Size: ${storageSize || 'N/A'}` : ''}
Notes: ${notes || 'N/A'}
Created At: ${createdAt || 'N/A'}
Updated At: ${updatedAt || 'N/A'}`;

        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&ecc=L&data=${encodeURIComponent(qrData)}`;

        setQrCodeUrl(qrApiUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [assetTag, serialNumber, productName, model, category, manufacturer, location]);

  // Handle Print QR functionality
  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    const assetInfo = {
      assetId: assetTag,
      serialNumber: serialNumber || 'N/A',
      productName: productName || model,
      propertyOf: 'MAP Active Philippines'
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>Asset QR Code - ${assetTag}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
              margin: 0;
            }
            .qr-container {
              border: 2px solid #333;
              padding: 20px;
              display: inline-block;
              margin: 20px;
            }
            .qr-container img {
              width: 200px;
              height: 200px;
              display: block;
            }
            .asset-info {
              margin-top: 15px;
              font-size: 14px;
            }
            .property-text {
              font-style: italic;
              margin-top: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="Asset QR Code" onload="window.print();" onerror="window.print();" />
            <div class="asset-info">
              <div><strong>Asset ID:</strong> ${assetInfo.assetId}</div>
              <div><strong>Serial Number:</strong> ${assetInfo.serialNumber}</div>
              <div><strong>Product:</strong> ${assetInfo.productName}</div>
              <div class="property-text">${assetInfo.propertyOf}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  return (
    <>
    <main className="detailed-view-layout">
      {/* Breadcrumb Navigation */}
      <section className="detailed-breadcrumb">
        <ul>
          <li>
            <a href={breadcrumbRootPath}>{breadcrumbRoot}</a>
          </li>
          <li>{breadcrumbCurrent}</li>
        </ul>
      </section>

      {/* Page Title */}
      <section className="detailed-title-section">
        <div className="title-with-image">
          <img
            src={assetImage || DefaultImage}
            alt="Asset"
            className="asset-title-image"
            onError={(e) => { e.target.src = DefaultImage; }}
          />
          <div className="title-text">
            <h1>{title}</h1>
            {subtitle && <span className="detailed-subtitle">{subtitle}</span>}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="detailed-tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange(index)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Main Content Area */}
      <section className={`detailed-content-wrapper ${activeTab === 3 || activeTab === 4 || activeTab === 5 ? 'full-width' : ''}`}>
        {/* Left Content - Asset Details */}
        <section className={`detailed-main-content ${activeTab === 3 || activeTab === 4 || activeTab === 5 ? 'hidden' : ''}`}>
          {/* About Asset Section */}
          {activeTab === 0 && (
            <div className="about-section">
              {/* QR Section */}
              <div className="qr-section">
                <div className="qr-code-container">
                  <div className="qr-code-placeholder">
                    <div className="qr-code">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="Asset QR Code"
                          className="qr-code-image"
                        />
                      ) : (
                        <div className="qr-placeholder">Generating QR Code...</div>
                      )}
                    </div>
                  </div>
                  <div className="qr-info">
                    <div className="qr-detail">
                      <strong>Serial Number:</strong> {serialNumber || assetTag}
                    </div>
                    <div className="qr-detail">
                      <strong>Asset ID:</strong> {assetTag}
                    </div>
                    <div className="qr-detail property-text">
                      Property of MAP Active Philippines
                    </div>
                    <button className="print-qr-btn" onClick={handlePrintQR}>
                      <i className="fas fa-print"></i> Print QR
                    </button>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="asset-details-section">
                <h3 className="section-header">Details</h3>
                <div className="asset-details-grid">
                  <div className="detail-row">
                    <label>Asset ID</label>
                    <span>{assetTag}</span>
                  </div>

                  <div className="detail-row">
                    <label>Asset Serial Number</label>
                    <span>{serialNumber || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Asset Model / Product Name</label>
                    <span>{productName || model}</span>
                  </div>

                  <div className="detail-row">
                    <label>Category</label>
                    <span>{category}</span>
                  </div>

                  <div className="detail-row">
                    <label>Supplier</label>
                    <span>{supplier || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Manufacturer</label>
                    <div className="manufacturer-links">
                      <div>
                        <span>{manufacturer}</span>
                      </div>
                      {manufacturerUrl && (
                        <div>
                          <a href={manufacturerUrl} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-external-link-alt"></i> {manufacturerUrl}
                          </a>
                        </div>
                      )}
                      {supportUrl && (
                        <div>
                          <a href={supportUrl} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-external-link-alt"></i> {supportUrl}
                          </a>
                        </div>
                      )}
                      {supportPhone && (
                        <div>
                          <a href={`tel:${supportPhone}`}>
                            <i className="fas fa-phone"></i> {supportPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-row">
                    <label>Depreciation Type</label>
                    <span>{depreciationType || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Fully Depreciated</label>
                    <span>{fullyDepreciatedDate || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Location</label>
                    <span>{location || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Warranty</label>
                    <span>{warrantyDate || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>End of Life</label>
                    <span>{endOfLife || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Order Number</label>
                    <span>{orderNumber || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Purchase Date</label>
                    <span>{purchaseDate || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Purchase Cost</label>
                    <span>{purchaseCost || 'N/A'}</span>
                  </div>

                  {/* Smartphone specific fields */}
                  {assetType === 'Smartphone' && (
                    <>
                      <div className="detail-row">
                        <label>IMEI Number</label>
                        <span>{imeiNumber || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>Connectivity</label>
                        <span>{connectivity || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>Operating System</label>
                        <span>{operatingSystem || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>Storage Size</label>
                        <span>{storageSize || 'N/A'}</span>
                      </div>
                    </>
                  )}

                  {/* Laptop specific fields */}
                  {assetType === 'Laptop' && (
                    <>
                      <div className="detail-row">
                        <label>SSD Encryption Status</label>
                        <span>{ssdEncryptionStatus || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>CPU</label>
                        <span>{cpu || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>GPU</label>
                        <span>{gpu || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>Operating System</label>
                        <span>{operatingSystem || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>RAM</label>
                        <span>{ram || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>Screen Size</label>
                        <span>{screenSize || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <label>Storage Size</label>
                        <span>{storageSize || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Fields Section */}
              <div className="additional-fields-section">
                <h3 className="section-header">Additional Fields</h3>
                <div className="asset-details-grid">
                  <div className="detail-row">
                    <label>Notes</label>
                    <span>{notes || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Created At</label>
                    <span>{createdAt || 'N/A'}</span>
                  </div>

                  <div className="detail-row">
                    <label>Updated At</label>
                    <span>{updatedAt || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tab content will go here */}
          {activeTab !== 0 && activeTab !== 1 && activeTab !== 2 && activeTab !== 3 && activeTab !== 4 && activeTab !== 5 && (
            <div className="tab-content">
              <p>No data available.</p>
            </div>
          )}

          {/* Custom Children Content */}
          {children}
        </section>

        {/* History Tab - Outside of detailed-main-content */}
        {activeTab === 1 && (() => {

          const startIndex = (historyCurrentPage - 1) * historyPageSize;
          const endIndex = startIndex + historyPageSize;
          const paginatedData = historyData.slice(startIndex, endIndex);

          return (
            <div className="history-tab-wrapper">
              <div className="history-tab-header">
                <h3>History</h3>
              </div>
              <section className="history-table-section">
                <table>
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>USER</th>
                      <th>ACTION DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td>{item.user}</td>
                        <td>{item.actionDetails}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section className="history-pagination-section">
                <Pagination
                  currentPage={historyCurrentPage}
                  pageSize={historyPageSize}
                  totalItems={historyData.length}
                  onPageChange={setHistoryCurrentPage}
                  onPageSizeChange={setHistoryPageSize}
                />
              </section>
            </div>
          );
        })()}

        {/* Components Tab - Outside of detailed-main-content */}
        {activeTab === 2 && (() => {

          return (
            <div className="components-tab-wrapper">
              <div className="components-tab-header">
                <h3>Components</h3>
              </div>
              <section className="components-table-section">
                <table>
                  <thead>
                    <tr>
                      <th>COMPONENT</th>
                      <th>CHECKOUT DATE</th>
                      <th>USER</th>
                      <th>NOTES</th>
                      <th>CHECKIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentsData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.component}</td>
                        <td>{item.checkoutDate}</td>
                        <td>{item.user}</td>
                        <td>{item.notes}</td>
                        <td>
                          <ActionButtons
                            showCheckin
                            onCheckinClick={() => {
                              // Navigate to check-in page
                              window.location.href = '/components/check-in/1';
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          );
        })()}

        {/* Repairs Tab - Outside of detailed-main-content */}
        {activeTab === 3 && (() => {

          return (
            <div className="repairs-tab-wrapper">
              <div className="repairs-tab-header">
                <h3>Repairs</h3>
                <div className="repairs-header-controls">
                  <MediumButtons
                    type="new"
                    navigatePage="/repairs/registration"
                    previousPage="/asset-view"
                  />
                </div>
              </div>
              <section className="repairs-table-section">
                <table>
                  <thead>
                    <tr>
                      <th>ASSET</th>
                      <th>TYPE</th>
                      <th>NAME</th>
                      <th>START DATE</th>
                      <th>END DATE</th>
                      <th>COST</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairsData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.asset}</td>
                        <td>{item.type}</td>
                        <td>{item.name}</td>
                        <td>{item.startDate}</td>
                        <td>{item.endDate || 'Ongoing'}</td>
                        <td>{item.cost}</td>
                        <td>
                          <Status
                            value={index}
                            type={item.status === 'Completed' ? 'ready-to-deploy' : 'in-progress'}
                            name={item.status}
                          />
                        </td>
                        <td>
                          <ActionButtons
                            showEdit
                            showDelete
                            showView
                            editPath={`edit/${index}`}
                            editState={{ item, previousPage: "/asset-view" }}
                            onDeleteClick={() => console.log('Delete repair:', index)}
                            onViewClick={() => console.log('View repair:', item)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          );
        })()}

        {/* Attachments Tab - Outside of detailed-main-content */}
        {activeTab === 5 && (() => {
          const handleUploadClick = () => {
            setUploadModalOpen(true);
          };

          const closeUploadModal = () => {
            setUploadModalOpen(false);
          };

          const handleUpload = async (formData) => {
            // Handle file upload logic here
            console.log("Uploading file:", formData);
            // You can send this to your backend API
          };

          return (
            <>
              {isUploadModalOpen && (
                <UploadModal
                  isOpen={isUploadModalOpen}
                  onClose={closeUploadModal}
                  onUpload={handleUpload}
                  title="Upload Attachment"
                />
              )}
              <div className="attachments-tab-wrapper">
                <div className="attachments-tab-header">
                  <h3>Attachments</h3>
                  <div className="attachments-header-controls">
                    <UploadButton
                      onClick={handleUploadClick}
                      label="Upload"
                    />
                  </div>
                </div>
                <section className="attachments-table-section">
                  <table>
                    <thead>
                      <tr>
                        <th>UPLOADED</th>
                        <th>FILE</th>
                        <th>NOTES</th>
                        <th>DELETE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attachmentsData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.uploaded}</td>
                          <td>{item.file}</td>
                          <td>{item.notes}</td>
                          <td>{item.delete}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>
            </>
          );
        })()}

        {/* Audits Tab (Position 4) - Duplicated Audits Table with Navigation */}
        {activeTab === 4 && (() => {

          const currentAuditData = auditsDuplicateData[activeAuditTab] || [];

          const openAuditDeleteModal = (id) => {
            setAuditDeleteId(id);
            setAuditDeleteModalOpen(true);
          };

          const closeAuditDeleteModal = () => {
            setAuditDeleteModalOpen(false);
            setAuditDeleteId(null);
          };

          const confirmAuditDelete = () => {
            console.log("Deleting audit ID:", auditDeleteId);
            closeAuditDeleteModal();
          };

          const handleAuditViewClick = (item) => {
            setSelectedAuditItem(item);
            setAuditViewModalOpen(true);
          };

          const closeAuditViewModal = () => {
            setAuditViewModalOpen(false);
            setSelectedAuditItem(null);
          };

          return (
            <>
              {isAuditDeleteModalOpen && (
                <ConfirmationModal
                  closeModal={closeAuditDeleteModal}
                  actionType="delete"
                  onConfirm={confirmAuditDelete}
                />
              )}

              {isAuditViewModalOpen && selectedAuditItem && (
                <View
                  title={`${selectedAuditItem.asset.name} : ${selectedAuditItem.date}`}
                  data={[
                    { label: "Due Date", value: selectedAuditItem.date },
                    { label: "Asset", value: `${selectedAuditItem.asset.displayed_id} - ${selectedAuditItem.asset.name}` },
                    { label: "Created At", value: selectedAuditItem.created_at },
                    { label: "Notes", value: selectedAuditItem.notes },
                  ]}
                  closeModal={closeAuditViewModal}
                />
              )}

              <div className="audits-duplicate-tab-wrapper">
                <div className="audits-duplicate-tab-header">
                  <h3>Audits</h3>
                  <div className="audits-duplicate-header-controls">
                    <div className="audit-duplicate-tabs">
                      <button
                        className={`audit-duplicate-tab-btn ${activeAuditTab === 'pending' ? 'active' : ''}`}
                        onClick={() => { setActiveAuditTab('pending'); setAuditsCurrentPage(1); }}
                      >
                        Due to be Audited (0)
                      </button>
                      <button
                        className={`audit-duplicate-tab-btn ${activeAuditTab === 'overdue' ? 'active' : ''}`}
                        onClick={() => { setActiveAuditTab('overdue'); setAuditsCurrentPage(1); }}
                      >
                        Overdue for Audit (0)
                      </button>
                      <button
                        className={`audit-duplicate-tab-btn ${activeAuditTab === 'scheduled' ? 'active' : ''}`}
                        onClick={() => { setActiveAuditTab('scheduled'); setAuditsCurrentPage(1); }}
                      >
                        Scheduled Audit (0)
                      </button>
                      <button
                        className={`audit-duplicate-tab-btn ${activeAuditTab === 'completed' ? 'active' : ''}`}
                        onClick={() => { setActiveAuditTab('completed'); setAuditsCurrentPage(1); }}
                      >
                        Completed Audit (0)
                      </button>
                    </div>
                    <div className="audit-duplicate-action-buttons">
                      <MediumButtons
                        type="schedule-audits"
                        navigatePage="/audits/schedule"
                        previousPage="/asset-view"
                      />
                      <MediumButtons
                        type="perform-audits"
                        navigatePage="/audits/new"
                        previousPage="/asset-view"
                      />
                    </div>
                  </div>
                </div>
                <section className="audits-duplicate-table-section">
                  <table>
                    <thead>
                      <tr>
                        <th>DUE DATE</th>
                        <th>ASSET</th>
                        <th>CREATED</th>
                        <th>AUDIT</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAuditData.length > 0 ? (
                        currentAuditData.map((item) => (
                          <tr key={item.id}>
                            <td>{item.date}</td>
                            <td>{item.asset.displayed_id} - {item.asset.name}</td>
                            <td>{new Date(item.created_at).toLocaleDateString()}</td>
                            <td>
                              <TableBtn
                                type="audit"
                                navigatePage="/audits/new"
                                data={item}
                                previousPage="/asset-view"
                              />
                            </td>
                            <td>
                              <ActionButtons
                                showEdit
                                showDelete
                                showView
                                editPath={`edit/${item.id}`}
                                editState={{ item, previousPage: "/asset-view" }}
                                onDeleteClick={() => openAuditDeleteModal(item.id)}
                                onViewClick={() => handleAuditViewClick(item)}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="no-data-message">No audits found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              </div>
            </>
          );
        })()}

        {/* Right Sidebar - Action Buttons */}
        <aside className="detailed-sidebar">
          {/* Action Buttons Section */}
          {actionButtons && (
            <div className="action-buttons-section">
              {actionButtons}
            </div>
          )}

          {/* Checked Out To Section */}
          {checkedOutTo && (
            <div className="checked-out-section">
              <h3>Checked Out To</h3>
              <div className="checked-out-info">
                <div className="user-avatar">
                  <img
                    src={DefaultProfile}
                    alt="User Profile"
                    className="profile-icon"
                  />
                </div>
                <div className="user-details">
                  <div className="user-name">{checkedOutTo.name}</div>
                  <div className="user-email">{checkedOutTo.email}</div>
                  <div className="checkout-date">Checkout Date: {checkedOutTo.checkoutDate}</div>
                </div>
              </div>
            </div>
          )}


        </aside>
      </section>
    </main>
    <Footer />
    </>
  );
}
