function scene2() {
  const margin = { top: 60, right: 60, bottom: 80, left: 100 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

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

  function cleanNumber(str) {
    return +str.replace(/[^\d.]/g, "") || 0;
  }

  d3.csv("data/superhero_movies.csv").then(raw => {
    const data = raw.map(d => {
      const budget = cleanNumber(d["Inflation Adjusted Budget"]);
      const gross = cleanNumber(d["Inflation Adjusted Worldwide Gross"]);
      let rating = "flop";
      if (gross > 2.5 * budget) rating = "hit";
      else if (gross > budget) rating = "moderate";

      return {
        title: d.Film,
        budget,
        gross,
        rating
      };
    }).filter(d => d.budget > 0 && d.gross > 0);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.budget) * 1.1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.gross) * 1.1])
      .range([height, 0]);

    const radius = d3.scaleSqrt()
      .domain(d3.extent(data, d => d.gross))
      .range([4, 18]);

    const color = d => ({
      flop: "#d73027",
      moderate: "#fdae61",
      hit: "#1a9850"
    })[d.rating];

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `$${(d / 1e6).toFixed(0)}M`));

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${(d / 1e6).toFixed(0)}M`));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Inflation-Adjusted Budget");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Inflation-Adjusted Worldwide Gross");

    // X-axis gridlines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#eee");

    // Y-axis gridlines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#eee");


    svg.selectAll(".bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", d => x(d.budget))
      .attr("cy", d => y(d.gross))
      .attr("r", 0)
      .attr("fill", d => color(d))
      .attr("stroke", "#444")
      .attr("opacity", 0.75)
      .on("mouseover", (event, d) => {
      const label = {
        flop: "❌ Flop",
        moderate: "➖ Moderate",
        hit: "✅ Hit"
      }[d.rating];
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(
        `<strong>${d.title}</strong><br/>
         Budget: $${(d.budget / 1e6).toFixed(1)}M<br/>
         Gross: $${(d.gross / 1e6).toFixed(1)}M<br/>
         ${label}`
      )
      .style("left", (event.pageX + 12) + "px")
      .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
      tooltip.transition().duration(300).style("opacity", 0);
      })
      .transition()
      .duration(900)
      .attr("r", d => 1 * radius(d.gross));
  });
}
