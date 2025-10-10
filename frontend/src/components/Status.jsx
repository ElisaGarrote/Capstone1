import "../styles/Status.css";
import personIcon from "../assets/icons/person.svg";
import locationIcon from "../assets/icons/location.svg";

export default function Status({
  type,
  name,
  personName = null,
  location = null,
}) {
  /* LIST OF TYPES
    - archived
    - deployed
    - undeployable
    - pending
    - deployable
    - lost
    - create
    - update
    - delete
    - checkin
    - checkout
    - schedule
    - passed
    - failed
    - repair
  */

  return (
    <span className={`status-${type.split(" ").join("-")}`}>
      <span className="circle" aria-hidden="true"></span>
      {name}
      {/* Below will be rendered when any of these (i.e personName or location)
      is not equal to null*/}
      {(personName != null || location != null) && (
        <span className="status-details">
          <span className="status-to">to</span>
          <span className="icon">
            <img src={personName != null ? personIcon : locationIcon} alt="" />
          </span>
          <span className="status-target">
            {personName != null ? personName : location}
          </span>
        </span>
      )}
    </span>
  );
}
