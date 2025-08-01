const scenes = [
  { label: "", subtitle: "", caption: "", render: scene0 },
  {
    label: "Setting the Stage",
    subtitle: "How superhero movies exploded in number and became a billion dollar market.",
    caption: "Movie count and revenue per year.",
    render: scene1,
  },
  {
    label: "The Formula for Success",
    subtitle: "Big budgets, bigger risks. Which superhero movies paid off?",
    caption: "Each bubble is a movie. Color shows profitability: red = flop, yellow = breakeven, green = success (2.5x budget).",
    render: scene2
  },
  {
    label: "Studio Showdown",
    subtitle: "Market share shifts across decades of superhero films.",
    caption: "Share of yearly box office gross by distributor (normalized 0–100%).",
    render: scene3
  },    
  {
    label: "One Genre, Many Universes",
    subtitle: "Franchises and characters are the backbone of modern superhero storytelling.",
    caption: "Treemap shows total revenue by character family based on franchise.",
    render: scene4
  },
  {
    label: "Explore Again",
    subtitle: "",
    caption: "",
    render: scene5,
  },
];

let currentScene = 0;

function showScene(index) {
  d3.select("#vis").html("");
  d3.select("#scene-label").text(scenes[index].label);
  d3.select("#scene-subtitle").text(scenes[index].subtitle);
  d3.select("#scene-caption").text(scenes[index].caption);
  scenes[index].render();

  const nextBtn = document.getElementById("next-btn");
  if (index === 0 || index === scenes.length - 1) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "inline-block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showScene(currentScene);

  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      document.getElementById("hero").style.display = "none";
      document.getElementById("scene-container").style.display = "block";
      document.getElementById("nav-container").style.display = "block";
      currentScene = 1;
      showScene(currentScene);
    });
  }

  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentScene < scenes.length - 1) {
        currentScene++;
      } else {
        currentScene = scenes.length - 1;
      }
      showScene(currentScene);
    });
  }
});
