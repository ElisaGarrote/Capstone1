import React, { useState } from "react";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import SampleImage from "../../assets/img/dvi.jpeg";
import MediumButtons from "../../components/buttons/MediumButtons";

// Sample asset data
const sampleItems = [
  {
    id: 10098,
    product: "XPS 13",
    status: "Ready",
    checkin: true,
    warranty: "2025-12-31",
    image: SampleImage,
  },
];

export default function Assets() {
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
            <h1>Assets</h1>
            <div>
              <form action="" method="post">
                <input type="text" placeholder="Search..." />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/assets/registration" />
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
                  <th>ID</th>
                  <th>PRODUCT</th>
                  <th>STATUS</th>
                  <th>CHECKIN/CHECKOUT</th>
                  <th>WARRANTY</th>
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
                      <img src={item.image} alt={item.product} width="50" />
                    </td>
                    <td>{item.id}</td>
                    <td>{item.product}</td>
                    <td>{item.status}</td>
                    <td>{item.checkin ? "Check-In" : "Check-Out"}</td>
                    <td>{item.warranty}</td>
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
