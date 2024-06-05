import React, { useEffect, useState } from "react";
import "./App.css";
import { fetchData } from "./api";
import HappinessChart from "./HappinessChart";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData();
      setData(result);
    };

    getData();
  }, []);

  return (
    <div className="App">
      <h1>World Happiness Index (2019)</h1>
      <HappinessChart data={data} />
    </div>
  );
}

export default App;
