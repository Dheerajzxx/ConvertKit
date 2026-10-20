/* ============================================================
   ConvertKit — theme.js
   Applies the saved colour theme before first paint and wires
   the header toggle once the shared header is injected.
   Classic (non-module) script, loaded in <head>.
   ============================================================ */
(function () {
  var STORAGE_KEY = "convertkit:theme";
  var root = document.documentElement;

  function saved() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (e) {
      return null;
    }
  }

  function current() {
    var explicit = root.getAttribute("data-theme");
    if (explicit === "light" || explicit === "dark") return explicit;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    refreshButton();
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#020617" : "#f8fafc");
  }

  var SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/></svg>';
  var MOON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function refreshButton() {
    var theme = current();
    var icon = document.querySelector("#theme-toggle .theme-icon");
    if (icon) icon.innerHTML = theme === "dark" ? SUN : MOON;
    var button = document.getElementById("theme-toggle");
    if (button) {
      button.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
      button.setAttribute("title", theme === "dark" ? "Light theme" : "Dark theme");
    }
  }

  var stored = saved();
  if (stored) {
    root.setAttribute("data-theme", stored);
  }

  document.addEventListener("click", function (event) {
    if (!event.target.closest("#theme-toggle")) return;
    event.preventDefault();
    var next = current() === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* storage unavailable — theme still applies for this page */
    }
  });

  if (window.matchMedia) {
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      if (!saved()) refreshButton();
    };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  function boot() {
    refreshButton();
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      refreshButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.ConvertKitTheme = {
    apply: apply,
    toggle: function () {
      var next = current() === "dark" ? "light" : "dark";
      apply(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* ignore */
      }
      return next;
    },
    refresh: refreshButton,
    current: current,
  };
})();
