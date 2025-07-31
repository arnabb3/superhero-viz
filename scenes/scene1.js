function scene1() {
  const margin = { top: 60, right: 40, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 420 - margin.top - margin.bottom;

  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("#vis")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("pointer-events", "none");

  d3.csv("data/superhero_movies.csv").then(data => {
    const grouped = {};

    data.forEach(d => {
      const year = +d.Year;
      if (!year) return;

      const title = d.Film;

      if (!grouped[year]) {
        grouped[year] = {
          year,
          movieCount: 0,
          titles: []
        };
      }

      grouped[year].movieCount += 1;
      grouped[year].titles.push(title);
    });

    const yearData = Object.values(grouped).sort((a, b) => a.year - b.year);

    const x = d3.scaleLinear()
      .domain(d3.extent(yearData, d => d.year))
      .range([0, width]);

    const yCount = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.movieCount)]).nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g").call(d3.axisLeft(yCount));

    const lineCount = d3.line()
      .x(d => x(d.year))
      .y(d => yCount(d.movieCount))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(yearData)
      .attr("fill", "none")
      .attr("stroke", "#2c7bb6")
      .attr("stroke-width", 3)
      .attr("d", lineCount);

    svg.selectAll(".dot")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => yCount(d.movieCount))
      .attr("r", 4)
      .attr("fill", "#2c7bb6")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.year}</strong><br>${d.movieCount} movies<br><ul style="margin: 4px 0 0; padding-left: 16px;">${d.titles.map(t => `<li>${t}</li>`).join("")}</ul>`)
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
      });

    const events = [
      { year: 2008, label: "MCU begins", anchor: "middle", dx: 0, dy: -10 },
      { year: 2012, label: "Avengers", anchor: "middle", dx: 0, dy: -25 }
    ];

    events.forEach(({ year, label, anchor, dx, dy }) => {
      const xCoord = x(year);
      svg.append("line")
        .attr("x1", xCoord)
        .attr("x2", xCoord)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#d7191c")
        .attr("stroke-dasharray", "4 4")
        .attr("stroke-width", 1.5);

      svg.append("text")
        .attr("x", xCoord + dx)
        .attr("y", dy)
        .attr("text-anchor", anchor)
        .text(`${year}: ${label}`)
        .attr("fill", "#d7191c")
        .attr("font-weight", "bold")
        .attr("font-size", "12px");
    });

    const legend = svg.append("g").attr("transform", `translate(0, -30)`);
    legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 5).attr("fill", "#2c7bb6");
    legend.append("text").attr("x", 10).attr("y", 4).text("Movies Released").style("font-size", "12px");
  });
}
