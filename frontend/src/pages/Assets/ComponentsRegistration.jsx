import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import { useNavigate, useParams } from 'react-router-dom';
import MediumButtons from '../../components/buttons/MediumButtons';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import SampleImage from '../../assets/img/dvi.jpeg';
import CloseIcon from '../../assets/icons/close.svg';

export default function ComponentsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split('T')[0];

  const componentData = {
    '1': {
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
    '2': {
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
    }
  };

  const categoryList = ['RAM', 'Storage', 'Motherboard', 'Networking'];
  const manufacturerList = ['Corsair', 'Intel', 'Samsung', 'Kingston'];
  const supplierList = ['TechStore', 'NetSupplies', 'HardwareHub'];
  const locationList = ['Main Warehouse', 'Storage Room A', 'Storage Room B'];

  const [component, setComponent] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchedComponent = componentData[id];
      if (fetchedComponent) {
        setComponent(fetchedComponent);
      }
    } else {
      setComponent({
        componentName: '',
        category: '',
        manufacturer: '',
        supplier: '',
        location: '',
        modelNumber: '',
        orderNumber: '',
        purchaseDate: '',
        purchaseCost: '',
        quantity: '',
        minimumQuantity: '',
        notes: '',
        image: null,
      });
    }
  }, [id]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!component) return <div>Loading...</div>;

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage={id ? 'Edit Component' : 'New Component'}
            rootNavigatePage="/components"
            title={id ? 'Edit Component' : 'New Component'}
          />
        </section>
        <section className="registration-form">
          <form>
            <fieldset>
              <label htmlFor="component-name">Component Name *</label>
              <input
                type="text"
                name="componentName"
                placeholder="Component Name"
                maxLength="100"
                defaultValue={component?.componentName || ''}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="category">Category *</label>
              <div>
                <select name="category" defaultValue={component?.category || ''}>
                  <option value="">Select Category</option>
                  {categoryList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <MediumButtons type="new" />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="manufacturer">Manufacturer</label>
              <div>
                <select name="manufacturer" defaultValue={component?.manufacturer || ''}>
                  <option value="">Select Manufacturer</option>
                  {manufacturerList.map((mfg, idx) => (
                    <option key={idx} value={mfg}>{mfg}</option>
                  ))}
                </select>
                <MediumButtons type="new" />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <div>
                <select name="supplier" defaultValue={component?.supplier || ''}>
                  <option value="">Select Supplier</option>
                  {supplierList.map((sup, idx) => (
                    <option key={idx} value={sup}>{sup}</option>
                  ))}
                </select>
                <MediumButtons type="new" />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="location">Location</label>
              <div>
                <select name="location" defaultValue={component?.location || ''}>
                  <option value="">Select Location</option>
                  {locationList.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
                <MediumButtons type="new" />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="model-number">Model Number</label>
              <input
                type="text"
                name="modelNumber"
                placeholder="Model Number"
                maxLength="100"
                defaultValue={component?.modelNumber || ''}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="order-number">Order Number</label>
              <input
                type="text"
                name="orderNumber"
                placeholder="Order Number"
                maxLength="100"
                defaultValue={component?.orderNumber || ''}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="purchase-date">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                max={currentDate}
                defaultValue={component?.purchaseDate || ''}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="purchase-cost">Purchase Cost</label>
              <input
                type="number"
                name="purchaseCost"
                step="0.01"
                min="0"
                defaultValue={component?.purchaseCost || ''}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                defaultValue={component?.quantity || ''}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="minimum-quantity">Minimum Quantity</label>
              <input
                type="number"
                name="minimumQuantity"
                min="1"
                defaultValue={component?.minimumQuantity || ''}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                maxLength="500"
                defaultValue={component?.notes || ''}
              ></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor="upload-image">Image</label>
              <div>
                {previewImage && (
                  <div className="image-selected">
                    <img src={previewImage} alt="Preview" />
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        setPreviewImage(null);
                        document.getElementById('image').value = '';
                      }}
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                )}
                {!previewImage && component?.image && (
                  <div className="image-selected">
                    <img src={component.image} alt="Current" />
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageSelection}
                  style={{ display: 'none' }}
                />
              </div>
              <label htmlFor="image" className="upload-image-btn">
                {!previewImage ? 'Choose Image' : 'Change Image'}
              </label>
            </fieldset>
            <button type="submit" className="save-btn">
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
