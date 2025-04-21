import "../../styles/custom-colors.css";
import "../../styles/AssetAudits.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import Status from "../../components/Status";
import { useNavigate } from "react-router-dom";
import TabNavBar from "../../components/TabNavBar";

export default function ScheduledAudits() {
  let notes = "sdfsdfsdfdfdfdfdfdfdfsdfsdfsdf";
  const navigate = useNavigate();

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="asset-audits-page">
        <section className="main-top">
          <h1>Asset Audits</h1>
          <div>
            <MediumButtons
              type="schedule-audits"
              navigatePage="/audits/schedule"
            />
            <MediumButtons type="perform-audits" navigatePage="/audits/new" />
          </div>
        </section>
        <section className="main-middle">
          <section>
            <TabNavBar />
          </section>
          <section className="container">
            <section className="top">
              <h2>Scheduled Audits</h2>
              <div>
                <form action="" method="post">
                  <input type="text" placeholder="Search..." />
                </form>
                <MediumButtons type="export" navigatePage="" />
              </div>
            </section>
            <section className="middle">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" name="" id="" />
                    </th>
                    <th>DUE DATE</th>
                    <th>ASSET</th>
                    <th>STATUS</th>
                    <th className={notes == null ? "blank" : ""}>NOTES</th>
                    <th>CREATED</th>
                    <th>EDIT</th>
                    <th>DELETE</th>
                    <th>VIEW</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input type="checkbox" name="" id="" />
                    </td>
                    <td>December 31, 2025</td>
                    <td>100019 - Macbook Pro 16"</td>
                    <td>
                      <Status
                        type="deployed"
                        name="Deployed"
                        location="Makati"
                      />
                    </td>
                    <td className={notes == null ? "blank" : ""}>
                      {notes == null ? "-" : notes}
                    </td>
                    <td>December 31, 2025</td>
                    <td>
                      <TableBtn type="edit" />
                    </td>
                    <td>
                      <TableBtn type="delete" />
                    </td>
                    <td>
                      <TableBtn type="view" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section></section>
          </section>
        </section>
      </main>
    </>
  );
}
