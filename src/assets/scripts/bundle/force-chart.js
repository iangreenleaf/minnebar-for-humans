import * as d3 from "d3";
import * as stats from "../../../_data/stats.json";
import sessions from "../../../_data/sessions.json";

const connectionsMax = 3;

stats["connections"].sort((a, b) => b["count"] - a["count"]);
const links = [];
for (const session of sessions) {
  let foundConnections = 0;
  for (const connection of stats["connections"]) {
    if (foundConnections >= connectionsMax)
      break;
    if (!(connection["source"] === session["url"] || connection["target"] === session["url"]))
      continue;
    foundConnections += 1;
    if (links.includes(connection))
      continue;
    links.push(connection);
  }
}

window.addEventListener("load", (e) => {
  const svg = d3.select("#forces");
  const width = 900;
  const height = 900;

  const simulation = d3
    .forceSimulation(sessions)
    .force("link", d3
      .forceLink()
      .id((d) => d["url"])
      .links(links)
      .strength((d) => {
        return d["count"] / 10;
      })
    )
    .force("center", d3.forceCenter(width / 2, height / 2).strength(1))
    .force("manybody", d3.forceManyBody().strength(-200))
    .force("collide", d3
      .forceCollide()
      .radius((d) => {
        return areaToRadius(d["participants"].length*(25+10));
      })
    )
    .on("tick", ticked);

  const link = svg
  .append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("stroke-width", (d) => {
    return d["count"]*0.1;
  })
  .style("stroke", "pink");

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(sessions)
    .enter()
    .append("circle")
    .attr("r", (d) => {
      return areaToRadius(d["participants"].length*25);
    })
    .attr("fill", (d) => {
      const list = d["list"];
      if (list === "ai")
        return "red";
      if (list === "none")
        return "green";
      return "yellow";
    }).call(
      d3
        .drag()
        .on("start", (d) => {
          if (!d.active)
            simulation.alphaTarget(0.3).restart();
            d.subject.fx = d.subject.x;
            d.subject.fy = d.subject.y;
        })
        .on("drag", (d) => {
          d.subject.fx = d.x;
          d.subject.fy = d.y;
        })
        .on("end", (d) => {
          if (!d.active) simulation.alphaTarget(0);
          d.subject.fx = null;
          d.subject.fy = null;
        })
    );

  function ticked() {
    console.log("ticked");

    link
      .attr("x1", (d) => {
        return d.source.x;
      })
      .attr("y1", (d) => {
        return d.source.y;
      })
      .attr("x2", (d) => {
        return d.target.x;
      })
      .attr("y2", (d) => {
        return d.target.y;
      });

    node
      .attr("cx", (d) => {
        return d.x;
      })
      .attr("cy", (d) => {
        return d.y;
      });
  }
});

function areaToRadius(area) {
  return Math.sqrt(area/Math.PI);
}
