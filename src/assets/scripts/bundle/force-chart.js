import * as d3 from "d3";
import * as stats from "../../../_data/stats.json";
import sessions from "../../../_data/sessions.json";

window.addEventListener("load", (e) => {
  const svg = d3.select("#forces");
  svg.style("background", "red");
  const width = 960;
  const height = 600;

  const simulation = d3
    .forceSimulation(sessions)
    .force("link", d3
      .forceLink()
      .id((d) => {
        return d["url"]
      })
      .links(stats["connections"])
    )
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(sessions)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("fill", (d) => {
      return "orange";
    })
    .attr("stroke", "yellow");

  function ticked() {
    node
      .attr("cx", (d) => {
        return d.x;
      })
      .attr("cy", (d) => {
        return d.y;
      });
  }
});

console.log("loaded");