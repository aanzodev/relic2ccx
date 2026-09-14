let tabs = [];
let activeTabId = null;
let customShortcuts = JSON.parse(sessionStorage.getItem("aether-shortcuts") || "[]");

const tabsEl = document.getElementById("tabs");
const contentEl = document.getElementById("tabcontent");
const addressBar = document.getElementById("address-bar");

const APP_VERSION = "1.0.1";

const UPDATE_LOG = [
  {
    version: "1.0.1",
    changes: [
      "Redesigned Settings with a sidebar layout",
      "Added custom background themes",
      "Added a Seasonal theme that automatically updates with the time of year",
      "Renamed Utilities to Apps, now loaded from a JSON config",
      "Split app.js into themes.js / content.js / settings.js / app.js",
      "Added a Service Worker settings tab with a manual unregister button",
    ],
  },
  {
    version: "Coming Soon",
    changes: [
      "Movies",
      "Working calculator app",
    ],
  },
];

const DEFAULT_SHORTCUTS = [
  { name: "YouTube", url: "https://youtube.com", slug: "youtube" },
  { name: "GitHub", url: "https://github.com", slug: "github" },
  { name: "Discord", url: "https://discord.com", slug: "discord" },
  { name: "Twitter", url: "https://twitter.com", slug: "x" },
  { name: "Reddit", url: "https://reddit.com", slug: "reddit" },
  { name: "Spotify", url: "https://open.spotify.com", slug: "spotify" },
  { name: "SoundCloud", url: "https://soundcloud.com", slug: "soundcloud" },
  { name: "Twitch", url: "https://twitch.tv", slug: "twitch" },
];

const QUOTES = [
  "so tuff",
  "it is what it is",
  "do ur work",
  "this is what happens when u dont touch grass",
  "FULL BOX",
  "press esc + refresh + power button for hacks",
];

function iconFor(slug) {
  return `<img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${slug}.svg" alt="">`;
}


