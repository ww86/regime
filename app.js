const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const colors = [
  "#ffffff",
  "#f7f7f7",
  "#efefef",
  "#e7e7e7",
  "#d0d0d0",
  "#bdbdbd",
  "#9e9e9e",
  "#7f7f7f",
  "#616161",
  "#424242",
  "#212121",
  "#000000",
  "#fff8e1",
  "#fff3bf",
  "#fff1c0",
  "#fff7f0",
  "#f8f0ff",
  "#f0f7ff",
  "#eef9f3",
  "#f3f0ff",
  "#f9f4f6",
  "#fff0f0",
  "#fff5ed",
  "#fffef6",
  "#e7f5ff",
  "#dbeafe",
  "#e0f2fe",
  "#cfe9ff",
  "#dbe7ff",
  "#cfe2ff",
  "#bfe1ff",
  "#b3d9ff",
  "#8fc9ff",
  "#66b3ff",
  "#3e98ff",
  "#1967d2",
  "#e6fffa",
  "#d1fbe8",
  "#bff4d9",
  "#aef0c8",
  "#8decab",
  "#6fd78f",
  "#4fc56f",
  "#2fb54f",
  "#1aa34a",
  "#0e8f3f",
  "#067a35",
  "#045b26",
  "#fff0f0",
  "#ffdce6",
  "#ffc9d9",
  "#ffb3c9",
  "#ff9bb6",
  "#ff7fa6",
  "#ff5f8f",
  "#ff3f76",
  "#ff1f5c",
  "#ff0550",
  "#e60044",
  "#b30036",
  "#fffbea",
  "#fff5d6",
  "#fff1c0",
  "#ffeaa3",
  "#ffe285",
  "#ffd166",
  "#ffc24a",
  "#ffb21e",
  "#ff9e00",
  "#ff7a00",
  "#e66a00",
  "#b35400",
  "#f8f0ff",
  "#f3e8ff",
  "#eadcff",
  "#e1d0ff",
  "#d7c4ff",
  "#c9b1ff",
  "#b89cff",
  "#9f80ff",
  "#8866ff",
  "#6f48ff",
  "#5a36e6",
  "#3f22b3",
];

let state = {
  startHour: 6,
  endHour: 22,
  rowDuration: 30,
  timeInterval: 1,
  headerPos: "top",
  direction: "normal",
  colColors: Array(9).fill("transparent"),
  cards: [],
  sections: [],
  activeTypo: null,
  selectedCard: null,
  selectedSection: null,
  editing: null,
};

