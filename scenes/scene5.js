function scene5() {
  const container = d3.select("#vis");

  container
    .append("div")
    .attr("class", "explore-hub")
    .html(`
      <h2>📊 Explore the Story</h2>
      <p>Jump to any scene to revisit the trends, strategies, and evolution of superhero movies.</p>
      <div class="scene-buttons">
        <button class="jump-btn" data-target="1">🚀 Scene 1: Rise & Revenue</button>
        <button class="jump-btn" data-target="2">💸 Scene 2: Budget vs Profit</button>
        <button class="jump-btn" data-target="3">🤺 Scene 3: Studio Battle</button>
        <button class="jump-btn" data-target="4">🧩 Scene 4: Franchise Power</button>
      </div>
    `);

  d3.select("#scene-label").text("Explore Again");
  d3.select("#scene-subtitle").text("");
  d3.select("#scene-caption").text("Click a scene to revisit any part of the story.");

  // Wire up buttons
  document.querySelectorAll(".jump-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = parseInt(btn.getAttribute("data-target"));
      currentScene = target;
      showScene(currentScene);
    });
  });
}
