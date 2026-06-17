/** Lazy-load heavy CDN vendors (graphs, motion, mermaid) on first use. */
(function (global) {
  const VENDORS = {
    gsap: [
      "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js",
      "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js",
    ],
    cytoscape: ["https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/dist/cytoscape.min.js"],
    mermaid: ["https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"],
  };

  const scriptPromises = {};

  function loadScript(src) {
    if (!scriptPromises[src]) {
      scriptPromises[src] = new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = src;
        el.async = true;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(el);
      });
    }
    return scriptPromises[src];
  }

  async function ensure(names) {
    const urls = [];
    for (const name of names) {
      for (const url of VENDORS[name] || []) urls.push(url);
    }
    await Promise.all(urls.map(loadScript));
  }

  global.FOSVendors = { ensure, VENDORS };
})(window);
