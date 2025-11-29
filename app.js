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

const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const publisherGrid = document.getElementById("publisherGrid");
const adPublisherSelect = document.getElementById("adPublisher");
const adCountryInput = document.getElementById("adCountry");
const adLimitInput = document.getElementById("adLimit");
const adStatus = document.getElementById("adStatus");
const adResults = document.getElementById("adResults");
const adLibraryForm = document.getElementById("adLibraryForm");
const refreshPublisherOptions = document.getElementById("refreshPublisherOptions");
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
  populateOptions(categoryFilter, state.categories);
  populateOptions(publisherCategoryInput, state.categories);
  populatePublisherSelect();
}

function populatePublisherSelect() {
  if (!adPublisherSelect) return;
  const current = adPublisherSelect.value;
  adPublisherSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a publisher";
  adPublisherSelect.appendChild(placeholder);

  state.publishers.forEach((publisher) => {
    const opt = document.createElement("option");
    opt.value = publisher.id;
    opt.textContent = publisher.name;
    adPublisherSelect.appendChild(opt);
  });

  if (Array.from(adPublisherSelect.options).some((opt) => opt.value === current)) {
    adPublisherSelect.value = current;
  }
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
    const nameEl = card.querySelector(".publisher-name");
    nameEl.textContent = publisher.name;
    nameEl.tabIndex = 0;
    nameEl.setAttribute("role", "button");
    nameEl.setAttribute("title", "Load creatives for this publisher");
    nameEl.addEventListener("click", () =>
      loadCreativesForPublisher(publisher.id, { focusSelect: true })
    );
    nameEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        loadCreativesForPublisher(publisher.id, { focusSelect: true });
      }
    });
    card.querySelector(".category").textContent = publisher.category;

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

  return matchesCategory && matchesSearch;
}

function addPublisher(event) {
  event.preventDefault();
  const name = publisherNameInput.value.trim();
  const category = publisherCategoryInput.value;
  if (!name || !category) return;

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

function setAdStatus(message, tone = "muted") {
  if (!adStatus) return;
  adStatus.textContent = message;
  adStatus.dataset.tone = tone;
}

function clearAdResults() {
  if (adResults) adResults.innerHTML = "";
}

function renderAdResults(items = []) {
  clearAdResults();
  if (!adResults) return;
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No creatives returned for this query.";
    adResults.appendChild(empty);
    return;
  }

  items.forEach((ad) => {
    const card = document.createElement("article");
    card.className = "ad-card";

    const title = document.createElement("h3");
    title.textContent = ad.ad_creative_link_title || "Untitled creative";
    card.appendChild(title);

    if (ad.ad_creative_body) {
      const body = document.createElement("p");
      body.textContent = ad.ad_creative_body;
      card.appendChild(body);
    }

    const meta = document.createElement("div");
    meta.className = "ad-meta";
    const platforms = document.createElement("span");
    platforms.className = "tag";
    platforms.textContent = ad.publisher_platforms?.join(", ") || "Unknown platforms";
    meta.appendChild(platforms);

    if (ad.ad_reached_countries?.length) {
      const countries = document.createElement("span");
      countries.className = "tag";
      countries.textContent = `Countries: ${ad.ad_reached_countries.join(", ")}`;
      meta.appendChild(countries);
    }

    card.appendChild(meta);

    if (ad.ad_snapshot_url) {
      const link = document.createElement("a");
      link.href = ad.ad_snapshot_url;
      link.className = "ad-link";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open ad snapshot";
      card.appendChild(link);
    }

    adResults.appendChild(card);
  });
}

