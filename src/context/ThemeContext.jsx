// context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import { THEMES, THEME_STORAGE_KEY, DEFAULT_THEME_ID } from "../constants";

export { THEMES };

const ThemeContext = createContext();

const VALID_IDS = THEMES.map((t) => t.id);
const sanitize  = (id) => (VALID_IDS.includes(id) ? id : DEFAULT_THEME_ID);

// ─── Animated background layer HTML per theme ─────────────────────────────
// These are injected into #theme-bg-layer in the DOM.
// The CSS in themes.css targets [data-theme="x"] #theme-bg-layer .* selectors.
const ANIMATED_LAYERS = {
  aurora: `
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
    <div class="scan"></div>
    <div class="scan"></div>
    <div class="scan"></div>
  `,
  nebula: `
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
    <div class="star-1"></div>
    <div class="star-2"></div>
    <div class="star-3"></div>
  `,
  inferno: `
    <div class="core-1"></div>
    <div class="core-2"></div>
    <div class="flare-1"></div>
    <div class="flare-2"></div>
    <div class="shimmer"></div>
    <div class="shimmer"></div>
    <div class="shimmer"></div>
  `,
  matrix: `
    <div class="rain-1"></div>
    <div class="rain-2"></div>
    <div class="rain-3"></div>
    <div class="rain-4"></div>
    <div class="rain-5"></div>
    <div class="rain-6"></div>
    <div class="glow"></div>
  `,
  // shadow layer is built procedurally — see buildShadowLayer()
  shadow: "__shadow__",
};

// ─── Animated theme IDs ────────────────────────────────────────────────────
const ANIMATED_IDS = new Set(Object.keys(ANIMATED_LAYERS));

// ─── Shadow theme: ethereal SVG-filter displacement animation ─────────────
// Mirrors the etheral-shadow.tsx component but in vanilla JS so it works
// outside of React's render cycle (injected directly into #theme-bg-layer).
let _shadowRafId   = null;
let _shadowHue     = 0;
let _shadowLastTs  = null;

function buildShadowLayer(layer) {
  // Displacement & filter params (matches component: scale=100, speed=90)
  const DISPLACEMENT = 80;   // mapRange(100, 1,100, 20,100) ≈ 100; tuned down for subtlety
  const DURATION_S   = 2.0;  // mapRange(90,  1,100, 1000,50)/25  ≈ 2s per full rotation
  const INSET        = -DISPLACEMENT;

  // Build the SVG filter
  const svgNS = "http://www.w3.org/2000/svg";
  const filterId = "shadow-disp-filter";

  layer.innerHTML = `
    <svg style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
      <defs>
        <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            id="shadow-turbulence"
            result="undulation"
            numOctaves="2"
            baseFrequency="0.0005,0.002"
            seed="0"
            type="turbulence"
          />
          <feColorMatrix
            id="shadow-hue"
            in="undulation"
            type="hueRotate"
            values="0"
          />
          <feColorMatrix
            in="dist"
            result="circulation"
            type="matrix"
            values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="circulation"
            scale="${DISPLACEMENT}"
            result="dist"
          />
          <feDisplacementMap
            in="dist"
            in2="undulation"
            scale="${DISPLACEMENT}"
            result="output"
          />
        </filter>
      </defs>
    </svg>

    <div class="shadow-wrap" style="
      position:absolute;
      inset:${INSET}px;
      filter:url(#${filterId}) blur(5px);
    ">
      <div class="shadow-mask" style="
        background-color: rgba(200, 200, 200, 1);
        mask-image: url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png');
        mask-size: cover;
        mask-repeat: no-repeat;
        mask-position: center;
        width: 100%;
        height: 100%;
      "></div>
    </div>

    <div class="shadow-vignette"></div>
    <div class="shadow-noise"></div>
  `;

  // Grab the hue feColorMatrix and start the rAF loop
  const hueEl = layer.querySelector("#shadow-hue");
  if (!hueEl) return;

  _shadowHue    = 0;
  _shadowLastTs = null;

  function tick(ts) {
    if (_shadowLastTs !== null) {
      const delta = ts - _shadowLastTs;          // ms since last frame
      _shadowHue  = (_shadowHue + (360 / (DURATION_S * 1000)) * delta) % 360;
      hueEl.setAttribute("values", String(_shadowHue));
    }
    _shadowLastTs = ts;
    _shadowRafId  = requestAnimationFrame(tick);
  }

  _shadowRafId = requestAnimationFrame(tick);
}

