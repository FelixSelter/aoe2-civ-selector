/**
 * AoE2 Civilisation Selector — main.ts
 *
 * Architecture:
 *  - StorageManager   : typed localStorage read/write with versioning
 *  - CivCard          : encapsulates a single civ DOM block + state cycling
 *  - WeightEngine     : computes effective draw weights from mode/multiplier/history
 *  - CarouselController: slot-machine animation and random-pick logic
 *  - HistoryManager   : history list rendering + persistence
 *  - App              : top-level orchestration and event wiring
 */

// ─────────────────────────────────────────────────────────────
// DATA — AoE2 Civilisations
// Add as many entries as you like. `image` is a URL or relative
// path to the civ's square emblem. A coloured CSS fallback is
// shown when an image fails to load, so no img is strictly required.
// ─────────────────────────────────────────────────────────────

export interface CivDef {
  name: string;
  image: string; // URL or path to a square emblem
}

/**
 * Canonical list of AoE2 (Definitive Edition) civilisations.
 * Replace `image` values with actual emblem assets.
 * The placeholder URLs point to a simple SVG badge generated via
 * DiceBear's initials API, which requires no external dependency.
 */
const AOE_COMPANION = "https://aoecompanion.com/civ-icons";

const CIVS: CivDef[] = [
  {
    name: "Armenians",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/e/e3/Armenians_AoE2.png/revision/latest",
  },
  { name: "Aztecs", image: `${AOE_COMPANION}/aztecs.png` },
  { name: "Bengalis", image: `${AOE_COMPANION}/bengalis.png` },
  { name: "Berbers", image: `${AOE_COMPANION}/berbers.png` },
  { name: "Bohemians", image: `${AOE_COMPANION}/bohemians.png` },
  { name: "Britons", image: `${AOE_COMPANION}/britons.png` },
  { name: "Bulgarians", image: `${AOE_COMPANION}/bulgarians.png` },
  { name: "Burgundians", image: `${AOE_COMPANION}/burgundians.png` },
  { name: "Burmese", image: `${AOE_COMPANION}/burmese.png` },
  { name: "Byzantines", image: `${AOE_COMPANION}/byzantines.png` },
  { name: "Celts", image: `${AOE_COMPANION}/celts.png` },
  { name: "Chinese", image: `${AOE_COMPANION}/chinese.png` },
  { name: "Cumans", image: `${AOE_COMPANION}/cumans.png` },
  { name: "Dravidians", image: `${AOE_COMPANION}/dravidians.png` },
  { name: "Ethiopians", image: `${AOE_COMPANION}/ethiopians.png` },
  { name: "Franks", image: `${AOE_COMPANION}/franks.png` },
  {
    name: "Georgians",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/4/4c/Georgians_AoE2.png/revision/latest",
  },
  { name: "Goths", image: `${AOE_COMPANION}/goths.png` },
  { name: "Gurjaras", image: `${AOE_COMPANION}/gurjaras.png` },
  { name: "Hindustanis", image: `${AOE_COMPANION}/hindustanis.png` },
  { name: "Huns", image: `${AOE_COMPANION}/huns.png` },
  { name: "Inca", image: `${AOE_COMPANION}/incas.png` },
  { name: "Italians", image: `${AOE_COMPANION}/italians.png` },
  { name: "Japanese", image: `${AOE_COMPANION}/japanese.png` },
  {
    name: "Jurchens",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/3/38/Jurchens_AoE2.png/revision/latest",
  },
  {
    name: "Khitans",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/1/1b/Khitans_AoE2.png/revision/latest",
  },
  { name: "Khmer", image: `${AOE_COMPANION}/khmer.png` },
  { name: "Koreans", image: `${AOE_COMPANION}/koreans.png` },
  { name: "Lithuanians", image: `${AOE_COMPANION}/lithuanians.png` },
  { name: "Magyars", image: `${AOE_COMPANION}/magyars.png` },
  { name: "Malay", image: `${AOE_COMPANION}/malay.png` },
  { name: "Malians", image: `${AOE_COMPANION}/malians.png` },
  {
    name: "Mapuche",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/9/92/Mapuche_AoE2.png/revision/latest",
  },
  { name: "Maya", image: `${AOE_COMPANION}/mayans.png` },
  { name: "Mongols", image: `${AOE_COMPANION}/mongols.png` },
  {
    name: "Muisca",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/f/f4/Muisca_AoE2.png/revision/latest",
  },
  { name: "Persians", image: `${AOE_COMPANION}/persians.png` },
  { name: "Poles", image: `${AOE_COMPANION}/poles.png` },
  { name: "Portuguese", image: `${AOE_COMPANION}/portuguese.png` },
  {
    name: "Romans",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/f/ff/Romans_AoE2.png/revision/latest/",
  },
  { name: "Saracens", image: `${AOE_COMPANION}/saracens.png` },
  {
    name: "Shu",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/a/aa/Shu_AoE2.png/revision/latest",
  },
  { name: "Sicilians", image: `${AOE_COMPANION}/sicilians.png` },
  { name: "Slavs", image: `${AOE_COMPANION}/slavs.png` },
  { name: "Spanish", image: `${AOE_COMPANION}/spanish.png` },
  { name: "Tatars", image: `${AOE_COMPANION}/tatars.png` },
  { name: "Teutons", image: `${AOE_COMPANION}/teutons.png` },
  {
    name: "Tupi",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/f/f3/Tupi_AoE2.png/revision/latest",
  },
  { name: "Turks", image: `${AOE_COMPANION}/turks.png` },
  { name: "Vietnamese", image: `${AOE_COMPANION}/vietnamese.png` },
  { name: "Vikings", image: `${AOE_COMPANION}/vikings.png` },
  {
    name: "Wei",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/1/18/Wei_AoE2.png/revision/latest",
  },
  {
    name: "Wu",
    image:
      "https://static.wikia.nocookie.net/ageofempires/images/6/61/Wu_AoE2.png/revision/latest",
  },
];

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

