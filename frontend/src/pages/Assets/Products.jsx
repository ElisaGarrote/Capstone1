import React, { useEffect, useState } from "react";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";

export default function Products() {
  const [manufacturers, setManufacturers] = useState([]);
  const [products, setProducts] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === products.length;

  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isDeleteFailed, setDeleteFailed] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const fetchedProducts = await assetsService.fetchAllProducts();
        if (fetchedProducts) {
          setProducts(fetchedProducts);
        } else {
          setProducts([]);
        }
        
        // Fetch manufacturers
        const fetchedManufacturers = await contextsService.fetchAllManufacturers();
        if (fetchedManufacturers) {
          setManufacturers(fetchedManufacturers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  

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

  return (
    <>
      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}
      
      {isDeleteFailed && (
        <Alert message="Delete failed. Please try again." type="error" />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
        endPoint={endPoint}
        closeModal={() => setDeleteModalOpen(false)}
        confirmDelete={async () => {
          await fetchProducts();
          setDeleteSucess(true);
          setTimeout(() => setDeleteSucess(false), 5000);
        }}
        onDeleteFail={() => {
          setDeleteFailed(true);
          setTimeout(() => setDeleteFailed(false), 5000);
        }}
      />      
      )}

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
                      <th>CATEGORY</th>
                      <th>MANUFACTURER</th>
                      <th>Depreciation</th>
                      <th>EDIT</th>
                      <th>DELETE</th>
                      <th>VIEW</th>
                    </tr>
                  </thead>
                    {products.length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan="9" className="no-products-message">
                            <p>No products found. Please add some products.</p>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
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
                                  setEndPoint(`http://localhost:8003/products/delete/${product.id}`)
                                  setDeleteModalOpen(true);
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
                    )}
                </table>
          </section>
          <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}
