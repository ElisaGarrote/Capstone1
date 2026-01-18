import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import NavBar from "../components/NavBar";
import DefaultProfile from "../assets/img/default-profile.svg";
import "../styles/ManageProfile.css";

export default function ManageProfile() {
  const [userInfo, setUserInfo] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    company_id: "",
    department: "",
    email: "",
    password: "",
    image: null,
    imageFile: null,
  });
  const { user, fetchUserProfile, updateUserProfile, updateUserContext } =
    useAuth();

  const [statusAlert, setStatusAlert] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const profile = (await fetchUserProfile()) || user;

      if (!mounted) return;

      if (profile) {
        setUserInfo({
          first_name: profile.first_name || profile.firstName || "",
          middle_name: profile.middle_name || profile.middleName || "",
          last_name: profile.last_name || profile.lastName || "",
          suffix: profile.suffix || "",
          company_id: profile.company_id || "",
          department: profile.department || "",
          email: profile.email || "",
          password: "",
          image: profile.profile_picture || profile.image || null,
        });
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchUserProfile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserInfo((prev) => ({
          ...prev,
          image: e.target.result,
          imageFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      first_name: userInfo.first_name,
      middle_name: userInfo.middle_name,
      last_name: userInfo.last_name,
      suffix: userInfo.suffix,
      company_id: userInfo.company_id,
      department: userInfo.department,
      email: userInfo.email,
      // include file when present so backend can accept multipart uploads
      profile_picture: userInfo.imageFile || undefined,
    };

    try {
      const res = await updateUserProfile(payload);
      if (res?.success) {
        updateUserContext(res.data);
        setStatusAlert({
          type: "success",
          message: "Profile updated successfully",
        });
        setTimeout(() => setStatusAlert(null), 4000);
      } else {
        console.error("Profile update failed:", res?.error);
        setStatusAlert({ type: "danger", message: "Failed to update profile" });
        setTimeout(() => setStatusAlert(null), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="manage-profile-page">
        <div className="manage-profile-container">
          <h1>Manage Profile</h1>

          {statusAlert && (
            <div style={{ marginTop: 8 }}>
              <Alert message={statusAlert.message} type={statusAlert.type} />
            </div>
          )}

          <div className="profile-content">
            <div className="profile-left">
              <div className="profile-card">
                <div className="profile-image-section">
                  <div className="profile-image-container">
                    <img
                      src={userInfo.image || DefaultProfile}
                      alt="Profile"
                      className="profile-image"
                    />
                  </div>
                  <input
                    type="file"
                    id="profile-image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="profile-image-input"
                    className="change-image-btn"
                  >
                    Change Photo
                  </label>
                </div>

                <div className="profile-info">
                  <h3>
                    {userInfo.first_name} {userInfo.last_name}
                  </h3>
                  <div className="profile-details">
                    <p>
                      <strong>Position:</strong>
                    </p>
                    <p>{userInfo.department || "Not specified"}</p>
                    <p>
                      <strong>Department:</strong>
                    </p>
                    <p>{userInfo.department || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-right">
              <form onSubmit={handleSaveChanges}>
                <div className="profile-settings-card">
                  <h2>Profile Settings</h2>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={userInfo.first_name}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Company ID</label>
                      <input
                        type="text"
                        name="company_id"
                        value={userInfo.company_id}
                        onChange={handleInputChange}
                        placeholder="XXX-XXX-XXX"
                      />
                    </div>

                    <div className="form-group">
                      <label>Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        value={userInfo.middle_name}
                        onChange={handleInputChange}
                        placeholder="Enter middle name (if applicable)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={userInfo.department}
                        onChange={handleInputChange}
                        placeholder="XXXXXXXXX"
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={userInfo.last_name}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Suffix</label>
                      <input
                        type="text"
                        name="suffix"
                        value={userInfo.suffix}
                        onChange={handleInputChange}
                        placeholder="Enter suffix (if applicable)"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="save-changes-btn"
                    disabled={isSaving}
                  >
                    {isSaving ? "SAVING..." : "SAVE CHANGES"}
                  </button>
                </div>

                <div className="authentication-card">
                  <h2>Authentication Details</h2>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      placeholder="Email@gmail.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={userInfo.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