/** Three possible states for each civilisation card. */
type CivMode = "default" | "whitelist" | "blacklist";

/** Persisted per-civ settings stored in localStorage. */
interface CivSettings {
  mode: CivMode;
  multiplier: number;
}

/** A single history entry. */
interface HistoryEntry {
  civName: string;
  timestamp: number; // Unix ms
}

/** Root shape of the persisted state blob. */
interface PersistedState {
  version: 1;
  civSettings: Record<string, CivSettings>;
  history: HistoryEntry[];
  autoWeight: boolean;
}

// ─────────────────────────────────────────────────────────────
// STORAGE MANAGER
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "aoe2-civ-selector-v1";

/** Typed wrapper around localStorage with automatic JSON (de)serialisation. */
class StorageManager {
  private state: PersistedState;

  constructor() {
    this.state = this.load();
  }

  private load(): PersistedState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.version === 1) return parsed;
        else
          console.warn(
            "[StorageManager] Unrecognized storage version, resetting to defaults.",
          );
      }
    } catch {
      // Corrupt storage — start fresh
    }
    return this.defaults();
  }

  private defaults(): PersistedState {
    return {
      version: 1,
      civSettings: {},
      history: [],
      autoWeight: false,
    };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      console.warn(
        "[StorageManager] localStorage write failed (quota exceeded?).",
      );
    }
  }

  getCivSettings(civId: string): CivSettings {
    return this.state.civSettings[civId] ?? { mode: "default", multiplier: 1 };
  }

  setCivSettings(civId: string, settings: CivSettings): void {
    this.state.civSettings[civId] = settings;
    this.save();
  }

  getHistory(): HistoryEntry[] {
    return this.state.history;
  }

  pushHistory(entry: HistoryEntry): void {
    // Most-recent first; cap at MAX_HISTORY entries.
    this.state.history = [entry, ...this.state.history].slice(0, MAX_HISTORY);
    this.save();
  }

  removeHistoryAt(index: number): void {
    this.state.history.splice(index, 1);
    this.save();
  }

  clearHistory(): void {
    this.state.history = [];
    this.save();
  }

  getAutoWeight(): boolean {
    return this.state.autoWeight;
  }

  setAutoWeight(val: boolean): void {
    this.state.autoWeight = val;
    this.save();
  }
}

