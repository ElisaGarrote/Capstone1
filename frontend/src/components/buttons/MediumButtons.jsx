import "../../styles/custom-colors.css";
import "../../styles/MediumButtons.css";

import { useNavigate } from "react-router-dom";
import plusIcon from "../../assets/icons/plus.svg";
import deleteIcon from "../../assets/icons/delete-white.svg";

export default function MediumButtons({
  type,
  navigatePage = null,
  previousPage,
  deleteModalOpen,
}) {
  /* List of Button Type:
    - new
    - export
    - schedule-audits
    - perform-audits
    - delete
    - sort
    - filter
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
      default:
        return buttonType.replace("-", " ");
    }
  };

  return (
    <button
      type="button"
      className={`medium-button-${type}`}
      onClick={
        navigatePage == null
          ? deleteModalOpen
          : () => navigate(navigatePage, { state: { previousPage } })
      }
    >
      {/* The img tag will be rendered when the icon is not null*/}
      {icon && <img src={icon} alt="" />}
      {getButtonText(type)}
    </button>
  );
}
