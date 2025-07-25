let currentScene = 0;
const scenes = [scene1, scene2, scene3, scene4];

function showScene(index) {
  d3.select("#vis").html(""); // Clear previous chart
  d3.select("#scene-label").text(`Scene ${index + 1}`);
  scenes[index]();
}

d3.select("#next-btn").on("click", () => {
  if (currentScene < scenes.length - 1) {
    currentScene++;
    showScene(currentScene);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  showScene(currentScene);
});
