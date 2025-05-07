import React, { useState } from "react";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import "../../styles/Products.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import SampleImage from "../../assets/img/dvi.jpeg";
import MediumButtons from "../../components/buttons/MediumButtons";

// Sample asset data
const sampleItems = [
  {
    id: 1,
    image: SampleImage,
    productName: 'Dell Latitude',
    category: 'Laptop',
    modelNumber: 'DL-2025',
    manufacturer: 'Dell',
    depreciation: 'Straight Line',
    endOfLife: '2028-12-31',
    minimumQuantity: 10,
    imeiNumber: '123456789012345',
    ssdEncryption: 'Enabled',
    notes: 'Sample notes for Dell Latitude',
  },
  {
    id: 2,
    image: SampleImage,
    productName: 'iPhone 15 Pro',
    category: 'Mobile Phone',
    modelNumber: 'IPH15P',
    manufacturer: 'Apple',
    depreciation: 'Declining Balance',
    endOfLife: '2027-11-20',
    minimumQuantity: 10,
    imeiNumber: '123456789012345',
    ssdEncryption: 'Disabled',
    notes: null,
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
            <table className="products-table">
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
                      <img src={item.image} alt={item.product} width="50" />
                    </td>
                    <td>{item.productName}</td>
                    <td>{item.modelNumber}</td>
                    <td>{item.category}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.endOfLife}</td>
                    <td>
                      <TableBtn type="edit" navigatePage={`/products/registration/${item.id}`} />
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
