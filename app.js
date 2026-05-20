const STORAGE_KEY = "deckflow-modern-powerpoint-clone";
const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const WORKSPACE_MARGIN = 520;

const themeLibrary = {
  midnight: {
    id: "midnight",
    name: "Midnight Blue",
    background: "linear-gradient(135deg, #0d1628 0%, #0a1220 45%, #10294a 100%)",
    accent: "#4db3ff",
    secondary: "#245dff",
    text: "#f6f9ff",
    muted: "#b6c8eb",
    shapeFill: "rgba(77, 179, 255, 0.18)",
    shapeStroke: "rgba(160, 208, 255, 0.32)"
  },
  graphite: {
    id: "graphite",
    name: "Graphite Pulse",
    background: "linear-gradient(135deg, #090c12 0%, #101625 55%, #16233d 100%)",
    accent: "#79b7ff",
    secondary: "#2f67ff",
    text: "#f4f7ff",
    muted: "#aab8d5",
    shapeFill: "rgba(121, 183, 255, 0.18)",
    shapeStroke: "rgba(121, 183, 255, 0.34)"
  },
  electric: {
    id: "electric",
    name: "Electric Depth",
    background: "linear-gradient(135deg, #050914 0%, #0c1630 52%, #12386b 100%)",
    accent: "#78d8ff",
    secondary: "#1d8dff",
    text: "#f7fbff",
    muted: "#c5d4f1",
    shapeFill: "rgba(120, 216, 255, 0.18)",
    shapeStroke: "rgba(147, 224, 255, 0.34)"
  }
};

const transitionModes = [
  { id: "morph", label: "Morph" },
  { id: "fade", label: "Fade" },
  { id: "push", label: "Push" },
  { id: "zoom", label: "Zoom" },
  { id: "none", label: "Ohne" }
];

const transitionDurations = [
  { value: 420, label: "Schnell" },
  { value: 680, label: "Standard" },
  { value: 980, label: "Lang" }
];

const textFontOptions = ["Sora", "Manrope", "Outfit", "Space Grotesk"];
const shapeTypeOptions = [
  { id: "rounded", label: "Abgerundet" },
  { id: "square", label: "Rechteck" },
  { id: "circle", label: "Kreis" },
  { id: "diamond", label: "Diamant" },
  { id: "hexagon", label: "Hexagon" },
  { id: "ticket", label: "Ticket" }
];
const imageMaskOptions = [
  { id: "rounded", label: "Rounded" },
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
  { id: "diamond", label: "Diamond" },
  { id: "hexagon", label: "Hexagon" },
  { id: "ticket", label: "Ticket" }
];

const el = {
  deckTitle: document.getElementById("deckTitle"),
  slideList: document.getElementById("slideList"),
  slideCount: document.getElementById("slideCount"),
  stageCanvas: document.getElementById("stageCanvas"),
  activeSlideName: document.getElementById("activeSlideName"),
  transitionBadge: document.getElementById("transitionBadge"),
  autosaveState: document.getElementById("autosaveState"),
  inspectorContent: document.getElementById("inspectorContent"),
  statusText: document.getElementById("statusText"),
  slideContextMenu: document.getElementById("slideContextMenu"),
  imageEditorPanel: document.getElementById("imageEditorPanel"),
  imageEditorContent: document.getElementById("imageEditorContent"),
  presentationOverlay: document.getElementById("presentationOverlay"),
  presentationStage: document.getElementById("presentationStage"),
  presentationCounter: document.getElementById("presentationCounter"),
  imageInput: document.getElementById("imageInput"),
  replaceImageInput: document.getElementById("replaceImageInput"),
  importInput: document.getElementById("importInput"),
  addSlideBtn: document.getElementById("addSlideBtn"),
  deleteSlideBtn: document.getElementById("deleteSlideBtn"),
  addTitleBtn: document.getElementById("addTitleBtn"),
  addTextBtn: document.getElementById("addTextBtn"),
  addShapeBtn: document.getElementById("addShapeBtn"),
  addImageBtn: document.getElementById("addImageBtn"),
  importDeckBtn: document.getElementById("importDeckBtn"),
  exportDeckBtn: document.getElementById("exportDeckBtn"),
  presentBtn: document.getElementById("presentBtn"),
  closeImageEditorBtn: document.getElementById("closeImageEditorBtn"),
  closePresentationBtn: document.getElementById("closePresentationBtn"),
  prevPresentationBtn: document.getElementById("prevPresentationBtn"),
  nextPresentationBtn: document.getElementById("nextPresentationBtn"),
  fontFamilyControl: document.getElementById("fontFamilyControl"),
  fontSizeControl: document.getElementById("fontSizeControl"),
  fontWeightControl: document.getElementById("fontWeightControl"),
  lineHeightControl: document.getElementById("lineHeightControl"),
  fontColorControl: document.getElementById("fontColorControl"),
  shapePresetControl: document.getElementById("shapePresetControl"),
  cornerRadiusControl: document.getElementById("cornerRadiusControl"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  zoomResetBtn: document.getElementById("zoomResetBtn"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  alignLeftBtn: document.getElementById("alignLeftBtn"),
  alignCenterBtn: document.getElementById("alignCenterBtn"),
  alignRightBtn: document.getElementById("alignRightBtn")
};
const quickShapeButtons = Array.from(document.querySelectorAll("[data-quick-shape]"));

const state = hydrateDeck(loadState() || createDefaultDeck());
const uiState = {
  activeShapeType: "rounded",
  defaultRadius: 26,
  zoom: 1,
  slideContext: { open: false, slideId: null, x: 0, y: 0 },
  imageEditor: { open: false, elementId: null, x: 0, y: 0 },
  pendingReplaceImageId: null
};

let editingElementId = null;
let dragState = null;
let draggedSlideId = null;
let saveTimer = null;
let autosaveFlashTimer = null;
let presentationIndex = 0;

function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultAdjustments() {
  return {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    opacity: 100,
    sharpness: 0
  };
}

function createDefaultDeck() {
  const introSlide = createSlide({
    name: "Titel",
    transition: "morph",
    transitionDuration: 680,
    elements: [
      createElement("title", {
        x: 94,
        y: 108,
        w: 840,
        h: 118,
        content: "DeckFlow Studio",
        fontSize: 60,
        color: "#f8fbff",
        fontFamily: "Sora"
      }),
      createElement("text", {
        x: 96,
        y: 246,
        w: 700,
        h: 136,
        content: "Moderner PowerPoint-Klon mit schwarzem Design, blauem Akzent, Start-Leiste, Morph-Übergängen und Bild-Editor per Rechtsklick.",
        fontSize: 28,
        color: "#c8d8f7",
        fontFamily: "Manrope"
      }),
      createElement("shape", {
        x: 876,
        y: 96,
        w: 258,
        h: 258,
        radius: 42,
        shapeType: "circle",
        fill: "linear-gradient(135deg, rgba(77,179,255,0.18), rgba(36,93,255,0.35))",
        shadow: "0 18px 40px rgba(20, 54, 138, 0.45)"
      }),
      createElement("shape", {
        x: 850,
        y: 402,
        w: 300,
        h: 166,
        radius: 30,
        shapeType: "rounded",
        fill: "rgba(7, 15, 30, 0.74)",
        stroke: "rgba(113, 180, 255, 0.22)",
        shadow: "0 16px 42px rgba(0, 0, 0, 0.26)"
      }),
      createElement("text", {
        x: 894,
        y: 444,
        w: 212,
        h: 76,
        content: "Morph\nready",
        fontSize: 34,
        fontWeight: 800,
        color: "#7fd3ff",
        align: "center",
        fontFamily: "Outfit"
      })
    ]
  });

  const agendaSlide = createSlide({
    name: "Agenda",
    transition: "push",
    transitionDuration: 680,
    theme: "graphite",
    elements: [
      createElement("title", {
        x: 90,
        y: 88,
        w: 880,
        h: 96,
        content: "Agenda",
        fontSize: 52,
        fontFamily: "Sora"
      }),
      createElement("shape", {
        x: 82,
        y: 204,
        w: 1116,
        h: 364,
        radius: 36,
        shapeType: "rounded"
      }),
      createElement("text", {
        x: 130,
        y: 250,
        w: 980,
        h: 244,
        content: "1. Start-Leiste für Schriftart, Größe, Farbe und Ausrichtung\n2. Rechtsklick-Menü links für Duplizieren, Umbenennen und Löschen\n3. Formen mit nachträglicher Abrundung\n4. Bild-Editor mit Helligkeit, Kontrast, Transparenz, Schärfe und Form-Masken",
        fontSize: 31,
        lineHeight: 1.42,
        fontFamily: "Manrope"
      })
    ]
  });

  return {
    title: "DeckFlow Studio",
    slides: [introSlide, agendaSlide],
    selectedSlideId: introSlide.id,
    selectedElementId: null
  };
}

function createSlide(overrides = {}) {
  return {
    id: createId("slide"),
    name: overrides.name || "Neue Folie",
    theme: overrides.theme || "midnight",
    transition: overrides.transition || "morph",
    transitionDuration: Number(overrides.transitionDuration) || 680,
    notes: overrides.notes || "",
    elements: Array.isArray(overrides.elements) ? overrides.elements : []
  };
}

function createElement(type, overrides = {}) {
  const base = {
    id: createId("el"),
    type,
    x: 120,
    y: 110,
    w: type === "title" ? 760 : 360,
    h: type === "shape" ? 220 : 120,
    radius: type === "shape" || type === "image" ? 26 : 0,
    fill: undefined,
    stroke: undefined,
    shadow: undefined,
    content: type === "title" ? "Neuer Titel" : type === "text" ? "Neuer Text" : "",
    color: "#f5f8ff",
    fontSize: type === "title" ? 52 : 28,
    fontWeight: type === "title" ? 800 : 600,
    fontFamily: type === "title" ? "Sora" : "Manrope",
    lineHeight: 1.25,
    align: "left",
    fit: "cover",
    src: "",
    shapeType: "rounded",
    maskShape: "rounded",
    adjustments: createDefaultAdjustments()
  };
  return { ...base, ...overrides, adjustments: { ...base.adjustments, ...(overrides.adjustments || {}) } };
}

function hydrateDeck(rawDeck) {
  const deck = rawDeck && typeof rawDeck === "object" ? rawDeck : createDefaultDeck();
  const slides = Array.isArray(deck.slides) && deck.slides.length ? deck.slides : createDefaultDeck().slides;
  return {
    title: deck.title || "DeckFlow Studio",
    slides: slides.map((slide, index) => hydrateSlide(slide, index)),
    selectedSlideId: deck.selectedSlideId || slides[0].id,
    selectedElementId: deck.selectedElementId || null
  };
}

function hydrateSlide(rawSlide, index) {
  const slide = createSlide({
    name: rawSlide?.name || `Folie ${index + 1}`,
    theme: rawSlide?.theme || "midnight",
    transition: rawSlide?.transition || "morph",
    transitionDuration: rawSlide?.transitionDuration || 680,
    notes: rawSlide?.notes || ""
  });
  slide.id = rawSlide?.id || slide.id;
  slide.elements = Array.isArray(rawSlide?.elements) ? rawSlide.elements.map((element) => hydrateElement(element)) : [];
  return slide;
}

function hydrateElement(rawElement) {
  const element = createElement(rawElement?.type || "text", rawElement || {});
  element.id = rawElement?.id || element.id;
  return element;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.slides?.length) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Konnte Zustand nicht laden:", error);
    return null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  flashAutosave();
}

function queueSave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveState, 160);
}

