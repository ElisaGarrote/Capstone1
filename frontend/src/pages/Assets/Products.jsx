import React, { useEffect, useState } from "react";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";

export default function Products() {
  const [products, setProducts] = useState([]);
  
  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === products.length;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8001/products/");
      const data = await response.json();
      setProducts(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSelectAll = () => {
    if (allChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(products.map((item) => item.id));
    }
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    console.log("Delete product with id:", id);
    
  };

  const handleView = (id) => {
    console.log("View product with id:", id);
    
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(product.id)}
                        onChange={() => toggleItem(product.id)}
                      />
                    </td>
                    <td>
                      <img
                        src={`http://127.0.0.1:8001${product.first_image}`}
                        alt={DefaultImage}
                        width="50"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.model_number}</td>
                    <td>{product.category_name}</td>
                    <td>{product.manufacturer_name}</td>
                    <td>{product.end_of_life}</td>
                    <td>
                      <TableBtn
                        type="edit"
                        navigatePage={`/products/registration/${product.id}`}
                      />
                    </td>
                    <td>
                      <TableBtn
                        type="delete"
                        onClick={() => handleDelete(product.id)}
                      />
                    </td>
                    <td>
                      <TableBtn
                        type="view"
                        onClick={() => handleView(product.id)}
                      />
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
