import { useState, useEffect, useRef } from "react";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import DepreciationFilter from "../../components/FilterPanel";
import Footer from "../../components/Footer";
import dateRelated from "../../utils/dateRelated";
import { RxPerson } from "react-icons/rx";
import { IoWarningOutline, IoLocationOutline } from "react-icons/io5";
import assetsAxios from "../../api/assetsAxios";
import { fetchEmployeeById, fetchLocationById } from "../../services/integration-help-desk-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";

import "../../styles/reports/DueBackReport.css";

const filterConfig = [
  {
    type: "date",
    name: "checkoutdate",
    label: "Checkout Date",
  },
  {
    type: "date",
    name: "checkindate",
    label: "Checkin Date",
  },
];

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>ASSET</th>
      <th>CHECKED OUT BY</th>
      <th>CHECKED OUT TO</th>
      <th>LOCATION</th>
      <th>CHECKOUT DATE</th>
      <th>CHECKIN DATE</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ asset }) {
  const [currentDate, setCurrentDate] = useState("");

  // Handle current date
  useEffect(() => {
    const today = new Date();
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options); // "en-CA" ensures YYYY-MM-DD format
    const formattedDate = formatter.format(today); // Format date in Philippines timezone
    setCurrentDate(formattedDate);
  }, []);

  // Use status from backend
  const isOverdue = asset.status === 'overdue';
  const daysUntilDue = asset.days_until_due;
  const absValue = Math.abs(daysUntilDue);

  return (
    <tr>
      <td>
        {asset.asset_id} - {asset.asset_name}
      </td>
      <td>
        <div className="icon-td">
          <RxPerson className="user-icon" />
          <span>{asset.checked_out_by}</span>
        </div>
      </td>
      <td>
        <div className="icon-td">
          <RxPerson className="user-icon" />
          <span>{asset.checked_out_to}</span>
        </div>
      </td>
      <td>
        {asset.location ? (
          <div className="icon-td">
            <IoLocationOutline style={{ color: '#0D6EFD' }} />
            <span>{asset.location}</span>
          </div>
        ) : (
          <span>—</span>
        )}
      </td>
      <td>{dateRelated.formatDate(asset.checkout_date)}</td>
      <td
        title={
          isOverdue
            ? `Overdue by ${absValue} ${absValue !== 1 ? "days" : "day"}`
            : `Due in ${absValue} ${absValue !== 1 ? "days" : "day"}`
        }
      >
        <div className="icon-td">
          {isOverdue && <IoWarningOutline />}
          <span
            style={{
              color: isOverdue ? "red" : daysUntilDue <= 3 ? "orange" : "#333333",
            }}
          >
            {dateRelated.formatDate(asset.return_date)}
          </span>
        </div>
      </td>
    </tr>
  );
}

export default function DueBackReport() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // Data state
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // Fetch data from backend
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch assets due within 30 days
        const response = await assetsAxios.get("/due-checkin-report/?days=30");
        if (response.data.success) {
          const data = response.data.data;
          
          // Collect all unique location IDs for batch fetching
          const locationIds = [...new Set(data.map(item => item.location_id).filter(Boolean))];
          const locationMap = {};

          // Fetch all location names in parallel
          if (locationIds.length > 0) {
            const locationPromises = locationIds.map(locId =>
              fetchLocationById(locId).catch(() => null)
            );
            const locationResults = await Promise.all(locationPromises);
            locationIds.forEach((locId, idx) => {
              locationMap[locId] = locationResults[idx]?.name || `Location ${locId}`;
            });
          }
          
          // Enrich data with employee names and location names
          const enrichedData = await Promise.all(
            data.map(async (item) => {
              try {
                let updatedItem = { ...item };
                
                // Fetch employee name if needed
                if (item.checked_out_to_id && (item.checked_out_to === 'Unknown' || !item.checked_out_to)) {
                  const employee = await fetchEmployeeById(item.checked_out_to_id);
                  updatedItem.checked_out_to = employee ? employee.name : `Employee #${item.checked_out_to_id}`;
                }
                
                // Add location name from the map
                if (item.location_id && locationMap[item.location_id]) {
                  updatedItem.location = locationMap[item.location_id];
                }
                
                return updatedItem;
              } catch (error) {
                console.error(`Failed to enrich data for item:`, error);
                return item;
              }
            })
          );
          
          setReportData(enrichedData);
        } else {
          setError("Failed to load report data");
        }
      } catch (err) {
        console.error("Error fetching due checkin report:", err);
        setError(err.response?.data?.error || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Filter data based on search term
  const filteredData = reportData.filter((asset) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      asset.asset_id?.toLowerCase().includes(searchLower) ||
      asset.asset_name?.toLowerCase().includes(searchLower) ||
      asset.checked_out_by?.toLowerCase().includes(searchLower) ||
      asset.checked_out_to?.toLowerCase().includes(searchLower)
    );
  });

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDepreciation = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportToggle &&
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setExportToggle(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportToggle]);

  return (
    <>
      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Due for Checkin Report</h1>
          </section>

          {/* Table Filter */}
          <DepreciationFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset ({filteredData.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
              </section>
            </section>

            {/* Table Structure */}
            <section className="due-back-report-table-section">
              {exportToggle && (
                <section className="export-button-section" ref={exportRef}>
                  <button>Download as Excel</button>
                  <button>Download as PDF</button>
                  <button>Download as CSV</button>
                </section>
              )}
              
              {loading ? (
                <SkeletonLoadingTable />
              ) : error ? (
                <div className="error-message" style={{ textAlign: "center", padding: "2rem", color: "red" }}>
                  {error}
                </div>
              ) : (
                <table>
                  <thead>
                    <TableHeader />
                  </thead>
                  <tbody>
                    {paginatedDepreciation.length > 0 ? (
                      paginatedDepreciation.map((asset, index) => (
                        <TableItem
                          key={asset.checkout_id || index}
                          asset={asset}
                          onDeleteClick={() => setDeleteModalOpen(true)}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="no-data-message">
                          {searchTerm ? "No assets found matching your search." : "No assets due for check-in within 30 days."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </section>

            {/* Table pagination */}
            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredData.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </section>
        </main>
        <Footer />
      </section>
    </>
  );
}
