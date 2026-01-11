// Get user info from session storage
export const getUserInfo = () => {
  return JSON.parse(sessionStorage.getItem("user"));
};

// Get user role from session storage
export const getUserRole = () => {
  return (
    JSON.parse(
      sessionStorage.getItem("user")
    ).system_roles[0].role_name?.toLowerCase() || ""
  );
};
