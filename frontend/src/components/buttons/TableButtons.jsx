import "../../styles/custom-colors.css";
import "../../styles/TableButtons.css";

import { useNavigate } from "react-router-dom";
import checkinIcon from "../../assets/icons/left.svg";
import checkoutIcon from "../../assets/icons/right-arrow.svg";
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import viewIcon from "../../assets/icons/eye.svg";

export default function TableButtons({
  type,
  navigatePage,
  previousPage,
  id,
  showModal,
}) {
  let icon;
  const navigate = useNavigate();

  console.log("id e2: ", id);
  console.log("previous page buttons: ", previousPage);

  // Assign the correct icon based on the type
  switch (type) {
    case "checkout":
      icon = checkoutIcon;
      break;
    case "checkin":
      icon = checkinIcon;
      break;
    case "edit":
      icon = editIcon;
      break;
    case "delete":
      icon = deleteIcon;
      break;
    case "view":
      icon = viewIcon;
      break;
  }

  return (
    <button
      type="button"
      className={`table-buttons-${type}`}
      onClick={
        navigatePage != null
          ? () => navigate(navigatePage, { state: { id, previousPage } })
          : showModal
      }
    >
      <img src={icon} alt="" />
    </button>
  );
}
