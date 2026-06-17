/** Load after deferred GSAP / Cytoscape — init motion only (graphs drawn in afterRender). */
(function () {
  function run() {
    if (window.FOSMotion) {
      FOSMotion.init?.();
      FOSMotion.runShell?.();
      FOSMotion.ensureContentVisible?.();
    }
    if (typeof drawDashboardCharts === "function" && currentView === "dashboard") {
      try { drawDashboardCharts(); } catch (e) { console.error(e); }
    }
  }
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run);
})();
