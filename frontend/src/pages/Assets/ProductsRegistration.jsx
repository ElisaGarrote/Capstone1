import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import { useNavigate, useParams } from 'react-router-dom';
import MediumButtons from '../../components/buttons/MediumButtons';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import SampleImage from '../../assets/img/dvi.jpeg';
import CloseIcon from '../../assets/icons/close.svg';

export default function ProductsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split('T')[0];

  const productData = {
    '1': {
      image: SampleImage,
      productName: 'Dell Latitude',
      modelNumber: 'DL-2025',
      category: 'Laptop',
      manufacturer: 'Dell',
      depreciation: 'Straight Line',
      endOfLife: '2028-12-31',
      minimumQuantity: 10,
      imeiNumber: '123456789012345',
      ssdEncryption: 'Enabled',
      notes: 'Sample notes for Dell Latitude',
    },
    '2': {
      image: SampleImage,
      productName: 'iPhone 15 Pro',
      modelNumber: 'IPH15P',
      category: 'Mobile Phone',
      manufacturer: 'Apple',
      depreciation: 'Declining Balance',
      endOfLife: '2027-11-20',
      minimumQuantity: 10,
      imeiNumber: '123456789012345',
      ssdEncryption: 'Disabled',
      notes: null,
    }
  };

  const [product, setProduct] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchedProduct = productData[id];
      if (fetchedProduct) {
        setProduct({
          ...fetchedProduct,
          endOfLifeDate: fetchedProduct.endOfLife,
        });
      }
    } else {
      setProduct({
        productName: '',
        modelNumber: '',
        category: '',
        manufacturer: '',
        depreciation: '',
        endOfLifeDate: '',
        minimumQuantity: '',
        imeiNumber: '',
        ssdEncryption: '',
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

  if (!product) return <div>Loading...</div>;

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className='registration'>
        <section className='top'>
          <TopSecFormPage
            root='Products'
            currentPage={id ? 'Edit Product' : 'New Product'}
            rootNavigatePage='/products'
            title={id ? 'Edit Product' : 'New Product'}
          />
        </section>
        <section className='registration-form'>
          <form>
            <fieldset>
              <label htmlFor='product-name'>Product Name *</label>
              <input
                type='text'
                name='productName'
                placeholder='Product Name'
                maxLength='100'
                defaultValue={product?.productName || ''}
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor='model-number'>Model Number</label>
              <input
                type='text'
                name='modelNumber'
                placeholder='Model Number'
                maxLength='100'
                defaultValue={product?.modelNumber || ''}
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor='category'>Category *</label>
              <div>
                <select name='category' defaultValue={product?.category || ''} disabled={!id}>
                  <option value=''>Select Category</option>
                  <option value='Laptop'>Laptop</option>
                  <option value='Mobile Phone'>Mobile Phone</option>
                  <option value='Tablet'>Tablet</option>
                </select>
                <MediumButtons type='new' disabled={!id} />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor='manufacturer'>Manufacturer *</label>
              <div>
                <select name='manufacturer' defaultValue={product?.manufacturer || ''} disabled={!id}>
                  <option value=''>Select Manufacturer</option>
                  <option value='Apple'>Apple</option>
                  <option value='Dell'>Dell</option>
                  <option value='Samsung'>Samsung</option>
                </select>
                <MediumButtons type='new' disabled={!id} />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor='depreciation'>Depreciation *</label>
              <div>
                <select name='depreciation' defaultValue={product?.depreciation || ''} disabled={!id}>
                  <option value=''>Select Depreciation Method</option>
                  <option value='Straight Line'>Straight Line</option>
                  <option value='Declining Balance'>Declining Balance</option>
                </select>
                <MediumButtons type='new' disabled={!id} />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor='end-of-life-date'>End of Life Date</label>
              <input
                type='date'
                name='endOfLifeDate'
                max={currentDate}
                defaultValue={product?.endOfLifeDate || ''}
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor='minimum-quantity'>Minimum Quantity</label>
              <input
                type='number'
                name='minimumQuantity'
                min='0'
                defaultValue={product?.minimumQuantity || ''}
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor='imei-number'>IMEI Number</label>
              <input
                type='text'
                name='imeiNumber'
                placeholder='IMEI Number'
                maxLength='15'
                defaultValue={product?.imeiNumber || ''}
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor='ssd-encryption'>SSD Encryption</label>
              <input
                type='text'
                name='ssdEncryption'
                placeholder='SSD Encryption'
                maxLength='100'
                defaultValue={product?.ssdEncryption || ''}
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor='notes'>Notes</label>
              <textarea
                name='notes'
                maxLength='500'
                defaultValue={product?.notes || ''}
                readOnly={!id}
              ></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor='upload-image'>Image</label>
              <div>
                {previewImage && (
                  <div className='image-selected'>
                    <img src={previewImage} alt='Preview' />
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        setPreviewImage(null);
                        document.getElementById('image').value = '';
                      }}
                    >
                      <img src={CloseIcon} alt='Remove' />
                    </button>
                  </div>
                )}
                {!previewImage && product?.image && (
                  <div className='image-selected'>
                    <img src={product.image} alt='Current' />
                  </div>
                )}
                <input
                  type='file'
                  name='image'
                  id='image'
                  accept='image/*'
                  onChange={handleImageSelection}
                  style={{ display: 'none' }}
                  disabled={!id}
                />
              </div>
              <label htmlFor='image' className='upload-image-btn'>
                {!previewImage ? 'Choose Image' : 'Change Image'}
              </label>
            </fieldset>
          </form>
        </section>
      </main>
    </>
  );
}
