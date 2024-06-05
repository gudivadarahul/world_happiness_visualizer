import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

const HappinessChart = ({ data }) => {
  const [sortCriteria, setSortCriteria] = useState("score");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFactor, setSelectedFactor] = useState("");
  const chartRef = useRef();

  const factorBlurbs = {
    "GDP per capita":
      "GDP per capita is a measure of a country's economic output per person. Higher economic prosperity is associated with higher levels of happiness.",
    "Social support":
      "Social support refers to the support and assistance people receive from their friends, family, and community. Strong social connections contribute to higher happiness levels.",
    "Healthy life expectancy":
      "Healthy life expectancy is the average number of years a person can expect to live in good health. Longer and healthier lives are linked to increased happiness.",
    "Freedom to make life choices":
      "Freedom to make life choices reflects the level of autonomy and control people have over their lives. Greater freedom is associated with higher happiness levels.",
    Generosity:
      "Generosity is measured by the proportion of people who donate money to charity. Acts of kindness and giving contribute to both individual and societal happiness.",
    "Perceptions of corruption":
      "Perceptions of corruption indicate the extent to which people believe corruption is widespread in their country. Lower levels of perceived corruption are associated with higher happiness.",
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleFactorChange = (event) => {
    const factor = event.target.value;
    setSelectedFactor(factor);
    if (factor === "alphabetical") {
      setSortCriteria("alphabetical");
    } else if (factor === "") {
      setSortCriteria("score");
    } else {
      setSortCriteria(factor);
    }
  };

  const filteredData = data
    .filter((d) => d["Country or region"].toLowerCase().includes(searchTerm))
    .sort((a, b) => {
      if (sortCriteria === "alphabetical") {
        return a["Country or region"].localeCompare(b["Country or region"]);
      } else if (sortCriteria === "score") {
        return b["Score"] - a["Score"];
      } else {
        return b[sortCriteria] - a[sortCriteria];
      }
    });

  useEffect(() => {
    if (filteredData.length === 0) return;

    // Clear any previous SVG elements
    d3.select(chartRef.current).selectAll("*").remove();

    // Set up the SVG element and its dimensions
    const svg = d3
      .select(chartRef.current)
      .attr("width", window.innerWidth - 100)
      .attr("height", filteredData.length * 50 + 50) // Extra space for legend
      .style("overflow", "visible");

    // Add a legend at the top
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${(window.innerWidth - 80) / 2 - 150}, 30)`
      );

    const legendData = [
      { color: "#00ff00", text: "High Happiness" },
      { color: "#ffff00", text: "Medium Happiness" },
      { color: "red", text: "Low Happiness" },
    ];

    const legendSpacing = 20; // Adjust this value as needed

    const legendText = legend
      .selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .text((d) => d.text)
      .attr("font-size", "12px")
      .attr("fill", "black");

    const legendRects = legend
      .selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => d.color);

    let previousX = 0;

    legendText.each(function (d, i) {
      const currentText = d3.select(this);
      const textWidth = currentText.node().getBBox().width;

      currentText.attr("transform", `translate(${previousX + 30}, 15)`);

      const currentRect = legendRects.filter((_, j) => j === i);
      currentRect.attr("transform", `translate(${previousX}, 0)`);

      previousX += textWidth + 30 + legendSpacing;
    });

    // Center the legend horizontally
    const legendWidth = previousX - legendSpacing;
    legend.attr(
      "transform",
      `translate(${(window.innerWidth - 200 - legendWidth) / 2}, 10)`
    );

    // Set up the scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => +d["Score"])])
      .range([0, window.innerWidth - 150]);

    // Set up the color scale
    const colorScale = d3
      .scaleSequential()
      .domain([
        d3.min(filteredData, (d) => +d["Score"]),
        d3.max(filteredData, (d) => +d["Score"]),
      ])
      .interpolator(
        d3.interpolateRgbBasis([
          "#8b0000", // dark red
          "#ff4500", // orange-red
          "#ffd700", // yellow-orange
          "#ffff00", // yellow
          "#9acd32", // yellow-green
          "#00ff00", // green
        ])
      );

    // Create a custom tooltip
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // Create the bars with tooltips and smooth scrolling
    const bars = svg
      .selectAll(".bar")
      .data(filteredData, (d) => d["Country or region"]) // Use key function to track data
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "bar")
            .attr("y", (d, i) => i * 50 + 50)
            .attr("height", 40)
            .attr("fill", (d) => colorScale(d["Score"]))
            .attr(
              "id",
              (d) => `bar-${d["Country or region"].replace(/\s+/g, "-")}`
            )
            .attr("width", 0),
        (update) =>
          update
            .attr("y", (d, i) => i * 50 + 50)
            .attr("fill", (d) => colorScale(d["Score"])),
        (exit) => exit.transition().duration(500).attr("width", 0).remove()
      );

    // Add country labels inside each bar
    const labels = svg
      .selectAll(".label")
      .data(filteredData, (d) => d["Country or region"]) // Use key function to track data
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "label")
            .attr("y", (d, i) => i * 50 + 75)
            .attr("x", 10)
            .text((d) => d["Country or region"])
            .attr("font-size", "12px")
            .attr("fill", "black")
            .attr("opacity", 0),
        (update) =>
          update
            .attr("y", (d, i) => i * 50 + 75)
            .text((d) => d["Country or region"]),
        (exit) => exit.transition().duration(500).attr("opacity", 0).remove()
      );

    // Add score text to the right end of each bar inside the bar
    const scores = svg
      .selectAll(".score")
      .data(filteredData)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "score")
            .attr("x", (d) => xScale(d["Score"]) - 5) // Position inside the bar, adjust as needed
            .attr("y", (d, i) => i * 50 + 75)
            .text((d) => d["Score"])
            .attr("font-size", "12px")
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .attr("opacity", 0),
        (update) =>
          update.attr("y", (d, i) => i * 50 + 75).text((d) => d["Score"]),
        (exit) => exit.transition().duration(500).attr("opacity", 0).remove()
      );

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = d3.select(entry.target);
            bar
              .transition()
              .duration(1000)
              .attr("width", (d) => xScale(d["Score"]));
            const scoreText = svg
              .selectAll(".score")
              .filter(
                (d) =>
                  `bar-${d["Country or region"].replace(/\s+/g, "-")}` ===
                  entry.target.id
              );
            scoreText
              .transition()
              .duration(1000)
              .attr("opacity", 1)
              .attr("x", (d) => xScale(d["Score"]) - 10); // Adjust padding
            const labelText = svg
              .selectAll(".label")
              .filter(
                (d) =>
                  `bar-${d["Country or region"].replace(/\s+/g, "-")}` ===
                  entry.target.id
              );
            labelText.transition().duration(1000).attr("opacity", 1);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    bars.each(function () {
      observer.observe(this);
    });

    bars
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<div class="tooltip-content">
              <div class="tooltip-title">${d["Country or region"]}</div>
              <div class="tooltip-item"><strong>Happiness Score:</strong> ${d["Score"]}</div>
              <div class="tooltip-item"><strong>GDP per Capita:</strong> ${d["GDP per capita"]}</div>
              <div class="tooltip-item"><strong>Social Support:</strong> ${d["Social support"]}</div>
              <div class="tooltip-item"><strong>Healthy Life Expectancy:</strong> ${d["Healthy life expectancy"]}</div>
              <div class="tooltip-item"><strong>Freedom to Make Life Choices:</strong> ${d["Freedom to make life choices"]}</div>
              <div class="tooltip-item"><strong>Generosity:</strong> ${d["Generosity"]}</div>
              <div class="tooltip-item"><strong>Perceptions of Corruption:</strong> ${d["Perceptions of corruption"]}</div>
            </div>`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .on("click", function (event, d) {
        document
          .getElementById(`bar-${d["Country or region"].replace(/\s+/g, "-")}`)
          .scrollIntoView({ behavior: "smooth" });
      });

    return () => {
      tooltip.remove();
      if (observer) {
        bars.each(function () {
          observer.unobserve(this);
        });
      }
    };
  }, [filteredData, selectedFactor]);

  return (
    <div>
      <div className="controls">
        <label>
          Sort by:
          <select value={selectedFactor} onChange={handleFactorChange}>
            <option value="">Happiness Score</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="GDP per capita">GDP per Capita</option>
            <option value="Social support">Social Support</option>
            <option value="Healthy life expectancy">
              Healthy Life Expectancy
            </option>
            <option value="Freedom to make life choices">
              Freedom to Make Life Choices
            </option>
            <option value="Generosity">Generosity</option>
            <option value="Perceptions of corruption">
              Perceptions of Corruption
            </option>
          </select>
        </label>
        <label>
          Search:
          <input type="text" value={searchTerm} onChange={handleSearchChange} />
        </label>
      </div>
      <div className="blurb-container">
        <p className="factor-blurb">
          {selectedFactor ? factorBlurbs[selectedFactor] : ""}
        </p>
      </div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default HappinessChart;
