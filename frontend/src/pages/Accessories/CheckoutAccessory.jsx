import NavBar from "../../components/NavBar";
import "../../styles/custom-colors.css";
import "../../styles/CheckoutAccessories.css";

export default function CheckoutAccessory() {
  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="checkout-accessories">
        <h1>Checkout Accessory!</h1>
      </main>
    </>
  );
}