// --- Utilities (small, clear helpers to improve readability) ---
const $ = (id) => document.getElementById(id);
const q = (sel) => document.querySelector(sel);
const qAll = (sel) => Array.from(document.querySelectorAll(sel));
function createFromHTML(html) {
  const d = document.createElement("div");
  d.innerHTML = html.trim();
  return d.firstChild;
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function safeNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
// pickTextColorForBg resolved later using luminance() helper (keeps color logic centralised)

// small DOM helpers to reduce repetitive code
function on(el, ev, fn) {
  if (!el) return;
  el.addEventListener(ev, fn);
}
function off(el, ev, fn) {
  if (!el) return;
  el.removeEventListener(ev, fn);
}

// keep public API surface minimal: scheduleRender/scheduleSave exist elsewhere

function setupDefaults() {
  state.colColors[7] = "#fff4e6"; // Saturday light orange
  state.colColors[8] = "#ff9800"; // Sunday deep orange

  const rowsPerHour = Math.round(60 / state.rowDuration);
  const morningStart = 0 + rowsPerHour * 1;
  const dayStart = morningStart + rowsPerHour * 2;
  const workStart = dayStart;
  const workSpan = rowsPerHour * 8;
  const schoolSpan = rowsPerHour * 6;
  const eveningStart = workStart + workSpan + rowsPerHour * 1;

  state.sections = [
    { id: 1, row: morningStart, title: "Morning" },
    { id: 2, row: dayStart, title: "Day" },
    { id: 3, row: dayStart + workSpan, title: "" },
    { id: 4, row: eveningStart, title: "Evening" },
  ];

  state.cards = [
    {
      id: "c-ufo",
      row: morningStart,
      col: 1,
      span: rowsPerHour,
      title: "UFO spotting",
      bullets: "Look to the skies",
      bgColor: "#fff8e1",
      headerColor: "#fff3bf",
    },
    {
      id: "c-vamp",
      row: morningStart + rowsPerHour,
      col: 2,
      span: Math.max(1, rowsPerHour),
      title: "Vampire hunting",
      bullets: "Crucifix ready",
      bgColor: "#fff0f0",
      headerColor: "#ffdce6",
    },
    {
      id: "c-vill",
      row: dayStart,
      col: 1,
      span: Math.max(2, Math.floor(rowsPerHour * 1.5)),
      title: "Catching supervillains",
      bullets: "Gadgets\nPlan route",
      bgColor: "#e7f5ff",
      headerColor: "#dbeafe",
    },
    {
      id: "c-pizza",
      row: dayStart + rowsPerHour * 2,
      col: 5,
      span: rowsPerHour,
      title: "Pizza",
      bullets: "Order online",
      bgColor: "#fff4e6",
      headerColor: "#ffd7d7",
    },
    {
      id: "c-swim",
      row: dayStart,
      col: 5,
      span: rowsPerHour * 2,
      title: "Swimming",
      bullets: "Pool laps",
      bgColor: "#e6fffa",
      headerColor: "#d1fbe8",
    },
    {
      id: "c-soccer",
      row: eveningStart,
      col: 6,
      span: rowsPerHour,
      title: "Soccer",
      bullets: "Team practice",
      bgColor: "#e0f2fe",
      headerColor: "#cfe9ff",
    },
    {
      id: "c-hockey",
      row: eveningStart,
      col: 3,
      span: rowsPerHour,
      title: "Ice Hockey",
      bullets: "Rink time",
      bgColor: "#f8f0ff",
      headerColor: "#f3e8ff",
    },
    {
      id: "c-skate",
      row: eveningStart,
      col: 1,
      span: rowsPerHour,
      title: "Figure skating",
      bullets: "Practice spins",
      bgColor: "#f3f0ff",
      headerColor: "#e7f5ff",
    },
    {
      id: "c-work",
      row: workStart,
      col: 2,
      span: workSpan,
      title: "Work",
      bullets: "",
      bgColor: "#fff9db",
      headerColor: "#fff3bf",
    },
    {
      id: "c-school",
      row: workStart,
      col: 3,
      span: schoolSpan,
      title: "School",
      bullets: "",
      bgColor: "#fffbea",
      headerColor: "#fff5d6",
    },
  ];
}

function init() {
  const loaded = loadState();
  if (!loaded || !state.cards || state.cards.length === 0) setupDefaults();
  createTypographyButtons();

  document.getElementById("start-hour").addEventListener("change", (e) => {
    state.startHour = parseInt(e.target.value);
    render();
  });
  document.getElementById("end-hour").addEventListener("change", (e) => {
    state.endHour = parseInt(e.target.value);
    render();
  });
  document.getElementById("row-duration").addEventListener("change", (e) => {
    state.rowDuration = Math.max(2, parseInt(e.target.value));
    render();
  });
  document.getElementById("time-interval").addEventListener("change", (e) => {
    state.timeInterval = parseInt(e.target.value);
    render();
  });
  document.getElementById("header-pos").addEventListener("change", (e) => {
    state.headerPos = e.target.value;
    render();
  });
  document.getElementById("table-dir").addEventListener("change", (e) => {
    state.direction = e.target.value;
    render();
  });

  const importInput = document.getElementById("import-file");
  if (importInput) importInput.addEventListener("change", handleImportFile);

  document.getElementById("font-size-input").onchange = (e) => {
    if (!state.activeTypo) return;
    document.documentElement.style.setProperty(
      `--font-size-${state.activeTypo}`,
      e.target.value + "px",
    );
    render();
  };
  document.getElementById("font-family-input").onchange = (e) => {
    if (!state.activeTypo) return;
    document.documentElement.style.setProperty(
      `--font-family-${state.activeTypo}`,
      e.target.value,
    );
    render();
  };

  window.onclick = (e) => {
    if (!e.target.closest(".floating-menu")) {
      document
        .querySelectorAll(".floating-menu")
        .forEach((m) => m.classList.remove("active"));
    }
    if (
      state.editing &&
      !e.target.closest("input") &&
      !e.target.closest("[contenteditable]")
    ) {
      state.editing = null;
    }
    // clear selections when clicking outside their elements
    if (
      state.selectedSection &&
      !e.target.closest(".section-label") &&
      !e.target.closest(".section-delete")
    ) {
      state.selectedSection = null;
      render();
    }
    if (state.selectedCard && !e.target.closest(".activity-card")) {
      state.selectedCard = null;
      render();
    }
  };

  window.scheduleRender = function () {
    clearTimeout(window.renderTimer);
    const delay = state.editing ? 700 : 150;
    window.renderTimer = setTimeout(() => {
      render();
    }, delay);
  };

  render();
  requestAnimationFrame(() => render());
  setTimeout(() => render(), 120);
}

function saveState() {
  try {
    const snapshot = {
      startHour: state.startHour,
      endHour: state.endHour,
      rowDuration: state.rowDuration,
      timeInterval: state.timeInterval,
      headerPos: state.headerPos,
      direction: state.direction,
      colColors: state.colColors,
      cards: state.cards,
      sections: state.sections,
    };
    localStorage.setItem("regime_state_v1", JSON.stringify(snapshot));
  } catch (e) {
    console.warn("save failed", e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem("regime_state_v1");
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (s.cards && Array.isArray(s.cards)) {
      s.cards = s.cards.map((c) => ({
        id: c.id != null ? String(c.id) : Date.now().toString(),
        row: Number.isFinite(c.row) ? c.row : 0,
        col: Number.isFinite(c.col) ? Math.max(1, Math.min(7, c.col)) : 1,
        span: Number.isFinite(c.span) ? Math.max(1, c.span) : 4,
        title: c.title || "Activity",
        bullets: c.bullets || "",
        bgColor: c.bgColor || "#ffffff",
        headerColor: c.headerColor || "#f8f9fa",
      }));
    } else {
      s.cards = [];
    }
    if (s.sections && Array.isArray(s.sections)) {
      s.sections = s.sections.map((sec) => ({
        id: sec.id != null ? sec.id : Date.now() + Math.random(),
        row: Number.isFinite(sec.row) ? sec.row : 0,
        title: sec.title || "",
      }));
    } else {
      s.sections = [];
    }

    state.startHour = s.startHour ?? state.startHour;
    state.endHour = s.endHour ?? state.endHour;
    state.rowDuration = s.rowDuration ?? state.rowDuration;
    state.timeInterval = s.timeInterval ?? state.timeInterval;
    state.headerPos = s.headerPos ?? state.headerPos;
    state.direction = s.direction ?? state.direction;
    state.colColors = s.colColors ?? state.colColors;
    state.cards = s.cards ?? state.cards;
    state.sections = s.sections ?? state.sections;
    return true;
  } catch (e) {
    console.warn("load failed", e);
    return false;
  }
}

function scheduleSave(delay = 300) {
  clearTimeout(window.__saveTimer);
  window.__saveTimer = setTimeout(() => {
    try {
      saveState();
    } catch (e) {
      console.warn("scheduled save failed", e);
    }
  }, delay);
}

function exportJSON() {
  try {
    const snapshot = {
      startHour: state.startHour,
      endHour: state.endHour,
      rowDuration: state.rowDuration,
      timeInterval: state.timeInterval,
      headerPos: state.headerPos,
      direction: state.direction,
      colColors: state.colColors,
      cards: state.cards,
      sections: state.sections,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "regime.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Export failed: " + e);
  }
}

function triggerImportJSON() {
  const inp = document.getElementById("import-file");
  if (inp) {
    inp.value = "";
    inp.click();
  }
}
function handleImportFile(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const s = JSON.parse(reader.result);
      state.startHour = s.startHour ?? state.startHour;
      state.endHour = s.endHour ?? state.endHour;
      state.rowDuration = s.rowDuration ?? state.rowDuration;
      state.timeInterval = s.timeInterval ?? state.timeInterval;
      state.headerPos = s.headerPos ?? state.headerPos;
      state.direction = s.direction ?? state.direction;
      state.colColors = s.colColors ?? state.colColors;
      state.cards = s.cards ?? state.cards;
      state.sections = s.sections ?? state.sections;
      saveState();
      render();
      alert("Import successful");
    } catch (err) {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(f);
}

async function exportPNG() {
  const area = document.getElementById("capture-area");
  document
    .querySelectorAll(".floating-menu")
    .forEach((m) => m.classList.remove("active"));
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const rect = area.getBoundingClientRect();
  const clone = area.cloneNode(true);
  clone.querySelectorAll(".no-export").forEach((n) => n.remove());
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0px";
  wrapper.style.width = rect.width + "px";
  wrapper.style.height = rect.height + "px";
  wrapper.style.overflow = "hidden";
  wrapper.style.background = "#ffffff";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const srcEls = Array.from(area.querySelectorAll("*"));
    const dstEls = Array.from(clone.querySelectorAll("*"));
    srcEls.unshift(area);
    dstEls.unshift(clone);
    for (let i = 0; i < srcEls.length && i < dstEls.length; i++) {
      const s = window.getComputedStyle(srcEls[i]);
      const dest = dstEls[i];
      for (let j = 0; j < s.length; j++) {
        const prop = s[j];
        try {
          dest.style.setProperty(
            prop,
            s.getPropertyValue(prop),
            s.getPropertyPriority(prop),
          );
        } catch (e) {}
      }
      if (s.position === "fixed" || s.position === "sticky")
        dest.style.position = "static";
      dest.style.transform = "none";
    }
  } catch (e) {
    console.warn("style copy failed", e);
  }

  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 40));
  const scale = window.devicePixelRatio || 2;
  const canvas = await html2canvas(clone, {
    scale,
    backgroundColor: "#ffffff",
    width: rect.width,
    height: rect.height,
    useCORS: true,
    allowTaint: false,
    scrollY: -window.scrollY,
  });
  const link = document.createElement("a");
  link.download = "regime.png";
  link.href = canvas.toDataURL();
  link.click();
  wrapper.remove();
}

