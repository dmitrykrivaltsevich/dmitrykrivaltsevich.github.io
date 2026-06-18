/* Minimal runtime: theme toggle + KaTeX init. No framework, offline-safe. */
(function () {
  "use strict";
  var KEY = "kr-theme";
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var b = document.getElementById("theme-toggle");
    if (b) { b.textContent = t === "dark" ? "☀" : "☾"; b.setAttribute("aria-label", "Switch to " + (t === "dark" ? "light" : "dark") + " mode"); }
  }
  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved) saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  apply(saved);

  document.addEventListener("DOMContentLoaded", function () {
    var b = document.getElementById("theme-toggle");
    if (b) b.addEventListener("click", function () {
      apply(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
    // Render TeX written as \( \) and \[ \] or $…$ when KaTeX is present.
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  });
})();
