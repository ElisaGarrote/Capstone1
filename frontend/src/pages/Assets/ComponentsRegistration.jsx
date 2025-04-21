import NavBar from "../../components/NavBar";
import "../../styles/Dashboard.css";

function ComponentsRegistration() {
  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="dashboard-page">
        <h1>New Component</h1>
      </main>
    </>
  );
}

export default ComponentsRegistration;