// utils
function luminance(hex) {
  if (!hex) return 1;
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function pickTextColorForBg(bgHex) {
  const L = luminance(bgHex);
  return L > 0.5 ? "#111111" : "#ffffff";
}

function createTypographyButtons() {
  const container = document.getElementById("typo-btns");
  container.innerHTML = "";
  const types = [
    { id: "card-title", label: "Card Title" },
    { id: "bullets", label: "Bullets" },
    { id: "section-title", label: "Sections" },
    { id: "timestamps", label: "Times" },
    { id: "header", label: "Day Head" },
    { id: "time-col", label: "Time Col" },
  ];
  types.forEach((t) => {
    const btn = document.createElement("button");
    btn.className =
      "px-2 py-0.5 border rounded bg-white text-[9px] hover:bg-gray-50 whitespace-nowrap";
    btn.innerText = t.label;
    btn.onclick = (e) => {
      e.stopPropagation();
      state.activeTypo = t.id;
      const menu = document.getElementById("typo-menu");
      document.getElementById("typo-menu-title").innerText = t.label;
      document.getElementById("font-size-input").value = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          `--font-size-${t.id}`,
        ),
      );
      try {
        document.getElementById("font-family-input").value = getComputedStyle(
          document.documentElement,
        ).getPropertyValue(`--font-family-${t.id}`);
      } catch (e) {}
      menu.style.left = e.clientX + "px";
      menu.style.top = e.clientY + 20 + "px";
      menu.classList.add("active");
      populateTypoColorGrid();
    };
    container.appendChild(btn);
  });
}

