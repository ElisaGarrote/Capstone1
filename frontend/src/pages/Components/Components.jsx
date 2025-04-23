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
    id: 1,
    image: SampleImage,
    componentName: 'Corsair Vengeance RAM',
    category: 'RAM',
    manufacturer: 'Corsair',
    supplier: 'TechStore',
    location: 'Main Warehouse',
    modelNumber: 'CMK16GX4M2B3200C16',
    status: 'Ready for Deployment',
    orderNumber: 'ORD-2048',
    purchaseDate: '2024-06-15',
    purchaseCost: 120.99,
    quantity: 20,
    minimumQuantity: 5,
    notes: 'High performance RAM module for gaming PCs',
  },
  {
    id: 2,
    image: SampleImage,
    componentName: 'Intel Network Card',
    category: 'Networking',
    manufacturer: 'Intel',
    supplier: 'NetSupplies',
    location: 'Storage Room B',
    modelNumber: 'I350-T4V2',
    status: 'Deployed',
    orderNumber: 'ORD-3090',
    purchaseDate: '2023-10-10',
    purchaseCost: 89.5,
    quantity: 15,
    minimumQuantity: 3,
    notes: '',
  },
];

export default function Components() {
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
            <h1>Components</h1>
            <div>
              <form action="" method="post">
                <input type="text" placeholder="Search..." />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/components/registration" />
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
                  <th>CHECKIN/CHECKOUT</th>
                  <th>AVAILABLE</th>
                  <th>CATEGORY</th>
                  <th>MODEL NUMBER</th>
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
                    <td>{item.componentName}</td>
                    <td>
                      {item.status === 'Deployed' ? (
                        <button className="check-in-btn" onClick={() => handleCheckIn(item.id)}>{"< Check-In"}</button>
                      ) : (
                        <button className="check-out-btn" onClick={() => handleCheckOut(item.id)}>{"> Check-Out"}</button>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.category}</td>
                    <td>{item.modelNumber}</td>
                    <td>
                      <TableBtn type="edit" navigatePage={`/assets/registration/${item.id}`} />
                    </td>
                    <td>
                      <TableBtn type="delete" onClick={() => handleDelete(item.id)} />
                    </td>
                    <td>
                      <TableBtn type="view" onClick={() => handleView(item.id)} />
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
