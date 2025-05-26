import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import "../../styles/Registration.css";
import CloseIcon from "../../assets/icons/close.svg";
import assetsService from "../../services/assets-service";

export default function AssetsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const [generatedAssetId, setGeneratedAssetId] = useState('(Loading...)');
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      image: null,
      assetId: '',
      assetName: '',
      serialNumber: '',
      product: '',
      status: 'Ready for Deployment',
      supplier: '',
      location: '',
      warrantyExpiration: '',
      orderNumber: '',
      purchaseDate: '',
      purchaseCost: '',
      notes: ''
    }
  });

  const statusList = ['Ready for Deployment', 'Deployed'];
  const productList = ['XPS 13', 'Mouse', 'Keyboard', 'Monitor', 'Laptop'];
  const supplierList = ['Amazon', 'TechCorp', 'GadgetWorld', 'GizmoHub'];
  const locationList = ['Office', 'Makati City', 'Quezon City', 'Cebu City', 'Davao City'];

  const [previewImage, setPreviewImage] = useState(null);
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        // Editing existing asset
        try {
          const assetData = await assetsService.fetchAssetById(id);
          if (assetData) {
            // Set form values from fetched asset data
            Object.entries(assetData).forEach(([key, value]) => {
              setValue(key, value);
            });
            setGeneratedAssetId(assetData.displayed_id);
            setPreviewImage(assetData.image ? 
              `https://assets-service-production.up.railway.app${assetData.image}` : null);
          }
        } catch (error) {
          console.error("Error fetching asset:", error);
        }
      } else {
        // New asset - generate a temporary ID
        try {
          const response = await assetsService.getNextAssetId();
          if (response && response.next_id) {
            setGeneratedAssetId(response.next_id);
          } else {
            setGeneratedAssetId('(Auto-generated)');
          }
        } catch (error) {
          console.error("Error generating asset ID:", error);
          setGeneratedAssetId('(Auto-generated)');
        }
      }
    };

    fetchData();
  }, [id, setValue]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    // Remove assetId from data if it's the placeholder text
    if (data.assetId === '(Auto-generated)') {
      delete data.assetId;
    }
    
    console.log(errors); // Log errors for debugging
    console.log("Form submitted:", data);
    
    // Here you would typically make an API call to save the asset
    // The backend will generate the displayed_id
    
    navigate("/assets");
  };

  return (
    <>
      <nav><NavBar /></nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Assets"
            currentPage={id ? "Edit Asset" : "New Asset"}
            rootNavigatePage="/assets"
            title={id ? "Edit Asset" : "New Asset"}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label>Asset ID</label>
              <input 
                type="text" 
                readOnly
                className="readonly-field"
                value={generatedAssetId}
              />
            </fieldset>

            <fieldset>
              <label>Product *</label>
              <div>
                <select 
                className={errors.product ? 'input-error' : ''}
                {...register("product", {required: 'Product is required.'})}>
                  <option value="">Select Product</option>
                  {productList.map((product, idx) => (
                    <option key={idx} value={product}>{product}</option>
                  ))}
                </select>
              </div>
              {errors.product && <span className='error-message'>{errors.product.message}</span>}
            </fieldset>

            <fieldset>
              <label>Status *</label>
              <div>
                <select 
                className={errors.status ? 'input-error' : ''}
                {...register("status", {required: 'Status is required.'})}>
                  <option value="">Select Status</option>
                  {statusList.map((status, idx) => (
                    <option key={idx} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              {errors.status && <span className='error-message'>{errors.status.message}</span>}
            </fieldset>

            <fieldset>
              <label>Supplier</label>
              <div>
                <select {...register("supplier")}>
                  <option value="">Select Supplier</option>
                  {supplierList.map((supplier, idx) => (
                    <option key={idx} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset>
              <label>Location</label>
              <div>
                <select {...register("location")}>
                  <option value="">Select Location</option>
                  {locationList.map((location, idx) => (
                    <option key={idx} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset>
              <label>Asset Name</label>
              <input type="text" {...register("assetName")} placeholder="Asset Name" />
            </fieldset>

            <fieldset>
              <label>Serial Number</label>
              <input type="text" {...register("serialNumber")} placeholder="Serial Number" />
            </fieldset>

            <fieldset>
              <label>Warranty Expiration</label>
              <input type="date" {...register("warrantyExpiration")} min={!id ? currentDate : undefined} />
            </fieldset>

            <fieldset>
              <label>Order Number</label>
              <input type="text" {...register("orderNumber")} placeholder="Order Number" />
            </fieldset>

            <fieldset>
              <label>Purchase Date</label>
              <input type="date" {...register("purchaseDate")} max={!id ? currentDate : undefined} />
            </fieldset>

            <fieldset>
              <label>Purchase Cost</label>
              <div>
                <p>PHP</p>
                <input type="number" step="0.01" min="1" {...register("purchaseCost", {valueAsNumber: true})} />
              </div>
            </fieldset>

            <fieldset>
              <label>Schedule Audit</label>
              <input type="date" {...register("scheduleAudit")} min={!id ? currentDate : undefined} />
            </fieldset>

            <fieldset>
              <label>Notes</label>
              <textarea {...register("notes")} maxLength="500" />
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
                        setValue('image', null);
                        document.getElementById('image').value = '';
                      }}
                    >
                      <img src={CloseIcon} alt='Remove' />
                    </button>
                  </div>
                )}
                <input
                  type='file'
                  id='image'
                  accept='image/*'
                  onChange={handleImageSelection}
                  style={{ display: 'none' }}
                />
              </div>
              <label htmlFor='image' className='upload-image-btn'>
                {!previewImage ? 'Choose Image' : 'Change Image'}
              </label>
            </fieldset>

            <button type="submit" className="save-btn">Save</button>
          </form>
        </section>
      </main>
    </>
  );
}