function formatTime(startH, elapsed) {
  const m = startH * 60 + elapsed;
  let h = Math.floor(m / 60);
  let mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

function updateEditableEmpty(el) {
  if (!el) return;
  if (el.innerText.trim() === "") el.classList.add("empty");
  else el.classList.remove("empty");
}

// Main render
function render() {
  const grid = document.getElementById("main-grid");
  grid.innerHTML = "";
  // compute rows
  const totalMins = (state.endHour - state.startHour) * 60;
  const rowCount = Math.ceil(totalMins / state.rowDuration);

  // compute min heights
  const computedMinH = Math.min(
    64,
    Math.max(14, Math.round(14 + 12 * (30 / state.rowDuration))),
  );
  const minH = computedMinH;
  const rowHeights = new Array(rowCount).fill(minH);
  const measurer = document.getElementById("measurer");
  const rootStyles = getComputedStyle(document.documentElement);
  const fontFamilyBullets = rootStyles.getPropertyValue(
    "--font-family-bullets",
  );
  const fontSizeBullets = rootStyles.getPropertyValue("--font-size-bullets");
  const fontFamilyTitle = rootStyles.getPropertyValue(
    "--font-family-card-title",
  );
  const fontSizeTitle = rootStyles.getPropertyValue("--font-size-card-title");

  measurer.style.whiteSpace = "pre-wrap";
  measurer.style.wordWrap = "break-word";
  state.cards.forEach((card) => {
    measurer.style.fontFamily = fontFamilyBullets;
    measurer.style.fontSize = fontSizeBullets;
    measurer.innerText = card.bullets || " ";
    const bodyH = measurer.offsetHeight;
    const headerH = 18;
    const totalReq = bodyH + headerH + 8;
    const perRow = Math.ceil(totalReq / (card.span || 1));
    for (let r = card.row || 0; r < (card.row || 0) + (card.span || 1); r++) {
      if (r < rowCount) rowHeights[r] = Math.max(rowHeights[r], perRow);
    }
  });
  grid.style.gridTemplateRows = `auto ${rowHeights.map((h) => h + "px").join(" ")} auto`;

  // dynamic columns
  const timeColW = parseInt(rootStyles.getPropertyValue("--time-col-w")) || 50;
  const notesColW =
    parseInt(rootStyles.getPropertyValue("--notes-col-w")) || 100;
  const dayCols = new Array(7).fill(60);
  measurer.style.whiteSpace = "nowrap";
  state.cards.forEach((card) => {
    if (!card.col || card.col < 1 || card.col > 7) return;
    measurer.style.fontFamily = fontFamilyTitle;
    measurer.style.fontSize = fontSizeTitle;
    measurer.innerText = card.title || "";
    const titleW = measurer.offsetWidth || 0;
    measurer.style.fontFamily = fontFamilyBullets;
    measurer.style.fontSize = fontSizeBullets;
    const lines = (card.bullets || "").split("\n");
    let bulletsW = 0;
    lines.forEach((l) => {
      measurer.innerText = l || "";
      bulletsW = Math.max(bulletsW, measurer.offsetWidth || 0);
    });
    const desired = Math.min(
      420,
      Math.max(60, Math.max(titleW + 80, bulletsW + 40)),
    );
    dayCols[card.col - 1] = Math.max(dayCols[card.col - 1], desired);
  });
  measurer.style.whiteSpace = "pre-wrap";

  const gridRect = grid.getBoundingClientRect();
  const available = Math.max(200, gridRect.width - timeColW - notesColW);
  const sumMin = dayCols.reduce((s, v) => s + v, 0);
  let finalDayWidths = new Array(7).fill(60);
  const defaultMin = 60;
  if (sumMin <= available) {
    const extra = available - sumMin;
    const weights = dayCols.map((w) => (w > defaultMin ? 2 : 1));
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    finalDayWidths = dayCols.map((v, i) =>
      Math.round(v + extra * (weights[i] / totalWeight)),
    );
  } else {
    const scale = available / sumMin;
    finalDayWidths = dayCols.map((v) => Math.max(40, Math.round(v * scale)));
  }
  const dayTemplate = finalDayWidths.map((w) => `${w}px`).join(" ");
  grid.style.gridTemplateColumns = `${timeColW}px ${notesColW}px ${dayTemplate}`;

  // header
  const headerRowY = state.headerPos === "top" ? 1 : rowCount + 2;
  const colNames = ["Time", "Notes", ...weekdays];
  colNames.forEach((name, i) => {
    const div = document.createElement("div");
    div.className = "header-cell";
    div.textContent = name;
    div.style.gridColumn = i + 1;
    div.style.gridRow = headerRowY;
    div.onclick = (e) => {
      e.stopPropagation();
      const rect = div.getBoundingClientRect();
      showPaletteAt(rect, (c) => {
        state.colColors[i] = c;
        if (i === 0) {
          const textColor = pickTextColorForBg(c);
          document.documentElement.style.setProperty(
            "--font-color-time-col",
            textColor,
          );
        }
        render();
      });
    };
    div.style.backgroundColor = state.colColors[i];
    div.style.color =
      state.colTextColors && state.colTextColors[i]
        ? state.colTextColors[i]
        : "";
    grid.appendChild(div);
  });

  // slots
  for (let r = 0; r < rowCount; r++) {
    const gridY = state.headerPos === "top" ? r + 2 : r + 1;
    const logicRow = state.direction === "normal" ? r : rowCount - 1 - r;
    for (let c = 0; c < 9; c++) {
      const slot = document.createElement("div");
      slot.className = "cell " + (c === 0 ? "time-cell" : "slot");
      slot.dataset.row = logicRow;
      slot.dataset.col = c - 1;
      slot.style.gridRow = gridY;
      slot.style.gridColumn = c + 1;
      slot.style.height = rowHeights[r] + "px";
      slot.style.backgroundColor = state.colColors[c];
      if (c === 0) {
        slot.style.fontSize = "var(--font-size-time-col)";
        slot.style.fontFamily = "var(--font-family-time-col)";
        if (logicRow % state.timeInterval === 0)
          slot.textContent = formatTime(
            state.startHour,
            logicRow * state.rowDuration,
          );
      } else if (c >= 2) {
        slot.ondblclick = () => {
          state.cards.push({
            id: Date.now(),
            row: logicRow,
            col: c - 1,
            span: 4,
            title: "Activity",
            bullets: "Bullet points...",
            bgColor: "#ffffff",
            headerColor: "#f8f9fa",
          });
          scheduleSave();
          render();
        };
      }
      grid.appendChild(slot);
    }
  }

  // cards
  state.cards.forEach((cardObj) => {
    const rowStart =
      state.direction === "normal"
        ? cardObj.row
        : rowCount - cardObj.row - cardObj.span;
    const gridY = state.headerPos === "top" ? rowStart + 2 : rowStart + 1;
    const cardEl = document.createElement("div");
    cardEl.className = "activity-card";
    cardObj.col = Math.max(1, Math.min(7, cardObj.col || 1));
    cardObj.span = Math.max(1, Math.min(cardObj.span || 1, rowCount));
    cardObj.row = Math.max(
      0,
      Math.min(cardObj.row || 0, Math.max(0, rowCount - cardObj.span)),
    );
    cardEl.style.setProperty("--col-start", cardObj.col + 2);
    cardEl.style.setProperty("--row-start", gridY);
    cardEl.style.setProperty("--row-span", cardObj.span);
    cardEl.style.backgroundColor = cardObj.bgColor;
    cardEl.dataset.cardId = cardObj.id;
    cardEl.innerHTML = `
            <div class="drag-bar"></div>
            <div class="resize-handle-top"></div>
            <div class="card-header" style="background:${cardObj.headerColor}">
                <div class="card-times"><span>${formatTime(state.startHour, cardObj.row * state.rowDuration)}</span><span>${formatTime(state.startHour, (cardObj.row + cardObj.span) * state.rowDuration)}</span></div>
                <div class="card-title" contenteditable="true" spellcheck="false">${cardObj.title}</div>
                <div class="flex flex-row gap-1 no-export items-center"><div class="color-picker-box bg-btn" style="background:${cardObj.bgColor}"></div><div class="color-picker-box header-btn" style="background:${cardObj.headerColor}"></div></div>
            </div>
            <div class="card-body"><div class="bullet-list" contenteditable="true" spellcheck="false">${cardObj.bullets}</div></div>
            <button class="card-delete no-export" title="Delete">×</button>
            <div class="resize-handle"></div>
        `;

    const bulletList = cardEl.querySelector(".bullet-list");
    const cardTitle = cardEl.querySelector(".card-title");
    updateEditableEmpty(bulletList);
    cardEl.querySelector(".bg-btn").onclick = (e) =>
      showPalette(e, (c) => {
        cardObj.bgColor = c;
        scheduleSave();
        render();
      });
    cardEl.querySelector(".header-btn").onclick = (e) =>
      showPalette(e, (c) => {
        cardObj.headerColor = c;
        scheduleSave();
        render();
      });
    const deleteBtn = cardEl.querySelector(".card-delete");
    if (deleteBtn)
      deleteBtn.onclick = (ev) => {
        ev.stopPropagation();
        const idx = state.cards.findIndex((c) => c.id === cardObj.id);
        if (idx >= 0) {
          state.cards.splice(idx, 1);
          state.selectedCard = null;
          scheduleSave();
          render();
        }
      };

    cardTitle.oninput = (e) => {
      cardObj.title = e.target.innerText;
      state.editing = {
        id: cardObj.id,
        field: "title",
        offset: getCaretCharacterOffsetWithin(e.target),
      };
      state.selectedCard = cardObj.id;
      clearTimeout(window.renderTimer);
      scheduleRender();
      scheduleSave();
    };
    cardTitle.onblur = (e) => {
      cardObj.title = e.target.innerText;
      state.editing = null;
      scheduleSave();
      render();
    };
    bulletList.oninput = (e) => {
      cardObj.bullets = bulletList.innerText;
      state.editing = {
        id: cardObj.id,
        field: "bullets",
        offset: getCaretCharacterOffsetWithin(e.target),
      };
      state.selectedCard = cardObj.id;
      updateEditableEmpty(bulletList);
      clearTimeout(window.renderTimer);
      scheduleRender();
      scheduleSave();
    };
    bulletList.onkeydown = (e) => {
      if (e.key === "Enter") {
        setTimeout(() => {
          render();
        }, 50);
      }
    };
    bulletList.onblur = () => {
      state.editing = null;
      scheduleSave();
      render();
    };

    cardEl.onclick = (ev) => {
      ev.stopPropagation();
      if (state.selectedCard !== cardObj.id) {
        state.selectedCard = cardObj.id;
        render();
      }
    };
    // stop propagation on editable fields to prevent card click handler from triggering re-render
    cardTitle.onclick = (ev) => {
      ev.stopPropagation();
      if (state.selectedCard !== cardObj.id) {
        state.selectedCard = cardObj.id;
        render();
      }
    };
    bulletList.onclick = (ev) => {
      ev.stopPropagation();
      if (state.selectedCard !== cardObj.id) {
        state.selectedCard = cardObj.id;
        render();
      }
    };
    if (state.selectedCard === cardObj.id)
      cardEl.classList.add("card-selected");
    else cardEl.classList.remove("card-selected");

    // drag
    const dragBar = cardEl.querySelector(".drag-bar");
    dragBar.onmousedown = (e) => {
      e.preventDefault();
      const gridEl = document.getElementById("main-grid");
      const gridRect = gridEl.getBoundingClientRect();
      const ghost = cardEl.cloneNode(true);
      const cardRect = cardEl.getBoundingClientRect();
      ghost.style.position = "fixed";
      ghost.style.left = cardRect.left + "px";
      ghost.style.top = cardRect.top + "px";
      ghost.style.pointerEvents = "none";
      ghost.style.opacity = "0.95";
      ghost.style.zIndex = "2000";
      ghost.style.width = cardRect.width + "px";
      ghost.style.height = cardRect.height + "px";
      ghost.style.boxSizing = "border-box";
      ghost.style.overflow = "hidden";
      ghost.style.removeProperty("--col-start");
      ghost.style.removeProperty("--row-start");
      ghost.style.removeProperty("--row-span");
      document.body.appendChild(ghost);
      cardEl.style.visibility = "hidden";
      let pendingRow = cardObj.row;
      let pendingCol = cardObj.col;
      const onMouseMove = (moveEvent) => {
        const target = document.elementFromPoint(
          moveEvent.clientX,
          moveEvent.clientY,
        );
        const slot = target?.closest(".slot");
        if (slot) {
          const tr = parseInt(slot.dataset.row);
          let tc = parseInt(slot.dataset.col);
          if (isNaN(tc) || tc <= 0) tc = 1;
          tc = Math.max(1, Math.min(tc, 7));
          const targetRow = Math.max(0, Math.min(tr, rowCount - cardObj.span));
          pendingRow = targetRow;
          pendingCol = tc;
          const slotRect = slot.getBoundingClientRect();
          ghost.style.left = slotRect.left + 4 + "px";
          ghost.style.top = slotRect.top + 2 + "px";
          ghost.style.width = Math.max(80, slotRect.width - 8) + "px";
        }
      };
      const onMouseUp = (upEvent) => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        cardObj.row = pendingRow;
        cardObj.col = pendingCol;
        ghost.remove();
        cardEl.style.visibility = "";
        scheduleSave();
        render();
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    // resize
    cardEl
      .querySelectorAll(".resize-handle, .resize-handle-top")
      .forEach((h) => {
        h.onmousedown = (e) => {
          e.preventDefault();
          const isTop = h.classList.contains("resize-handle-top");
          const startY = e.clientY;
          const startRow = cardObj.row;
          const startSpan = cardObj.span;
          const move = (me) => {
            const diff = Math.round((me.clientY - startY) / Math.max(8, minH));
            if (isTop) {
              const newRow = Math.max(
                0,
                Math.min(startRow + diff, startRow + startSpan - 1),
              );
              cardObj.span = startSpan + (startRow - newRow);
              cardObj.row = newRow;
            } else {
              cardObj.span = Math.max(1, startSpan + diff);
            }
            scheduleSave();
            render();
          };
          const up = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
          };
          window.addEventListener("mousemove", move);
          window.addEventListener("mouseup", up);
        };
      });

    grid.appendChild(cardEl);

    // Restore editing caret/focus if the user was typing in this card
    if (state.editing && state.editing.id === cardObj.id) {
      try {
        const f = state.editing.field;
        const off = state.editing.offset || 0;
        let targetEl = null;
        if (f === "bullets") targetEl = cardEl.querySelector(".bullet-list");
        else if (f === "title") targetEl = cardEl.querySelector(".card-title");
        if (targetEl) {
          targetEl.focus();
          // set caret at offset
          setCaretCharacterOffsetWithin(targetEl, off);
        }
      } catch (e) {
        /* ignore restore errors */
      }
    }
  });

  // sections
  state.sections.forEach((sec, idx) => {
    const rowStart =
      state.direction === "normal" ? sec.row : rowCount - sec.row;
    const gridY = state.headerPos === "top" ? rowStart + 2 : rowStart + 1;
    const secEl = document.createElement("div");
    secEl.className = "section-break";
    secEl.style.setProperty("--row-start", gridY);
    secEl.innerHTML = `
            <div class="section-line"></div>
            <div class="section-label ${sec.title.trim() === "" ? "section-empty" : ""}"><input class="section-input" value="${sec.title}" spellcheck="false"></div>
            <button class="section-delete no-export" title="Delete">×</button>
        `;
    const input = secEl.querySelector(".section-input");
    input.onclick = (e) => {
      e.stopPropagation();
      state.selectedSection = sec.id;
    };
    input.onfocus = (e) => {
      state.selectedSection = sec.id;
    };
    input.onblur = (e) => {
      sec.title = e.target.value;
      state.editing = null;
      render();
    };
    input.oninput = (e) => {
      e.target.style.width = e.target.value.length + 0.5 + "ch";
      const lbl = secEl.querySelector(".section-label");
      if (e.target.value.trim() === "") lbl.classList.add("section-empty");
      else lbl.classList.remove("section-empty");
      sec.title = e.target.value;
      state.editing = {
        id: sec.id,
        field: "section",
        offset: e.target.selectionStart,
      };
    };
    input.style.width = sec.title.length + 0.5 + "ch";
    const deleteBtn = secEl.querySelector(".section-delete");
    deleteBtn.onclick = (ev) => {
      ev.stopPropagation();
      state.sections.splice(idx, 1);
      scheduleSave();
      render();
    };
    const label = secEl.querySelector(".section-label");
    label.onclick = (ev) => {
      ev.stopPropagation();
      state.selectedSection = sec.id;
      render();
    };
    if (state.selectedSection === sec.id) {
      label.classList.add("selected");
      secEl.classList.add("selected");
    } else {
      label.classList.remove("selected");
      secEl.classList.remove("selected");
    }
    label.onmousedown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.classList.contains("section-delete")
      )
        return;
      e.preventDefault();
      state.selectedSection = sec.id;
      label.classList.add("selected");
      const gridEl = document.getElementById("main-grid");
      const gridRect = gridEl.getBoundingClientRect();
      const line = document.createElement("div");
      line.style.position = "fixed";
      line.style.left = gridRect.left + 2 + "px";
      line.style.width = gridRect.width - 4 + "px";
      line.style.height = "2px";
      line.style.background = "rgba(0,0,0,0.6)";
      line.style.zIndex = 2000;
      document.body.appendChild(line);
      const cumulative = [0];
      for (let i = 0; i < rowHeights.length; i++)
        cumulative[i + 1] = cumulative[i] + rowHeights[i];
      let dataStartTop = 0;
      try {
        const firstSlot = grid.querySelector('.cell[data-row="0"]');
        if (firstSlot)
          dataStartTop = firstSlot.getBoundingClientRect().top - gridRect.top;
      } catch (e) {
        dataStartTop = 0;
      }
      let rafId = null;
      const onMove = (me) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const y = me.clientY - gridRect.top - dataStartTop;
          let r = rowHeights.length - 1;
          for (let i = 0; i < rowHeights.length; i++) {
            if (y >= cumulative[i] && y < cumulative[i + 1]) {
              r = i;
              break;
            }
          }
          const lineTop = gridRect.top + dataStartTop + cumulative[r];
          line.style.top = lineTop - 1 + "px";
          const lr = r;
          const newRow = state.direction === "normal" ? lr : rowCount - lr;
          sec.row = Math.max(0, Math.min(newRow, rowCount));
        });
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        if (rafId) cancelAnimationFrame(rafId);
        line.remove();
        render();
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    grid.appendChild(secEl);
  });

  // restore editing caret for section
  if (state.editing && state.editing.field === "section") {
    const sec = state.sections.find((s) => s.id === state.editing.id);
    if (sec) {
      const inputs = Array.from(document.querySelectorAll(".section-input"));
      let input = inputs.find((i) => i && i.value === sec.title);
      if (!input) input = inputs[0];
      if (input) {
        input.focus();
        try {
          const off =
            state.editing.offset || (input.value ? input.value.length : 0);
          input.setSelectionRange(off, off);
        } catch (e) {}
      }
    }
  }

  scheduleSave();
}

