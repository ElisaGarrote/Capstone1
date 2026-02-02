// Get user info from session storage
export const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Get user role from session storage
export const getUserRole = () => {
  const user = getUserInfo();
  // Support both old format (user.role) and new format (user.roles[0].role)
  if (user?.roles?.[0]?.role) {
    return user.roles[0].role.toLowerCase();
  }
  return user?.role?.toLowerCase() || "";
};
