import "../../styles/custom-colors.css";
import "../../styles/MediumButtons.css";

import { useNavigate } from "react-router-dom";
import plusIcon from "../../assets/icons/plus.svg";
import deleteIcon from "../../assets/icons/delete-white.svg";
import recoverIcon from "../../assets/icons/undo-icon.svg";

export default function MediumButtons({
  type,
  navigatePage = null,
  previousPage,
  onClick = null,
}) {
  /* List of Button Type:
    - new
    - export
    - schedule-audits
    - perform-audits
    - delete
    - sort
    - filter
    - recover
   */
  let icon;
  const navigate = useNavigate();

  // Assign the correct icon based on the type
  switch (type.toLowerCase()) {
    case "new":
      icon = plusIcon;
      break;
    case "delete":
      icon = deleteIcon;
      break;
    case "recover":
      icon = recoverIcon;
      break;
    default:
      icon = null;
  }

  // Function to get the correct button text
  const getButtonText = (buttonType) => {
    switch (buttonType) {
      case "schedule-audits":
        return "Schedule Audit";
      case "perform-audits":
        return "Perform Audit";
      case "bulk":
        return "Bulk Checkin";
      default:
        return buttonType.replace("-", " ");
    }
  };

  const handleClick = () => {
    if (type.toLowerCase() === "export" && onClick) {
      onClick();
    }

    if (type.toLowerCase() === "delete" && onClick) {
      onClick();
    }

    if (type.toLowerCase() === "recover" && onClick) {
      onClick();
    }

    if (type.toLowerCase() === "edit" && onClick) {
      onClick();
    }

    if (type.toLowerCase() === "clone" && onClick) {
      onClick();
    }

    if (navigatePage) {
      navigate(navigatePage, { state: { previousPage } });
    }
  };

  return (
    <button
      type="button"
      className={`medium-button-${type}`}
      onClick={handleClick}
    >
      {/* The img tag will be rendered when the icon is not null*/}
      {icon && <img src={icon} alt="" />}
      {getButtonText(type)}
    </button>
  );
}
