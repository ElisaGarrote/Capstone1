import authAxios from "../api/integraitonAuth";

/* ===============================
            EMPLOYEES
================================= */
// GET all employees
export async function fetchAllEmployees() {
  const res = await authAxios.get("employees/");
  return res.data;
}