import closeIcon from "../assets/icons/close.png";
import checkIcon from "../assets/icons/check.png";

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