// ─────────────────────────────────────────────────────────────
// CIV CARD CLASS
// ─────────────────────────────────────────────────────────────

/**
 * Manages the DOM representation and state of a single civilisation card.
 * Cycling through modes: default → whitelist → blacklist → default.
 */
class CivCard {
  readonly civ: CivDef;
  private _mode: CivMode;
  private _multiplier: number;

  readonly element: HTMLLIElement;
  private multiplierInput: HTMLInputElement;
  private multiplierLabel: HTMLSpanElement;

  /** Called whenever state changes — wired up by App. */
  onStateChange?: () => void;

  constructor(civ: CivDef, settings: CivSettings) {
    this.civ = civ;
    this._mode = settings.mode;
    this._multiplier = settings.multiplier;
    this.element = this.build();

    this.multiplierInput =
      this.element.querySelector<HTMLInputElement>(".civ-multiplier")!;
    this.multiplierLabel = this.element.querySelector<HTMLSpanElement>(
      ".civ-multiplier-label",
    )!;

    this.applyMode();
    this.bindEvents();
  }

  get mode(): CivMode {
    return this._mode;
  }
  get multiplier(): number {
    return this._multiplier;
  }

  /** Build and return the card's <li> element. */
  private build(): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "civ-card";
    li.setAttribute("role", "listitem");
    li.setAttribute("tabindex", "0");
    li.setAttribute("aria-label", `${this.civ.name} — click to change status`);

    li.innerHTML = `
      <div class="civ-img-wrapper">
        <img class="civ-img" src="${this.civ.image}" alt="${this.civ.name} emblem"
             width="80" height="80" draggable="false" />
        <span class="civ-badge-star" aria-hidden="true">★</span>
        <span class="civ-badge-cross" aria-hidden="true">✕</span>
      </div>
      <span class="civ-name">${this.civ.name}</span>
      <div class="civ-multiplier-wrapper">
        <span class="civ-multiplier-label">Weight</span>
        <input
          class="civ-multiplier"
          type="number"
          min="0"
          step="0.1"
          value="${this._multiplier}"
          aria-label="${this.civ.name} weight multiplier"
          title="Relative probability weight. 1 = normal, 2 = twice as likely, 0 = never."
        />
      </div>
    `;

