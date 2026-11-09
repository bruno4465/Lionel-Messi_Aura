/* ============================================================
   MESSI ✦ M10 — engine
   Transição de página (mecânica real do Lando: Rive page-transition
   com inputs initial/transition-out/transition-in + fallback CSS)
   + Lenis + efeitos de scroll (split-text, parallax, marquee por
   velocidade, header, scroll-indicator, contadores, acordeão, jogo)
   ============================================================ */
(() => {
"use strict";
const doc = document.documentElement;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TOUCH = matchMedia("(hover: none)").matches;
doc.classList.add("js");
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------
   1) TRANSIÇÃO DE PÁGINA — igual ao Lando (transitions-rive-isolate)
   overlay .transition-w, inputs: initial / transition-out / transition-in
   ------------------------------------------------------------ */
const TRANS = (() => {
  const W = $(".transition-w");
  const canvas = W && $("canvas[data-rive-primary]", W);
  const btn = $(".transition-btn", W);
  const intro = doc.dataset.intro === "1"; // só na home, primeira visita
  let inputs = null, riveOK = false, introArmed = false, riveInst = null;
  let transit = false;
  try { transit = sessionStorage.getItem("m-transit") === "1"; } catch (e) {}
  let busy = false;

  if (btn) btn.style.transition = "opacity 300ms";

  const show = () => { W.classList.add("on", "live");
    W.classList.toggle("no-rive", !riveOK); /* intro própria quando Rive não carrega */
    if (riveInst) { try { riveInst.resizeDrawingSurfaceToCanvas(); } catch (e) {} } };
  const hideUI = () => { setTimeout(() => { W.classList.remove("on", "live", "cover", "reveal"); doc.classList.remove("transit"); if (btn) btn.style.display = "none"; }, 560); };

  /* pageTransitionIn() do Lando — as classes cover/reveal são aplicadas
     sempre: no fallback elas animam as cortinas e na variante v4 (íris)
     elas dirigem o clip-path do canvas/cortina */
  function pageTransitionIn() {
    if (!W) return;
    show();
    doc.classList.remove("transit");
    if (riveOK && inputs) {
      inputs.initial.value = false; inputs.out.value = false; inputs.inp.value = true;
    }
    $$(".tr-curtain i", W).forEach(p => p.style.transition = "");
    W.classList.add("reveal"); W.classList.remove("cover");
    setTimeout(() => { if (btn) btn.style.opacity = "0"; }, 100);
    hideUI();
  }
  /* pageTransitionOut() do Lando */
  function pageTransitionOut() {
    if (!W) return;
    show();
    if (btn) { btn.style.display = "none"; }
    if (riveOK && inputs) {
      inputs.initial.value = false; inputs.inp.value = false; inputs.out.value = true;
    }
    W.classList.remove("reveal"); W.classList.add("cover");
  }

  /* cobre a tela instantaneamente (chegada por transição) */
  function coverInstant() {
    if (!W) return;
    show();
    if (btn) btn.style.display = "none";
    W.classList.add("cover"); W.classList.remove("reveal");
    if (!riveOK) { $$(".tr-curtain i", W).forEach(p => p.style.transition = "none"); }
  }

  async function initRive() {
    const RV = window.rive;
    if (!W || !canvas || typeof RV === "undefined" || typeof RV.Rive !== "function") { return false; }
    try {
      if (RV.RuntimeLoader) RV.RuntimeLoader.setWasmUrl("assets/rive/rive.wasm");
      const r = new RV.Rive({
        src: "assets/rive/page-transition.riv",
        canvas, artboard: "page-transition",
        stateMachines: "page-transition", autoplay: true,
        layout: new RV.Layout({ fit: RV.Fit.Cover, alignment: RV.Alignment.Center }),
        onLoad: () => {
          try {
            r.resizeDrawingSurfaceToCanvas();
            const list = r.stateMachineInputs("page-transition");
            const init = list.find(i => i.name === "initial");
            const out = list.find(i => i.name === "transition-out");
            const inp = list.find(i => i.name === "transition-in");
            if (!init || !out || !inp) return;
            inputs = { initial: init, out, inp };
            init.value = true; out.value = false; inp.value = false;
            riveOK = true;
            riveInst = r;
            W.classList.remove("cover", "reveal");
            $$(".tr-curtain i", W).forEach(p => p.style.transition = "none");
            window.dispatchEvent(new CustomEvent("trans-ready"));
          } catch (e) { /* fallback permanece */ }
        },
        onLoadError: () => { riveOK = false; window.dispatchEvent(new CustomEvent("trans-ready")); }
      });
      addEventListener("resize", () => { try { r.resizeDrawingSurfaceToCanvas(); } catch (e) {} });
      return true;
    } catch (e) { return false; }
  }

  function armIntro() {
    if (!W || !intro || transit || introArmed) return;
    introArmed = true;
    if (!riveOK) W.classList.add("no-rive");
    W.classList.add("introing"); /* animações de entrada só durante a intro */
    show();
    if (!riveOK) { W.classList.add("cover"); W.classList.remove("reveal"); }

    /* preloader próprio: contagem 00→100 + barra fina; entra sozinho no fim */
    let ui = null;
    if (!REDUCED) {
      ui = document.createElement("div");
      ui.className = "tr-load";
      ui.innerHTML = '<span class="tl-bar"><i></i></span><b class="tl-pct">00</b>';
      W.appendChild(ui);
    }
    const bar = ui ? $(".tl-bar i", ui) : null, pct = ui ? $(".tl-pct", ui) : null;
    const DUR = REDUCED ? 350 : 2000, t0 = performance.now();
    let gone = false;
    const keyh = e => { if (e.key === "Enter" || e.key === " ") go(); };
    const go = () => {
      if (gone) return; gone = true;
      W.removeEventListener("click", go);
      removeEventListener("keydown", keyh);
      W.classList.remove("introing");
      if (ui) ui.remove();
      try { sessionStorage.setItem("m-transit", "0"); } catch (e) {}
      pageTransitionIn();
      setTimeout(() => { busy = false; }, 1200);
    };
    /* clique em qualquer lugar pula a contagem (à prova de falhas) */
    W.addEventListener("click", go);
    addEventListener("keydown", keyh);
    (function tick(t) {
      if (gone) return;
      const p = clamp((t - t0) / DUR, 0, 1);
      const e = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      if (pct) pct.textContent = String(Math.round(e * 100)).padStart(2, "0");
      if (bar) bar.style.transform = "scaleX(" + e.toFixed(4) + ")";
      if (p < 1) requestAnimationFrame(tick); else go();
    })(t0);
  }

  /* navega com a transição — usada por cliques e por "rolar além do fim" */
  const DEST = { "index.html": "início", "carreira.html": "carreira",
                 "momentos.html": "momentos", "records.html": "números", "jogo.html": "jogo" };
  /* cada destino tem sua própria transição (v1–v5, ver site.css) */
  const VARS = { "carreira.html": "v1", "momentos.html": "v2", "records.html": "v3",
                 "jogo.html": "v4", "index.html": "v5" };
  function navigateTo(href) {
    if (busy) return; busy = true;
    const last = decodeURIComponent(href.split("/").pop() || "").toLowerCase();
    /* anuncia o destino na marca central (M10 → carreira…) */
    const dest = W && $(".tr-dest", W);
    if (dest) dest.textContent = DEST[last] ? "→ " + DEST[last] : "";
    /* escolhe a variante da transição ANTES do out (a página de chegada
       relê do sessionStorage e aplica no <html> antes do paint) */
    const v = VARS[last] || "v1";
    doc.dataset.variant = v;
    try { sessionStorage.setItem("m-variant", v); } catch (e) {}
    try { sessionStorage.setItem("m-transit", "1"); } catch (e) {}
    doc.classList.add("is-transitioning");
    pageTransitionOut();
    setTimeout(() => { location.href = href; }, REDUCED ? 80 : 1000);
  }

  /* intercepta cliques internos → out → navega (lL = 1000ms, como o Lando) */
  function armLinks() {
    document.addEventListener("click", e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // âncora interna
      if (url.hash && url.pathname === location.pathname) return;
      if (a.dataset.taxiIgnore !== undefined) return;
      e.preventDefault();
      navigateTo(url.href);
    });
  }

  async function boot() {
    if (!W) { try { sessionStorage.removeItem("m-transit"); } catch (e) {} return; }
    armLinks();
    if (transit) { coverInstant(); }
    /* chegou por transição: espera rive (ou fallback) e revela, como PP()/LL() */
    let revDone = false;
    const reveal = () => { if (revDone) return; revDone = true;
      try { sessionStorage.setItem("m-transit", "0"); } catch (e) {}
      requestAnimationFrame(() => requestAnimationFrame(() => pageTransitionIn())); };
    /* primeira visita: preloader próprio (contador → entra sozinho) */
    let armDone = false;
    const ready = () => { if (armDone) return; armDone = true; armIntro(); };
    /* listeners ANTES do initRive — sem rive o evento dispara antes do await */
    if (transit) window.addEventListener("trans-ready", reveal, { once: true });
    else if (intro) window.addEventListener("trans-ready", ready, { once: true });
    const ok = await initRive();
    if (!ok) window.dispatchEvent(new CustomEvent("trans-ready"));
    if (transit) setTimeout(reveal, 1600);   /* segurança */
    else if (intro) setTimeout(ready, 1600); /* segurança */
  }
  boot();
  /* bfcache: voltar/avançar do navegador não pode deixar overlay nem scroll travados */
  addEventListener("pageshow", e => {
    if (!e.persisted) return;
    doc.classList.remove("is-transitioning");
    if (W) W.classList.remove("on", "live", "cover", "reveal", "introing");
    try { sessionStorage.setItem("m-transit", "0"); } catch (err) {}
    if (lenis) lenis.start();
  });
  return { out: pageTransitionOut, in: pageTransitionIn, go: navigateTo };
})();

