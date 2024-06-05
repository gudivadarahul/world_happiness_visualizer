const API_BASE_URL = "http://localhost:8000";

export const fetchData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/data`);
  const data = await response.json();
  return data;
};
 