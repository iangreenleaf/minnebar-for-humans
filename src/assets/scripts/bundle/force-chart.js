import * as d3 from "d3";
import * as stats from "../../../_data/stats.json";

window.addEventListener("load", (e) => {
  const svg = d3.select("#forces");
  svg.style("background", "red");
  const width = svg.attr("width");
  const height = svg.attr("height");

  console.log("hi");
  console.log(width, height);
});

console.log("loaded");