/* ------------------------------------------------------------
   2) LENIS — scroll suave (a lib que o Lando usa)
   ------------------------------------------------------------ */
let lenis = null, scrollY = 0, vel = 0;
if (!REDUCED && typeof Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on("scroll", (e) => { scrollY = e.scroll; vel = e.velocity || 0; });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
} else {
  addEventListener("scroll", () => { scrollY = scrollY = window.scrollY; vel = 0; }, { passive: true });
}
const scrollTo = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.35 });
  else (typeof target === "number" ? window.scrollTo(0, target)
       : target.scrollIntoView({ behavior: "smooth" }));
};
/* âncoras internas */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    if (a.hash.startsWith("#/")) return; /* rotas do arquivo único: deixa o roteador */
    let el = null;
    try { el = a.hash && $(a.hash); } catch (_) { return; }
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.35 });
    else el.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", a.hash);
  });
});

/* ------------------------------------------------------------
   3) SPLIT-TEXT (estilo SplitType do Lando) em [data-split]
   ------------------------------------------------------------ */
function splitChars(el) {
  if (el.dataset.splitDone) return;
  const text = el.textContent;
  el.textContent = "";
  el.setAttribute("aria-label", text);
  [...text].forEach((c, i) => {
    const w = document.createElement("span");
    w.className = "stx"; w.setAttribute("aria-hidden", "true");
    const ch = document.createElement("span");
    ch.className = "ch"; ch.style.setProperty("--i", i);
    ch.textContent = c === " " ? "\u00A0" : c;
    w.appendChild(ch); el.appendChild(w);
  });
  el.dataset.splitDone = "1";
}
$$("[data-split]").forEach(splitChars);

