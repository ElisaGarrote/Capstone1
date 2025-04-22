import "../../styles/custom-colors.css";
import "../../styles/Accessories.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import SampleImage from "../../assets/img/dvi.jpeg";
import MediumButtons from "../../components/buttons/MediumButtons";
import { useState } from "react";
import AccessoriesViewModal from "../../components/Modals/AccessoriesViewModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Accessories() {
  const location = useLocation();
  let maxAvail = 10;
  let availValue = 7;
  let accessoryName1 = "DVI Cable";
  let accessoryName2 = "HDMI Cable";
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);

  // Retrieve the "isDeleteSuccessFromEdit" value passed from the navigation state.
  // If the "isDeleteSuccessFromEdit" is not exist, the default value for this is "undifiend".
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;

  // Set the setDeleteSuccess to true when the isDeleteSuccessFromEdit is true.
  // And reset the setDeleteSucces to false after 5 seconds.
  useEffect(() => {
    if (isDeleteSuccessFromEdit == true) {
      setDeleteSucess(true);
      setTimeout(() => {
        setDeleteSucess(false);
      }, 5000);
    }
  }, [isDeleteSuccessFromEdit]); // This will be executed every time the isDeleteSucessFromEdit changes.

  // For debugging only.
  console.log("modal edit: ", isEditModalOpen);
  console.log("modal delete: ", isDeleteModalOpen);
  console.log("modal view: ", isViewModalOpen);
  console.log("delete confirm: ", isDeleteSuccess);
  console.log("delete from edit: ", isDeleteSuccessFromEdit);

  return (
    <>
      {isViewModalOpen && (
        <AccessoriesViewModal
          id={selectedRowId}
          closeModal={() => setViewModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          id={selectedRowId}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={() => {
            setDeleteSucess(true);
            setTimeout(() => {
              setDeleteSucess(false);
            }, 5000);
          }}
        />
      )}

      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}

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
              <MediumButtons
                type="new"
                navigatePage="/accessories/registration"
              />
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
                  <td>{accessoryName1}</td>
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
                      id={accessoryName1}
                    />
                  </td>
                  <td>
                    <TableBtn
                      type="checkin"
                      navigatePage={"/accessories/checkin"}
                      id={accessoryName1}
                    />
                  </td>
                  <td>MLA22LL/A sdfsdfsdfsdfsdfsdfsdf</td>
                  <td>December 31, 2025</td>
                  <td>
                    <TableBtn
                      type="edit"
                      navigatePage={"/accessories/edit"}
                      id={accessoryName1}
                    />
                  </td>
                  <td>
                    <TableBtn
                      type="delete"
                      showModal={() => {
                        setDeleteModalOpen(true);
                        setSelectedRowId(accessoryName1);
                      }}
                    />
                  </td>
                  <td>
                    <TableBtn
                      type="view"
                      showModal={() => {
                        setViewModalOpen(true);
                        setSelectedRowId(accessoryName1);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="" id="" />
                  </td>
                  <td>
                    <img src={SampleImage} alt="sample-img" />
                  </td>
                  <td>{accessoryName2}</td>
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
                      id={accessoryName2}
                    />
                  </td>
                  <td>
                    <TableBtn
                      type="checkin"
                      navigatePage={"/accessories/checkin"}
                      id={accessoryName2}
                    />
                  </td>
                  <td>MLA22LL/A sdfsdfsdfsdfsdfsdfsdf</td>
                  <td>December 31, 2025</td>
                  <td>
                    <TableBtn
                      type="edit"
                      navigatePage={"/accessories/edit"}
                      id={accessoryName2}
                    />
                  </td>
                  <td>
                    <TableBtn
                      type="delete"
                      showModal={() => {
                        setDeleteModalOpen(true);
                        setSelectedRowId(accessoryName1);
                      }}
                    />
                  </td>
                  <td>
                    <TableBtn
                      type="view"
                      showModal={() => {
                        setViewModalOpen(true);
                        setSelectedRowId(accessoryName2);
                      }}
                    />
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
