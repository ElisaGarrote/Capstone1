import { useState, useEffect, useRef } from "react";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import DueBackFilterModal from "../../components/Modals/DueBackFilterModal";
import Footer from "../../components/Footer";
import dateRelated from "../../utils/dateRelated";
import { RxPerson } from "react-icons/rx";
import { IoWarningOutline, IoLocationOutline } from "react-icons/io5";
import assetsAxios from "../../api/assetsAxios";
import { fetchEmployeeById, fetchLocationById } from "../../services/integration-help-desk-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";

import "../../styles/reports/DueBackReport.css";


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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
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
          
          // Collect unique employee IDs that need fetching
          const unknownEmployeeIds = [
            ...new Set(
              data
                .filter(
                  (item) =>
                    item.checked_out_to_id &&
                    (item.checked_out_to === "Unknown" || !item.checked_out_to)
                )
                .map((item) => item.checked_out_to_id)
            ),
          ];

          // Batch fetch all unknown employees
          const employeeCache = {};
          if (unknownEmployeeIds.length > 0) {
            // Fetch in batches of 10 to avoid overwhelming the server
            const batchSize = 10;
            for (let i = 0; i < unknownEmployeeIds.length; i += batchSize) {
              const batch = unknownEmployeeIds.slice(i, i + batchSize);
              const employeePromises = batch.map(async (empId) => {
                try {
                  const employee = await fetchEmployeeById(empId);
                  return { empId, employee };
                } catch (error) {
                  console.error(`Failed to fetch employee ${empId}:`, error);
                  return { empId, employee: null };
                }
              });

              const results = await Promise.all(employeePromises);
              results.forEach(({ empId, employee }) => {
                employeeCache[empId] = employee;
              });
            }
          }
          
          // Enrich data with cached employee names and location names
          const enrichedData = data.map((item) => {
            let updatedItem = { ...item };
            
            // Add employee name from cache if needed
            if (
              item.checked_out_to_id &&
              (item.checked_out_to === "Unknown" || !item.checked_out_to)
            ) {
              const employee = employeeCache[item.checked_out_to_id];
              updatedItem.checked_out_to = employee
                ? employee.name
                : `Employee #${item.checked_out_to_id}`;
            }
            
            // Add location name from the map
            if (item.location_id && locationMap[item.location_id]) {
              updatedItem.location = locationMap[item.location_id];
            }
            
            return updatedItem;
          });
          
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

  // Apply filters logic
  const applyFilters = (filters) => {
    let filtered = [...reportData];

    if (filters?.checkoutdate) {
      filtered = filtered.filter((row) => {
        if (!row.checkout_date) return false;
        return row.checkout_date === filters.checkoutdate;
      });
    }

    if (filters?.checkindate) {
      filtered = filtered.filter((row) => {
        if (!row.return_date) return false;
        return row.return_date === filters.checkindate;
      });
    }

    return filtered;
  };

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFilters(filters);
    // Apply search on top of date filters
    const searchLower = searchTerm.toLowerCase();
    const finalFiltered = filtered.filter((asset) =>
      asset.asset_id?.toLowerCase().includes(searchLower) ||
      asset.asset_name?.toLowerCase().includes(searchLower) ||
      asset.checked_out_by?.toLowerCase().includes(searchLower) ||
      asset.checked_out_to?.toLowerCase().includes(searchLower)
    );
    return finalFiltered;
  };

  // Filter data based on search term and applied filters
  const filteredData = appliedFilters && Object.keys(appliedFilters).length > 0
    ? handleApplyFilter(appliedFilters)
    : reportData.filter((asset) => {
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
      <DueBackFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={(filters) => {
          setAppliedFilters(filters);
          setCurrentPage(1);
        }}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Due for Checkin Report</h1>
          </section>

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
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  Filter
                </button>
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
