import React, { useEffect, useState } from "react";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";

export default function Products() {
  const [products, setProducts] = useState([]);
  
  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === products.length;
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8003/products/");
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

  const handleView = (id) => {
    console.log("View product with id:", id);
    
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      {isDeleteModalOpen && (
        <DeleteModal
          id={selectedRowId}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={() => {
            setDeleteSucess(true);
            setTimeout(() => {
              setDeleteSucess(false);
            }, 5000);
          }}
        />
      )}

      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}

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
            {products.length === 0 ? (
                  <section className="no-products-message">
                    <p>No products found. Please add some products.</p>
                  </section>
                ) : (
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
                        <th>CATEGORY</th>
                        <th>MODEL NUMBER</th>
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
                                src={product.image ? `http://127.0.0.1:8003${product.image}` : DefaultImage}
                                alt="Product-Image"
                                width="50"
                              />
                            </td>
                            <td>{product.name}</td>
                            <td>{product.category_name}</td>
                            <td>{product.model_number}</td>
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
                                showModal={() => {
                                  setDeleteModalOpen(true);
                                  setSelectedRowId(product.id);
                                }}
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
                )}
          </section>
          <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}
