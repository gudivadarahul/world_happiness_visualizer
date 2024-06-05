const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;

// Enable CORS using the cors middleware
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/api/data", (req, res) => {
  const results = [];
  fs.createReadStream(path.join(__dirname, "csv_files", "2019-happiness-report.csv"))
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
