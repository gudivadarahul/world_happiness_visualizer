const API_BASE_URL = "https://thriving-gnome-ab666a.netlify.app";

export const fetchData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/data`);
  const data = await response.json();
  return data;
};
