import "../../styles/custom-colors.css";
import "../../styles/TableButtons.css";

import { useNavigate } from "react-router-dom";
import checkinIcon from "../../assets/icons/left.svg";
import checkoutIcon from "../../assets/icons/right-arrow.svg";
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import viewIcon from "../../assets/icons/eye.svg";
import auditIcon from "../../assets/icons/audit-secondary-text-color.svg";

export default function TableButtons({
  type,
  navigatePage,
  previousPage,
  data,
  showModal,
  onClick,
}) {
  let icon;
  const navigate = useNavigate();

  // Only log if data exists to avoid console spam
  // if (data !== undefined) {
  //   console.log("table button id received:", data);
  // }

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
    case "audit":
      icon = auditIcon;
      break;
  }

  return (
    <button
      type="button"
      className={`table-buttons-${type}`}
      onClick={
        onClick
          ? onClick
          : navigatePage != null
          ? () => navigate(navigatePage, { state: { data, previousPage } })
          : showModal
      }
      title={type === "audit" ? "Perform Audit" : null}
    >
      {type === "checkin" ? (
        "Check-In"
      ) : type === "checkout" ? (
        "Check-Out"
      ) : (
        <img src={icon} alt="" />
      )}
    </button>
  );
}
