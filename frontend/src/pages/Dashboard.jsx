import NavBar from "../components/NavBar";
import "../styles/Dashboard.css";

function Dashbaord() {
  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="dashboard-page">
        <h1>Dashboard!</h1>
      </main>
    </>
  );
}

export default Dashbaord;