function buildUpdateLogModal() {
  const overlay = document.createElement("div");
  overlay.className = "updatelog-overlay";

  overlay.innerHTML = `
    <div class="updatelog-card">
      <div class="updatelog-header">
        <div class="updatelog-title">Update Log <span style="opacity:.6">|</span> ${APP_VERSION}</div>
        <div class="updatelog-close"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="updatelog-body"></div>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  overlay.querySelector(".updatelog-close").onclick = () => overlay.remove();

  const body = overlay.querySelector(".updatelog-body");
  UPDATE_LOG.forEach((entry) => {
    const label = document.createElement("div");
    label.className = "updatelog-section-label";
    label.textContent = entry.version === "Coming Soon" ? "Coming Soon" : `v${entry.version}`;
    body.appendChild(label);

    entry.changes.forEach((c) => {
      const div = document.createElement("div");
      div.className = "updatelog-entry" + (entry.version === "Coming Soon" ? " soon" : "");
      div.textContent = entry.version === "Coming Soon" ? `✨ COMING SOON: ${c}` : c;
      body.appendChild(div);
    });
  });

  document.body.appendChild(overlay);
}


function buildNewTabPage(tabId) {
  const wrap = document.createElement("div");
  wrap.className = "newtab-page";

  const clock = document.createElement("div");
  clock.className = "nt-clock";
  const dateEl = document.createElement("div");
  dateEl.className = "nt-date";

  function tick() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    dateEl.textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
  tick();
  setInterval(tick, 1000);

  const searchBar = document.createElement("div");
  searchBar.className = "nt-searchbar";
  searchBar.innerHTML = `
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" placeholder="Search the web..." autocomplete="off" />
    <select>
      <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
      <option value="https://search.brave.com/search?q=">Brave</option>
      <option value="https://www.google.com/search?q=">Google</option>
    </select>
  `;
  const ntInput = searchBar.querySelector("input");
  const ntSelect = searchBar.querySelector("select");
  ntInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && ntInput.value.trim()) {
      navigate(ntSelect.value + encodeURIComponent(ntInput.value.trim()), tabId);
    }
  });

  const shortcutsGrid = document.createElement("div");
  shortcutsGrid.className = "nt-shortcuts";

  function renderShortcuts() {
    shortcutsGrid.innerHTML = "";
    DEFAULT_SHORTCUTS.forEach((s) => {
      const el = document.createElement("div");
      el.className = "nt-shortcut";
      el.innerHTML = `<div class="nt-shortcut-icon">${iconFor(s.slug)}</div><div class="nt-shortcut-label">${s.name}</div>`;
      el.onclick = () => navigate(s.url, tabId);
      shortcutsGrid.appendChild(el);
    });

    customShortcuts.forEach((s) => {
      const el = document.createElement("div");
      el.className = "nt-shortcut";
      el.innerHTML = `<div class="nt-shortcut-icon"><i class="fa-solid fa-link"></i></div><div class="nt-shortcut-label">${s.name}</div>`;
      el.onclick = () => navigate(s.url, tabId);
      shortcutsGrid.appendChild(el);
    });

    const addEl = document.createElement("div");
    addEl.className = "nt-shortcut";
    addEl.innerHTML = `<div class="nt-shortcut-icon"><i class="fa-solid fa-plus"></i></div><div class="nt-shortcut-label">Add</div>`;
    addEl.onclick = () => {
      const name = prompt("Shortcut name:");
      if (!name) return;
      let url = prompt("URL:");
      if (!url) return;
      if (!url.startsWith("http")) url = "https://" + url;
      customShortcuts.push({ name, url });
      sessionStorage.setItem("aether-shortcuts", JSON.stringify(customShortcuts));
      renderShortcuts();
    };
    shortcutsGrid.appendChild(addEl);
  }
  renderShortcuts();

  const quote = document.createElement("div");
  quote.className = "nt-quote";
  quote.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const updateBtn = document.createElement("div");
  updateBtn.className = "updatelog-btn";
  updateBtn.innerHTML = `<i class="fa-solid fa-bullhorn"></i> v${APP_VERSION}`;
  updateBtn.onclick = () => buildUpdateLogModal();

  wrap.appendChild(clock);
  wrap.appendChild(dateEl);
  wrap.appendChild(searchBar);
  wrap.appendChild(shortcutsGrid);
  wrap.appendChild(quote);
  wrap.appendChild(updateBtn);

  return wrap;
}


function createTab(url, options = {}) {
  const id = crypto.randomUUID();

  const frameWrap = document.createElement("div");
  frameWrap.style.position = "absolute";
  frameWrap.style.inset = "0";
  frameWrap.style.display = "none";

  if (!url) {
    frameWrap.appendChild(buildNewTabPage(id));
  } else {
    const isExternal = /^https?:\/\//i.test(url);
    const iframe = document.createElement("iframe");
    iframe.src = isExternal && window.aetherEncode ? window.aetherEncode(url) : url;
    frameWrap.appendChild(iframe);
    if (options.showLaunchLoading) {
      showLaunchLoading(frameWrap, iframe, options.appName || url);
    }
  }

  contentEl.appendChild(frameWrap);

  const tabBtn = document.createElement("div");
  tabBtn.className = "tab";
  tabBtn.innerHTML = `<span class="tab-icon"><i class="fa-solid fa-globe"></i></span><span class="tab-title">${url || "Aether"}</span><span class="close-btn">×</span>`;
  tabBtn.onclick = (e) => {
    if (e.target.classList.contains("close-btn")) closeTab(id);
    else switchTab(id);
  };
  document.getElementById("newtab-btn").before(tabBtn);

  tabs.push({ id, url, frameWrap, tabBtn });
  switchTab(id);
  return id;
}

function switchTab(id) {
  tabs.forEach((t) => {
    t.frameWrap.style.display = t.id === id ? "block" : "none";
    t.tabBtn.classList.toggle("active", t.id === id);
  });
  activeTabId = id;
  const tab = tabs.find((t) => t.id === id);
  addressBar.value = tab.url || "aether://newtab";
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  tabs[idx].frameWrap.remove();
  tabs[idx].tabBtn.remove();
  tabs.splice(idx, 1);
  if (activeTabId === id) {
    if (tabs.length) switchTab(tabs[tabs.length - 1].id);
    else createTab();
  }
}

function navigate(rawInput, tabId) {
  let url = rawInput.trim();
  const looksLikeUrl = /^https?:\/\//i.test(url) || /\.[a-z]{2,}(\/|$)/i.test(url);

  if (!looksLikeUrl) {
    url = "https://duckduckgo.com/?q=" + encodeURIComponent(url);
  } else if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const id = tabId || activeTabId;
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;

  tab.url = url;
  tab.frameWrap.innerHTML = "";
  const isExternal = /^https?:\/\//i.test(url);
  const iframe = document.createElement("iframe");
  iframe.src = isExternal && window.aetherEncode ? window.aetherEncode(url) : url;
  tab.frameWrap.appendChild(iframe);
  tab.tabBtn.querySelector(".tab-title").textContent = url;

  if (id === activeTabId) addressBar.value = url;
}

addressBar.addEventListener("keydown", (e) => {
  if (e.key === "Enter") navigate(addressBar.value);
});


document.getElementById("menu-btn").onclick = () => {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("menu-btn").classList.add("hidden");
};

document.getElementById("sidebar-close").onclick = () => {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("menu-btn").classList.remove("hidden");
};

document.getElementById("apps-item").onclick = async () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return;
  tab.url = "aether://apps";
  tab.frameWrap.innerHTML = "";
  tab.frameWrap.appendChild(await buildAppsPage(tab.id));
  addressBar.value = "aether://apps";
  tab.tabBtn.querySelector(".tab-title").textContent = "Apps";

  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("menu-btn").classList.remove("hidden");
};

document.getElementById("activities-item").onclick = async () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return;
  tab.url = "aether://activities";
  tab.frameWrap.innerHTML = "";
  tab.frameWrap.appendChild(await buildActivitiesPage(tab.id));
  addressBar.value = "aether://activities";
  tab.tabBtn.querySelector(".tab-title").textContent = "Activities";

  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("menu-btn").classList.remove("hidden");
};


document.getElementById("newtab-btn").onclick = () => createTab();
document.getElementById("reload-btn").onclick = () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  const iframe = tab?.frameWrap.querySelector("iframe");
  if (iframe) iframe.src = iframe.src;
};
document.getElementById("home-btn").onclick = () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return;
  tab.url = null;
  tab.frameWrap.innerHTML = "";
  tab.frameWrap.appendChild(buildNewTabPage(tab.id));
  addressBar.value = "aether://newtab";
};
document.getElementById("fullscreen-btn").onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};
document.getElementById("code-btn").onclick = () => alert("Source view not implemented yet.");

document.getElementById("settings-btn").onclick = () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return;
  tab.url = "aether://settings";
  tab.frameWrap.innerHTML = "";
  tab.frameWrap.appendChild(buildSettingsPage());
  addressBar.value = "aether://settings";
  tab.tabBtn.querySelector(".tab-title").textContent = "Settings";
  document.getElementById("menu-btn").classList.add("hidden");
};

createTab();
