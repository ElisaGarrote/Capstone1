import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import TopSecFormPage from "../../components/TopSecFormPage";
import "../../styles/Registration.css";

export default function UserRegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    role: "",
    email: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const suffixOptions = [
    { value: "", label: "Select Suffix" },
    { value: "Jr.", label: "Jr." },
    { value: "Sr.", label: "Sr." },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.lastName || !formData.firstName || !formData.role || !formData.email) {
      setErrorMessage("Please fill in all required fields.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      console.log("Registering user:", formData);

      setSuccessMessage("User registered successfully!");
      setTimeout(() => {
        navigate("/user-management", {
          state: { successMessage: "User registered successfully!" },
        });
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Failed to register user. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleCancel = () => {
    navigate("/user-management");
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
          <section className="top">
            <TopSecFormPage
              root="User"
              currentPage="New User"
              rootNavigatePage="/user-management"
              title="New User"
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
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </fieldset>

                <fieldset className="registration-fieldset">
                  <label htmlFor="firstName">
                    First Name
                    <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </fieldset>

                <fieldset className="registration-fieldset">
                  <label htmlFor="middleName">Middle Name</label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Enter middle name"
                  />
                </fieldset>

                <fieldset className="registration-fieldset">
                  <label htmlFor="suffix">Suffix</label>
                  <select
                    id="suffix"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                    required
                  />
                </fieldset>
              </div>

              <div className="form-buttons">
                <button
                  type="submit"
                  className="save-btn"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  className="save-btn cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </main>
      </section>
      <Footer />
    </>
  );
}
