// Get user info from session storage
export const getUserInfo = () => {
  return JSON.parse(sessionStorage.getItem("user"));
};

// Get user role from session storage
export const getUserRole = () => {
  return JSON.parse(sessionStorage.getItem("user")).role?.toLowerCase() || "";
};
