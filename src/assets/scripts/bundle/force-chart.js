import * as d3 from "d3";
import * as stats from "../../../_data/stats.json";
import sessions from "../../../_data/sessions.json";

window.addEventListener("load", (e) => {
  const svg = d3.select("#forces");
  const width = 960;
  const height = 600;

  const simulation = d3
    .forceSimulation(sessions)
    .force("link", d3
      .forceLink()
      .id((d) => d["url"])
      .links(stats["connections"])
      .strength((d) => {
        return d["count"] / 5;
      })
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2).strength(1))
    .force("collide", d3
      .forceCollide()
      .radius((d) => {
        return d["participants"].length;
      })
    )
    .tick(1200)
    .on("tick", ticked);

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(sessions)
    .enter()
    .append("circle")
    .attr("r", (d) => {
      return d["participants"].length;
    })
    .attr("fill", (d) => {
      const list = d["list"];
      if (list === "ai")
        return "red";
      if (list === "none")
        return "green";
      return "yellow";
    })

  function ticked() {
    console.log("ticked")
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