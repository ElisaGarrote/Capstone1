import NavBar from "../../components/NavBar";
import "../../styles/ViewAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useLocation } from "react-router-dom";
import Status from "../../components/Status";

export default function ViewAudits() {
  const location = useLocation();

  // Retrieve the "id" value passed from the navigation state.
  // If the "id" is not exist, the default value for this is "undifiend".
  const id = location.state?.id;
  const previousPage = location.state?.previousPage;

  console.log("root: ", previousPage);

  // Function to assign the appropriate value for the root props in TopSecFormPage component
  const assignRoot = () => {
    if (previousPage == "/audits") {
      return "Audits";
    } else if (previousPage == "/audits/overdue") {
      return "Overdue Audit";
    } else if (previousPage == "/audits/scheduled") {
      return "Scheduled Audit";
    } else {
      return "Completed Audits";
    }
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="view-audits-page">
        <section className="top">
          <TopSecFormPage
            root={assignRoot()}
            currentPage="View Audits"
            rootNavigatePage={previousPage}
            title={id}
          />
        </section>
        <section className="view-audits-content">
          <fieldset>
            <label htmlFor="asset">Date Created</label>
            <p>April 10, 2025</p>
          </fieldset>
          <fieldset>
            <label htmlFor="asset">Status</label>
            <p>
              <Status type="deployable" name="Ready to Deploy" />
            </p>
          </fieldset>
          <fieldset>
            <label htmlFor="asset">Asset</label>
            <p>Macbook Pro 16"</p>
          </fieldset>
          <fieldset>
            <label htmlFor="asset-id">Asset ID</label>
            <p>100019</p>
          </fieldset>
          <fieldset>
            <label htmlFor="location">Location</label>
            <p>Makati</p>
          </fieldset>
          <fieldset>
            <label htmlFor="audit-date">
              {previousPage != "/audits/completed" ? "Due Date" : "Audit Date"}
            </label>
            <p>April 25, 2025</p>
          </fieldset>
          <fieldset>
            <label htmlFor="next-audit-date">Next Audit Date</label>
            <p>May 25, 2025</p>
          </fieldset>
          <fieldset>
            <label htmlFor="notes">Notes</label>
            <p>-</p>
          </fieldset>
        </section>
      </main>
    </>
  );
}
