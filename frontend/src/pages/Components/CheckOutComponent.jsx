import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function CheckOutComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, image, name, category } = location.state || {};
  const currentDate = new Date().toISOString().split("T")[0];

  // Dropdown lists for easier maintenance
  const assetList = ['XPS 13', 'Mouse', 'Keyboard', 'Monitor', 'Laptop'];
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      componentId: id,
      asset: '',
      quantity: null,
      checkInDate: currentDate,
      notes: '',
    }
  });

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    navigate("/components");
  };

  return (
    <>
      <nav><NavBar /></nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage="Check-Out Component"
            rootNavigatePage="/components"
            title={name}
          />
        </section>
        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Component Information</h2>
            <fieldset>
              <img src={image} alt="asset" />
            </fieldset>
            <fieldset>
              <label>Name:</label>
              <p>{name}</p>
            </fieldset>
            <fieldset>
              <label>Category:</label>
              <p>{category}</p>
            </fieldset>
          </section>
          
          <section className="checkin-form">
            <h2>Check-Out Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset>
                  <label>Check-Out To *</label>
                  <select
                    className={errors.asset ? 'input-error' : ''}
                    {...register("asset", { required: 'Asset is required' })}
                  >
                    <option value="">Select An Asset</option>
                    {assetList.map((asset, idx) => (
                      <option key={idx} value={asset}>{asset}</option>
                    ))}
                  </select>
                  {errors.asset && <span className='error-message'>{errors.asset.message}</span>}
                </fieldset>

                <fieldset>
                    <label htmlFor='component-quantity'>Quantity *</label>
                    <input
                        type='number'
                        className={errors.quantity ? 'input-error' : ''}
                        {...register('quantity', { required: 'Quantity is required' })}
                        maxLength='100'
                    />
                    {errors.quantity && <span className='error-message'>{errors.quantity.message}</span>}
                </fieldset>

                <fieldset>
                  <label>Check-Out Date *</label>
                  <input
                    type="text"  
                    readOnly
                    value={currentDate}
                    className={errors.checkInDate ? 'input-error' : ''}
                    {...register("checkInDate")}
                  />
                </fieldset>

                <fieldset>
                <label>Expected Return Date *</label>
                <input
                  type="date"
                  className={errors.expectedReturnDate ? 'input-error' : ''}
                  min={currentDate}
                  {...register("expectedReturnDate", { required: 'Expected return date is required' })}
                />
                {errors.expectedReturnDate && <span className='error-message'>{errors.expectedReturnDate.message}</span>}
              </fieldset>

                <fieldset>
                    <label>Notes</label>
                    <textarea {...register("notes")} maxLength="500" />
                </fieldset>

              <button type="submit" className="save-btn">Save</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}