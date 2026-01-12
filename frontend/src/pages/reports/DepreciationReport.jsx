import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import DeleteModal from "../../components/Modals/DeleteModal";
import DepreciationFilterModal from "../../components/Modals/DepreciationFilterModal";
import Footer from "../../components/Footer";
import { exportToExcel } from "../../utils/exportToExcel";
import api from "../../api";
// base for assets service (prefer specific env, fallback to general API)
const assetsBase = import.meta.env.VITE_ASSETS_API_URL || import.meta.env.VITE_API_URL || "/api/assets/";
import "../../styles/reports/DepreciationReport.css";

const filterConfig = [
  {
    type: "select",
    name: "status",
    label: "Status",
    options: [
      { value: "beingrepaired", label: "Being Repaired" },
      { value: "broken", label: "Broken" },
      { value: "deployed", label: "Deployed" },
      { value: "lostorstolen", label: "Lost or Stolen" },
      { value: "pending", label: "Pending" },
      { value: "readytodeploy", label: "Ready to Deploy" },
    ],
  },
  {
    type: "select",
    name: "depreciation",
    label: "Depreciation",
    options: [
      { value: "iphonedepreciation", label: "iPhone Depreciation" },
      { value: "laptopdepreciation", label: "Laptop Depreciation" },
      { value: "tabletdepreciation", label: "Tablet Depreciaton" },
    ],
  },
  {
    type: "number",
    name: "duration",
    label: "Duration Months",
  },
  {
    type: "number",
    name: "monthsleft",
    label: "Months Left",
  },
];

function TableHeader() {
  return (
    <tr>
      <th>ASSET</th>
      <th>STATUS</th>
      <th>DEPRECIATION</th>
      <th>DURATION</th>
      <th>MINIMUM VALUE</th>
      <th>PURCHASE COST</th>
      <th>CURRENT VALUE</th>
      <th>DEPRECIATED</th>
      <th>MONTHLY DEPRECIATION</th>
      <th>MONTHS LEFT</th>
    </tr>
  );
}

function TableItem({ asset, onDeleteClick }) {
  const rawStatus = (asset.statusType || asset.statusName || "").toString().toLowerCase();

  let statusType = rawStatus;
  if (rawStatus.includes("deployed")) {
    statusType = "deployed";
  } else if (rawStatus.includes("ready to deploy") || rawStatus.includes("deployable") || rawStatus.includes("available")) {
    statusType = "deployable";
  } else if (rawStatus.includes("pending")) {
    statusType = "pending";
  } else if (rawStatus.includes("write-off") || rawStatus.includes("write off") || rawStatus.includes("written off")) {
    statusType = "undeployable";
  } else if (rawStatus.includes("lost") || rawStatus.includes("stolen")) {
    statusType = "lost";
  } else if (rawStatus.includes("broken") || rawStatus.includes("repair")) {
    statusType = "undeployable";
  } else if (rawStatus.includes("archive")) {
    statusType = "archived";
  }

  const showPerson = statusType === "deployed" && !!asset.deployedTo;

  return (
    <tr>
      <td>
        {asset.assetId} - {asset.product}
      </td>
      <td>
        <Status
          type={statusType}
          name={asset.statusName}
          {...(showPerson && { personName: asset.deployedTo })}
        />
      </td>
      <td>{asset.depreciationName}</td>
      <td>
        {asset.duration} {asset.duration > 1 ? "months" : "month"}
      </td>
      <td>
        {asset.currency} {asset.minimumValue.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.purchaseCost.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.currentValue.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.depreciated.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.monthlyDepreciation.toFixed(2)}
      </td>
      <td>{asset.monthsLeft}</td>
    </tr>
  );
}

export default function DepreciationReport() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]);

  const applyFilters = (filters) => {
    let filtered = [...allData];

    if (filters?.status) {
      filtered = filtered.filter(
        (row) =>
          row.statusType?.toLowerCase() === filters.status.value?.toLowerCase()
      );
    }

    if (filters?.depreciation) {
      const depFilterVal = (filters.depreciation.label || filters.depreciation.value || "").toLowerCase();
      filtered = filtered.filter((row) => row.depreciationName?.toLowerCase() === depFilterVal);
    }

    if (filters?.duration && String(filters.duration).trim() !== "") {
      const duration = parseInt(filters.duration, 10);
      if (!Number.isNaN(duration)) {
        filtered = filtered.filter((row) => row.duration === duration);
      }
    }

    if (filters?.monthsleft && String(filters.monthsleft).trim() !== "") {
      const monthsLeft = parseInt(filters.monthsleft, 10);
      if (!Number.isNaN(monthsLeft)) {
        filtered = filtered.filter((row) => row.monthsLeft === monthsLeft);
      }
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
    // fetch depreciation report JSON from assets API
    const fetchData = async () => {
      try {
        // the API view supports format=json
        const url = `${assetsBase}reports/depreciation/?format=json`;
        // prefer using api axios instance if base points to gateway; otherwise fallback to direct fetch
        let resp;
        try {
          resp = await api.get(url.replace(import.meta.env.VITE_API_URL || "", ""));
        } catch (e) {
          // fallback direct call
          resp = await fetch(url);
          const data = await resp.json();
          setAllData(data.results || []);
          setFilteredData(data.results || []);
          return;
        }

        if (resp && resp.data) {
          const data = resp.data.results || resp.data || [];
          setAllData(data);
          setFilteredData(data);
        }
      } catch (err) {
        // leave data empty on error; UI will show no results
        console.error('Failed to load depreciation report', err);
      }
    };

    fetchData();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDepreciation = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
  }, []);

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : MockupData;
    exportToExcel(dataToExport, "Depreciation_Report.xlsx");
  };

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
        />
      )}

      <DepreciationFilterModal
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
            <h1>Depreciation Report</h1>
          </section>

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset Depreciation ({filteredData.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                />
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  Filter
                </button>
                <div>
                  <MediumButtons type="export" onClick={handleExport} />
                </div>
              </section>
            </section>

            {/* Table Structure */}
            <section className="depreciation-table-section">
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
                      <td colSpan={10} className="no-data-message">
                        No depreciation found.
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
