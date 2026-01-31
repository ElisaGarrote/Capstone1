import { useState, useEffect, useRef } from "react";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import DepreciationFilter from "../../components/FilterPanel";
import Footer from "../../components/Footer";
import dateRelated from "../../utils/dateRelated";
import { RxPerson } from "react-icons/rx";
import { IoWarningOutline } from "react-icons/io5";
import assetsAxios from "../../api/assetsAxios";

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

  // Convert to Date objects for comparison
  const isOverdue = new Date(asset.return_date) < new Date(currentDate);
  const dayDifference = Math.floor(
    (new Date(currentDate) - new Date(asset.return_date)) /
      (1000 * 60 * 60 * 24)
  );

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
      <td>{dateRelated.formatDate(asset.checkout_date)}</td>
      <td
        title={
          isOverdue &&
          `This checkin date is overdue by ${dayDifference} ${
            dayDifference > 1 ? "days" : "day"
          }.`
        }
      >
        <div className="icon-td">
          {isOverdue && <IoWarningOutline />}
          <span
            style={{
              color: isOverdue ? "red" : "#333333",
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
        const response = await assetsAxios.get("/due-checkin-report/");
        if (response.data.success) {
          setReportData(response.data.data);
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
                <div className="loading-message" style={{ textAlign: "center", padding: "2rem" }}>
                  Loading report data...
                </div>
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
                        <td colSpan={5} className="no-data-message">
                          {searchTerm ? "No assets found matching your search." : "No overdue assets found."}
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