function flashAutosave() {
  el.autosaveState.textContent = "Gespeichert";
  window.clearTimeout(autosaveFlashTimer);
  autosaveFlashTimer = window.setTimeout(() => {
    el.autosaveState.textContent = "Autosave aktiv";
  }, 1100);
}

function getCurrentSlide() {
  return state.slides.find((slide) => slide.id === state.selectedSlideId) || state.slides[0];
}

function getSelectedElement() {
  return getCurrentSlide()?.elements.find((element) => element.id === state.selectedElementId) || null;
}

function currentTheme(slide = getCurrentSlide()) {
  return themeLibrary[slide.theme] || themeLibrary.midnight;
}

function selectSlide(slideId) {
  state.selectedSlideId = slideId;
  state.selectedElementId = null;
  editingElementId = null;
  hideSlideContextMenu();
  render();
}

function selectElement(elementId) {
  state.selectedElementId = elementId;
  render();
}

function setStatus(message) {
  el.statusText.textContent = message;
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatContentForHtml(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function normalizeColor(value) {
  const raw = `${value ?? ""}`.trim();
  if (raw.startsWith("#")) {
    if (raw.length === 4) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
    }
    return raw.slice(0, 7).toLowerCase();
  }
  const match = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) {
    return "#4db3ff";
  }
  const toHex = (channel) => Number(channel).toString(16).padStart(2, "0");
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

function extractColor(value, fallback) {
  const match = `${value}`.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
  if (match) {
    return match[0];
  }
  const rgbaMatch = `${value}`.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbaMatch) {
    return normalizeColor(rgbaMatch[0]);
  }
  return fallback;
}

function applyClipShape(node, shapeType, radius = 26) {
  node.style.clipPath = "";
  node.style.borderRadius = `${radius}px`;

  if (shapeType === "square") {
    node.style.borderRadius = "0px";
  } else if (shapeType === "circle") {
    node.style.borderRadius = "50%";
  } else if (shapeType === "diamond") {
    node.style.borderRadius = "0px";
    node.style.clipPath = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  } else if (shapeType === "hexagon") {
    node.style.borderRadius = "0px";
    node.style.clipPath = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
  } else if (shapeType === "ticket") {
    node.style.borderRadius = `${radius}px`;
    node.style.clipPath = "polygon(0% 16%, 8% 16%, 8% 0%, 92% 0%, 92% 16%, 100% 16%, 100% 84%, 92% 84%, 92% 100%, 8% 100%, 8% 84%, 0% 84%)";
  }
}

function getImageFilterString(element) {
  const adjustments = { ...createDefaultAdjustments(), ...(element.adjustments || {}) };
  const filters = [];

  if (adjustments.sharpness >= 67) {
    filters.push("url(#sharpen-strong)");
  } else if (adjustments.sharpness >= 34) {
    filters.push("url(#sharpen-medium)");
  } else if (adjustments.sharpness >= 1) {
    filters.push("url(#sharpen-soft)");
  }

  filters.push(`brightness(${adjustments.brightness / 100})`);
  filters.push(`contrast(${adjustments.contrast / 100})`);
  filters.push(`saturate(${adjustments.saturation / 100})`);
  filters.push(`blur(${adjustments.blur}px)`);
  filters.push(`opacity(${adjustments.opacity / 100})`);
  return filters.join(" ");
}

function render() {
  const slide = getCurrentSlide();
  const theme = currentTheme(slide);
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--accent-2", theme.secondary);
  el.deckTitle.value = state.title;
  el.activeSlideName.textContent = slide.name;
  el.transitionBadge.textContent = `${transitionModes.find((item) => item.id === slide.transition)?.label || "Morph"} · ${slide.transitionDuration} ms`;
  el.slideCount.textContent = `${state.slides.length}`;
  renderSlideList();
  renderStage();
  renderInspector();
  renderRibbon();
  renderSlideContextMenu();
  renderImageEditor();
  updateToolbarState();
  renderZoomState();
}

function updateToolbarState() {
  el.deleteSlideBtn.disabled = state.slides.length <= 1;
}

function renderZoomState() {
  if (el.zoomResetBtn) {
    el.zoomResetBtn.textContent = `${Math.round(uiState.zoom * 100)}%`;
  }
}