/* ------------------------------------------------------------
   4) REVEALS por IntersectionObserver (ScrollTrigger-like)
   ------------------------------------------------------------ */
const io = new IntersectionObserver((ents) => {
  ents.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    if (en.target.dataset.count !== undefined) countUp(en.target);
    $$("[data-count]", en.target).forEach(countUp);
    io.unobserve(en.target);
  });
}, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
$$("[data-reveal]").forEach(el => io.observe(el));
$$("[data-split]").forEach(el => { if (!el.hasAttribute("data-reveal")) io.observe(el); });

/* contadores */
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const dur = 1500, t0 = performance.now();
  const fmt = n => Number.isInteger(target) ? Math.round(n) : n.toFixed(1);
  const tick = (t) => {
    const p = clamp((t - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * e);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------
   5) LOOP DE SCROLL: parallax, hero scale, marquee por velocidade,
      header, scroll-indicator, timeline rail
   ------------------------------------------------------------ */
const heroBg = $(".hero-bg img");
const heroInner = $(".hero-inner");
const marquee = $$(".marq");
const rail = $(".tl .rail");
const indBar = $(".scroll-indicator i");
const hd = $(".hd");
let lastY = 0, marqX = 0, marqDir = 1;

function frame() {
  const vh = innerHeight;
  const max = doc.scrollHeight - vh;
  const prog = max > 0 ? clamp(scrollY / max, 0, 1) : 0;

  /* header */
  if (hd) {
    hd.classList.toggle("solid", scrollY > 40);
    hd.classList.toggle("hide", scrollY > 140 && scrollY > lastY + 2 && !doc.querySelector(".menu.on"));
  }
  lastY = scrollY;

  /* indicador */
  if (indBar) indBar.style.height = (prog * 100).toFixed(2) + "%";

  /* hero: zoom-out + fade conforme rola (sticky-hero do Lando) */
  if (heroBg) {
    const p = clamp(scrollY / vh, 0, 1);
    heroBg.style.transform = `translateY(${scrollY * 0.22}px) scale(${1 + 0.07 - p * 0.07})`;
    if (heroInner) {
      heroInner.style.transform = `translateY(${scrollY * -0.08}px)`;
      heroInner.style.opacity = String(1 - p * 1.05);
    }
  }

  /* parallax genérico */
  $$("[data-parallax]").forEach(el => {
    const sp = parseFloat(el.dataset.parallax) || 0.12;
    const r = el.getBoundingClientRect();
    const center = r.top + r.height / 2 - vh / 2;
    el.style.transform = `translateY(${(-center * sp).toFixed(1)}px)`;
  });

  /* marquee: velocidade + direção reagindo ao scroll (Lando) */
  marquee.forEach(m => {
    const t = $(".mt", m);
    if (!t) return;
    const w = t.scrollWidth / 2 || 1;
    const boost = clamp(Math.abs(vel) * 0.14, 0, 9);
    if (Math.abs(vel) > 0.4) marqDir = vel > 0 ? 1 : -1;
    marqX -= (0.9 + boost) * marqDir;
    if (marqX <= -w) marqX += w;
    if (marqX > 0) marqX -= w;
    const skew = clamp(vel * 0.28, -9, 9);
    t.style.transform = `translateX(${marqX.toFixed(1)}px) skewX(${skew.toFixed(2)}deg)`;
  });

  /* timeline rail */
  if (rail) {
    const wrap = rail.parentElement;
    const r = wrap.getBoundingClientRect();
    const p = clamp((vh * 0.7 - r.top) / r.height, 0, 1);
    rail.style.height = (p * 100).toFixed(2) + "%";
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ------------------------------------------------------------
   6) cursor custom
   ------------------------------------------------------------ */
if (!TOUCH) {
  const cur = $(".cursor");
  if (cur) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; cur.style.opacity = "1"; });
    (function loop() { cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
      cur.style.transform = `translate(${cx - 7}px,${cy - 7}px)`; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", e => {
      cur.classList.toggle("big", !!e.target.closest("a,button,.coin,.mo,.kball,summary"));
    });
    document.addEventListener("mouseleave", () => cur.style.opacity = "0");
  }
}

