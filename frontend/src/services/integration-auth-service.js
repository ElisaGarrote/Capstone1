import authAxios from "../api/integrationAuth";

/* ===============================
            EMPLOYEES
================================= */
// GET all employees
export async function fetchAllEmployees() {
  const res = await authAxios.get("employees/");
  return res.data;
}