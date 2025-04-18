import "../../styles/custom-colors.css";
import "../../styles/Accessories.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import SampleImage from "../../assets/img/dvi.jpeg";
import MediumButtons from "../../components/buttons/MediumButtons";

export default function Accessories() {
  let maxAvail = 10;
  let availValue = 7;

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="accessories-page">
        <div className="container">
          <section className="top">
            <h1>Accessories</h1>
            <div>
              <form action="" method="post">
                <input type="text" placeholder="Search..." />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" />
            </div>
          </section>
          <section className="middle">
            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" name="" id="" />
                  </th>
                  <th>IMAGE</th>
                  <th>NAME</th>
                  <th>AVAILABLE</th>
                  <th>CHECKOUT</th>
                  <th>CHECKIN</th>
                  <th>MODEL NUMBER</th>
                  <th>PURCHASE DATE</th>
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
                  <td>
                    <img src={SampleImage} alt="sample-img" />
                  </td>
                  <td>DVI Cable dfgdfgdfgdfgdfgdfgsdgsdfsdfssdfsdfsdf</td>
                  <td>
                    <span>
                      {availValue}/{maxAvail}
                      <progress value={availValue} max={maxAvail}>
                        3
                      </progress>
                    </span>
                  </td>
                  <td>
                    <TableBtn
                      type="checkout"
                      navigatePage={"/accessories/checkout"}
                    />
                  </td>
                  <td>
                    <TableBtn type="checkin" navigatePage={""} />
                  </td>
                  <td>MLA22LL/A sdfsdfsdfsdfsdfsdfsdf</td>
                  <td>December 31, 2025</td>
                  <td>
                    <TableBtn type="edit" navigatePage={""} />
                  </td>
                  <td>
                    <TableBtn type="delete" navigatePage={""} />
                  </td>
                  <td>
                    <TableBtn type="view" navigatePage={""} />
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}