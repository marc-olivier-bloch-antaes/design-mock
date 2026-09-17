/* SiL · Comportements minimaux des maquettes (référence d'interaction pour React).
   Aucun framework. Paramètres d'URL de démonstration :
   ?tab=tarifs|securite|faq…  ouvre l'onglet (modèle d'URL du site actuel)
   ?menu=particuliers          ouvre le méga-menu (desktop)
   ?drawer=particuliers        ouvre le menu mobile et déplie la rubrique */
(function () {
  const params = new URLSearchParams(location.search);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const scrim = document.querySelector("[data-scrim]");

  /* ---------- Méga-menu ---------- */
  const megaButtons = $$("[data-mega]");
  function closeMega() {
    megaButtons.forEach((b) => b.setAttribute("aria-expanded", "false"));
    $$(".megamenu").forEach((m) => (m.hidden = true));
    if (scrim && document.getElementById("drawer").hidden) scrim.hidden = true;
  }
  function openMega(key) {
    closeMega();
    const btn = document.querySelector(`[data-mega="${key}"]`);
    const panel = document.getElementById(`mega-${key}`);
    if (!btn || !panel) return;
    btn.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    if (scrim) scrim.hidden = false;
  }
  megaButtons.forEach((b) =>
    b.addEventListener("click", () => {
      b.getAttribute("aria-expanded") === "true" ? closeMega() : openMega(b.dataset.mega);
    })
  );

  /* ---------- Drawer mobile ---------- */
  const drawer = document.getElementById("drawer");
  const openBtn = document.querySelector("[data-drawer-open]");
  function openDrawer() {
    drawer.hidden = false;
    scrim.hidden = false;
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    drawer.querySelector("[data-drawer-close]").focus({ preventScroll: true });
  }
  function closeDrawer() {
    drawer.hidden = true;
    scrim.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    openBtn.focus({ preventScroll: true });
  }
  openBtn && openBtn.addEventListener("click", openDrawer);
  drawer && drawer.querySelector("[data-drawer-close]").addEventListener("click", closeDrawer);
  $$("[data-drawer-l1]").forEach((b) =>
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      document.getElementById(b.getAttribute("aria-controls")).hidden = open;
    })
  );
  scrim && scrim.addEventListener("click", () => (drawer.hidden ? closeMega() : closeDrawer()));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (drawer && !drawer.hidden) closeDrawer();
    else closeMega();
  });

  /* ---------- Onglets (WAI-ARIA Tabs, activation automatique) ---------- */
  const tabs = $$("[role=tab]");
  function selectTab(id, { focus = false, push = true } = {}) {
    const tab = tabs.find((t) => t.dataset.tab === id);
    if (!tab) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    const list = tab.parentElement;
    list.scrollTo({ left: Math.max(0, tab.offsetLeft - list.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2) });
    if (push) {
      const url = new URL(location.href);
      url.searchParams.set("tab", id);
      try { history.replaceState(null, "", url); } catch (_) {}
    }
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      let n = k === -Infinity ? 0 : k === Infinity ? tabs.length - 1 : (i + k + tabs.length) % tabs.length;
      selectTab(tabs[n].dataset.tab, { focus: true });
    });
  });
  $$("[data-goto-tab]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      selectTab(a.dataset.gotoTab);
      document.getElementById("onglets").scrollIntoView({ behavior: "smooth" });
    })
  );

  /* ---------- Accordéon ---------- */
  $$("[data-accordion]").forEach((b) =>
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      document.getElementById(b.getAttribute("aria-controls")).hidden = open;
    })
  );

  /* ---------- Carrousel ---------- */
  $$("[data-carousel]").forEach((c) => {
    const track = c.querySelector(".carousel__track");
    const section = c.closest("section");
    const prev = section.querySelector("[data-carousel-prev]");
    const next = section.querySelector("[data-carousel-next]");
    const bar = c.querySelector("[data-carousel-progress]");
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = track.clientWidth / track.scrollWidth;
      if (bar) {
        bar.style.width = `${Math.max(ratio * 100, 12)}%`;
        bar.style.transform = `translateX(${max ? (track.scrollLeft / max) * ((1 / ratio - 1) * 100) : 0}%)`;
      }
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    };
    const step = () => track.querySelector("li").getBoundingClientRect().width + 24;
    prev && prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next && next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- Footer : colonnes repliables sur mobile uniquement ---------- */
  const mq = window.matchMedia("(min-width: 48rem)");
  const syncFooter = () => $$("[data-footer-col]").forEach((d) => (d.open = mq.matches));
  mq.addEventListener("change", syncFooter);
  syncFooter();
  $$("[data-totop]").forEach((b) => b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" })));

  /* ---------- États de démonstration via URL ---------- */
  if (params.get("tab")) selectTab(params.get("tab"), { push: false });
  if (params.get("menu")) openMega(params.get("menu"));
  if (params.get("drawer")) {
    openDrawer();
    const b = document.querySelector(`[aria-controls="dr-${params.get("drawer")}"]`);
    b && b.click();
  }
})();
