const API_URL_AUTH =
  "https://authentication-service-production-d804.up.railway.app/auth/";
const API_URL_USER = "http://127.0.0.1:8000/users/";

class AuthService {
  // Login user and store tokens
  async login(email, password) {
    try {
      const response = await fetch(API_URL_AUTH + "jwt/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.log("login failed!");
        return false;
      }

      const data = await response.json();
      console.log("data:", data);

      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        console.log("Token successfully stored in the local storage!");
      } else {
        console.log("No access token in response!");
      }

      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  // Determine if there is any active admin
  async hasActiveAdmin() {
    try {
      const response = await fetch(API_URL_USER + "has_active_admin/");

      if (!response.ok) {
        console.log("failed to determine if there is any active admin");
        return false;
      }

      const data = await response.json();

      console.log("Fetched data:", data);
      return data;
    } catch (error) {
      console.log("Failed to determine if there is any active admin");
    }
  }

  // Get current user
  async getCurrrentUser() {
    try {
      const response = await fetch(API_URL_AUTH + "users/me/", {
        method: "GET",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        console.log("failed to fetch curr. user");
      }

      const data = await response.json();

      console.log("here's the fetched: ", data);
    } catch (error) {
      console.log("Failed to get the current user!", error);
    }
  }

  // Get the access token
  getAccessToken() {
    return localStorage.getItem("access");
  }

  // Get the Autorization headers
  getAuthHeader() {
    const token = this.getAccessToken();

    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `JWT ${token}` : "",
    };
  }

  // Logout and clear the tokens
  logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
}

const authService = new AuthService();

export default authService;
