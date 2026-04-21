let state = {
  films: [],
  searchTerm: "",
  selectedValue: "",
};

const message = document.getElementById("message");
const container = document.getElementById("episode-container");
const searchBox = document.getElementById("search");
const countEpisodes = document.getElementById("episode-count");

const getEpisodeCode = (episode) => {
  const seasonNo = episode.season.toString().padStart(2, "0");
  const episodeNo = episode.number.toString().padStart(2, "0");
  return `S${seasonNo}E${episodeNo}`;
}

const fetchFilms = async () => {
  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }
    return await response.json();

  } catch (error) {
    container.textContent = ""
    message.textContent = "Unable to load episodes from the server. Please try again later."

    // Return empty array so state.films never becomes undefined
    return [];
  }
};

async function init() {
  state.films = await fetchFilms();

  populateDropdown();
  render();
}

init();

function createEpisodeCard(episode) {
  const card = document.getElementById("episode-card").content.cloneNode(true);

  card.querySelector(".episode-name").textContent = episode.name;
  card.querySelector(".episode-code").textContent = `- ${getEpisodeCode(episode)}`;
  card.querySelector("img").src = episode.image.medium;

  // Using innerHTML because summary contains p tag
  card.querySelector(".episode-summary").innerHTML = episode.summary;

  return card;
}

function render() {

  container.textContent = "";

  const filteredEpisodes = state.films.filter((episode) => {
    const matchesSearch =
      episode.name.toLowerCase().includes(state.searchTerm) ||
      episode.summary.toLowerCase().includes(state.searchTerm);

    const matchesDropdown =
      state.selectedValue === "" || state.selectedValue === getEpisodeCode(episode);

    return matchesSearch && matchesDropdown;
  });

  if (filteredEpisodes.length === 0) {
    message.textContent =
      "Your search term is not matching any episodes. Try another term!";
  } else {
    message.textContent = "";
  }

  const episodeCards = filteredEpisodes.map(createEpisodeCard);
  container.append(...episodeCards);

  if (state.searchTerm.length > 0 || state.selectedValue !== "") {
    countEpisodes.textContent = `Displaying ${filteredEpisodes.length}/${state.films.length} episodes.`;
  } else {
    countEpisodes.textContent = "";
  }
}

searchBox.addEventListener("input", handleInput);

function handleInput() {
  const term = searchBox.value.toLowerCase().trim();
  state.searchTerm = term;
  render();
}

// Dropdown filtering
const dropdown = document.getElementById("episodes");
function populateDropdown() {
  dropdown.innerHTML = "";

  const option = document.createElement("option");
  option.value = "";
  option.textContent = "All episodes";
  dropdown.appendChild(option);

  state.films.forEach((episode) => {
    const option = document.createElement("option");
    option.value = getEpisodeCode(episode);

    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    dropdown.append(option);
  });
}

dropdown.addEventListener("change", () => {
  const selected = dropdown.value;
  state.selectedValue = selected;
  render();
});