/* ------------------------------------------------------------
   7) header: menu mobile + tema
   ------------------------------------------------------------ */
const burger = $(".burger"), menu = $(".menu");
if (burger && menu) {
  burger.addEventListener("click", () => {
    const on = menu.classList.toggle("on");
    burger.classList.toggle("on", on);
    burger.setAttribute("aria-expanded", String(on));
    if (lenis) on ? lenis.stop() : lenis.start();
  });
  $$("a", menu).forEach(a => a.addEventListener("click", () => {
    menu.classList.remove("on"); burger.classList.remove("on");
    if (lenis) lenis.start();
  }));
}
const themeBtn = $("#theme");
if (themeBtn) {
  const apply = t => {
    doc.setAttribute("data-theme", t);
    themeBtn.textContent = t === "light" ? "escuro" : "claro";
    try { localStorage.setItem("m-theme", t); } catch (e) {}
  };
  let saved = null; try { saved = localStorage.getItem("m-theme"); } catch (e) {}
  if (saved) apply(saved);
  themeBtn.addEventListener("click", () =>
    apply(doc.getAttribute("data-theme") === "light" ? "dark" : "light"));
}

/* ------------------------------------------------------------
   8) hero card swap (v1: arco com duas fotos)
   ------------------------------------------------------------ */
