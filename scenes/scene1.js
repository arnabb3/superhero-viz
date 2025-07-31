function scene1() {
  const margin = { top: 40, right: 70, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#vis")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("data/superhero_movies.csv", d3.autoType).then(data => {
    const yearData = d3.rollups(
      data.filter(d => d.Year),
      v => ({
        movieCount: v.length,
        totalGross: d3.sum(v, d => d["Inflation Adjusted Worldwide Gross"])
      }),
      d => d.Year
    ).map(([year, stats]) => ({ year, ...stats }))
     .sort((a, b) => d3.ascending(a.year, b.year));

    const x = d3.scaleLinear()
      .domain(d3.extent(yearData, d => d.year))
      .range([0, width]);

    const yCount = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.movieCount)]).nice()
      .range([height, 0]);

    const yRevenue = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.totalGross)]).nice()
      .range([height, 0]);

    // Axes
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(yCount));
    svg.append("g").attr("transform", `translate(${width},0)`).call(d3.axisRight(yRevenue).tickFormat(d => `$${(d / 1e9).toFixed(1)}B`));

    // Line generators
    const lineCount = d3.line()
      .x(d => x(d.year))
      .y(d => yCount(d.movieCount))
      .curve(d3.curveMonotoneX);

    const lineRevenue = d3.line()
      .x(d => x(d.year))
      .y(d => yRevenue(d.totalGross))
      .curve(d3.curveMonotoneX);

    // Draw lines
    svg.append("path")
      .datum(yearData)
      .attr("fill", "none")
      .attr("stroke", "#2c7bb6")
      .attr("stroke-width", 2.5)
      .attr("d", lineCount);

    svg.append("path")
      .datum(yearData)
      .attr("fill", "none")
      .attr("stroke", "#d7191c")
      .attr("stroke-width", 2.5)
      .attr("d", lineRevenue);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(0, ${height + 40})`);

    legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 6).attr("fill", "#2c7bb6");
    legend.append("text").attr("x", 12).attr("y", 4).text("Movies Released");

    legend.append("circle").attr("cx", 160).attr("cy", 0).attr("r", 6).attr("fill", "#d7191c");
    legend.append("text").attr("x", 172).attr("y", 4).text("Inflation-Adjusted Revenue");

    // Annotations
    svg.append("text")
      .attr("x", x(2008))
      .attr("y", yCount(5))
      .attr("fill", "#2c7bb6")
      .style("font-size", "12px")
      .text("2008: MCU begins");

    svg.append("text")
      .attr("x", x(2012))
      .attr("y", yRevenue(2.5e9) - 10)
      .attr("fill", "#d7191c")
      .style("font-size", "12px")
      .text("2012: Avengers");
  });
}
