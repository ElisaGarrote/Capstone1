import React, { useState } from "react";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import SampleImage from "../../assets/img/dvi.jpeg";
import MediumButtons from "../../components/buttons/MediumButtons";

const sampleItems = [
  {
    id: 1,
    name: "HDMI Cable",
    model: "HDMI-1234",
    category: "Cables",
    manufacturer: "Anker",
    endOfLife: "2027-12-31",
    image: SampleImage,
  },
  {
    id: 2,
    name: "USB Hub",
    model: "USB-5678",
    category: "Adapters",
    manufacturer: "Belkin",
    endOfLife: "2026-06-30",
    image: SampleImage,
  },
];

export default function Products() {
  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === sampleItems.length;

  const toggleSelectAll = () => {
    if (allChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(sampleItems.map((item) => item.id));
    }
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="page">
        <div className="container">
          <section className="top">
            <h1>Products</h1>
            <div>
              <form action="" method="post">
                <input type="text" placeholder="Search..." />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/products/registration" />
            </div>
          </section>
          <section className="middle">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>IMAGE</th>

                  <th>NAME</th>
                  <th>MODEL NUMBER</th>
                  <th>CATEGORY</th>
                  <th>MANUFACTURER</th>
                  <th>END OF LIFE</th>

                  <th>EDIT</th>
                  <th>DELETE</th>
                  <th>VIEW</th>
                </tr>
              </thead>
              <tbody>
                {sampleItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                    </td>
                    <td>
                      <img src={item.image} alt={item.name} width="50" />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.model}</td>
                    <td>{item.category}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.endOfLife}</td>
                    <td>
                      <TableBtn type="edit" navigatePage="" />
                    </td>
                    <td>
                      <TableBtn type="delete" navigatePage="" />
                    </td>
                    <td>
                      <TableBtn type="view" navigatePage="" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}