$$(".hero-card").forEach(card => {
  const imgs = $$("img", card);
  if (imgs.length < 2) return;
  imgs[0].classList.add("on");
  let i = 0;
  const flip = () => {
    i = (i + 1) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle("on", k === i));
    const tag = $(".tag", card);
    if (tag) tag.textContent = imgs[i].dataset.cap || tag.textContent;
  };
  card.parentElement.addEventListener("mouseenter", flip);
  card.addEventListener("click", flip);
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
});

/* ------------------------------------------------------------
   9) lightbox (momentos)
   ------------------------------------------------------------ */
const lb = $("#lb");
if (lb) {
  const img = $("img", lb), cap = $("p", lb), cnt = $(".lb-count", lb);
  let group = [], idx = 0;
  const sources = $$("[data-full]").map(el => ({
    /* getter: lê o src na hora do clique (imagens dedup resolvem depois) */
    get src() { return el.dataset.full || ($("img", el) && $("img", el).src) || ""; },
    cap: el.dataset.cap || "", el
  }));
  const show = (k) => {
    idx = (k + sources.length) % sources.length;
    img.src = sources[idx].src;
    img.alt = sources[idx].cap;
    cap.textContent = sources[idx].cap;
    if (cnt) cnt.textContent = (idx + 1) + " / " + sources.length;
  };
  sources.forEach((s, k) => s.el.addEventListener("click", () => {
    show(k);
    if (typeof lb.showModal === "function") lb.showModal();
    if (lenis) lenis.stop();
  }));
  $(".x", lb).addEventListener("click", () => { lb.close(); if (lenis) lenis.start(); });
  lb.addEventListener("click", e => { if (e.target === lb) { lb.close(); if (lenis) lenis.start(); } });
  lb.addEventListener("close", () => lenis && lenis.start());
  const pv = $(".pv", lb), nx = $(".nx", lb);
  if (pv) pv.addEventListener("click", () => show(idx - 1));
  if (nx) nx.addEventListener("click", () => show(idx + 1));
  addEventListener("keydown", e => {
    if (!lb.open) return;
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
}

/* ------------------------------------------------------------
   10) bolas de ouro (info das moedas)
   ------------------------------------------------------------ */
const info = $("#info");
$$(".coin").forEach(c => {
  const act = () => {
    $$(".coin").forEach(x => x.classList.remove("picked"));
    c.classList.add("picked");
    if (info) info.innerHTML = `<b>${$(".y", c).textContent}</b> — ${c.dataset.info}`;
  };
  c.addEventListener("click", act);
  c.addEventListener("mouseenter", act);
  c.addEventListener("focus", act);
});

/* ------------------------------------------------------------
   11) jogo — embaixadinhas (v1 preservada)
   ------------------------------------------------------------ */
const field = $("#field");
if (field) {
  const ball = $("#kball"), sc = $("#sc"), best = $("#best"), msg = $("#fmsg");
  let score = 0, top = 0, playing = false;
  /* flag global: bloqueia o "rolar além do fim" enquanto a bola está no ar */
  const setPlay = on => { if (on) doc.dataset.playing = "1"; else delete doc.dataset.playing; };
  try { top = parseInt(localStorage.getItem("m-best") || "0", 10) || 0; } catch (e) {}
  if (best) best.textContent = top;

  function place() {
    const w = field.clientWidth, h = field.clientHeight;
    ball.style.left = (0.12 + Math.random() * 0.76) * w + "px";
    ball.style.top = (0.18 + Math.random() * 0.55) * h + "px";
  }
  function end() {
    playing = false;
    setPlay(false);
    score = 0; if (sc) sc.textContent = "0";
    if (msg) msg.innerHTML = "a bola caiu — <b>clique para recomeçar</b>";
    ball.classList.remove("fly");
    ball.style.transform = "";
    place();
  }
  function hit() {
    if (!playing) {
      playing = true; setPlay(true); score = 0; if (sc) sc.textContent = "0";
      if (msg) msg.textContent = "mantenha a bola no ar!";
    }
    score++; if (sc) sc.textContent = String(score);
    if (score > top) {
      top = score; if (best) best.textContent = String(top);
      try { localStorage.setItem("m-best", String(top)); } catch (e) {}
      if (msg) msg.innerHTML = `novo recorde: <b>${top}</b> toques`;
    }
    ball.classList.remove("fly"); void ball.offsetWidth; ball.classList.add("fly");
    place();
    clearTimeout(end._t);
    end._t = setTimeout(end, 1500);
  }
  ball.addEventListener("pointerdown", e => { e.preventDefault(); hit(); });
  field.addEventListener("pointerdown", e => { if (e.target === field) hit(); });
  place();
  addEventListener("resize", () => playing || place());
}

/* exposto p/ uso avançado (roteador da versão de arquivo único) */
window.M10TRANS = TRANS;

/* ------------------------------------------------------------
   12) PREFETCH — pré-carrega páginas internas no hover/focus
       (a troca de página fica instantânea, ainda mais que a do Lando)
   ------------------------------------------------------------ */
(() => {
  if ($(".route") || location.protocol === "file:") return; /* arquivo único/file://: nada a pré-carregar */
  const done = new Set([location.pathname]);
  const add = href => {
    try {
      const u = new URL(href, location.href);
      if (u.origin !== location.origin || !/\.html?$/i.test(u.pathname)) return;
      if (done.has(u.pathname)) return;
      done.add(u.pathname);
      const l = document.createElement("link");
      l.rel = "prefetch"; l.href = u.href;
      document.head.appendChild(l);
    } catch (e) {}
  };
  document.addEventListener("mouseover", e => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (a) add(a.href);
  }, { passive: true });
  document.addEventListener("focusin", e => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (a) add(a.href);
  });
})();

