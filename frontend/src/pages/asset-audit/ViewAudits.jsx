import NavBar from "../../components/NavBar";
import "../../styles/ViewAudits.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useLocation } from "react-router-dom";
import Status from "../../components/Status";
import { formatDate } from "../../utils/dateFormatter";

export default function ViewAudits() {
  const location = useLocation();

  // Retrieve the "data" value passed from the navigation state.
  // If the "data" is not exist, the default value for this is "undifiend".
  const data = location.state?.data;
  const previousPage = location.state?.previousPage;

  console.log("root: ", previousPage);
  console.log("data:", data);

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
            title={`${data.asset_info.displayed_id} - ${data.asset_info.name}`}
          />
        </section>
        <section className="view-audits-content">
          <fieldset>
            <label htmlFor="date-created">Date Created</label>
            <p>April 10, 2025</p>
          </fieldset>

          <fieldset>
            <label htmlFor="status">Status</label>
            <p>
              <Status type="deployable" name="Ready to Deploy" />
            </p>
          </fieldset>

          <fieldset>
            <label htmlFor="asset">Asset</label>
            <p>{data.asset_info.name}</p>
          </fieldset>

          <fieldset>
            <label htmlFor="asset-id">Asset ID</label>
            <p>{data.asset_info.displayed_id}</p>
          </fieldset>

          {data.audit_info != null && (
            <fieldset>
              <label htmlFor="location">Location</label>
              <p>{data.audit_info.location}</p>
            </fieldset>
          )}

          <fieldset>
            <label htmlFor="audit-date">
              {previousPage != "/audits/completed" ? "Due Date" : "Audit Date"}
            </label>
            <p>
              {previousPage != "/audits/completed"
                ? formatDate(data.date)
                : formatDate(data.audit_info.audit_date)}
            </p>
          </fieldset>

          {previousPage == "/audits/completed" && (
            <fieldset>
              <label htmlFor="next-audit-date">Next Audit Date</label>
              <p>{formatDate(data.date)}</p>
            </fieldset>
          )}

          <fieldset>
            <label htmlFor="notes">Notes</label>
            <p>{data.notes == "" ? "-" : data.notes}</p>
          </fieldset>
        </section>
      </main>
    </>
  );
}
