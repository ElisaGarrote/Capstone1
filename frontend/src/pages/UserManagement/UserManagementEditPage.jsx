import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import "../../styles/Registration.css";

function buildInitialFormData(user) {
  if (!user) {
    return {
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      role: "",
      email: "",
    };
  }

  return {
    lastName: user.name?.split(" ").pop() || "",
    firstName: user.name?.split(" ")[0] || "",
    middleName: "",
    suffix: "",
    role: user.role || "",
    email: user.email || "",
  };
}

const suffixOptions = [
  { value: "", label: "Select Suffix" },
  { value: "Jr.", label: "Jr." },
  { value: "Sr.", label: "Sr." },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
];

export default function UserManagementEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;

  const [formData, setFormData] = useState(() => buildInitialFormData(user));
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setErrorMessage("User data not found. Please go back to User Management.");
    } else {
      setFormData(buildInitialFormData(user));
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      setErrorMessage("Cannot save changes because user data is missing.");
      return;
    }

    const payload = {
      id: user.id || id,
      ...formData,
    };

    console.log("Updated user data:", payload);

    setSuccessMessage("User details have been updated successfully.");

    setTimeout(() => {
      navigate("/user-management", {
        state: {
          successMessage: "User details have been updated successfully.",
        },
      });
    }, 800);
  };

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.role.trim();

  const renderForm = () => (
    <section className="page-layout-registration">
      <NavBar />
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="User"
            currentPage="Edit User"
            rootNavigatePage="/user-management"
            title={user?.name || "Edit User"}
          />
        </section>

        <section className="registration-form">
          <form onSubmit={handleSubmit} className="user-registration-form">
            {/* Personal Information Section */}
            <div className="registration-section">
              <h3 className="registration-section-title">Personal Information</h3>
              
              <fieldset className="registration-fieldset">
                <label htmlFor="lastName">
                  Last Name
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  maxLength="100"
                  required
                />
              </fieldset>

              <fieldset className="registration-fieldset">
                <label htmlFor="firstName">
                  First Name
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  maxLength="100"
                  required
                />
              </fieldset>

              <fieldset className="registration-fieldset">
                <label htmlFor="middleName">Middle Name</label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  placeholder="Enter middle name"
                  value={formData.middleName}
                  onChange={handleChange}
                  maxLength="100"
                />
              </fieldset>

              <fieldset className="registration-fieldset">
                <label htmlFor="suffix">Suffix</label>
                <select
                  id="suffix"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                >
                  {suffixOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            {/* Role & Account Information Section */}
            <div className="registration-section">
              <h3 className="registration-section-title">Role & Account Information</h3>
              
              <fieldset className="registration-fieldset">
                <label htmlFor="role">
                  Role
                  <span className="required-asterisk">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="User">User</option>
                </select>
              </fieldset>

              <fieldset className="registration-fieldset">
                <label htmlFor="email">
                  Email Address
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength="150"
                  required
                />
              </fieldset>
            </div>

            <div className="form-buttons">
              <button
                type="submit"
                className="save-btn"
                disabled={!isFormValid}
              >
                Save
              </button>
              <button
                type="button"
                className="save-btn cancel-btn"
                onClick={() => navigate("/user-management")}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </section>
  );

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}
      {renderForm()}
    </>
  );
}

