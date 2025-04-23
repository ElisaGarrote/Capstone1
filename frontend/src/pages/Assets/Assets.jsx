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
    assetId: 10001,
    assetName: null,
    serialNumber: 'GC1SJL3',
    product: 'XPS 13',
    status: 'Ready for Deployment',
    supplier: 'Amazon',
    location: 'Makati City',
    warrantyExpiration: '2027-05-02',
    endOfLife: '2025-04-09',
    orderNumber: 'GJ08CX',
    purchaseDate: '2025-04-01',
    purchaseCost: 25000,
    notes: 'Laptop for software development.',
  },
  {
    id: 2,
    image: SampleImage,
    assetId: 10002,
    assetName: 'Logitech Mouse',
    serialNumber: 'LOGI789',
    product: 'Mouse',
    status: 'Deployed',
    supplier: 'GadgetWorld',
    location: 'Quezon City',
    warrantyExpiration: '2027-05-02',
    endOfLife: '2025-04-09',
    orderNumber: '67890',
    purchaseDate: '2025-04-01',
    purchaseCost: 30000,
    notes: null,
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
                    <td>{item.assetId}</td>
                    <td>{item.product}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.status === 'Deployed' ? (
                        <button className="check-in-btn" onClick={() => handleCheckIn(item.id)}>{"< Check-In"}</button>
                      ) : (
                        <button className="check-out-btn" onClick={() => handleCheckOut(item.id)}>{"> Check-Out"}</button>
                      )}
                    </td>

                    <td>{item.warrantyExpiration}</td>
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
