const defaultState = {
  industries: ["Real Money Gaming"],
  categories: [
    "Online Casino",
    "Online Sportsbook",
    "Sweepstakes/Social Casino",
    "DFS",
  ],
  publishers: [
    { name: "Caesars Palace Online Casino", category: "Online Casino", tags: [] },
    { name: "DraftKings Casino", category: "Online Casino", tags: [] },
    { name: "FanDuel Casino", category: "Online Casino", tags: [] },
    { name: "BetMGM Casino", category: "Online Casino", tags: [] },
    { name: "Bet365 US", category: "Online Casino", tags: [] },
    { name: "Hard Rock Bet", category: "Online Casino", tags: [] },
    { name: "Golden Nugget Online Casino", category: "Online Casino", tags: [] },
    { name: "BetRivers", category: "Online Casino", tags: [] },
    { name: "betPARX", category: "Online Casino", tags: [] },
    { name: "PlayStar", category: "Online Casino", tags: [] },
    { name: "Fanatics Casino", category: "Online Casino", tags: [] },
    { name: "Borgata Hotel Casino & Spa", category: "Online Casino", tags: [] },
    { name: "Bally Bet Sportsbook", category: "Online Casino", tags: [] },
    { name: "FireKeepers Casino", category: "Online Casino", tags: [] },
    { name: "Caesars Sportsbook", category: "Online Sportsbook", tags: [] },
    { name: "DraftKings Sportsbook", category: "Online Sportsbook", tags: [] },
    { name: "FanDuel Sportsbook", category: "Online Sportsbook", tags: [] },
    { name: "BetMGM", category: "Online Sportsbook", tags: [] },
    { name: "betPARX Sportsbook", category: "Online Sportsbook", tags: [] },
    { name: "Hard Rock Bet", category: "Online Sportsbook", tags: [] },
    { name: "BetRivers", category: "Online Sportsbook", tags: [] },
    { name: "Bally Bet Sportsbook", category: "Online Sportsbook", tags: [] },
    { name: "FireKeepers Casino", category: "Online Sportsbook", tags: [] },
    { name: "Chumba Casino", category: "Sweepstakes/Social Casino", tags: [] },
    { name: "WOW Vegas", category: "Sweepstakes/Social Casino", tags: [] },
    { name: "McLuck.com", category: "Sweepstakes/Social Casino", tags: [] },
    { name: "High 5 Casino", category: "Sweepstakes/Social Casino", tags: [] },
    { name: "RealPrize", category: "Sweepstakes/Social Casino", tags: [] },
    { name: "Betr", category: "DFS", tags: [] },
    { name: "Thrillzz Social Sportsbook", category: "DFS", tags: [] },
    { name: "Dabble Fantasy", category: "DFS", tags: [] },
    { name: "OwnersBox.com", category: "DFS", tags: [] },
    { name: "Onyx Odds", category: "DFS", tags: [] },
    { name: "Sleeper", category: "DFS", tags: [] },
    { name: "DraftKings Pick6", category: "DFS", tags: [] },
    { name: "PrizePicks", category: "DFS", tags: [] },
    { name: "Novig App", category: "DFS", tags: [] },
    { name: "FanDuel Picks", category: "DFS", tags: [] },
    { name: "Rebet, Inc.", category: "DFS", tags: [] },
  ],
};

const storageKey = "rmg-meta-ad-library";

const industryFilter = document.getElementById("industryFilter");
const categoryFilter = document.getElementById("categoryFilter");
const tagFilter = document.getElementById("tagFilter");
const searchInput = document.getElementById("searchInput");
const publisherGrid = document.getElementById("publisherGrid");
const graphTokenStatus = document.getElementById("graphTokenStatus");
const graphTokenSource = document.getElementById("graphTokenSource");
const graphTokenForm = document.getElementById("graphTokenForm");
const graphTokenInput = document.getElementById("graphTokenInput");
const clearGraphTokenButton = document.getElementById("clearGraphToken");
const publisherForm = document.getElementById("publisherForm");
const publisherNameInput = document.getElementById("publisherName");
const publisherCategoryInput = document.getElementById("publisherCategory");
const publisherTagInput = document.getElementById("publisherTag");
const resetButton = document.getElementById("resetState");
const cardTemplate = document.getElementById("publisherCardTemplate");

const sessionToken = sessionStorage.getItem("graphApiAccessToken") || "";
const configToken = window.graphConfig?.graphApiAccessToken || "";
let graphApiToken = sessionToken || configToken;
let graphApiTokenSource = graphApiToken
  ? sessionToken
    ? "Session storage (this tab)"
    : "config.js (untracked)"
  : "None";

function loadState() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return withIds(structuredClone(defaultState));
  try {
    const parsed = JSON.parse(stored);
    return withIds(parsed);
  } catch (err) {
    console.error("Failed to parse saved state", err);
    return withIds(structuredClone(defaultState));
  }
}

function withIds(state) {
  return {
    ...state,
    publishers: state.publishers.map((publisher) => ({
      ...publisher,
      id: publisher.id || crypto.randomUUID(),
    })),
  };
}

