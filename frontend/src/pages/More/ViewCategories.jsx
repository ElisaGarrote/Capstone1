import { useState } from "react";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import "../../styles/Category.css";
import MediumButtons from "../../components/buttons/MediumButtons";

// icons
import keyboardIcon from "../../assets/img/keyboard_Icon.png";
import chargerIcon from "../../assets/img/charger_Icon.png";
import cablesIcon from "../../assets/img/cables_Icon.png";
import paperprinterIcon from "../../assets/img/paperprinter_Icon.png";
import printerinkIcon from "../../assets/img/printerink_Icon.png";

// mock data
const categories = [
  {
    id: 1,
    icon: cablesIcon,
    name: "Cables",
    type: "Accessory",
    quantity: 2,
  },
  {
    id: 2,
    icon: chargerIcon,
    name: "Charger",
    type: "Accessory",
    quantity: 1,
  },
  {
    id: 3,
    icon: keyboardIcon,
    name: "Keyboards",
    type: "Accessory",
    quantity: 2,
  },
  {
    id: 4,
    icon: paperprinterIcon,
    name: "Printer Paper",
    type: "Consumable",
    quantity: 262,
  },
  {
    id: 5,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 6,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 7,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 8,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 9,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 10,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 11,
    icon: printerinkIcon,
    name: "Printer",
    type: "Consumable",
    quantity: 95,
  },
];

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          name="checkbox-category"
          id="checkbox-category"
        />
      </th>
      <th>NAME</th>
      <th>TYPE</th>
      <th>QUANTITY</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ category }) {
  return (
    <tr>
      <td>
        <div className="checkbox-category">
          <input type="checkbox" name="" id="" />
        </div>
      </td>
      <td>
        <div className="category-name">
          <img src={category.icon} alt={category.name} />
          {category.name}
        </div>
      </td>
      <td>{category.type}</td>
      <td>{category.quantity}</td>
      <td>
        <section className="action-button-section">
          <button title="Edit" className="action-button">
            {/* edit */}
            <i className="fas fa-edit"></i>
          </button>
          <button title="Delete" className="action-button">
            {/* delete */}
            <i className="fas fa-trash-alt"></i>
          </button>
        </section>
      </td>
    </tr>
  );
}

export default function Category() {
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  return (
    <>
      <section>
        <nav>
          <NavBar />
        </nav>
        <main className="page-layout">
          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Categories ({categories.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                />
                <MediumButtons type="export" />
                <MediumButtons
                  type="new"
                  navigatePage="/More/CategoryRegistration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <table>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {paginatedCategories.map((category, index) => (
                  <TableItem key={index} category={category} />
                ))}
              </tbody>
            </table>

            {/* Table pagination */}
            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={categories.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </section>
        </main>
      </section>
    </>
  );
}
