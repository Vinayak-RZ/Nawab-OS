/** Load after deferred vendors — init motion only (graphs drawn in afterRender). */
(function () {
  async function run() {
    try {
      if (window.FOSVendors) await window.FOSVendors.ensure(["gsap"]);
    } catch (e) {
      console.warn("gsap load failed:", e);
    }
    if (window.FOSMotion) {
      FOSMotion.init?.();
      FOSMotion.runShell?.();
      FOSMotion.ensureContentVisible?.();
    }
    if (typeof drawDashboardCharts === "function" && currentView === "dashboard") {
      try { drawDashboardCharts(); } catch (e) { console.error(e); }
    }
  }
  if (document.readyState === "complete") void run();
  else window.addEventListener("load", () => { void run(); });
})();