function maskToken(token) {
  if (!token) return "Not set";
  const visible = Math.min(6, token.length);
  const tail = token.slice(-visible);
  const maskedLength = Math.max(token.length - visible, 0);
  return `${"•".repeat(maskedLength)}${tail}`;
}

function updateGraphTokenStatus() {
  const tokenText = maskToken(graphApiToken);
  if (graphTokenStatus) graphTokenStatus.textContent = tokenText;

  if (graphTokenSource) {
    graphTokenSource.textContent = graphApiToken
      ? `Loaded from: ${graphApiTokenSource}`
      : "Loaded from: none";
  }

  window.graphApiToken = graphApiToken;
}

function persistGraphToken(token) {
  if (token) {
    sessionStorage.setItem("graphApiAccessToken", token);
  } else {
    sessionStorage.removeItem("graphApiAccessToken");
  }
}

function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify({
    ...state,
    publishers: state.publishers.map(({ id, ...rest }) => rest),
  }));
}

let state = loadState();

function hydrateFilters() {
  populateOptions(industryFilter, state.industries);
  populateOptions(categoryFilter, state.categories);
  populateOptions(publisherCategoryInput, state.categories);

  const tags = new Set();
  state.publishers.forEach((p) => p.tags.forEach((tag) => tags.add(tag)));
  populateOptions(tagFilter, Array.from(tags).sort());
}

function populateOptions(select, options) {
  const current = select.value;
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All";
  select.appendChild(defaultOption);

  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });

  if (Array.from(select.options).some((opt) => opt.value === current)) {
    select.value = current;
  }
}

function renderGrid() {
  publisherGrid.innerHTML = "";
  const filtered = state.publishers.filter(filterPublisher);

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No publishers match the current filters.";
    publisherGrid.appendChild(empty);
    return;
  }

  filtered.forEach((publisher) => {
    const card = cardTemplate.content.cloneNode(true);
    card.querySelector(".publisher-name").textContent = publisher.name;
    card.querySelector(".category").textContent = publisher.category;
    card.querySelector(".industry-tag").textContent = state.industries[0];
    const tagList = card.querySelector(".tag-list");

    if (publisher.tags.length === 0) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "No special tags";
      tagList.appendChild(tag);
    } else {
      publisher.tags.forEach((tagText) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = tagText;
        tagList.appendChild(tag);
      });
    }

    const removeButton = card.querySelector(".icon-button");
    removeButton.addEventListener("click", () => removePublisher(publisher.id));

    publisherGrid.appendChild(card);
  });
}

function filterPublisher(publisher) {
  const matchesIndustry =
    industryFilter.value === "all" || state.industries.includes(industryFilter.value);
  const matchesCategory =
    categoryFilter.value === "all" || publisher.category === categoryFilter.value;
  const matchesTag =
    tagFilter.value === "all" || publisher.tags.includes(tagFilter.value);
  const matchesSearch = publisher.name
    .toLowerCase()
    .includes(searchInput.value.trim().toLowerCase());

  return matchesIndustry && matchesCategory && matchesTag && matchesSearch;
}

function addPublisher(event) {
  event.preventDefault();
  const name = publisherNameInput.value.trim();
  const category = publisherCategoryInput.value;
  const rawTags = publisherTagInput.value.trim();
  if (!name || !category) return;

  const tags = rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  state.publishers.unshift({
    id: crypto.randomUUID(),
    name,
    category,
    tags,
  });

  hydrateFilters();
  renderGrid();
  saveState(state);
  publisherForm.reset();
}

function removePublisher(id) {
  state.publishers = state.publishers.filter((publisher) => publisher.id !== id);
  hydrateFilters();
  renderGrid();
  saveState(state);
}

function handleGraphTokenSubmit(event) {
  event.preventDefault();
  const token = graphTokenInput?.value.trim();
  if (!token) return;

  graphApiToken = token;
  graphApiTokenSource = "Session storage (this tab)";
  persistGraphToken(token);
  graphTokenInput.value = "";
  updateGraphTokenStatus();
}

function handleClearGraphToken() {
  graphApiToken = configToken || "";
  graphApiTokenSource = graphApiToken ? "config.js (untracked)" : "None";
  persistGraphToken("");
  updateGraphTokenStatus();
}

function resetState() {
  state = withIds(structuredClone(defaultState));
  saveState(state);
  hydrateFilters();
  renderGrid();
}

function bindListeners() {
  [industryFilter, categoryFilter, tagFilter].forEach((select) =>
    select.addEventListener("change", renderGrid)
  );
  searchInput.addEventListener("input", renderGrid);
  publisherForm.addEventListener("submit", addPublisher);
  if (graphTokenForm) graphTokenForm.addEventListener("submit", handleGraphTokenSubmit);
  if (clearGraphTokenButton)
    clearGraphTokenButton.addEventListener("click", handleClearGraphToken);
  resetButton.addEventListener("click", resetState);
}

function init() {
  hydrateFilters();
  bindListeners();
  updateGraphTokenStatus();
  renderGrid();
}

document.addEventListener("DOMContentLoaded", init);