function stopShadowAnimation() {
  if (_shadowRafId !== null) {
    cancelAnimationFrame(_shadowRafId);
    _shadowRafId  = null;
    _shadowLastTs = null;
  }
}

// ─── Apply theme to DOM ────────────────────────────────────────────────────
function applyTheme(id) {
  const safe = sanitize(id);

  // Always stop any previous shadow animation before switching
  stopShadowAnimation();

  // 1. Set data-theme attribute on <html>
  document.documentElement.setAttribute("data-theme", safe);

  // 2. Manage the animated background layer
  let layer = document.getElementById("theme-bg-layer");

  if (ANIMATED_IDS.has(safe)) {
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "theme-bg-layer";
      layer.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      `;
      document.body.insertBefore(layer, document.body.firstChild);
    }
    layer.style.display = "block";

    if (safe === "shadow") {
      buildShadowLayer(layer);
    } else {
      layer.innerHTML = ANIMATED_LAYERS[safe];
    }
  } else {
    if (layer) {
      layer.style.display = "none";
      layer.innerHTML = "";
    }
  }
}

// ─── ThemeProvider ─────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() =>
    sanitize(localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID)
  );

  // Apply on first render
  useEffect(() => {
    applyTheme(theme);
    return () => {
      // Cleanup: stop shadow animation and hide layer on unmount (hot reload safety)
      stopShadowAnimation();
      const layer = document.getElementById("theme-bg-layer");
      if (layer) layer.style.display = "none";
    };
  }, []);

  /**
   * Called by AuthContext after login / page-refresh /me fetch.
   * DB value always wins over localStorage.
   */
  const setThemeFromUser = useCallback((userTheme) => {
    const id = sanitize(userTheme);
    setThemeState(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    applyTheme(id);
  }, []);

  /**
   * Called from the Settings page.
   * Optimistic update → persists to backend.
   */
  const saveTheme = useCallback(async (id) => {
    const safe = sanitize(id);
    setThemeState(safe);
    localStorage.setItem(THEME_STORAGE_KEY, safe);
    applyTheme(safe);
    await axios.put("/api/auth/me", { theme: safe });
  }, []);

  /**
   * Temporarily apply a theme visually WITHOUT touching state or localStorage.
   * Used by auth pages (login/register) to enforce a branded look.
   * Call restoreTheme() on unmount to go back to the user's real theme.
   */
  const overrideTheme = useCallback((id) => {
    applyTheme(sanitize(id));
  }, []);

  /**
   * Restore the real persisted theme after an override.
   */
  const restoreTheme = useCallback(() => {
    applyTheme(sanitize(localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, saveTheme, setThemeFromUser, overrideTheme, restoreTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/**
 * useAuthTheme(themeId)
 * Drop this hook into any auth page (Login, Register).
 * Instantly applies `themeId` visually and restores the user's real
 * theme when the page unmounts — no state changes, no flicker.
 *
 * Usage:
 *   import { useAuthTheme } from "../context/ThemeContext";
 *   export default function Login() {
 *     useAuthTheme("amber");
 *     ...
 *   }
 */
export function useAuthTheme(themeId = "amber") {
  const { overrideTheme, restoreTheme } = useTheme();
  useEffect(() => {
    overrideTheme(themeId);
    return () => restoreTheme();
  }, [themeId, overrideTheme, restoreTheme]);
}