// caret helpers (char-offset-based; could be upgraded to Range-based)
function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var sel = window.getSelection();
  if (sel.rangeCount > 0) {
    var range = sel.getRangeAt(0);
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
}
function setCaretCharacterOffsetWithin(element, chars) {
  if (chars < 0) return;
  var nodeStack = [element],
    node,
    found = false,
    charCount = 0;
  var range = document.createRange();
  var sel = window.getSelection();
  while (nodeStack.length && !found) {
    node = nodeStack.shift();
    if (node.nodeType === 3) {
      var nextCharCount = charCount + node.length;
      if (nextCharCount >= chars) {
        range.setStart(node, chars - charCount);
        range.collapse(true);
        found = true;
      } else {
        charCount = nextCharCount;
      }
    } else {
      var i = node.childNodes.length;
      while (i--) nodeStack.unshift(node.childNodes[i]);
    }
  }
  if (!found) {
    range.setStart(element, element.childNodes.length);
    range.collapse(true);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

// Palette helpers
function showPalette(e, onSelect) {
  e.stopPropagation();
  const menu = document.getElementById("global-palette");
  const grid = document.getElementById("palette-grid");
  grid.innerHTML = "";
  colors.forEach((c) => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.backgroundColor = c;
    s.onclick = (ev) => {
      ev.stopPropagation();
      onSelect(c);
      menu.classList.remove("active");
    };
    grid.appendChild(s);
  });
  menu.style.left = Math.min(e.clientX, window.innerWidth - 160) + "px";
  menu.style.top = Math.min(e.clientY, window.innerHeight - 150) + "px";
  menu.classList.add("active");
}
function showPaletteAt(rect, onSelect) {
  const menu = document.getElementById("global-palette");
  const grid = document.getElementById("palette-grid");
  grid.innerHTML = "";
  colors.forEach((c) => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.backgroundColor = c;
    s.onclick = (ev) => {
      ev.stopPropagation();
      onSelect(c);
      menu.classList.remove("active");
    };
    grid.appendChild(s);
  });
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 160));
  const top = Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 150));
  menu.style.left = left + "px";
  menu.style.top = top + "px";
  menu.classList.add("active");
}

