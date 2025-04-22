import "../../styles/custom-colors.css";
import "../../styles/MediumButtons.css";

import { useNavigate } from "react-router-dom";
import plusIcon from "../../assets/icons/plus.svg";
import deleteIcon from "../../assets/icons/delete-white.svg";

export default function MediumButtons({ type, navigatePage, deleteModalOpen }) {
  /* List of Button Type:
    - new
    - export
    - schedule-audits
    - perform-audits
    - delete
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

  return (
    <button
      type="button"
      className={`medium-button-${type}`}
      onClick={
        type == "delete" ? deleteModalOpen : () => navigate(navigatePage)
      }
    >
      {/* The img tag will be rendered when the icon is not null*/}
      {icon && <img src={icon} alt="" />}
      {type.replace("-", " ")}
    </button>
  );
}
