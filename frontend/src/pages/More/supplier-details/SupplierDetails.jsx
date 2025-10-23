import { useLocation } from "react-router-dom";
import NavBar from "../../../components/NavBar";
import TopSecFormPage from "../../../components/TopSecFormPage";
import SupplierTabNavBar from "../../../components/tab-nav-bar/SupplierTabNavBar";
import Footer from "../../../components/Footer";

import "../../../styles/more/supplier/SupplierDetails.css";

export default function SupplierDetails() {
  const location = useLocation();

  // Retrieve the "supplier" data value passed from the navigation state.
  // If the "supplier" data is not exist, the default value for this is "undifiend".
  const supplierDetails = location.state?.supplier;

  return (
    <>
      <section className="supplier-details-layout">
        <NavBar />
        <main className="main-supplier">
          <section className="main-top">
            <TopSecFormPage
              root="Suppliers"
              currentPage="Show Supplier"
              rootNavigatePage="/More/ViewSupplier"
              title={supplierDetails.name}
              borderBottom={false}
            />
            <SupplierTabNavBar supplier={supplierDetails} />
          </section>
          <section className="main-middle">
            <section className="card-content">
              <h2>About Supplier</h2>
              <h3>Details</h3>
              <fieldset>
                <label htmlFor="address">Address</label>
                <p>{supplierDetails.address || "-"}</p>
              </fieldset>
              <fieldset>
                <label htmlFor="city">City</label>
                <p>{supplierDetails.city || "-"}</p>
              </fieldset>
              <fieldset>
                <label htmlFor="zip">ZIP</label>
                <p>{supplierDetails.zip || "-"}</p>
              </fieldset>
              <fieldset>
                <label htmlFor="contactName">Contact Name</label>
                <p>{supplierDetails.contactName || "-"}</p>
              </fieldset>
              <fieldset>
                <label htmlFor="phoneNumber">Phone Number</label>
                <p
                  onClick={() =>
                    window.open(`tel:${supplierDetails.phoneNumber}`, "_blank")
                  }
                >
                  {supplierDetails.phoneNumber || "-"}
                </p>
              </fieldset>
              <fieldset>
                <label htmlFor="email">Email</label>
                <p
                  onClick={() =>
                    window.open(`mailto:${supplierDetails.email}`, "_blank")
                  }
                >
                  {supplierDetails.email || "-"}
                </p>
              </fieldset>
              <fieldset>
              <label htmlFor="URL">URL</label>
                <p onClick={() => window.open(supplierDetails.URL, "_blank")}>
                  {supplierDetails.URL || "-"}
                </p>
              </fieldset>
              <fieldset>
                <label htmlFor="notes">Notes</label>
                <p>{supplierDetails.notes || "-"}</p>
              </fieldset>
            </section>
          </section>
        </main>
        <Footer />
      </section>
    </>
  );
}
