import "../../styles/custom-colors.css";
import "../../styles/OverdueAudits.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import Status from "../../components/Status";
import TabNavBar from "../../components/TabNavBar";

export default function OverdueAudits() {
  let notes = null;
  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="overdue-audits-page">
        <section className="main-top">
          <h1>Asset Audits</h1>
          <div>
            <button>Schedule Audits</button>
            <button>Perform Audits</button>
          </div>
        </section>
        <section className="main-middle">
          <section>
            <TabNavBar />
          </section>
          <section className="container">
            <section className="top">
              <h2>Overdue for an Audits</h2>
              <div>
                <form action="" method="post">
                  <input type="text" placeholder="Search..." />
                </form>
                <MediumButtons type="export" navigatePage="" />
                <MediumButtons type="new" navigatePage="" />
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
                    <th>OVERDUE BY</th>
                    <th>ASSET</th>
                    <th>STATUS</th>
                    <th className={notes == null ? "blank" : ""}>NOTES</th>
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
                    <td>31 days</td>
                    <td>100019 - Macbook Pro 16"</td>
                    <td>
                      <Status
                        type="deployed"
                        name="Deployed"
                        personName="Mary Grace Piattos"
                      />
                    </td>
                    <td className={notes == null ? "blank" : ""}>
                      {notes == null ? "-" : notes}
                    </td>
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