function populateTypoColorGrid() {
  const menu = document.getElementById("typo-menu");
  if (!menu) return;
  let grid = document.getElementById("typo-color-grid");
  if (!grid) {
    const container = document.createElement("div");
    container.className = "mt-2";
    container.innerHTML =
      '<div class="text-[10px] font-bold text-gray-400 mb-1">Color</div><div id="typo-color-grid" class="menu-grid"></div>';
    menu.querySelector(".flex")?.appendChild(container);
    grid = document.getElementById("typo-color-grid");
  }
  grid.innerHTML = "";
  colors.forEach((c) => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.backgroundColor = c;
    s.onclick = (ev) => {
      ev.stopPropagation();
      if (!state.activeTypo) return;
      document.documentElement.style.setProperty(
        `--font-color-${state.activeTypo}`,
        c,
      );
      menu.classList.remove("active");
      render();
    };
    grid.appendChild(s);
  });
}

function addSection() {
  state.sections.push({ id: Date.now(), row: 10, title: "NEW SECTION" });
  render();
}

function addActivity() {
  const totalMins = (state.endHour - state.startHour) * 60;
  const rowCount = Math.ceil(totalMins / state.rowDuration);
  const defaultRow = Math.min(4, Math.max(0, Math.floor(rowCount / 8)));
  // default to first weekday column (card.col = 1 corresponds to MON)
  state.cards.push({
    id: Date.now().toString(),
    row: defaultRow,
    col: 1,
    span: 4,
    title: "New Activity",
    bullets: "Point 1",
    bgColor: "#ffffff",
    headerColor: "#f8f9fa",
  });
  render();
}