async function loadCreativesForPublisher(publisherId, { focusSelect = false } = {}) {
  if (!publisherId) {
    setAdStatus("Select a publisher first.", "warn");
    return;
  }

  const publisher = state.publishers.find((p) => p.id === publisherId);
  if (!publisher) {
    setAdStatus("Publisher not found in the list.", "warn");
    return;
  }

  if (!graphApiToken) {
    setAdStatus("Add a Graph API access token before querying.", "warn");
    return;
  }

  if (/\s/.test(graphApiToken)) {
    setAdStatus(
      "The access token looks malformed. Paste the raw token without quotes, spaces, or a 'Bearer' prefix.",
      "warn"
    );
    return;
  }

  if (focusSelect && adPublisherSelect) {
    adPublisherSelect.value = publisherId;
  }

  const country = adCountryInput?.value.trim() || "US";
  const limit = Math.min(Math.max(Number(adLimitInput?.value) || 12, 1), 50);

  const url = new URL("https://graph.facebook.com/v20.0/ads_archive");
  url.searchParams.set("access_token", graphApiToken);
  url.searchParams.set("search_terms", publisher.name);
  url.searchParams.set("ad_reached_countries", country || "US");
  url.searchParams.set("ad_active_status", "ALL");
  url.searchParams.set("ad_type", "ALL");
  url.searchParams.set(
    "fields",
    [
      "ad_creative_body",
      "ad_creative_link_caption",
      "ad_creative_link_description",
      "ad_creative_link_title",
      "ad_snapshot_url",
      "publisher_platforms",
      "ad_reached_countries",
    ].join(",")
  );
  url.searchParams.set("limit", String(limit));

  setAdStatus(`Fetching creatives for ${publisher.name}…`, "info");
  clearAdResults();

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const graphErr = await parseGraphError(response);
      throw new Error(graphErr);
    }

    const data = await response.json();
    if (data?.error) {
      const graphErr = formatGraphError(data.error);
      throw new Error(graphErr);
    }

    const items = data?.data || [];
    renderAdResults(items);
    setAdStatus(`Loaded ${items.length} creatives for ${publisher.name}.`, "success");
  } catch (err) {
    console.error("Failed to fetch ads", err);
    const fallback =
      "Unable to load creatives. Confirm the token, permissions, and network access, then try again.";
    const message = err?.message || fallback;
    setAdStatus(`Unable to load creatives: ${message}`, "error");
  }
}

function formatGraphError(error, meta = {}) {
  if (!error) return "An unknown Graph API error occurred.";

  const parts = [error.error_user_msg || error.message || "Graph API request failed."];
  const codes = [error.code, error.error_subcode].filter(Boolean);
  if (codes.length) parts.push(`(code ${codes.join("/")})`);
  if (error.fbtrace_id) parts.push(`trace ${error.fbtrace_id}`);
  if (meta.status) parts.push(`[HTTP ${meta.status}]`);

  const message = parts.join(" ");

  if (codes.includes(1)) {
    return `${message} Check that the access token is valid, not expired, and has Ads Library access with ads_read. If the issue persists, regenerate the token and retry.`;
  }

  if (codes.includes(190)) {
    return `${message} The token may be malformed. Paste the raw access token without quotes or a 'Bearer' prefix, ensure it has ads_read/Ads Library permissions, and try again.`;
  }

  return message;
}

async function parseGraphError(response) {
  try {
    const data = await response.json();
    if (data?.error) return formatGraphError(data.error, { status: response.status });
    if (data?.message) return `${data.message} [HTTP ${response.status}]`;
  } catch (err) {
    // Fall through to text parsing
  }

  try {
    const raw = await response.text();
    if (raw) return `${raw.trim()} [HTTP ${response.status}]`;
  } catch (err) {
    // Ignore parse errors and return fallback below
  }

  return `Request failed with status ${response.status}`;
}

async function handleAdLibrarySubmit(event) {
  event.preventDefault();
  const publisherId = adPublisherSelect?.value;
  await loadCreativesForPublisher(publisherId);
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
  [categoryFilter].forEach((select) => select.addEventListener("change", renderGrid));
  searchInput.addEventListener("input", renderGrid);
  publisherForm.addEventListener("submit", addPublisher);
  if (adLibraryForm) adLibraryForm.addEventListener("submit", handleAdLibrarySubmit);
  if (refreshPublisherOptions)
    refreshPublisherOptions.addEventListener("click", populatePublisherSelect);
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