function renderRibbon() {
  const element = getSelectedElement();
  const textSelected = element && ["text", "title"].includes(element.type);
  const radiusTarget = element && ["shape", "image"].includes(element.type) ? element.radius : uiState.defaultRadius;
  const shapeTarget = element?.type === "shape" ? element.shapeType : uiState.activeShapeType;

  el.fontFamilyControl.disabled = !textSelected;
  el.fontSizeControl.disabled = !textSelected;
  el.fontWeightControl.disabled = !textSelected;
  el.lineHeightControl.disabled = !textSelected;
  el.fontColorControl.disabled = !textSelected;
  el.alignLeftBtn.disabled = !textSelected;
  el.alignCenterBtn.disabled = !textSelected;
  el.alignRightBtn.disabled = !textSelected;

  el.fontFamilyControl.value = textSelected ? element.fontFamily || "Manrope" : "Sora";
  el.fontSizeControl.value = textSelected ? element.fontSize : 32;
  el.fontWeightControl.value = textSelected ? String(element.fontWeight || 600) : "600";
  el.lineHeightControl.value = textSelected ? Number(element.lineHeight || 1.25).toFixed(2) : "1.20";
  el.fontColorControl.value = textSelected ? normalizeColor(element.color || "#f5f8ff") : "#f5f8ff";

  el.alignLeftBtn.classList.toggle("active", textSelected && element.align === "left");
  el.alignCenterBtn.classList.toggle("active", textSelected && element.align === "center");
  el.alignRightBtn.classList.toggle("active", textSelected && element.align === "right");

  el.shapePresetControl.value = shapeTarget;
  el.cornerRadiusControl.value = Math.round(radiusTarget || 0);
  quickShapeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.quickShape === shapeTarget);
  });
}

function renderSlideList() {
  el.slideList.innerHTML = "";
  state.slides.forEach((slide, index) => {
    const theme = currentTheme(slide);
    const card = document.createElement("article");
    card.className = `slide-card${slide.id === state.selectedSlideId ? " active" : ""}`;
    card.dataset.slideId = slide.id;
    card.draggable = true;
    card.innerHTML = `
      <div class="slide-number">${index + 1}</div>
      <div class="slide-preview-wrap">
        <div class="slide-preview" style="background:${theme.background};"></div>
        <div>
          <p class="slide-name">${escapeHtml(slide.name)}</p>
          <p class="slide-meta">${transitionModes.find((mode) => mode.id === slide.transition)?.label || "Morph"} · ${slide.elements.length} Elemente</p>
        </div>
      </div>
    `;

    const preview = card.querySelector(".slide-preview");
    slide.elements.slice(0, 6).forEach((element) => {
      preview.appendChild(createElementNode(element, slide, { scale: 0.18, interactive: false, thumbnail: true }));
    });
    el.slideList.appendChild(card);
  });
}

function renderStage() {
  const slide = getCurrentSlide();
  const baseScale = el.stageCanvas.clientWidth ? el.stageCanvas.clientWidth / SLIDE_WIDTH : 1;
  const scale = baseScale * uiState.zoom;
  const scene = createScene(slide, { interactive: true, sceneScale: scale });
  el.stageCanvas.innerHTML = "";
  el.stageCanvas.replaceChildren(scene);
}

function createScene(slide, options = {}) {
  const theme = currentTheme(slide);
  const scene = document.createElement("div");
  scene.className = "slide-scene";
  scene.style.background = theme.background;

  if (!options.thumbnail) {
    if (options.interactive) {
      scene.classList.add("editor-scene");
    }
    scene.style.width = `${SLIDE_WIDTH}px`;
    scene.style.height = `${SLIDE_HEIGHT}px`;
    scene.style.transformOrigin = "top left";
    scene.style.transform = `scale(${options.sceneScale || 1})`;
  }

  if (options.interactive) {
    scene.dataset.surface = "canvas";
  }

  const grid = document.createElement("div");
  grid.className = "canvas-grid";
  scene.appendChild(grid);

  slide.elements.forEach((element) => {
    scene.appendChild(createElementNode(element, slide, { scale: 1, interactive: options.interactive, thumbnail: options.thumbnail }));
  });

  return scene;
}

function createElementNode(element, slide, options = {}) {
  const theme = currentTheme(slide);
  const interactive = options.interactive !== false;
  const scale = options.scale ?? 1;
  const node = document.createElement("div");
  const isSelected = interactive && state.selectedElementId === element.id;
  const isEditing = interactive && editingElementId === element.id && (element.type === "text" || element.type === "title");

  node.className = `canvas-element${isSelected ? " selected" : ""}${isEditing ? " editing" : ""}`;
  node.dataset.elementId = element.id;
  node.dataset.type = element.type;
  node.style.left = `${element.x * scale}px`;
  node.style.top = `${element.y * scale}px`;
  node.style.width = `${element.w * scale}px`;
  node.style.height = `${element.h * scale}px`;
  node.style.color = element.color || theme.text;
  node.style.boxShadow = element.shadow || "";
  node.style.overflow = "visible";

  if (options.thumbnail) {
    node.classList.add("thumbnail-item", element.type);
  }

  if (element.type === "shape") {
    const shape = document.createElement("div");
    shape.className = "shape-element";
    shape.style.background = element.fill || theme.shapeFill;
    shape.style.border = `1px solid ${element.stroke || theme.shapeStroke}`;
    applyClipShape(shape, element.shapeType || "rounded", (element.radius || 0) * scale);
    node.appendChild(shape);
  } else if (element.type === "image") {
    const image = document.createElement("img");
    image.className = "image-element";
    image.src = element.src;
    image.alt = "";
    image.style.objectFit = element.fit || "cover";
    image.style.filter = getImageFilterString(element);
    applyClipShape(image, element.maskShape || "rounded", (element.radius || 0) * scale);
    node.appendChild(image);
  } else {
    const text = document.createElement("div");
    text.className = "element-content";
    text.style.fontSize = `${element.fontSize * scale}px`;
    text.style.fontWeight = element.fontWeight;
    text.style.lineHeight = element.lineHeight;
    text.style.textAlign = element.align;
    text.style.fontFamily = `"${element.fontFamily || (element.type === "title" ? "Sora" : "Manrope")}", sans-serif`;
    text.innerHTML = formatContentForHtml(element.content);

    if (interactive && isEditing) {
      text.contentEditable = "true";
      text.spellcheck = false;
      text.dataset.editable = "true";
    }
    node.appendChild(text);
  }

  if (interactive && isSelected) {
    ["nw", "ne", "sw", "se"].forEach((handleName) => {
      const handle = document.createElement("div");
      handle.className = "resize-handle";
      handle.dataset.handle = handleName;
      node.appendChild(handle);
    });
  }

  return node;
}