function resetTool() {
  if (confirm("Reset to defaults? This will remove your saved regime.")) {
    localStorage.removeItem("regime_state_v1");
    // Force reset of all state properties to initial defaults
    state.startHour = 6;
    state.endHour = 22;
    state.rowDuration = 30;
    state.timeInterval = 1;
    state.headerPos = "top";
    state.direction = "normal";
    state.colColors = Array(9).fill("transparent");
    state.cards = [];
    state.sections = [];
    state.selectedCard = null;
    state.selectedSection = null;
    state.editing = null;

    // Update UI inputs to match reset state
    const ids = [
      "start-hour",
      "end-hour",
      "row-duration",
      "time-interval",
      "header-pos",
      "table-dir",
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.value =
          state[id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] ||
          state[id.replace("-", "")] ||
          state[id] ||
          el.value;
    });
    // handle edge cases for camelCase mapping manually where needed
    if ($("start-hour")) $("start-hour").value = state.startHour;
    if ($("end-hour")) $("end-hour").value = state.endHour;
    if ($("row-duration")) $("row-duration").value = state.rowDuration;
    if ($("time-interval")) $("time-interval").value = state.timeInterval;
    if ($("header-pos")) $("header-pos").value = state.headerPos;
    if ($("table-dir")) $("table-dir").value = state.direction;

    setupDefaults();
    render();
  }
}

window.onload = init;
