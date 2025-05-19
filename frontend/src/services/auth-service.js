const API_URL = "http://127.0.0.1:8000/auth/";

class AuthService {
  // Login user and store tokens
  async login(email, password) {
    try {
      const response = await fetch(API_URL + "jwt/create/", {
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

  // Get current user
  async getCurrrentUser() {
    try {
      const response = await fetch(API_URL + "users/me/", {
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
