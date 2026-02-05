import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoWarningOutline } from "react-icons/io5";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import EndOfLifeWarrantyFilterModal from "../../components/Modals/EndOfLifeWarrantyFilterModal";
import api from "../../api";
import MockupData from "../../data/mockData/reports/end-of-life-mockup-data.json";
// base for assets service (prefer specific env, fallback to general API)
const assetsBase = import.meta.env.VITE_ASSETS_API_URL || import.meta.env.VITE_API_URL || "/api/assets/";
import Pagination from "../../components/Pagination";
import dateRelated from "../../utils/dateRelated";
import Footer from "../../components/Footer";
import "../../styles/UpcomingEndOfLife.css";

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>ASSET</th>
      <th>STATUS</th>
      <th>LOCATION</th>
      <th>END OF LIFE DATE</th>
      <th>WARRANTY EXPIRATION DATE</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ asset, onDeleteClick }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    const formattedDate = formatter.format(today);
    setCurrentDate(formattedDate);
  }, []);

  const warrantyDate = asset.warrantyExpiration || "";
  const isExpired = warrantyDate ? new Date(warrantyDate) < new Date(currentDate) : false;
  let dayDifference = 0;
  if (isExpired) {
    const diff = Math.floor((new Date(currentDate) - new Date(warrantyDate)) / (1000 * 60 * 60 * 24));
    dayDifference = Number.isFinite(diff) ? diff : 0;
  }

  return (
    <tr>
      <td>
        {asset.assetId} - {asset.product}
      </td>
      <td>
        <Status
          type={asset.statusType}
          name={asset.statusName}
          {...(asset.deployedTo && { personName: asset.deployedTo })}
        />
      </td>
      <td>{asset.location}</td>
      <td>{dateRelated.formatDate(asset.endOfLifeDate)}</td>
      <td
        title={
          isExpired && `Warranty expired ${dayDifference} ${dayDifference > 1 ? "days" : "day"} ago.`
        }
      >
          <div className="icon-td">
            {isExpired && <IoWarningOutline />}
            <span
              title={
                isExpired
                  ? `Beyond warranty by ${dayDifference} ${dayDifference > 1 ? "days" : "day"}`
                  : ""
              }
              style={{ color: isExpired ? "red" : "#333333" }}
            >
              {dateRelated.formatDate(asset.warrantyExpiration)}
            </span>
          </div>
      </td>
    </tr>
  );
}

export default function EndOfLifeWarrantyReport() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const toggleRef = useRef(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const [allData, setAllData] = useState(MockupData);
  const [filteredData, setFilteredData] = useState(MockupData);
  const paginatedDepreciation = filteredData.slice(startIndex, endIndex);

  // Apply filters logic
  const applyFilters = (filters) => {
    let filtered = [...allData];

    if (filters?.status?.value) {
      filtered = filtered.filter(
        (row) =>
          row.statusType?.toLowerCase() === filters.status.value?.toLowerCase()
      );
    }

    if (filters?.checkoutDate) {
      filtered = filtered.filter((row) => {
        if (!row.checkoutDate) return false;
        return row.checkoutDate === filters.checkoutDate;
      });
    }

    if (filters?.checkinDate) {
      filtered = filtered.filter((row) => {
        if (!row.checkinDate) return false;
        return row.checkinDate === filters.checkinDate;
      });
    }

    if (filters?.warrantyExpirationDate) {
      filtered = filtered.filter((row) => {
        if (!row.warrantyExpiration) return false;
        return row.warrantyExpiration === filters.warrantyExpirationDate;
      });
    }

    return filtered;
  };

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const next = applyFilters(filters);
    setFilteredData(next);
    setCurrentPage(1);
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      const url = `${assetsBase}reports/eol-warranty/?format=json`;
      try {
        let resp;
        try {
          resp = await api.get(url.replace(import.meta.env.VITE_API_URL || "", ""));
        } catch (e) {
          // fallback to direct fetch
          resp = await fetch(url);
          const data = await resp.json();
          if (!cancelled) {
            const rows = data.results || [];
            rows.sort((a, b) => {
              const pa = a.warrantyExpiration ? new Date(a.warrantyExpiration).getTime() : Number.MAX_SAFE_INTEGER;
              const pb = b.warrantyExpiration ? new Date(b.warrantyExpiration).getTime() : Number.MAX_SAFE_INTEGER;
              return pa - pb;
            });
            setAllData(rows);
            setFilteredData(rows);
            setIsLoading(false);
          }
          return;
        }

        if (!cancelled && resp && resp.data) {
          const data = resp.data.results || resp.data || [];
          data.sort((a, b) => {
            const pa = a.warrantyExpiration ? new Date(a.warrantyExpiration).getTime() : Number.MAX_SAFE_INTEGER;
            const pb = b.warrantyExpiration ? new Date(b.warrantyExpiration).getTime() : Number.MAX_SAFE_INTEGER;
            return pa - pb;
          });
          setAllData(data);
          setFilteredData(data);
          setIsLoading(false);
        }
      } catch (e) {
        // keep mock data on error
        setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);

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
      <EndOfLifeWarrantyFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>End of Life & Warranty Report</h1>
          </section>

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset ({filteredData.length})</h2>
              <section className="table-actions">
                <input type="search" placeholder="Search..." className="search" />
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
            <section className="eof-warranty-report-table-section">
              {exportToggle && (
                <section className="export-button-section" ref={exportRef}>
                  <button>Download as Excel</button>
                  <button>Download as PDF</button>
                  <button>Download as CSV</button>
                </section>
              )}
            {isLoading ? (
              <SkeletonLoadingTable />
            ) : (
              <table>
                <thead>
                  <TableHeader />
                </thead>
                <tbody>
                  {paginatedDepreciation.length > 0 ? (
                    paginatedDepreciation.map((asset, index) => (
                      <TableItem
                        key={index}
                        asset={asset}
                        onDeleteClick={() => setDeleteModalOpen(true)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="no-data-message">
                        No end of life & warranty found.
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
              totalItems={allData.length}
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
