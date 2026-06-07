let state = {
  allShows: [],
  selectedShowId: "",
  currentEpisodes: [],
  selectedEpisode: "",
  searchTerm: "",
  showSearchTerm: "",
  cache: {},
};

const message = document.getElementById("message");
const container = document.getElementById("main-container");
const searchBox = document.getElementById("search");
const countEpisodes = document.getElementById("episode-count");

const tvShowSelect = document.getElementById("tvShowSelect");
const episodeSelect = document.getElementById("episodesSelect");
const filterContainer = document.querySelector(".filter-container");
const searchLabel = document.getElementById("label");
const showCount = document.getElementById("show-count");
const showSearch = document.getElementById("show-search");
const showInput = document.getElementById("searchShow");
const showCounts = document.getElementById("show-count");

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
    message.textContent = "Unable to load TV shows. Please try again later.";
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
      `https://api.tvmaze.com/shows/${showId}/episodes`,
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
  const toSort = filteredShows.length > 0 ? filteredShows : [...state.allShows];
  const sortedShows = toSort.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
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
  const card = document.getElementById("show-card").content.cloneNode(true);

  card.querySelector(".show-name").textContent = show.name;
  card.querySelector(".tvshow-img").src =
    show.image?.medium || "placeholder.png";

  card.querySelector(".show-summary").innerHTML =
    show.summary || "No summary available.";

  card.querySelector(".status").textContent = `Status: ${show.status}`;
  card.querySelector(".rating").textContent = ` Rating: ${show.rating.average}`;
  card.querySelector(".runtime").textContent = `Runtime: ${show.runtime}`;
  card.querySelector(".genre").textContent = `Genre: ${show.genres}`;
  return card;
}

// EPISODE CARD

function createEpisodeCard(episode) {
  const card = document.getElementById("episode-card").content.cloneNode(true);

  card.querySelector(".episode-name").textContent = episode.name;
  card.querySelector(".episode-code").textContent =
    `- ${getEpisodeCode(episode)}`;

  card.querySelector(".episode-image").src =
    episode.image?.medium || "placeholder.png";

  card.querySelector(".episode-summary").innerHTML =
    episode.summary.trim()|| "No summary available.";

  return card;
}

// RENDER SHOWS
let filteredShows;

function renderShows() {
  container.textContent = "";
  showCount.style.display = "block";
  showSearch.style.display = "block";

  filteredShows = state.allShows.filter((show) => {
    return (
      show.name.toLowerCase().includes(state.showSearchTerm) ||
      show.genres.some((genre) =>
        genre.toLowerCase().includes(state.showSearchTerm),
      ) ||
      (show.summary || "").toLowerCase().includes(state.showSearchTerm) ||
      show.name.toLowerCase() === showInput.value.toLowerCase()
    );
  });

  const showCards = filteredShows.map(createTVShowCard);
  container.append(...showCards);

  countEpisodes.style.display = "none";
  searchLabel.style.display = "none";
  episodeSelect.style.display = "none";
  showCounts.textContent = `Found ${filteredShows.length} shows`;
}

// RENDER EPISODES
const backBtn = document.querySelector(".backBtn");

function navBtn() {
  backBtn.textContent = "Back to Show";
  backBtn.style.display = "block";
}

function renderEpisodes() {
  container.textContent = "";

  countEpisodes.style.display = "block";
  searchBox.style.display = "block";
  episodeSelect.style.display = "none";
  tvShowSelect.style.display = "none";
  episodeSelect.style.display = "block";
  showCount.style.display = "none";
  showSearch.style.display = "none";
  searchLabel.style.display = "block";

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
    message.textContent = "No episodes found. Try another term.";
    navBtn();
  }

  if (filteredEpisodes.length > 0) {
    navBtn();
  }

  const episodeCards = filteredEpisodes.map(createEpisodeCard);
  container.append(...episodeCards);

  countEpisodes.textContent = `Displaying ${filteredEpisodes.length}/${state.currentEpisodes.length} episodes.`;
  navBtn();
  populateEpisodeDropdown();
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

console.log(showInput);
showInput.addEventListener("input", () => {
  state.showSearchTerm = showInput.value.toLowerCase();
  renderShows();
  populateTVShowDropdown();
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
    tvShowSelect.style.display = "block";
    renderShows();

    return;
  }

  //tvShowSelect.style.display="none"
  state.currentEpisodes = await fetchEpisodes(state.selectedShowId);

  populateEpisodeDropdown();
  renderEpisodes();
});

// EPISODE SELECT
episodeSelect.addEventListener("change", () => {
  state.selectedEpisode = episodeSelect.value;
  renderEpisodes();
});

backBtn.addEventListener("click", () => {
  episodeSelect.style.display = "none";
  backBtn.style.display = "none";
  tvShowSelect.style.display = "block";
  renderShows();
});

// INIT

async function init() {
  state.allShows = await fetchTVShows();

  renderShows();
  populateTVShowDropdown();
}

init();
