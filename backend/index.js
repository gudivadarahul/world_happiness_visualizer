const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();

// Enable CORS using the cors middleware
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("/api/data", (req, res) => {
  const results = [];
  fs.createReadStream(
    path.join(__dirname, "csv_files", "2019-happiness-report.csv")
  )
    .pipe(csv())
    .on("data", (data) => {
      // Convert numeric values to numbers
      data["Overall rank"] = Number(data["Overall rank"]);
      data["Score"] = Number(data["Score"]);
      data["GDP per capita"] = Number(data["GDP per capita"]);
      data["Social support"] = Number(data["Social support"]);
      data["Healthy life expectancy"] = Number(data["Healthy life expectancy"]);
      data["Freedom to make life choices"] = Number(
        data["Freedom to make life choices"]
      );
      data["Generosity"] = Number(data["Generosity"]);
      data["Perceptions of corruption"] = Number(
        data["Perceptions of corruption"]
      );

      results.push(data);
    })
    .on("end", () => {
      // console.log("results", results);
      res.json(results);
    });
});

// Serve the frontend's index.html file for all other requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
