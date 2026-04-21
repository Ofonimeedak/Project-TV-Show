let state = {
  films: [],
  searchTerm: "",
  selectedVAlue: "",
};

const fetchFilms = async () => {
  const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
  return await response.json();
};

async function init() {
  state.films = await fetchFilms();

  populateDropdown();
  render();
}

init();

function createEpisodeCard(episode) {
  const card = document.getElementById("episode-card").content.cloneNode(true);

  const seasonNo = episode.season.toString().padStart(2, "0");
  const episodeNo = episode.number.toString().padStart(2, "0");

  card.querySelector(".episode-name").textContent = episode.name;
  card.querySelector(".episode-code").textContent =
    `- S${seasonNo}E${episodeNo}`;
  card.querySelector("img").src = episode.image.medium;

  // Using innerHTML because summary contains p tag
  card.querySelector(".episode-summary").innerHTML = episode.summary;

  return card;
}

const container = document.getElementById("episode-container");
const searchBox = document.getElementById("search");
const countEpisodes = document.getElementById("episode-count");

function render() {
  container.textContent = "";
  
  const filteredEpisodes = state.films.filter((episode) => {
    const seasonNo = episode.season.toString().padStart(2, "0");
    const episodeNo = episode.number.toString().padStart(2, "0");
    const code = `${seasonNo}-${episodeNo}`;
    const matchesSearch =
      episode.name.toLowerCase().includes(state.searchTerm) ||
      episode.summary.toLowerCase().includes(state.searchTerm);

    const matchesDropdown =
      state.selectedVAlue === "" || state.selectedVAlue === code;
  

    return matchesSearch && matchesDropdown;
  });

  if (filteredEpisodes.length === 0) {
    const message = document.getElementById("message");
    message.textContent =
      "Your search term is not matching any episodes. Try another term!";
    message.style.textAlign = "center";
    message.style.display = "block";
  }

  const episodeCards = filteredEpisodes.map(createEpisodeCard);

  container.append(...episodeCards);

  if (state.searchTerm.length > 0 || state.selectedVAlue != "") {
    countEpisodes.textContent = `Displaying ${filteredEpisodes.length}/${state.films.length} episodes.`;
  } else {
    countEpisodes.textContent = "";
  }
}

searchBox.addEventListener("input", handleInput);

function handleInput() {
  const term = searchBox.value.toLowerCase();
  state.searchTerm = term;
  render();
}

// Dropdown filtering
const dropdown = document.getElementById("episodes");
function populateDropdown() {
  const option = document.createElement("option");
  option.value = "";
  option.textContent = "All episodes";
  dropdown.appendChild(option);

  state.films.forEach((episode) => {
    const option = document.createElement("option");
    const seasonNo = episode.season.toString().padStart(2, "0");
    const episodeNo = episode.number.toString().padStart(2, "0");

    option.value = `${seasonNo}-${episodeNo}`;

    option.textContent = `S${seasonNo}E${episodeNo} - ${episode.name}`;
    dropdown.append(option);
  });
}

dropdown.addEventListener("change", () => {
  const selected = dropdown.value;
  state.selectedVAlue = selected;
  render();
});

render();
