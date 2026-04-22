let state = {
  allShows: [],
  selectedShowId: "",
  currentEpisodes: [],
  selectedEpisode: "",
  searchTerm: "",
  cache: {}
};

const message = document.getElementById("message");
const container = document.getElementById("main-container");
const searchBox = document.getElementById("search");
const countEpisodes = document.getElementById("episode-count");

const tvShowSelect = document.getElementById("tvShowSelect");
const episodeSelect = document.getElementById("episodesSelect");

const getEpisodeCode = (episode) => {
  const seasonNo = String(episode.season).padStart(2, "0");
  const episodeNo = String(episode.number).padStart(2, "0");
  return `S${seasonNo}E${episodeNo}`;
};


// FETCH ALL SHOWS

async function fetchTVShows() {
  try {
    const res = await fetch("https://api.tvmaze.com/shows");

    if (!res.ok) {
      throw new Error(`Error status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    message.textContent =
      "Unable to load TV shows. Please try again later.";
    return [];
  }
}


// FETCH EPISODES WITH CACHE

async function fetchEpisodes(showId) {
  // prevent duplicate fetches
  if (state.cache[showId]) {
    return state.cache[showId];
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );

    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }

    const data = await response.json();

    // save to cache
    state.cache[showId] = data;

    return data;
  } catch (error) {
    message.textContent =
      "Unable to load episodes from the server. Please try again later.";
    return [];
  }
}


// SHOW DROPDOWN

function populateTVShowDropdown() {
  tvShowSelect.innerHTML = "";

  const allShowsOption = document.createElement("option");
  allShowsOption.value = "";
  allShowsOption.textContent = "All shows";
  tvShowSelect.appendChild(allShowsOption);

  // alphabetical order (case-insensitive)
  const sortedShows = [...state.allShows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;

    tvShowSelect.appendChild(option);
  });
}

// EPISODE DROPDOWN
function populateEpisodeDropdown() {
  episodeSelect.innerHTML = "";

  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "";
  allEpisodesOption.textContent = "All episodes";
  episodeSelect.appendChild(allEpisodesOption);

  state.currentEpisodes.forEach((episode) => {
    const code = getEpisodeCode(episode);

    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });
}

// SHOW CARD

function createTVShowCard(show) {
  const card = document
    .getElementById("show-card")
    .content.cloneNode(true);

  card.querySelector(".show-name").textContent = show.name;
  card.querySelector(".tvshow-img").src =
    show.image?.medium || "placeholder.png";

  card.querySelector(".show-summary").innerHTML =
    show.summary || "No summary available.";

  return card;
}


// EPISODE CARD

function createEpisodeCard(episode) {
  const card = document
    .getElementById("episode-card")
    .content.cloneNode(true);

  card.querySelector(".episode-name").textContent = episode.name;
  card.querySelector(".episode-code").textContent =
    `- ${getEpisodeCode(episode)}`;

  card.querySelector(".episode-image").src =
    episode.image?.medium || "placeholder.png";

  card.querySelector(".episode-summary").innerHTML =
    episode.summary || "No summary available.";

  return card;
}


// RENDER SHOWS

function renderShows() {
  container.textContent = "";

  const filteredShows = state.allShows.filter((show) =>
    show.name.toLowerCase().includes(state.searchTerm)
  );

  const showCards = filteredShows.map(createTVShowCard);
  container.append(...showCards);

  countEpisodes.textContent = "";
}


// RENDER EPISODES

function renderEpisodes() {
  container.textContent = "";

  const filteredEpisodes = state.currentEpisodes.filter((episode) => {
    const matchesSearch =
      episode.name.toLowerCase().includes(state.searchTerm) ||
      (episode.summary || "").toLowerCase().includes(state.searchTerm);

    const matchesDropdown =
      state.selectedEpisode === "" ||
      state.selectedEpisode === getEpisodeCode(episode);

    return matchesSearch && matchesDropdown;
  });

  if (filteredEpisodes.length === 0) {
    message.textContent =
      "No episodes found. Try another term.";
  } else {
    message.textContent = "";
  }

  const episodeCards = filteredEpisodes.map(createEpisodeCard);
  container.append(...episodeCards);

  countEpisodes.textContent =
    `Displaying ${filteredEpisodes.length}/${state.currentEpisodes.length} episodes.`;
}


// SEARCH

searchBox.addEventListener("input", () => {
  state.searchTerm = searchBox.value.toLowerCase().trim();

  if (state.selectedShowId === "") {
    renderShows();
  } else {
    renderEpisodes();
  }
});


// SHOW SELECT

tvShowSelect.addEventListener("change", async () => {
  state.selectedShowId = tvShowSelect.value;
  state.selectedEpisode = "";
  state.searchTerm = "";
  searchBox.value = "";

  if (state.selectedShowId === "") {
    state.currentEpisodes = [];
    episodeSelect.innerHTML = "";
    renderShows();
    return;
  }

  state.currentEpisodes = await fetchEpisodes(state.selectedShowId);

  populateEpisodeDropdown();
  renderEpisodes();
});


// EPISODE SELECT
episodeSelect.addEventListener("change", () => {
  state.selectedEpisode = episodeSelect.value;
  renderEpisodes();
});


// INIT
async function init() {
  state.allShows = await fetchTVShows();

  populateTVShowDropdown();
  renderShows();
}

init();