import NavBar from "../../components/NavBar"
import "../../styles/AccessoriesRegistration.css"
import { useNavigate } from "react-router-dom";
import MediumButtons from "../../components/buttons/MediumButtons";

export default function AccessoriesRegistration() {
    const navigate = useNavigate();
    const currentDate = new Date().toISOString().split("T")[0];

    return (
      <>
        <nav>
          <NavBar />
        </nav>
        <main className="accessories-registration">
          <section className="navigation-and-title">
            <div>
              <a onClick={() => navigate("/accessories")}>Accessories</a> / New
              Accessory
            </div>
            <h1>New Accessory</h1>
          </section>
          <section className="registration-form">
            <form action="" method="post">
              <fieldset>
                <label htmlFor="accessory-name">Accessory Name *</label>
                <input
                  type="text"
                  placeholder="Accessory Name"
                  maxLength="100"
                  required
                />
              </fieldset>
              <fieldset>
                <label htmlFor="category">Category *</label>
                <div>
                  <select name="category" id="category" required>
                    <option value="cables">Cables</option>
                    <option value="chargers">Chargers</option>
                    <option value="keyboards">Keyboards</option>
                  </select>
                  <MediumButtons type="new" />
                </div>
              </fieldset>
              <fieldset>
                <label htmlFor="manufacturer">Manufacturer *</label>
                <div>
                  <select name="category" id="category" required>
                    <option value="cables">Cables</option>
                    <option value="chargers">Chargers</option>
                    <option value="keyboards">Keyboards</option>
                  </select>
                  <MediumButtons type="new" />
                </div>
              </fieldset>
              <fieldset>
                <label htmlFor="supplier">Supplier</label>
                <div>
                  <select name="category" id="category">
                    <option value="cables">Cables</option>
                    <option value="chargers">Chargers</option>
                    <option value="keyboards">Keyboards</option>
                  </select>
                  <MediumButtons type="new" />
                </div>
              </fieldset>
              <fieldset>
                <label htmlFor="location">Location *</label>
                <div>
                  <select name="category" id="category" required>
                    <option value="cables">Cables</option>
                    <option value="chargers">Chargers</option>
                    <option value="keyboards">Keyboards</option>
                  </select>
                  <MediumButtons type="new" />
                </div>
              </fieldset>
              <fieldset>
                <label htmlFor="order-number">Order Number</label>
                <input
                  type="text"
                  name="order-number"
                  id="order-number"
                  placeholder="Order Number"
                  maxLength="30"
                />
              </fieldset>
              <fieldset>
                <label htmlFor="model-number">Model Number</label>
                <input
                  type="text"
                  name="order-number"
                  id="order-number"
                  placeholder="Order Number"
                  maxLength="50"
                />
              </fieldset>
              <fieldset>
                <label htmlFor="purchase-date">Purchase Date *</label>
                <input
                  type="date"
                  name="purchase-date"
                  id="purchase-date"
                  max={currentDate}
                  required
                />
              </fieldset>
              <fieldset>
                <label htmlFor="purchase-cost">Purchase Cost *</label>
                <div>
                  <p>PHP</p>
                  <input
                    type="number"
                    name="purchase-cost"
                    id="purchase-cost"
                    step="0.01"
                    min="1"
                    required
                  />
                </div>
              </fieldset>
              <fieldset>
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="1"
                  max="9999"
                  defaultValue="1"
                  required
                />
              </fieldset>
              <fieldset>
                <label htmlFor="minimum-quantity">Min Quantity *</label>
                <input
                  type="number"
                  name="min-quantity"
                  id="min-quantity"
                  min="0"
                  max="9999"
                  defaultValue="0"
                  required
                />
              </fieldset>
              <fieldset>
                <label htmlFor="notes">Notes</label>
                <textarea
                  name="notes"
                  id="notes"
                  maxLength="500"
                ></textarea>
              </fieldset>
              <fieldset>
                <label htmlFor="image">Image</label>
                <div>
                  Image here
                  <button type="button">Upload</button>
                </div>
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