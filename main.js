const scenes = [
  { label: "", subtitle: "", caption: "", render: scene0 },
  {
    label: "Scene 1: Setting the Stage",
    subtitle: "How superhero movies exploded in number.",
    caption: "Movie count per year.",
    render: scene1,
  },
  {
    label: "Scene 2: The Formula for Success",
    subtitle: "Studios made bets. Some failed. Others made billions.",
    caption: "Each bubble is a movie. Red = profitable.",
    render: scene2,
  },
  {
    label: "Scene 3: Studio Showdown",
    subtitle: "Disney/Marvel overtook the genre post-2012.",
    caption: "Box office revenue by studio over time.",
    render: scene3,
  },
  {
    label: "Scene 4: One Genre, Many Universes",
    subtitle: "Franchises became the engine of blockbuster storytelling.",
    caption: "Treemap shows revenue by franchise.",
    render: scene4,
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

  // Show/hide nav based on scene
  const nextBtn = document.getElementById("next-btn");
  if (index === 0) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "inline-block";
  }
}

// Handle navigation button
document.addEventListener("DOMContentLoaded", () => {
  // Setup scene
  showScene(currentScene);

  // START button logic
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

  // NEXT button logic
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
