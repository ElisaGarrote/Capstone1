import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import ActionButtons from "../../components/ActionButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import TopSecFormPage from "../../components/TopSecFormPage";
import SystemLoading from "../../components/Loading/SystemLoading";
import { fetchComponentCheckoutsByComponent } from "../../services/assets-service";

// TableHeader
function TableHeader() {
  return (
    <tr>
      <th>IMAGE</th>
      <th>CHECKED-OUT TO</th>
      <th>CHECK-OUT DATE</th>
      <th>QUANTITY</th>
      <th>CHECKED-IN</th>
      <th>REMAINING</th>
      <th>STATUS</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
function TableItem({ item, componentName, navigate }) {
  const isFullyReturned = item.is_fully_returned;

  return (
    <tr className={isFullyReturned ? "fully-returned" : ""}>
      <td>
        <img
          src={item.asset_details?.image || DefaultImage}
          alt={item.asset_details?.name || "No Image"}
          onError={(e) => (e.currentTarget.src = DefaultImage)}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      </td>
      <td>{item.asset_details?.asset_id || "N/A"} - {item.asset_details?.name || "N/A"}</td>
      <td>{item.checkout_date}</td>
      <td>{item.quantity}</td>
      <td>{item.total_checked_in}</td>
      <td>{item.remaining_quantity}</td>
      <td>
        <span className={`status-badge ${isFullyReturned ? "status-returned" : "status-active"}`}>
          {isFullyReturned ? "Returned" : "Active"}
        </span>
      </td>
      <td>
        {!isFullyReturned && (
          <ActionButtons
            showCheckin
            onCheckinClick={() =>
              navigate(`/components/check-in/${item.id}`, {
                state: {
                  item: {
                    id: item.id,
                    checkout_date: item.checkout_date,
                    quantity: item.quantity,
                    remaining_quantity: item.remaining_quantity,
                    total_checked_in: item.total_checked_in,
                    asset_displayed_id: item.asset_details?.asset_id,
                  },
                  componentName
                }
              })
            }
          />
        )}
      </td>
    </tr>
  );
}

export default function ComponentCheckedoutList() {
  const navigate = useNavigate();
  const location = useLocation();
  const component = location.state?.item || {};

  const [checkouts, setCheckouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch checkouts for this component
  useEffect(() => {
    const loadCheckouts = async () => {
      if (!component.id) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchComponentCheckoutsByComponent(component.id);
        setCheckouts(data);
      } catch (error) {
        console.error("Error fetching checkouts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCheckouts();
  }, [component.id]);

  // Filter checkouts based on search
  const filteredCheckouts = checkouts.filter((checkout) => {
    const assetId = checkout.asset_details?.asset_id?.toLowerCase() || "";
    const assetName = checkout.asset_details?.name?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return assetId.includes(search) || assetName.includes(search);
  });

  // Calculate totals
  const totalCheckedOut = filteredCheckouts.reduce((sum, c) => sum + c.quantity, 0);
  const activeCheckouts = filteredCheckouts.filter(c => !c.is_fully_returned);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCheckouts = filteredCheckouts.slice(startIndex, endIndex);

  if (isLoading) return <SystemLoading />;

  return (
    <>
      <nav>
        <NavBar />
      </nav>

      <main className="page-layout">
        <section className="top" style={{ marginBottom: "2rem" }}>
          <TopSecFormPage
            root="Components"
            currentPage={`Checked Out ${component.name}`}
            rootNavigatePage="/components"
            title={component.name}
          />
        </section>

        <section className="table-layout">
          <section className="table-header">
            <h2 className="h2">
              {component.name} - Checkouts ({activeCheckouts.length} active / {filteredCheckouts.length} total)
            </h2>
            <section className="table-actions">
              <input
                type="search"
                placeholder="Search by asset..."
                className="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </section>
          </section>

          <section className="table-section">
            <table>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {paginatedCheckouts.length > 0 ? (
                  paginatedCheckouts.map((item) => (
                    <TableItem
                      key={item.id}
                      item={item}
                      componentName={component.name}
                      navigate={navigate}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="no-data-message">
                      No Checkouts Found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="table-pagination">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredCheckouts.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </section>
        </section>
      </main>
    </>
  );
}
