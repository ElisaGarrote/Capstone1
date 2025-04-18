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
  */

  return (
    <main className={`status-${type.split(" ").join("-")}`}>
      <div className="circle"></div>
      {name}
      {/* Below will be rendered when any of these (i.e personName or location) 
      is not equal to null*/}
      {(personName != null || location != null) && (
        <>
          {" "}
          to
          <div className="icon">
            <img src={personName != null ? personIcon : locationIcon} alt="" />
          </div>
          {personName != null ? personName : location}
        </>
      )}
    </main>
  );
}
