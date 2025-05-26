import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [manufacturers, setManufacturers] = useState([]);
  const [products, setProducts] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === products.length;

  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check for success messages passed from other components
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      
      // Clear the success message from location state after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }
    
    const fetchData = async () => {
      try {
        // Fetch all products
        const productsResponse = await assetsService.fetchAllProducts();
        setProducts(productsResponse.products || []);
        
        // Fetch manufacturers
        const manufacturersResponse = await contextsService.fetchAllManufacturerNames();
        setManufacturers(manufacturersResponse.manufacturers || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProducts([]);
        setManufacturers([]);
      }
    };

    fetchData();
  }, [location]);

  // Get manufacturer name by ID
  const getManufacturerName = (manufacturerId) => {
    const manufacturer = manufacturers.find(m => m.id === manufacturerId);
    return manufacturer ? manufacturer.name : '-';
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

  // Refresh products after deletion
  const fetchProducts = async () => {
    try {
      const productsResponse = await assetsService.fetchAllProducts();
      setProducts(productsResponse.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // TO BE CONFIGURED
  const handleView = (productId) => {
    // Navigate to the product view page
    window.location.href = `/products/view/${productId}`;
    // Or if you're using react-router:
    // navigate(`/products/view/${productId}`);
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            await fetchProducts();
            setSuccessMessage("Product Deleted Successfully!");
            setErrorMessage("");
            
            setTimeout(() => {
              setSuccessMessage("");
            }, 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again."); // Show error message immediately
            setSuccessMessage(""); // Clear any success messages
            
            // Auto-hide the error message after 5 seconds
            setTimeout(() => {
              setErrorMessage("");
            }, 5000);
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
                            {product.image ? (
                              <img
                                src={`https://assets-service-production.up.railway.app${product.image}`}
                                alt={`Product-${product.name}`}
                                width="50"
                                key={`img-${product.id}`}
                                onError={(e) => {
                                  console.log(`Error loading image for product ${product.id}`);
                                  e.target.src = DefaultImage;
                                }}
                              />
                            ) : (
                              <img
                                src={DefaultImage}
                                alt={`Product-${product.name}`}
                                width="50"
                                key={`img-${product.id}`}
                              />
                            )}
                          </td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>{getManufacturerName(product.manufacturer_id)}</td>
                          <td>{product.depreciation}</td>
                          <td>
                            <TableBtn
                              type="edit"
                              navigatePage={`/products/registration/${product.id}`}
                              data={product.id}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="delete"
                              showModal={() => {
                                setEndPoint(`https://assets-service-production.up.railway.app/products/${product.id}/delete/`)
                                setDeleteModalOpen(true);
                              }}
                              data={product.id}
                            />
                          </td>
                          <td>
                            <TableBtn
                              type="view"
                              navigatePage={`/products/view/${product.id}`}
                              data={product.id}
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
