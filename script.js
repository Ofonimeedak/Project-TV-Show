
function createEpisodeCard(episode) {

  const card = document.getElementById("episode-card").content.cloneNode(true);

  const seasonNo = episode.season.toString().padStart(2, "0");
  const episodeNo = episode.number.toString().padStart(2, "0");

  card.querySelector(".episode-name").textContent = episode.name;
  card.querySelector(".episode-code").textContent = `- S${seasonNo}E${episodeNo}`;
  card.querySelector("img").src = episode.image.medium;

  // Using innerHTML because summary contains p tag
  card.querySelector(".episode-summary").innerHTML = episode.summary;

  return card;
}


const container = document.getElementById("episode-container");
const searchBox = document.getElementById("search");
const countEpisodes = document.getElementById("episode-count");

const episodes = getAllEpisodes();

function render() {
  container.textContent = "";

  const term = searchBox.value.toLowerCase();
  const selected = dropdown.value;

  const filteredEpisodes = episodes.filter((episode) => {

    const seasonNo = episode.season.toString().padStart(2, "0");
    const episodeNo = episode.number.toString().padStart(2, "0");
    const code = `${seasonNo}-${episodeNo}`;

    const matchesSearch =
      episode.name.toLowerCase().includes(term) ||
      episode.summary.toLowerCase().includes(term)

    const matchesDropdown =
      selected === "" || selected === code;

    return matchesSearch && matchesDropdown;
  });

  const episodeCards = filteredEpisodes.map(createEpisodeCard);

  container.append(...episodeCards);

  if (term.length > 0 || selected != "") {
    countEpisodes.textContent =
      `Displaying ${filteredEpisodes.length}/${episodes.length} episodes.`;
  } else {
    countEpisodes.textContent = "";
  }
}

searchBox.addEventListener("input", handleInput);

function handleInput() {
  render();
}

// Dropdown filtering
const dropdown = document.getElementById("episodes");

const option = document.createElement("option");
option.value = "";
option.textContent = "All episodes";
dropdown.appendChild(option);

episodes.forEach((episode) => {
  const option = document.createElement("option");

  const seasonNo = episode.season.toString().padStart(2, "0");
  const episodeNo = episode.number.toString().padStart(2, "0");
  option.value = `${seasonNo}-${episodeNo}`;

  option.textContent = `S${seasonNo}E${episodeNo} - ${episode.name}`;
  dropdown.appendChild(option);
});

dropdown.addEventListener("change", render);

render();