    return li;
  }

  private bindEvents(): void {
    // Click / keyboard to cycle mode — propagation stopped so the input isn't caught here
    this.element.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".civ-multiplier-wrapper")) return;
      this.cycleMode();
    });

    this.element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if ((e.target as HTMLElement).closest(".civ-multiplier-wrapper"))
          return;
        e.preventDefault();
        this.cycleMode();
      }
    });

    this.multiplierInput.addEventListener("change", () => {
      const raw = parseFloat(this.multiplierInput.value);
      this._multiplier = Number.isFinite(raw)
        ? Math.max(0, Math.min(10, raw))
        : 1;
      this.multiplierInput.value = String(this._multiplier);
      this.onStateChange?.();
    });

    // Stop click from bubbling to card's own listener
    this.multiplierInput.addEventListener("click", (e) => e.stopPropagation());
  }

  /** Cycle: default → whitelist → blacklist → default */
  private cycleMode(): void {
    const order: CivMode[] = ["default", "whitelist", "blacklist"];
    const idx = order.indexOf(this._mode);
    this._mode = order[(idx + 1) % order.length];
    this.applyMode();
    this.onStateChange?.();
  }

  /** Update ARIA label and CSS classes to reflect current mode. */
  private applyMode(): void {
    this.element.classList.remove("is-whitelisted", "is-blacklisted");

    let ariaStatus: string;
    if (this._mode === "whitelist") {
      this.element.classList.add("is-whitelisted");
      ariaStatus = "whitelisted";
    } else if (this._mode === "blacklist") {
      this.element.classList.add("is-blacklisted");
      ariaStatus = "blacklisted";
    } else {
      ariaStatus = "default";
    }

    this.element.setAttribute(
      "aria-label",
      `${this.civ.name} — ${ariaStatus}. Click to change.`,
    );
  }

  /** Called by App when the whitelist state of the pool changes. */
  applyDimming(hasWhitelist: boolean): void {
    const shouldDim = hasWhitelist && this._mode === "default";
    this.element.classList.toggle("is-default-dim", shouldDim);
  }

  /**
   * Override the displayed multiplier with an auto-calculated value.
   * @param value  Auto-computed weight, or null to restore manual input.
   */
  setAutoMultiplier(value: number | null): void {
    if (value !== null) {
      // 2 digits after the decimal without trailing zeros
      this.multiplierInput.value = value.toFixed(2).replace(/\.?0+$/, "");
      this.multiplierInput.disabled = true;
      this.multiplierLabel.textContent = "Auto weight";
      this.multiplierLabel.classList.add("is-auto");
    } else {
      this.multiplierInput.value = String(this._multiplier);
      this.multiplierInput.disabled = false;
      this.multiplierLabel.textContent = "Weight";
      this.multiplierLabel.classList.remove("is-auto");
    }
  }

  /** The effective weight to use in draws: auto or manual. */
  get effectiveMultiplier(): number {
    return parseFloat(this.multiplierInput.value);
  }

  get imgSrc(): string {
    return this.civ.image;
  }
}

const MAX_HISTORY = 50;

// ─────────────────────────────────────────────────────────────
// WEIGHT ENGINE
// ─────────────────────────────────────────────────────────────

/**
 * Computes per-civ draw weights from mode, manual multipliers or history.
 * All weights are normalised to a probability distribution before use.
 */
class WeightEngine {
  /**
   * Given the pool of eligible cards (post whitelist/blacklist filter),
   * return a map of civId → weight ≥ 0.
   */
  static compute(
    cards: Map<string, CivCard>,
    history: HistoryEntry[],
    useAutoWeight: boolean,
  ): Map<string, number> {
    const weights = new Map<string, number>();

    if (useAutoWeight) {
      // k controls how fast civs recover toward weight 1
      const RECOVERY_RATE = 0.04;

      // Build quick lookup: civId → last seen index
      const lastSeen = new Map<string, number>();

      history.slice(0, MAX_HISTORY).forEach((entry, index) => {
        if (!lastSeen.has(entry.civName)) {
          lastSeen.set(entry.civName, index);
        }
      });

      for (const [id, card] of cards) {
        console.assert(
          card.mode !== "blacklist",
          "Blacklisted civ should have been filtered out",
        );
        const index = lastSeen.get(id);

        let weight: number;

        if (index === undefined) {
          // Never seen recently → full weight
          weight = 1;
        } else {
          // Age = games since played
          const age = index;

          // Exponential recovery
          weight = 1 - Math.exp(-RECOVERY_RATE * age);
        }

        // Hard floor to avoid exact 0 floating issues
        weights.set(id, Math.max(0.0001, weight));
      }
    } else {
      // Manual mode unchanged
      for (const [id, card] of cards) {
        if (card.mode !== "blacklist") {
          weights.set(id, Math.max(0, card.effectiveMultiplier));
        }
      }
    }

    return weights;
  }

  /**
   * Pick a random civId from the weighted pool.
   * Returns null if the pool is empty or all weights are zero.
   */
  static pick(weights: Map<string, number>): string | null {
    const entries = [...weights.entries()].filter(([, w]) => w > 0);
    if (entries.length === 0) return null;

    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * total;

    for (const [id, w] of entries) {
      r -= w;
      if (r <= 0) return id;
    }

    // Floating-point edge case: return last entry
    return entries[entries.length - 1][0];
  }
}