function renderInspector() {
  const slide = getCurrentSlide();
  const element = getSelectedElement();
  const theme = currentTheme(slide);

  const themeOptions = Object.values(themeLibrary)
    .map((themeItem) => `<option value="${themeItem.id}" ${themeItem.id === slide.theme ? "selected" : ""}>${themeItem.name}</option>`)
    .join("");
  const transitionOptions = transitionModes
    .map((mode) => `<option value="${mode.id}" ${mode.id === slide.transition ? "selected" : ""}>${mode.label}</option>`)
    .join("");
  const durationOptions = transitionDurations
    .map((duration) => `<option value="${duration.value}" ${Number(slide.transitionDuration) === duration.value ? "selected" : ""}>${duration.label} · ${duration.value} ms</option>`)
    .join("");

  let selectionSection = `
    <div class="inspector-section">
      <h3>Element</h3>
      <p class="empty-state">Wähle ein Textfeld, eine Form oder ein Bild aus, um Position, Stil und Inhalt zu bearbeiten.</p>
    </div>
  `;

  if (element) {
    selectionSection = `
      <div class="inspector-section">
        <h3>Ausgewähltes Element</h3>
        <div class="field-grid">
          <div class="field">
            <label>X</label>
            <input data-element-prop="x" type="number" min="0" max="${SLIDE_WIDTH}" step="1" value="${Math.round(element.x)}" />
          </div>
          <div class="field">
            <label>Y</label>
            <input data-element-prop="y" type="number" min="0" max="${SLIDE_HEIGHT}" step="1" value="${Math.round(element.y)}" />
          </div>
          <div class="field">
            <label>Breite</label>
            <input data-element-prop="w" type="number" min="40" max="${SLIDE_WIDTH}" step="1" value="${Math.round(element.w)}" />
          </div>
          <div class="field">
            <label>Höhe</label>
            <input data-element-prop="h" type="number" min="40" max="${SLIDE_HEIGHT}" step="1" value="${Math.round(element.h)}" />
          </div>
          <div class="field">
            <label>Radius</label>
            <input data-element-prop="radius" type="range" min="0" max="80" step="1" value="${Math.round(element.radius || 0)}" />
          </div>
          <div class="field">
            <label>Schatten</label>
            <select data-element-prop="shadowPreset">
              <option value="none" ${!element.shadow ? "selected" : ""}>Kein Schatten</option>
              <option value="soft" ${element.shadow === "0 18px 46px rgba(0, 0, 0, 0.24)" ? "selected" : ""}>Soft</option>
              <option value="glow" ${element.shadow === "0 18px 40px rgba(20, 54, 138, 0.45)" ? "selected" : ""}>Blue Glow</option>
            </select>
          </div>
          ${element.type === "text" || element.type === "title" ? `
            <div class="field field--full">
              <label>Inhalt</label>
              <textarea data-element-prop="content">${escapeHtml(element.content)}</textarea>
            </div>
            <div class="field">
              <label>Schriftart</label>
              <select data-element-prop="fontFamily">
                ${textFontOptions.map((fontName) => `<option value="${fontName}" ${fontName === element.fontFamily ? "selected" : ""}>${fontName}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Schriftgröße</label>
              <input data-element-prop="fontSize" type="number" min="14" max="120" step="1" value="${element.fontSize}" />
            </div>
            <div class="field">
              <label>Gewicht</label>
              <select data-element-prop="fontWeight">
                <option value="500" ${Number(element.fontWeight) === 500 ? "selected" : ""}>500</option>
                <option value="600" ${Number(element.fontWeight) === 600 ? "selected" : ""}>600</option>
                <option value="700" ${Number(element.fontWeight) === 700 ? "selected" : ""}>700</option>
                <option value="800" ${Number(element.fontWeight) === 800 ? "selected" : ""}>800</option>
              </select>
            </div>
            <div class="field">
              <label>Textfarbe</label>
              <input data-element-prop="color" type="color" value="${normalizeColor(element.color || theme.text)}" />
            </div>
            <div class="field">
              <label>Ausrichtung</label>
              <select data-element-prop="align">
                <option value="left" ${element.align === "left" ? "selected" : ""}>Links</option>
                <option value="center" ${element.align === "center" ? "selected" : ""}>Zentriert</option>
                <option value="right" ${element.align === "right" ? "selected" : ""}>Rechts</option>
              </select>
            </div>
            <div class="field">
              <label>Zeilenhöhe</label>
              <input data-element-prop="lineHeight" type="number" min="1" max="2" step="0.05" value="${element.lineHeight || 1.25}" />
            </div>
          ` : ""}
          ${element.type === "shape" ? `
            <div class="field">
              <label>Formtyp</label>
              <select data-element-prop="shapeType">
                ${shapeTypeOptions.map((option) => `<option value="${option.id}" ${option.id === element.shapeType ? "selected" : ""}>${option.label}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Füllung</label>
              <input data-element-prop="fillColor" type="color" value="${normalizeColor(extractColor(element.fill || theme.shapeFill, theme.accent))}" />
            </div>
            <div class="field">
              <label>Kontur</label>
              <input data-element-prop="strokeColor" type="color" value="${normalizeColor(extractColor(element.stroke || theme.shapeStroke, theme.accent))}" />
            </div>
          ` : ""}
          ${element.type === "image" ? `
            <div class="field">
              <label>Bildmodus</label>
              <select data-element-prop="fit">
                <option value="cover" ${element.fit === "cover" ? "selected" : ""}>Cover</option>
                <option value="contain" ${element.fit === "contain" ? "selected" : ""}>Contain</option>
              </select>
            </div>
            <div class="field">
              <label>Bildform</label>
              <select data-element-prop="maskShape">
                ${imageMaskOptions.map((option) => `<option value="${option.id}" ${option.id === element.maskShape ? "selected" : ""}>${option.label}</option>`).join("")}
              </select>
            </div>
          ` : ""}
        </div>
        <button class="ghost-button" data-action="delete-element">Element entfernen</button>
      </div>
    `;
  }

  el.inspectorContent.innerHTML = `
    <div class="inspector-section">
      <h3>Folie</h3>
      <div class="field-grid">
        <div class="field field--full">
          <label>Name</label>
          <input id="slideNameInput" type="text" value="${escapeHtml(slide.name)}" />
        </div>
        <div class="field">
          <label>Theme</label>
          <select id="slideThemeSelect">${themeOptions}</select>
        </div>
        <div class="field">
          <label>Übergang</label>
          <select id="slideTransitionSelect">${transitionOptions}</select>
        </div>
        <div class="field field--full">
          <label>Dauer</label>
          <select id="slideTransitionDurationSelect">${durationOptions}</select>
        </div>
        <div class="field field--full">
          <label>Notizen</label>
          <textarea id="slideNotesInput" placeholder="Speaker Notes oder Regieanweisungen">${escapeHtml(slide.notes)}</textarea>
        </div>
      </div>
      <div class="transition-pills">
        ${transitionModes.map((mode) => `<span class="transition-pill">${mode.label}</span>`).join("")}
      </div>
    </div>
    ${selectionSection}
  `;
}

function renderSlideContextMenu() {
  if (!uiState.slideContext.open) {
    el.slideContextMenu.classList.add("hidden");
    el.slideContextMenu.setAttribute("aria-hidden", "true");
    return;
  }

  const slide = state.slides.find((item) => item.id === uiState.slideContext.slideId) || getCurrentSlide();
  const menuWidth = 230;
  const menuHeight = 210;
  const left = clampNumber(uiState.slideContext.x, 12, window.innerWidth - menuWidth - 12);
  const top = clampNumber(uiState.slideContext.y, 12, window.innerHeight - menuHeight - 12);

  el.slideContextMenu.classList.remove("hidden");
  el.slideContextMenu.setAttribute("aria-hidden", "false");
  el.slideContextMenu.style.left = `${left}px`;
  el.slideContextMenu.style.top = `${top}px`;
  el.slideContextMenu.innerHTML = `
    <button class="menu-item" data-menu-action="duplicate-slide" data-slide-id="${slide.id}">Duplizieren <span>Strg/Cmd+D</span></button>
    <button class="menu-item" data-menu-action="new-after" data-slide-id="${slide.id}">Neue Folie danach <span>Enter</span></button>
    <button class="menu-item" data-menu-action="rename-slide" data-slide-id="${slide.id}">Umbenennen <span>F2</span></button>
    <button class="menu-item danger-soft" data-menu-action="delete-slide" data-slide-id="${slide.id}">Löschen <span>Entf</span></button>
  `;
}

function renderImageEditor() {
  if (!uiState.imageEditor.open) {
    el.imageEditorPanel.classList.add("hidden");
    el.imageEditorPanel.setAttribute("aria-hidden", "true");
    return;
  }

  const element = getCurrentSlide().elements.find((item) => item.id === uiState.imageEditor.elementId);
  if (!element || element.type !== "image") {
    uiState.imageEditor.open = false;
    el.imageEditorPanel.classList.add("hidden");
    return;
  }

  const width = 360;
  const height = 540;
  const left = clampNumber(uiState.imageEditor.x, 12, window.innerWidth - width - 12);
  const top = clampNumber(uiState.imageEditor.y, 12, window.innerHeight - height - 12);
  const adjustments = { ...createDefaultAdjustments(), ...(element.adjustments || {}) };

  el.imageEditorPanel.classList.remove("hidden");
  el.imageEditorPanel.setAttribute("aria-hidden", "false");
  el.imageEditorPanel.style.left = `${left}px`;
  el.imageEditorPanel.style.top = `${top}px`;
  el.imageEditorContent.innerHTML = `
    <div class="floating-editor__section">
      <h4>Filter</h4>
      <div class="field-grid">
        <div class="field field--full">
          <label>Helligkeit ${adjustments.brightness}%</label>
          <input data-image-prop="brightness" type="range" min="0" max="200" step="1" value="${adjustments.brightness}" />
        </div>
        <div class="field field--full">
          <label>Kontrast ${adjustments.contrast}%</label>
          <input data-image-prop="contrast" type="range" min="0" max="200" step="1" value="${adjustments.contrast}" />
        </div>
        <div class="field field--full">
          <label>Sättigung ${adjustments.saturation}%</label>
          <input data-image-prop="saturation" type="range" min="0" max="200" step="1" value="${adjustments.saturation}" />
        </div>
        <div class="field field--full">
          <label>Transparenz ${adjustments.opacity}%</label>
          <input data-image-prop="opacity" type="range" min="0" max="100" step="1" value="${adjustments.opacity}" />
        </div>
        <div class="field field--full">
          <label>Schärfe ${adjustments.sharpness}%</label>
          <input data-image-prop="sharpness" type="range" min="0" max="100" step="1" value="${adjustments.sharpness}" />
        </div>
        <div class="field field--full">
          <label>Weichzeichnung ${adjustments.blur}px</label>
          <input data-image-prop="blur" type="range" min="0" max="8" step="0.2" value="${adjustments.blur}" />
        </div>
      </div>
    </div>
    <div class="floating-editor__section">
      <h4>Bild in Form</h4>
      <div class="field-grid">
        <div class="field">
          <label>Maske</label>
          <select data-image-root-prop="maskShape">
            ${imageMaskOptions.map((option) => `<option value="${option.id}" ${option.id === element.maskShape ? "selected" : ""}>${option.label}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Bildmodus</label>
          <select data-image-root-prop="fit">
            <option value="cover" ${element.fit === "cover" ? "selected" : ""}>Cover</option>
            <option value="contain" ${element.fit === "contain" ? "selected" : ""}>Contain</option>
          </select>
        </div>
        <div class="field field--full">
          <label>Eckenradius ${Math.round(element.radius || 0)}</label>
          <input data-image-root-prop="radius" type="range" min="0" max="80" step="1" value="${Math.round(element.radius || 0)}" />
        </div>
      </div>
      <div class="mask-chips">
        ${imageMaskOptions.map((option) => `<button class="mask-chip ${option.id === element.maskShape ? "active" : ""}" type="button" data-mask-chip="${option.id}">${option.label}</button>`).join("")}
      </div>
    </div>
    <div class="floating-editor__section">
      <h4>Aktionen</h4>
      <div class="floating-editor__actions">
        <button class="ghost-button" type="button" data-image-action="replace">Bild ersetzen</button>
        <button class="ghost-button" type="button" data-image-action="reset">Filter zurücksetzen</button>
        <button class="ghost-button danger-soft" type="button" data-image-action="delete">Bild löschen</button>
      </div>
    </div>
  `;
}

function updateSelectedElement(updates, options = {}) {
  const slide = getCurrentSlide();
  const element = getSelectedElement();
  if (!element) {
    return;
  }

  Object.assign(element, updates);

  if (updates.adjustments) {
    element.adjustments = { ...createDefaultAdjustments(), ...(element.adjustments || {}), ...updates.adjustments };
  }

  if (updates.w !== undefined || updates.h !== undefined) {
    element.w = clampNumber(Number(element.w), 40, SLIDE_WIDTH + WORKSPACE_MARGIN * 2);
    element.h = clampNumber(Number(element.h), 40, SLIDE_HEIGHT + WORKSPACE_MARGIN * 2);
  }
  if (updates.x !== undefined || updates.w !== undefined) {
    element.x = clampNumber(Number(element.x), -WORKSPACE_MARGIN, SLIDE_WIDTH + WORKSPACE_MARGIN - element.w);
  }
  if (updates.y !== undefined || updates.h !== undefined) {
    element.y = clampNumber(Number(element.y), -WORKSPACE_MARGIN, SLIDE_HEIGHT + WORKSPACE_MARGIN - element.h);
  }
  if (updates.radius !== undefined) {
    element.radius = clampNumber(Number(element.radius) || 0, 0, 80);
    uiState.defaultRadius = element.radius;
  }
  if (element.type === "shape") {
    element.fill = element.fill || currentTheme(slide).shapeFill;
    element.stroke = element.stroke || currentTheme(slide).shapeStroke;
    uiState.activeShapeType = element.shapeType || uiState.activeShapeType;
  }

  queueSave();
  if (options.stageOnly) {
    renderStage();
    renderRibbon();
    renderInspector();
    renderImageEditor();
    return;
  }
  render();
}

function addElement(type, extra = {}) {
  const slide = getCurrentSlide();
  const theme = currentTheme(slide);
  const presets = {
    title: {
      x: 96,
      y: 96,
      w: 820,
      h: 112,
      color: theme.text,
      content: "Neuer Titel",
      fontFamily: "Sora"
    },
    text: {
      x: 104,
      y: 208,
      w: 520,
      h: 170,
      color: theme.muted,
      content: "Text hier bearbeiten",
      fontFamily: "Manrope"
    },
    shape: {
      x: 820,
      y: 164,
      w: 300,
      h: 220,
      fill: theme.shapeFill,
      stroke: theme.shapeStroke,
      radius: uiState.defaultRadius,
      shapeType: uiState.activeShapeType,
      shadow: "0 18px 46px rgba(0, 0, 0, 0.24)"
    }
  };

  const element = createElement(type, { ...(presets[type] || {}), ...extra });
  slide.elements.push(element);
  state.selectedElementId = element.id;
  editingElementId = type === "title" || type === "text" ? element.id : null;
  queueSave();
  render();
  if (editingElementId) {
    focusEditableElement();
  }
}

function addSlide(afterSlideId = null) {
  const current = state.slides.find((slide) => slide.id === (afterSlideId || state.selectedSlideId)) || getCurrentSlide();
  const newSlide = createSlide({
    name: `Folie ${state.slides.length + 1}`,
    theme: current.theme,
    transition: current.transition,
    transitionDuration: current.transitionDuration
  });
  const index = state.slides.findIndex((slide) => slide.id === current.id);
  state.slides.splice(index + 1, 0, newSlide);
  state.selectedSlideId = newSlide.id;
  state.selectedElementId = null;
  editingElementId = null;
  hideSlideContextMenu();
  queueSave();
  render();
  setStatus("Neue Folie hinzugefügt.");
}

function duplicateSlide(slideId = state.selectedSlideId) {
  const current = state.slides.find((slide) => slide.id === slideId) || getCurrentSlide();
  const clone = JSON.parse(JSON.stringify(current));
  clone.id = createId("slide");
  clone.name = `${current.name} Kopie`;
  clone.elements = clone.elements.map((element) => ({ ...element, id: createId("el") }));
  const index = state.slides.findIndex((slide) => slide.id === current.id);
  state.slides.splice(index + 1, 0, clone);
  state.selectedSlideId = clone.id;
  state.selectedElementId = null;
  editingElementId = null;
  hideSlideContextMenu();
  queueSave();
  render();
  setStatus("Folie dupliziert.");
}

function deleteSlide(slideId = state.selectedSlideId) {
  if (state.slides.length === 1) {
    return;
  }
  const index = state.slides.findIndex((slide) => slide.id === slideId);
  if (index < 0) {
    return;
  }
  state.slides.splice(index, 1);
  const fallback = state.slides[Math.max(0, index - 1)] || state.slides[0];
  state.selectedSlideId = fallback.id;
  state.selectedElementId = null;
  editingElementId = null;
  hideSlideContextMenu();
  queueSave();
  render();
  setStatus("Folie entfernt.");
}

function deleteSelectedElement() {
  const slide = getCurrentSlide();
  const index = slide.elements.findIndex((element) => element.id === state.selectedElementId);
  if (index < 0) {
    return;
  }
  const removed = slide.elements[index];
  slide.elements.splice(index, 1);
  state.selectedElementId = null;
  editingElementId = null;
  if (uiState.imageEditor.elementId === removed.id) {
    closeImageEditor();
  }
  queueSave();
  render();
  setStatus("Element entfernt.");
}

function renameSlide(slideId) {
  const slide = state.slides.find((item) => item.id === slideId);
  if (!slide) {
    return;
  }
  const nextName = window.prompt("Neuer Folienname", slide.name);
  if (!nextName) {
    return;
  }
  slide.name = nextName.trim() || slide.name;
  hideSlideContextMenu();
  queueSave();
  render();
}

function reorderSlides(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) {
    return;
  }
  const sourceIndex = state.slides.findIndex((slide) => slide.id === sourceId);
  const targetIndex = state.slides.findIndex((slide) => slide.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) {
    return;
  }
  const [slide] = state.slides.splice(sourceIndex, 1);
  state.slides.splice(targetIndex, 0, slide);
  queueSave();
  render();
}

function showSlideContextMenu(slideId, x, y) {
  uiState.slideContext = { open: true, slideId, x, y };
  renderSlideContextMenu();
}

function hideSlideContextMenu() {
  uiState.slideContext.open = false;
  renderSlideContextMenu();
}

function showImageEditor(elementId, x, y) {
  state.selectedElementId = elementId;
  uiState.imageEditor = { open: true, elementId, x, y };
  render();
}

function closeImageEditor() {
  uiState.imageEditor.open = false;
  uiState.imageEditor.elementId = null;
  renderImageEditor();
}

function beginPresentation() {
  presentationIndex = state.slides.findIndex((slide) => slide.id === state.selectedSlideId);
  if (presentationIndex < 0) {
    presentationIndex = 0;
  }
  el.presentationOverlay.classList.remove("hidden");
  el.presentationOverlay.setAttribute("aria-hidden", "false");
  renderPresentationSlide({ initial: true });
  setStatus("Präsentationsmodus aktiv.");
}

function closePresentation() {
  el.presentationOverlay.classList.add("hidden");
  el.presentationOverlay.setAttribute("aria-hidden", "true");
}

function goToPresentationSlide(nextIndex) {
  const clamped = clampNumber(nextIndex, 0, state.slides.length - 1);
  if (clamped === presentationIndex) {
    return;
  }
  presentationIndex = clamped;
  renderPresentationSlide();
}

function renderPresentationSlide({ initial = false } = {}) {
  const slide = state.slides[presentationIndex];
  const previousLayer = el.presentationStage.querySelector(".presentation-layer.current");
  const transition = slide.transition || "morph";
  const transitionMs = Number(slide.transitionDuration) || 680;
  const sceneScale = el.presentationStage.clientWidth ? el.presentationStage.clientWidth / SLIDE_WIDTH : 1;

  if (initial || !previousLayer || transition === "none") {
    el.presentationStage.innerHTML = "";
    const layer = document.createElement("div");
    layer.className = "presentation-layer current";
    layer.style.setProperty("--transition-ms", `${transitionMs}ms`);
    layer.appendChild(createScene(slide, { interactive: false, sceneScale }));
    el.presentationStage.appendChild(layer);
  } else {
    previousLayer.classList.add("exit", `transition-${transition}`);
    previousLayer.style.setProperty("--transition-ms", `${transitionMs}ms`);

    const nextLayer = document.createElement("div");
    nextLayer.className = `presentation-layer current enter transition-${transition}`;
    nextLayer.style.setProperty("--transition-ms", `${transitionMs}ms`);
    nextLayer.appendChild(createScene(slide, { interactive: false, sceneScale }));
    el.presentationStage.appendChild(nextLayer);

    window.setTimeout(() => {
      previousLayer.remove();
      nextLayer.classList.remove("enter");
    }, transitionMs + 60);
  }

  el.presentationCounter.textContent = `${presentationIndex + 1} / ${state.slides.length}`;
}

function setZoom(nextZoom) {
  uiState.zoom = clampNumber(nextZoom, 0.45, 1.9);
  renderStage();
  renderZoomState();
}

function exportDeck() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "deckflow-deck"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Präsentation als JSON exportiert.");
}

function importDeck(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = hydrateDeck(JSON.parse(reader.result));
      state.title = imported.title;
      state.slides = imported.slides;
      state.selectedSlideId = state.slides[0].id;
      state.selectedElementId = null;
      editingElementId = null;
      uiState.imageEditor.open = false;
      hideSlideContextMenu();
      saveState();
      render();
      setStatus("Präsentation importiert.");
    } catch (error) {
      setStatus("Import fehlgeschlagen. Bitte gültige Deck-JSON wählen.");
    }
  };
  reader.readAsText(file);
}

function addImageFromFile(file, targetElementId = null) {
  const reader = new FileReader();
  reader.onload = () => {
    if (targetElementId) {
      const element = getCurrentSlide().elements.find((item) => item.id === targetElementId);
      if (element && element.type === "image") {
        element.src = reader.result;
        queueSave();
        render();
        setStatus("Bild ersetzt.");
      }
      return;
    }
    const imageElement = createElement("image", {
      x: 760,
      y: 148,
      w: 360,
      h: 260,
      src: reader.result,
      radius: uiState.defaultRadius,
      maskShape: "rounded",
      shadow: "0 18px 46px rgba(0, 0, 0, 0.24)"
    });
    getCurrentSlide().elements.push(imageElement);
    state.selectedElementId = imageElement.id;
    queueSave();
    render();
    setStatus("Bild eingefügt.");
  };
  reader.readAsDataURL(file);
}

function focusEditableElement() {
  const editable = el.stageCanvas.querySelector('[data-editable="true"]');
  if (!editable) {
    return;
  }
  editable.focus();
  const selection = window.getSelection();
  selection?.selectAllChildren(editable);
  selection?.collapseToEnd();
}

function pointToSlideCoordinates(clientX, clientY) {
  const scene = el.stageCanvas.querySelector(".slide-scene");
  const rect = scene.getBoundingClientRect();
  const scaleX = SLIDE_WIDTH / rect.width;
  const scaleY = SLIDE_HEIGHT / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function beginDrag(event, elementId, handle) {
  const element = getCurrentSlide().elements.find((item) => item.id === elementId);
  if (!element) {
    return;
  }
  const origin = pointToSlideCoordinates(event.clientX, event.clientY);
  dragState = {
    type: handle ? "resize" : "move",
    handle,
    elementId,
    origin,
    startX: element.x,
    startY: element.y,
    startW: element.w,
    startH: element.h
  };
}

function handleDragMove(event) {
  if (!dragState) {
    return;
  }
  const element = getCurrentSlide().elements.find((item) => item.id === dragState.elementId);
  if (!element) {
    return;
  }
  const point = pointToSlideCoordinates(event.clientX, event.clientY);
  const deltaX = point.x - dragState.origin.x;
  const deltaY = point.y - dragState.origin.y;

  if (dragState.type === "move") {
    element.x = clampNumber(dragState.startX + deltaX, -WORKSPACE_MARGIN, SLIDE_WIDTH + WORKSPACE_MARGIN - element.w);
    element.y = clampNumber(dragState.startY + deltaY, -WORKSPACE_MARGIN, SLIDE_HEIGHT + WORKSPACE_MARGIN - element.h);
  } else {
    const next = {
      x: dragState.startX,
      y: dragState.startY,
      w: dragState.startW,
      h: dragState.startH
    };
    if (dragState.handle.includes("e")) {
      next.w = clampNumber(dragState.startW + deltaX, 40, SLIDE_WIDTH + WORKSPACE_MARGIN - next.x);
    }
    if (dragState.handle.includes("s")) {
      next.h = clampNumber(dragState.startH + deltaY, 40, SLIDE_HEIGHT + WORKSPACE_MARGIN - next.y);
    }
    if (dragState.handle.includes("w")) {
      next.x = clampNumber(dragState.startX + deltaX, -WORKSPACE_MARGIN, dragState.startX + dragState.startW - 40);
      next.w = clampNumber(dragState.startW - deltaX, 40, SLIDE_WIDTH + WORKSPACE_MARGIN - next.x);
    }
    if (dragState.handle.includes("n")) {
      next.y = clampNumber(dragState.startY + deltaY, -WORKSPACE_MARGIN, dragState.startY + dragState.startH - 40);
      next.h = clampNumber(dragState.startH - deltaY, 40, SLIDE_HEIGHT + WORKSPACE_MARGIN - next.y);
    }
    Object.assign(element, next);
  }

  renderStage();
  renderInspector();
  renderRibbon();
  renderImageEditor();
}

function finishDrag() {
  if (!dragState) {
    return;
  }
  dragState = null;
  queueSave();
}

function applyTextRibbonChanges(updates) {
  const element = getSelectedElement();
  if (!element || !["text", "title"].includes(element.type)) {
    return;
  }
  updateSelectedElement(updates);
}

function applyImageAdjustment(prop, value) {
  const element = getSelectedElement();
  if (!element || element.type !== "image") {
    return;
  }
  updateSelectedElement({ adjustments: { [prop]: value } }, { stageOnly: true });
}

function setSelectedImageRootProp(prop, value) {
  const element = getSelectedElement();
  if (!element || element.type !== "image") {
    return;
  }
  updateSelectedElement({ [prop]: value }, { stageOnly: false });
}

el.addSlideBtn.addEventListener("click", () => addSlide());
el.deleteSlideBtn.addEventListener("click", () => deleteSlide());
el.addTitleBtn.addEventListener("click", () => addElement("title"));
el.addTextBtn.addEventListener("click", () => addElement("text"));
el.addShapeBtn.addEventListener("click", () => addElement("shape"));
el.addImageBtn.addEventListener("click", () => el.imageInput.click());
el.importDeckBtn.addEventListener("click", () => el.importInput.click());
el.exportDeckBtn.addEventListener("click", exportDeck);
el.presentBtn.addEventListener("click", beginPresentation);
el.closeImageEditorBtn.addEventListener("click", closeImageEditor);
el.closePresentationBtn.addEventListener("click", closePresentation);
el.prevPresentationBtn.addEventListener("click", () => goToPresentationSlide(presentationIndex - 1));
el.nextPresentationBtn.addEventListener("click", () => goToPresentationSlide(presentationIndex + 1));

el.fontFamilyControl.addEventListener("change", (event) => applyTextRibbonChanges({ fontFamily: event.target.value }));
el.fontSizeControl.addEventListener("input", (event) => applyTextRibbonChanges({ fontSize: Number(event.target.value) }));
el.fontWeightControl.addEventListener("change", (event) => applyTextRibbonChanges({ fontWeight: Number(event.target.value) }));
el.lineHeightControl.addEventListener("input", (event) => applyTextRibbonChanges({ lineHeight: Number(event.target.value) }));
el.fontColorControl.addEventListener("input", (event) => applyTextRibbonChanges({ color: event.target.value }));
el.alignLeftBtn.addEventListener("click", () => applyTextRibbonChanges({ align: "left" }));
el.alignCenterBtn.addEventListener("click", () => applyTextRibbonChanges({ align: "center" }));
el.alignRightBtn.addEventListener("click", () => applyTextRibbonChanges({ align: "right" }));
el.shapePresetControl.addEventListener("change", (event) => {
  uiState.activeShapeType = event.target.value;
  const element = getSelectedElement();
  if (element?.type === "shape") {
    updateSelectedElement({ shapeType: event.target.value });
  }
});
quickShapeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    uiState.activeShapeType = button.dataset.quickShape;
    el.shapePresetControl.value = button.dataset.quickShape;
    const element = getSelectedElement();
    if (element?.type === "shape") {
      updateSelectedElement({ shapeType: button.dataset.quickShape });
      return;
    }
    renderRibbon();
  });
});
el.cornerRadiusControl.addEventListener("input", (event) => {
  uiState.defaultRadius = Number(event.target.value);
  const element = getSelectedElement();
  if (element && ["shape", "image"].includes(element.type)) {
    updateSelectedElement({ radius: Number(event.target.value) }, { stageOnly: true });
  }
});
el.zoomOutBtn.addEventListener("click", () => setZoom(uiState.zoom - 0.1));
el.zoomResetBtn.addEventListener("click", () => setZoom(1));
el.zoomInBtn.addEventListener("click", () => setZoom(uiState.zoom + 0.1));

el.imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    addImageFromFile(file);
  }
  event.target.value = "";
});

el.replaceImageInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file && uiState.pendingReplaceImageId) {
    addImageFromFile(file, uiState.pendingReplaceImageId);
  }
  uiState.pendingReplaceImageId = null;
  event.target.value = "";
});

el.importInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    importDeck(file);
  }
  event.target.value = "";
});

el.deckTitle.addEventListener("input", (event) => {
  state.title = event.target.value || "DeckFlow Studio";
  queueSave();
});

el.slideList.addEventListener("click", (event) => {
  const card = event.target.closest(".slide-card");
  if (!card) {
    return;
  }
  selectSlide(card.dataset.slideId);
});

el.slideList.addEventListener("contextmenu", (event) => {
  const card = event.target.closest(".slide-card");
  if (!card) {
    return;
  }
  event.preventDefault();
  state.selectedSlideId = card.dataset.slideId;
  state.selectedElementId = null;
  showSlideContextMenu(card.dataset.slideId, event.clientX, event.clientY);
  render();
});

el.slideList.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".slide-card");
  if (!card) {
    return;
  }
  draggedSlideId = card.dataset.slideId;
  event.dataTransfer.effectAllowed = "move";
});

el.slideList.addEventListener("dragover", (event) => {
  event.preventDefault();
  const card = event.target.closest(".slide-card");
  document.querySelectorAll(".slide-card.drag-over").forEach((node) => node.classList.remove("drag-over"));
  if (card) {
    card.classList.add("drag-over");
  }
});

el.slideList.addEventListener("drop", (event) => {
  event.preventDefault();
  const card = event.target.closest(".slide-card");
  document.querySelectorAll(".slide-card.drag-over").forEach((node) => node.classList.remove("drag-over"));
  if (card) {
    reorderSlides(draggedSlideId, card.dataset.slideId);
  }
  draggedSlideId = null;
});

el.slideList.addEventListener("dragend", () => {
  document.querySelectorAll(".slide-card.drag-over").forEach((node) => node.classList.remove("drag-over"));
  draggedSlideId = null;
});

el.slideContextMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-menu-action]");
  if (!button) {
    return;
  }
  const slideId = button.dataset.slideId;
  const action = button.dataset.menuAction;
  if (action === "duplicate-slide") {
    duplicateSlide(slideId);
  } else if (action === "new-after") {
    addSlide(slideId);
  } else if (action === "rename-slide") {
    renameSlide(slideId);
  } else if (action === "delete-slide") {
    deleteSlide(slideId);
  }
});

el.stageCanvas.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest(".resize-handle");
  const elementNode = event.target.closest(".canvas-element");
  const editable = event.target.closest('[data-editable="true"]');
  if (editable) {
    return;
  }
  hideSlideContextMenu();
  if (!elementNode) {
    state.selectedElementId = null;
    editingElementId = null;
    renderInspector();
    renderRibbon();
    renderStage();
    return;
  }

  state.selectedElementId = elementNode.dataset.elementId;
  if (handle) {
    beginDrag(event, elementNode.dataset.elementId, handle.dataset.handle);
  } else {
    beginDrag(event, elementNode.dataset.elementId);
  }
  renderStage();
  renderInspector();
  renderRibbon();
});

el.stageCanvas.addEventListener("dblclick", (event) => {
  const elementNode = event.target.closest(".canvas-element");
  if (!elementNode) {
    return;
  }
  const selected = getCurrentSlide().elements.find((item) => item.id === elementNode.dataset.elementId);
  if (!selected || !["text", "title"].includes(selected.type)) {
    return;
  }
  state.selectedElementId = selected.id;
  editingElementId = selected.id;
  render();
  focusEditableElement();
  setStatus("Textbearbeitung aktiv.");
});

el.stageCanvas.addEventListener("contextmenu", (event) => {
  const elementNode = event.target.closest(".canvas-element");
  if (!elementNode) {
    return;
  }
  const selected = getCurrentSlide().elements.find((item) => item.id === elementNode.dataset.elementId);
  if (!selected) {
    return;
  }
  state.selectedElementId = selected.id;
  if (selected.type === "image") {
    event.preventDefault();
    showImageEditor(selected.id, event.clientX + 10, event.clientY + 10);
  }
});

document.addEventListener("pointermove", handleDragMove);
document.addEventListener("pointerup", finishDrag);
window.addEventListener("resize", () => {
  renderStage();
  renderSlideContextMenu();
  renderImageEditor();
  if (!el.presentationOverlay.classList.contains("hidden")) {
    renderPresentationSlide({ initial: true });
  }
});

el.stageCanvas.addEventListener("wheel", (event) => {
  if (!event.ctrlKey && !event.metaKey) {
    return;
  }
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.08 : 0.08;
  setZoom(uiState.zoom + delta);
}, { passive: false });

el.stageCanvas.addEventListener("input", (event) => {
  const editable = event.target.closest('[data-editable="true"]');
  if (!editable) {
    return;
  }
  const element = getSelectedElement();
  if (!element) {
    return;
  }
  element.content = editable.innerText;
  queueSave();
});

el.stageCanvas.addEventListener("blur", (event) => {
  const editable = event.target.closest('[data-editable="true"]');
  if (!editable) {
    return;
  }
  editingElementId = null;
  render();
}, true);

el.inspectorContent.addEventListener("input", (event) => {
  const slide = getCurrentSlide();
  const prop = event.target.dataset.elementProp;

  if (event.target.id === "slideNameInput") {
    slide.name = event.target.value || "Folie";
    queueSave();
    renderSlideList();
    el.activeSlideName.textContent = slide.name;
    return;
  }
  if (event.target.id === "slideNotesInput") {
    slide.notes = event.target.value;
    queueSave();
    return;
  }
  if (!prop) {
    return;
  }

  if (prop === "content") {
    const element = getSelectedElement();
    if (!element) {
      return;
    }
    element.content = event.target.value;
    queueSave();
    renderStage();
    return;
  }

  if (prop === "fillColor") {
    updateSelectedElement({ fill: event.target.value });
    return;
  }
  if (prop === "strokeColor") {
    updateSelectedElement({ stroke: event.target.value });
    return;
  }
  if (prop === "color") {
    updateSelectedElement({ color: event.target.value });
    return;
  }

  const numericProps = ["x", "y", "w", "h", "radius", "fontSize", "fontWeight", "lineHeight"];
  const value = numericProps.includes(prop) ? Number(event.target.value) : event.target.value;
  updateSelectedElement({ [prop]: value }, { stageOnly: prop === "radius" });
});

el.inspectorContent.addEventListener("change", (event) => {
  const slide = getCurrentSlide();
  const prop = event.target.dataset.elementProp;

  if (event.target.id === "slideThemeSelect") {
    slide.theme = event.target.value;
    queueSave();
    render();
    setStatus("Theme aktualisiert.");
    return;
  }
  if (event.target.id === "slideTransitionSelect") {
    slide.transition = event.target.value;
    queueSave();
    render();
    setStatus(`Übergang auf ${transitionModes.find((item) => item.id === slide.transition)?.label || "Morph"} gesetzt.`);
    return;
  }
  if (event.target.id === "slideTransitionDurationSelect") {
    slide.transitionDuration = Number(event.target.value);
    queueSave();
    render();
    setStatus(`Übergangsdauer auf ${slide.transitionDuration} ms gesetzt.`);
    return;
  }
  if (event.target.dataset.action === "delete-element") {
    deleteSelectedElement();
    return;
  }
  if (!prop) {
    return;
  }
  if (prop === "shadowPreset") {
    const shadowMap = {
      none: "",
      soft: "0 18px 46px rgba(0, 0, 0, 0.24)",
      glow: "0 18px 40px rgba(20, 54, 138, 0.45)"
    };
    updateSelectedElement({ shadow: shadowMap[event.target.value] });
    return;
  }
  const numericProps = ["x", "y", "w", "h", "radius", "fontSize", "fontWeight", "lineHeight"];
  const value = numericProps.includes(prop) ? Number(event.target.value) : event.target.value;
  updateSelectedElement({ [prop]: value });
});

el.inspectorContent.addEventListener("click", (event) => {
  if (event.target.dataset.action === "delete-element") {
    deleteSelectedElement();
  }
});

el.imageEditorContent.addEventListener("input", (event) => {
  if (event.target.dataset.imageProp) {
    applyImageAdjustment(event.target.dataset.imageProp, Number(event.target.value));
    return;
  }
  if (event.target.dataset.imageRootProp) {
    const numericRoot = ["radius"];
    const value = numericRoot.includes(event.target.dataset.imageRootProp) ? Number(event.target.value) : event.target.value;
    setSelectedImageRootProp(event.target.dataset.imageRootProp, value);
  }
});

el.imageEditorContent.addEventListener("change", (event) => {
  if (event.target.dataset.imageRootProp) {
    const numericRoot = ["radius"];
    const value = numericRoot.includes(event.target.dataset.imageRootProp) ? Number(event.target.value) : event.target.value;
    setSelectedImageRootProp(event.target.dataset.imageRootProp, value);
  }
});

el.imageEditorContent.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-image-action]");
  if (actionButton) {
    const action = actionButton.dataset.imageAction;
    if (action === "replace") {
      uiState.pendingReplaceImageId = uiState.imageEditor.elementId;
      el.replaceImageInput.click();
    } else if (action === "reset") {
      updateSelectedElement({ adjustments: createDefaultAdjustments(), radius: 26, maskShape: "rounded", fit: "cover" });
    } else if (action === "delete") {
      deleteSelectedElement();
    }
    return;
  }

  const maskButton = event.target.closest("[data-mask-chip]");
  if (maskButton) {
    setSelectedImageRootProp("maskShape", maskButton.dataset.maskChip);
  }
});

document.addEventListener("click", (event) => {
  const insideMenu = event.target.closest("#slideContextMenu");
  const insideImageEditor = event.target.closest("#imageEditorPanel");
  const imageNode = event.target.closest('.canvas-element[data-type="image"]');
  const slideCard = event.target.closest(".slide-card");

  if (!insideMenu && !slideCard) {
    hideSlideContextMenu();
  }
  if (!insideImageEditor && !imageNode) {
    uiState.imageEditor.open = false;
    renderImageEditor();
  }
});

document.addEventListener("keydown", (event) => {
  if (!el.presentationOverlay.classList.contains("hidden")) {
    if (event.key === "Escape") {
      closePresentation();
    } else if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      goToPresentationSlide(presentationIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPresentationSlide(presentationIndex - 1);
    }
    return;
  }

  if (event.key === "Escape") {
    closeImageEditor();
    hideSlideContextMenu();
  }

  const activeTag = document.activeElement?.tagName?.toLowerCase();
  const typing = activeTag === "input" || activeTag === "textarea" || document.activeElement?.isContentEditable;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    exportDeck();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && !typing) {
    event.preventDefault();
    duplicateSlide();
    return;
  }
  if (typing) {
    return;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (state.selectedElementId) {
      event.preventDefault();
      deleteSelectedElement();
      return;
    }
    if (uiState.slideContext.open) {
      event.preventDefault();
      deleteSlide(uiState.slideContext.slideId);
      return;
    }
  }
  if (event.key === "F2" && uiState.slideContext.open) {
    event.preventDefault();
    renameSlide(uiState.slideContext.slideId);
    return;
  }
  if (event.key === "Enter" && uiState.slideContext.open) {
    event.preventDefault();
    addSlide(uiState.slideContext.slideId);
    return;
  }

  const element = getSelectedElement();
  if (!element) {
    return;
  }
  const amount = event.shiftKey ? 10 : 2;
  if (event.key === "ArrowUp") {
    event.preventDefault();
    updateSelectedElement({ y: element.y - amount });
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    updateSelectedElement({ y: element.y + amount });
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    updateSelectedElement({ x: element.x - amount });
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    updateSelectedElement({ x: element.x + amount });
  }
});

render();
queueSave();
