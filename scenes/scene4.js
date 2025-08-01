function scene4() {
  const margin = { top: 30, right: 10, bottom: 10, left: 10 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  d3.select("#vis").html("");

  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const parseRevenue = d => {
    const n = parseFloat(d.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  d3.csv("data/superhero_movies.csv").then(data => {
    const cleaned = data.filter(d =>
      d["Character Family"] && d["Franchise"] &&
      (d["Franchise"] === "Marvel" || d["Franchise"] === "DC") &&
      parseRevenue(d["Inflation Adjusted Worldwide Gross"]) > 0
    );

    const nested = d3.rollup(
      cleaned,
      v => d3.sum(v, d => parseRevenue(d["Inflation Adjusted Worldwide Gross"])),
      d => d["Franchise"],
      d => d["Character Family"]
    );

    const bubbles = [];
    for (const [franchise, groups] of nested.entries()) {
      const total = d3.sum(Array.from(groups.values()));
      for (const [name, value] of groups.entries()) {
        bubbles.push({
          franchise,
          name,
          value,
          pctOfFranchise: value / total
        });
      }
    }

    const radius = d3.scaleSqrt()
      .domain([0, d3.max(bubbles, d => d.value)])
      .range([10, 60]);

    const colorScale = {
      Marvel: d3.scaleLinear().domain([0, 1]).range(["#ff9999", "#e20303"]),
      DC: d3.scaleLinear().domain([0, 1]).range(["#99b2ff", "#0056a6"])
    };

    const simulation = d3.forceSimulation(bubbles)
      .force("charge", d3.forceManyBody().strength(1))
      .force("collision", d3.forceCollide(d => radius(d.value) + 2))
      .force("x", d3.forceX(d => (d.franchise === "Marvel" ? -200 : 200)))
      .force("y", d3.forceY(0))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    const tooltip = d3.select("#vis")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("opacity", 0)
      .style("pointer-events", "none");

    const nodes = svg.selectAll("circle")
      .data(bubbles)
      .enter()
      .append("circle")
      .attr("r", d => radius(d.value))
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", d => colorScale[d.franchise](d.pctOfFranchise))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("mousemove", function (event, d) {
        tooltip
          .html(`<strong>${d.name}</strong><br>${d.franchise}<br>$${(d.value / 1e9).toFixed(2)}B<br>${(d.pctOfFranchise * 100).toFixed(1)}% of ${d.franchise}`)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 40 + "px")
          .transition().duration(100).style("opacity", 1);
      })
      .on("mouseleave", () => tooltip.transition().duration(200).style("opacity", 0));

    svg.selectAll("label")
      .data(bubbles)
      .enter()
      .append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 4) // slight vertical adjustment
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .attr("font-size", d => Math.min(14, radius(d.value) / 4))
      .attr("pointer-events", "none")
      .text(d => d.name)
      .each(function(d) {
        const textLength = this.getComputedTextLength();
        const r = radius(d.value);
        if (textLength > r * 1.8) {
          d3.select(this).remove(); // Hide label if text won't fit
        }
      });
  });
}