// ─────────────────────────────────────────────────────────────
// CAROUSEL CONTROLLER
// ─────────────────────────────────────────────────────────────

/**
 * Drives the slot-machine animation.
 *
 * Strategy:
 *  - Clone the visible civ list many times to form a long strip.
 *  - Animate translateX with a custom cubic easing over 5 seconds,
 *    hitting the correct final offset so the target civ lands under
 *    the centre pointer.
 *  - Uses requestAnimationFrame for smooth 60fps animation.
 */
class CarouselController {
  private readonly track: HTMLElement;
  private readonly pointer: HTMLElement;
  private readonly ITEM_W: number;
  private items: CivDef[] = [];
  private isSpinning = false;

  constructor(track: HTMLElement, pointer: HTMLElement) {
    this.track = track;
    this.pointer = pointer;
    // Item width mirrors the CSS --carousel-h variable (updated in resize)
    this.ITEM_W = this.readItemWidth();
  }

  private readItemWidth(): number {
    const h = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--carousel-h",
      ),
      10,
    );
    return h || 200;
  }

  /** Populate the carousel strip from an eligible civ pool. */
  populate(civs: CivDef[]): void {
    this.items = civs;
    this.buildStrip(civs);
    // Position so the first item is centred
    this.setOffset(this.centreOffset(0), false);
  }

  /**
   * Spin to a target civ. Returns a Promise that resolves with the chosen CivDef
   * once the animation completes.
   */
  spin(targetCivName: string): Promise<CivDef> {
    return new Promise((resolve) => {
      if (this.isSpinning || this.items.length === 0) return;
      this.isSpinning = true;

      const DURATION = 1200; // ms total

      // Find the target index in a mid-section of the strip to give room to spin
      // We repeat the array enough times; land in the third repetition.
      const targetLocalIdx = this.items.findIndex(
        (c) => c.name === targetCivName,
      );
      if (targetLocalIdx === -1) {
        this.isSpinning = false;
        return;
      }

      // Clones: we build 9× repetitions; target lands at repetition 6 (0-indexed: 5)
      const targetGlobalIdx = 5 * this.items.length + targetLocalIdx;
      const targetOffset = this.centreOffset(targetGlobalIdx);

      // Current offset
      const startOffset = this.currentOffset();

      const startTime = performance.now();

      const frame = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / DURATION, 1);

        // Custom easing: slow start, fast middle, dramatic slow end
        const eased = this.easeInOutExpo(t);
        const currentOffset =
          startOffset + (targetOffset - startOffset) * eased;
        this.setOffset(currentOffset, false);

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          this.setOffset(targetOffset, false);
          this.isSpinning = false;

          // Flash the pointer to signal landing
          this.pointer.classList.add("is-landing");
          setTimeout(() => this.pointer.classList.remove("is-landing"), 1000);

          const chosen = this.items[targetLocalIdx];
          resolve(chosen);
        }
      };

      requestAnimationFrame(frame);
    });
  }

  // ── Private helpers ──────────────────────────────────────

  private buildStrip(civs: CivDef[]): void {
    this.track.innerHTML = "";
    const REPS = 9;

    for (let r = 0; r < REPS; r++) {
      for (const civ of civs) {
        const item = document.createElement("div");
        item.className = "carousel-item";
        item.innerHTML = `
          <img class="carousel-item-img" src="${civ.image}"
               alt="${civ.name}" width="148" height="148" draggable="false" />
          <span class="carousel-item-name">${civ.name}</span>
        `;
        this.track.appendChild(item);
      }
    }
  }

  /** Compute the translateX value that centres item at `index` under the pointer. */
  private centreOffset(index: number): number {
    const wrapperWidth = this.track.parentElement!.offsetWidth;
    return wrapperWidth / 2 - index * this.ITEM_W - this.ITEM_W / 2;
  }

  private currentOffset(): number {
    const m = new DOMMatrix(this.track.style.transform);
    return m.m41;
  }

  private setOffset(x: number, animated: boolean): void {
    this.track.style.transition = animated ? "transform 300ms ease" : "none";
    this.track.style.transform = `translateX(${x}px)`;
  }

  /** Custom easing: slow → fast → very slow deceleration (slot machine feel). */
  private easeInOutExpo(t: number): number {
    // Asymmetric: accelerate quickly (first 20%), cruise (20-70%), long decel (70-100%).
    if (t < 0.2) {
      // Ease in: exponential
      return Math.pow(2, 10 * (t / 0.2 - 1)) * 0.2;
    } else if (t < 0.7) {
      // Linear cruise
      return 0.2 + (t - 0.2) * (0.6 / 0.5);
    } else {
      // Ease out: exponential deceleration
      const tLocal = (t - 0.7) / 0.3;
      return 0.8 + 0.2 * (1 - Math.pow(2, -10 * tLocal));
    }
  }
}