/* ------------------------------------------------------------
   13) ROLAR ALÉM DO FIM → PRÓXIMA PÁGINA (mantém a transição)
   ------------------------------------------------------------ */
(() => {
  const NEXT = $(".next-page");
  /* no arquivo único quem cuida é o roteador (não há recarga de página) */
  if (!NEXT || !TRANS.go || $(".route")) return;
  const atBottom = () => scrollY + innerHeight >= doc.scrollHeight - 4;
  const armed = () => !doc.classList.contains("is-transitioning")
      && !doc.dataset.playing /* jogo em andamento não deixa passar */
      && !doc.querySelector(".menu.on") && !(typeof lb !== "undefined" && lb && lb.open)
      && atBottom(); /* busy/overlay: validados dentro de TRANS.go */
  let acc = 0, lastT = 0;
  addEventListener("wheel", e => {
    if (e.deltaY <= 0 || !armed()) { acc = 0; return; }
    const now = performance.now();
    if (now - lastT > 450) acc = 0;       /* gesto precisa ser contínuo */
    lastT = now;
    acc += e.deltaY;
    if (acc > 140) { acc = 0; TRANS.go(new URL(NEXT.getAttribute("href"), location.href).href); }
  }, { passive: true });
  /* toque: arrastar para cima já no fim */
  let tY = null;
  addEventListener("touchstart", e => { tY = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", e => {
    if (tY === null) return;
    const dy = tY - e.changedTouches[0].clientY;
    tY = null;
    if (dy > 60 && armed() && !e.target.closest("#field"))
      TRANS.go(new URL(NEXT.getAttribute("href"), location.href).href);
  }, { passive: true });
})();

})();
