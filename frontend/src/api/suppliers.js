import axios from "axios";

const suppliersAxios = axios.create({
  baseURL: import.meta.env.VITE_CONTEXTS_API_URL,
  timeout: 10000,
});

suppliersAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Suppliers API Error]", error.response || error.message);
    return Promise.reject(error);
  }
);

export const fetchSuppliers = async () => {
  const res = await suppliersAxios.get("/api/suppliers/");
  return res.data;
};

export const fetchSupplier = async (id) => {
  const res = await suppliersAxios.get(`/api/suppliers/${id}/`);
  return res.data;
};

export default suppliersAxios;