// ─────────────────────────────────────────────────────────────
// HISTORY MANAGER
// ─────────────────────────────────────────────────────────────

/** Manages rendering and persistence of the game history list. */
class HistoryManager {
  private readonly listEl: HTMLOListElement;
  private readonly emptyEl: HTMLParagraphElement;
  private readonly storage: StorageManager;
  private readonly civMap: Map<string, CivDef>;

  constructor(
    listEl: HTMLOListElement,
    emptyEl: HTMLParagraphElement,
    storage: StorageManager,
    civMap: Map<string, CivDef>,
  ) {
    this.listEl = listEl;
    this.emptyEl = emptyEl;
    this.storage = storage;
    this.civMap = civMap;
  }

  render(): void {
    const history = this.storage.getHistory();
    this.listEl.innerHTML = "";
    this.emptyEl.hidden = history.length > 0;

    history.forEach((entry, idx) => {
      const civ = this.civMap.get(entry.civName);
      if (!civ) return;

      // Opacity fades from 1 → 0.25 over the first 20 entries, then stays at 0.25
      const opacity = Math.max(0.25, 1 - (idx / 20) * 0.75);

      const li = document.createElement("li");
      li.className = "history-item";
      li.style.setProperty("--item-opacity", String(opacity));

      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      li.innerHTML = `${idx + 1}.
        <img class="history-item-thumb" src="${civ.image}" alt="${civ.name} emblem"
             width="36" height="36" />
        <div class="history-item-info">
          <div class="history-item-name">${civ.name}</div>
          <div class="history-item-date">${dateStr}</div>
        </div>
        <button class="history-item-remove" aria-label="Remove ${civ.name} from history" title="Remove">✕</button>
      `;

      li.querySelector(".history-item-remove")!.addEventListener(
        "click",
        () => {
          this.storage.removeHistoryAt(idx);
          this.render();
        },
      );

      this.listEl.appendChild(li);
    });
  }

  push(civId: string): void {
    this.storage.pushHistory({ civName: civId, timestamp: Date.now() });
    this.render();
  }

  clear(): void {
    this.storage.clearHistory();
    this.render();
  }
}

// ─────────────────────────────────────────────────────────────
// APPLICATION
// ─────────────────────────────────────────────────────────────

/** Top-level orchestrator. Initialises all subsystems and wires events. */
class App {
  private readonly storage = new StorageManager();
  private readonly cards = new Map<string, CivCard>();
  private readonly civMap = new Map<string, CivDef>();

