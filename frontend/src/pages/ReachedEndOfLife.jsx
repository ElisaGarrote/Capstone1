import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Status from "../components/Status";
import MediumButtons from "../components/buttons/MediumButtons";
import ActionButtons from "../components/ActionButtons";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import DefaultImage from "../assets/img/default-image.jpg";
import api from "../api";

import "../styles/UpcomingEndOfLife.css";

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>IMAGE</th>
      <th>ID</th>
      <th>PRODUCT</th>
      <th>STATUS</th>
      <th>ASSET NAME</th>
      <th>SERIAL</th>
      <th>WARRANTY</th>
      <th>END OF LIFE</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem component to render each row
function TableItem({ item, onViewClick }) {
  // Resolve image URL similar to UpcomingEndOfLife
  let imgSrc = DefaultImage;
  if (item.image) {
    try {
      const gateway = import.meta.env.VITE_API_GATEWAY_URL || "";
      if (/^https?:\/\//i.test(item.image)) {
        const pathOnly = item.image.replace(/^https?:\/\/[^/]+/i, "");
        imgSrc = `${gateway.replace(/\/$/, "")}/api/assets${pathOnly}`;
      } else if (/^\//.test(item.image)) {
        imgSrc = `${gateway.replace(/\/$/, "")}/api/assets${item.image}`;
      } else {
        imgSrc = item.image;
      }
    } catch (e) {
      imgSrc = item.image;
    }
  }

  const statusType = (item.statusType || item.status?.type || "").toLowerCase();
  const statusName = item.status || item.status?.text;
  const showPerson = statusType === "deployed";

  return (
    <tr>
      <td>
        <img src={imgSrc} alt={item.product} className="table-img" />
      </td>
      <td>{item.assetId || item.id}</td>
      <td>{item.product}</td>
      <td>
        <Status
          type={statusType}
          name={statusName}
          personName={showPerson ? (item.checkedOutTo || item.status?.personName) : undefined}
        />
      </td>
      <td>{item.assetName}</td>
      <td>{item.serialNumber || item.serial || ""}</td>
      <td>{item.warranty || ""}</td>
      <td>{item.endOfLife || ""}</td>
      <td>
        <ActionButtons
          showView
          showEdit={false}
          showDelete={false}
          onViewClick={() => onViewClick(item)}
        />
      </td>
    </tr>
  );
}

export default function ReachedEndOfLife() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const apiPath = "/assets/reports/reached-eol/?format=json";
        let resp;
        try {
          // axios baseURL is VITE_API_URL (e.g. http://localhost/api)
          resp = await api.get(apiPath);
        } catch (e) {
          // Fallback: build full URL using service-specific env or gateway
          const assetsBase = import.meta.env.VITE_ASSETS_API_URL || (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL + "/assets/") : "");
          const fullUrl = assetsBase.replace(/\/$/, "") + "/reports/reached-eol/?format=json";
          const fetchResp = await fetch(fullUrl);
          const data = await fetchResp.json();
          if (cancelled) return;
          const rows = data.results || [];
          rows.sort((a, b) => {
            const pa = a.endOfLife ? new Date(a.endOfLife).getTime() : Number.MAX_SAFE_INTEGER;
            const pb = b.endOfLife ? new Date(b.endOfLife).getTime() : Number.MAX_SAFE_INTEGER;
            return pa - pb;
          });
          setAllData(rows);
          return;
        }

        if (resp && resp.data) {
          const rows = resp.data.results || resp.data || [];
          rows.sort((a, b) => {
            const pa = a.endOfLife ? new Date(a.endOfLife).getTime() : Number.MAX_SAFE_INTEGER;
            const pb = b.endOfLife ? new Date(b.endOfLife).getTime() : Number.MAX_SAFE_INTEGER;
            return pa - pb;
          });
          if (!cancelled) setAllData(rows);
        }
      } catch (err) {
        console.error('Failed to load reached EoL', err);
      }
    }
    fetchData();
    return () => { cancelled = true };
  }, []);

  const items = allData;

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  const handleViewClick = (item) => {
    navigate(`/assets/view/${item.id}`);
  };

  return (
    <>
      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Reached End of Life</h1>
          </section>

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Assets ({items.length})</h2>
              <section className="table-actions">
                <input type="search" placeholder="Search..." className="search" />
                <MediumButtons type="export" navigatePage="" />
              </section>
            </section>

            {/* Table Structure */}
            <section className="assets-table-section">
              <table>
                <thead>
                  <TableHeader />
                </thead>
                <tbody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <TableItem
                        key={item.id}
                        item={item}
                        onViewClick={handleViewClick}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Items Found.
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
                totalItems={items.length}
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