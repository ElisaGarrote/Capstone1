import "../styles/custom-colors.css";
import "../styles/UpcomingEndOfLife.css";  // Reusing the same CSS for consistent styling
import "../styles/ExpiredWarranties.css"; // Specific styles for this page
import NavBar from "../components/NavBar";
import TableBtn from "../components/buttons/TableButtons";
import MediumButtons from "../components/buttons/MediumButtons";
import Status from "../components/Status";
import macbook from "../assets/img/macbook.png";
import CheckboxFix from "../components/CheckboxFix";

export default function ExpiredWarranties() {
  const items = [
    {
      id: "105900",
      image: macbook,
      product: "Macbook Pro 14\"",
      status: { type: "deployed", text: "Deployed", personName: "Pia Platos-Lim" },
      checkoutIn: { direction: "out", icon: "<" },
      assetName: "KWS/AALUM/19/VUW",
      serial: "A2345M",
      warranty: "Expired",
      endOfLife: "11 days left",
      purchaseDate: "April 2, 2025",
      purchaseCost: "₱ 20,990",
      category: "Laptops",
      location: "Makati",
      notes: "-"
    },
    {
      id: "107800",
      image: macbook,
      product: "Surface Laptop 5",
      status: { type: "lost", text: "Lost or Stolen" },
      checkoutIn: { direction: "in", icon: ">" },
      assetName: "KWS/AALUM/19/VUW",
      serial: "A2345M",
      warranty: "Expired",
      endOfLife: "11 days left",
      purchaseDate: "April 2, 2025",
      purchaseCost: "₱ 20,990",
      category: "Laptops",
      location: "Makati",
      notes: "-"
    }
  ];

  return (
    <div className="eol-container">
      <CheckboxFix />
      <NavBar />
      <main className="eol-content">
        <div className="eol-table-section">
          <div className="table-header">
            <div className="header-with-status">
              <h2>Expired Warranties (2)</h2>
              <div className="status-indicators">
                <div className="status-pill available">
                  Available: 1
                </div>
                <div className="status-pill deployed">
                  Deployed: 1
                </div>
              </div>
            </div>
            <div className="table-actions">
              <input type="text" placeholder="Search..." className="search-input" />
              <MediumButtons type="export" navigatePage="" />
              <MediumButtons type="new" navigatePage="/expired-warranties/new" />
            </div>
          </div>

          <div className="table-scroll-container">
            <table className="eol-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>IMAGE</th>
                  <th>ID</th>
                  <th>PRODUCT</th>
                  <th>STATUS</th>
                  <th>CHECKOUT/IN</th>
                  <th>ASSET NAME</th>
                  <th>SERIAL</th>
                  <th>WARRANTY</th>
                  <th>END OF LIFE</th>
                  <th>PURCHASE DATE</th>
                  <th>PURCHASE COST</th>
                  <th>CATEGORY</th>
                  <th>LOCATION</th>
                  <th>NOTES</th>
                  <th>EDIT</th>
                  <th>DELETE</th>
                  <th>VIEW</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><input type="checkbox" /></td>
                    <td>
                      <img src={item.image} alt={item.product} className="product-image" />
                    </td>
                    <td>{item.id}</td>
                    <td>{item.product}</td>
                    <td>
                      <Status
                        type={item.status.type}
                        name={item.status.text}
                        personName={item.status.personName}
                        location={item.status.location}
                      />
                    </td>
                    <td>
                      <TableBtn
                        type={item.checkoutIn.direction === "out" ? "checkin" : "checkout"}
                        navigatePage={`/expired-warranties/${item.checkoutIn.direction === "out" ? "checkin" : "checkout"}/${item.id}`}
                      />
                    </td>
                    <td>{item.assetName}</td>
                    <td>{item.serial}</td>
                    <td>{item.warranty}</td>
                    <td>{item.endOfLife}</td>
                    <td>{item.purchaseDate}</td>
                    <td>{item.purchaseCost}</td>
                    <td>{item.category}</td>
                    <td>{item.location}</td>
                    <td>{item.notes}</td>
                    <td>
                      <TableBtn type="edit" navigatePage={`/expired-warranties/edit/${item.id}`} />
                    </td>
                    <td>
                      <TableBtn type="delete" navigatePage="" />
                    </td>
                    <td>
                      <TableBtn type="view" navigatePage={`/expired-warranties/view/${item.id}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}