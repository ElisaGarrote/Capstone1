import closeIcon from "../assets/icons/close.svg";
import checkIcon from "../assets/icons/check.svg";
import "../styles/custom-colors.css";
import "../styles/alert.css";

function Alert({ message, type }) {
  let icon = type === "success" ? checkIcon : closeIcon;

  return (
    <div className={`alert alert-${type}`}>
      <img src={icon} alt="close-icon" />
      <p>{message}</p>
    </div>
  );
}

export default Alert;
