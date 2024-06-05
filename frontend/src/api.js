export const fetchData = async () => {
  const response = await fetch(
    "https://thriving-gnome-ab666a.netlify.app/api/data"
  );
  const data = await response.json();
  return data;
};
