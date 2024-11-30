import { getCookie } from "./cookie";

import { API_BASE_URL } from "./api-config";

export const updateProduct = async (id: number, data: any) => {
  const token = getCookie("token");
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update product");
  return response.json();
};