  // DOM refs
  private readonly gridEl = document.getElementById(
    "civGrid",
  ) as HTMLUListElement;
  private readonly carouselTrack = document.getElementById(
    "carouselTrack",
  ) as HTMLElement;
  private readonly carouselResult = document.getElementById(
    "carouselResult",
  ) as HTMLElement;
  private readonly btnSpin = document.getElementById(
    "btnSpin",
  ) as HTMLButtonElement;
  private readonly btnAddToHistory = document.getElementById(
    "btnAddToHistory",
  ) as HTMLButtonElement;
  private readonly chkAutoWeight = document.getElementById(
    "chkAutoWeight",
  ) as HTMLInputElement;
  private readonly historySelect = document.getElementById(
    "historySelect",
  ) as HTMLSelectElement;
  private readonly btnAddManual = document.getElementById(
    "btnAddManual",
  ) as HTMLButtonElement;
  private readonly btnClearHistory = document.getElementById(
    "btnClearHistory",
  ) as HTMLButtonElement;
  private readonly historyList = document.getElementById(
    "historyList",
  ) as HTMLOListElement;
  private readonly historyEmpty = document.getElementById(
    "historyEmpty",
  ) as HTMLParagraphElement;
  private readonly pointer =
    document.querySelector<HTMLElement>(".carousel-pointer")!;

  private carousel!: CarouselController;
  private historyManager!: HistoryManager;

  /** The civ chosen by the most recent spin. */
  private lastChosenCivId: string | null = null;

  init(): void {
    // Build lookup map
    for (const civ of CIVS) this.civMap.set(civ.name, civ);

    // Build CivCards
    for (const civ of CIVS) {
      const settings = this.storage.getCivSettings(civ.name);
      const card = new CivCard(civ, settings);
      card.onStateChange = () => this.onCivStateChange(card);
      this.cards.set(civ.name, card);
      this.gridEl.appendChild(card.element);
    }

    // Restore auto-weight toggle
    this.chkAutoWeight.checked = this.storage.getAutoWeight();

    // Populate history dropdown
    this.populateHistorySelect();

    // Subsystems
    this.carousel = new CarouselController(this.carouselTrack, this.pointer);
    this.historyManager = new HistoryManager(
      this.historyList,
      this.historyEmpty,
      this.storage,
      this.civMap,
    );

    // Initial visual state
    this.applyDimmingToAll();
    this.applyAutoWeightState();
    this.historyManager.render();
    this.refreshCarousel();

    // Events
    this.btnSpin.addEventListener("click", () => this.handleSpin());
    this.btnAddToHistory.addEventListener("click", () =>
      this.handleAddToHistory(),
    );
    this.chkAutoWeight.addEventListener("change", () =>
      this.handleAutoWeightToggle(),
    );
    this.btnAddManual.addEventListener("click", () => this.handleAddManual());
    this.btnClearHistory.addEventListener("click", () =>
      this.handleClearHistory(),
    );
  }

  // ── Event handlers ───────────────────────────────────────

  private async handleSpin(): Promise<void> {
    // Build the eligible pool
    const whitelistedCards = [...this.cards.values()].filter(
      (c) => c.mode === "whitelist",
    );
    const pool =
      whitelistedCards.length > 0
        ? whitelistedCards
        : [...this.cards.values()].filter((c) => c.mode !== "blacklist");

    if (pool.length === 0) {
      this.showResult(
        "⚠ All civilisations are blacklisted — nothing to draw from.",
        null,
      );
      return;
    }

    const poolMap = new Map(pool.map((c) => [c.civ.name, c]));
    const weights = WeightEngine.compute(
      poolMap,
      this.storage.getHistory(),
      this.chkAutoWeight.checked,
    );

    const pickedCivName = WeightEngine.pick(weights);
    if (!pickedCivName) {
      this.showResult("⚠ All weights are zero — adjust multipliers.", null);
      return;
    }

    const pickedCiv = this.civMap.get(pickedCivName)!;

    // Disable controls during spin
    this.btnSpin.disabled = true;
    this.btnAddToHistory.hidden = true;
    this.carouselResult.innerHTML = "";

    // Repopulate carousel with current pool (in case it changed)
    const poolCivs = pool.map((c) => c.civ);
    this.carousel.populate(poolCivs);

    // Run animation
    await this.carousel.spin(pickedCivName);

    this.lastChosenCivId = pickedCivName;
    this.showResult(null, pickedCiv);

    this.btnSpin.disabled = false;
    this.btnAddToHistory.hidden = false;
  }

