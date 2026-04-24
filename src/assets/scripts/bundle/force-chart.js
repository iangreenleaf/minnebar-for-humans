import * as d3 from "d3";
import * as stats from "../../../_data/stats.json";
import sessions from "../../../_data/sessions.json";

window.addEventListener("load", (e) => {
  const svg = d3.select("#forces");
  svg.style("background", "red");
  const width = svg.attr("width");
  const height = svg.attr("height");

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

  // const link = svg
  //   .append("g")
  //   .attr("class", "links")
  //   .selectAll("line")
  //   .data(stats["connections"])
  //   .enter()
  //   .append("line")
  //   .attr("stroke-width", (d) => {
  //     return 0.5;
  //   })
  //   .style("stroke", "pink");

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
    // link
    //   .attr("x1", (d) => {
    //     return d.source.x;
    //   })
    //   .attr("y1", (d) => {
    //     return d.source.y;
    //   })
    //   .attr("x2", (d) => {
    //     return d.target.x;
    //   })
    //   .attr("y2", (d) => {
    //     return d.target.y;
    //   });

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