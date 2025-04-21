import { useNavigate } from "react-router-dom";
import "../styles/TopSecFormPage.css";
import MediumButtons from "./buttons/MediumButtons";

export default function TopSecFormPage({
  root,
  currentPage,
  rootNavigatePage,
  title,
  buttonType,
  buttonNavigation,
}) {
  const navigate = useNavigate();

  return (
    <>
      <main className="top-section-form-page">
        <section className="breadcrumb-navigation">
          <ul>
            <li>
              <a onClick={() => navigate(rootNavigatePage)}>{root}</a>
            </li>
            <li>{currentPage}</li>
          </ul>
        </section>
        <section className="title">
            <h1>
                {title}
            </h1>
            {buttonType && (
                <MediumButtons
                    type={buttonType}
                    navigatePage={buttonNavigation}
                />
            )}
        </section>
      </main>
    </>
  );
}