  private handleAddToHistory(): void {
    if (!this.lastChosenCivId) return;
    this.historyManager.push(this.lastChosenCivId);
    if (this.chkAutoWeight.checked) this.applyAutoWeightState();
    this.btnAddToHistory.hidden = true;
  }

  private handleAutoWeightToggle(): void {
    this.storage.setAutoWeight(this.chkAutoWeight.checked);
    this.applyAutoWeightState();
  }

  private handleAddManual(): void {
    const civId = this.historySelect.value;
    if (!civId) return;
    this.historyManager.push(civId);
    this.historySelect.value = "";
    if (this.chkAutoWeight.checked) this.applyAutoWeightState();
  }

  private handleClearHistory(): void {
    if (!confirm("Clear all game history? This cannot be undone.")) return;
    this.historyManager.clear();
    if (this.chkAutoWeight.checked) this.applyAutoWeightState();
  }

  private onCivStateChange(card: CivCard): void {
    // Persist
    this.storage.setCivSettings(card.civ.name, {
      mode: card.mode,
      multiplier: card.multiplier,
    });
    this.applyDimmingToAll();
    this.refreshCarousel();
  }

  // ── Helpers ──────────────────────────────────────────────

  /** Update the dimming of all cards based on whether any whitelist exists. */
  private applyDimmingToAll(): void {
    const hasWhitelist = [...this.cards.values()].some(
      (c) => c.mode === "whitelist",
    );
    for (const card of this.cards.values()) card.applyDimming(hasWhitelist);
  }

  /** Enable or disable auto-weight on all cards and recompute values. */
  private applyAutoWeightState(): void {
    const isAuto = this.chkAutoWeight.checked;

    if (!isAuto) {
      // Restore manual multipliers
      for (const card of this.cards.values()) card.setAutoMultiplier(null);
      return;
    }

    const history = this.storage.getHistory();
    const allPool = new Map(
      [...this.cards.entries()].filter(([, c]) => c.mode !== "blacklist"),
    );
    const weights = WeightEngine.compute(allPool, history, true);

    for (const [id, card] of this.cards) {
      const w = weights.get(id) ?? null;
      console.assert(w !== undefined, `Auto-weight missing for ${id}`);
      card.setAutoMultiplier(w);
    }
  }

  /** Sync the carousel strip with the current eligible pool. */
  private refreshCarousel(): void {
    const whitelisted = [...this.cards.values()].filter(
      (c) => c.mode === "whitelist",
    );
    const pool =
      whitelisted.length > 0
        ? whitelisted
        : [...this.cards.values()].filter((c) => c.mode !== "blacklist");

    if (pool.length === 0) return;
    this.carousel.populate(pool.map((c) => c.civ));
  }

  /** Populate the history manual-add dropdown. */
  private populateHistorySelect(): void {
    const sorted = [...CIVS].sort((a, b) => a.name.localeCompare(b.name));
    for (const civ of sorted) {
      const opt = document.createElement("option");
      opt.value = civ.name;
      opt.textContent = civ.name;
      this.historySelect.appendChild(opt);
    }
  }

  /** Render the post-spin result display. */
  private showResult(error: string | null, civ: CivDef | null): void {
    if (error) {
      this.carouselResult.innerHTML = `<p class="carousel-idle-hint" role="alert">${error}</p>`;
      return;
    }
    if (civ) {
      this.btnSpin.innerHTML = this.btnSpin.innerHTML.replace(
        "Choose Civilisation",
        "Spin Again",
      );
      this.carouselResult.innerHTML = `
        <p class="carousel-chosen-name" role="status">${civ.name}</p>
        <p class="carousel-chosen-sub">has been chosen as your civilisation.</p>
      `;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────

const app = new App();
app.init();
