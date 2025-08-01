function scene3() {
  const margin = { top: 60, right: 120, bottom: 80, left: 80 };
  const width = 1000 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const parseRevenue = str => +str.replace(/[^\d.]/g, "") || 0;

  d3.csv("data/superhero_movies.csv").then(raw => {
    const distributorTotals = d3.rollup(
      raw,
      v => d3.sum(v, d => parseRevenue(d["Inflation Adjusted Worldwide Gross"])),
      d => d.Distributor
    );

    const topDistributors = Array.from(distributorTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(d => d[0]);

    const filtered = raw.filter(d => d.Year && d["Inflation Adjusted Worldwide Gross"]);
    const data = {};

    filtered.forEach(d => {
      const year = +d.Year;
      const dist = topDistributors.includes(d.Distributor) ? d.Distributor : "Other";
      const gross = parseRevenue(d["Inflation Adjusted Worldwide Gross"]);
      if (!data[year]) data[year] = { year };
      data[year][dist] = (data[year][dist] || 0) + gross;
    });

    const distributors = [...topDistributors, "Other"];
    const years = Object.keys(data).map(d => +d).sort((a, b) => a - b);
    const dataset = years.map(y => {
      const row = { year: y };
      const total = d3.sum(distributors, dist => data[y]?.[dist] || 0);
      distributors.forEach(d => {
        const val = data[y]?.[d] || 0;
        row[d] = val / total;
        row[d + "_raw"] = val;
      });
      return row;
    });

    const stack = d3.stack()
      .keys(distributors)
      .offset(d3.stackOffsetExpand);

    const series = stack(dataset);

    const x = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0, width]);

    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(distributors)
      .range(d3.schemeTableau10);

    // AXES
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("font-size", "12px");

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${(d / 1e9).toFixed(1)}B`))
      .attr("font-size", "12px");

    // STACKED AREA CHART
    const area = d3.area()
      .x(d => x(d.data.year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    svg.selectAll(".area")
      .data(series)
      .enter()
      .append("path")
      .attr("class", "area")
      .attr("fill", d => color(d.key))
      .attr("d", d => area(d))
      .attr("opacity", 0.8)
      .on("mousemove", function (event, d) {
        const [mx] = d3.pointer(event);
        const year = Math.round(x.invert(mx));
        const row = dataset.find(r => r.year === year);
        if (row) {
          const val = row[d.key + "_raw"] || 0;
          const pct = row[d.key] || 0;
          tooltip
            .html(`<strong>${d.key}</strong><br>${year}<br>$${(val / 1e6).toFixed(1)}M<br>${(pct * 100).toFixed(1)}%`)
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 40 + "px")
            .transition().duration(100).style("opacity", 1);
        }
      })
      .on("mouseleave", () => tooltip.transition().duration(200).style("opacity", 0));

    // VERTICAL GRIDLINES
    svg.append("g")
      .attr("class", "grid-v")
      .selectAll("line")
      .data(years)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#555")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", "3,3");

    // TOOLTIP
    const tooltip = d3.select("#vis")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "6px 10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);


    // LEGEND
    const legend = svg.append("g")
      .attr("transform", `translate(${width / 2 - 350}, ${height + 40})`);

    distributors.forEach((dist, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const xOffset = col * 250;
      const yOffset = row * 20;

      legend.append("rect")
        .attr("x", xOffset)
        .attr("y", yOffset)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(dist));

      legend.append("text")
        .attr("x", xOffset + 18)
        .attr("y", yOffset + 10)
        .text(dist)
        .attr("font-size", "12px")
        .attr("fill", "#333");
    });
  });
}
