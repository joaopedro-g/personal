/* Personal Trainer · template — interações sem dependências */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  /* =======================================================
     1. Personalização: ?nome=&cidade=&insta=&whats=&cref=&cor=
     ======================================================= */
  const DEFAULTS = { nome: "Seu Nome", cidade: "Sua Cidade", insta: "seuinsta", cref: "000000-G/UF", whats: "", cor: "FF5A2C" };
  const KEYS = Object.keys(DEFAULTS);
  const state = { ...DEFAULTS };

  function clean(k, v) {
    v = String(v ?? "").trim().slice(0, 40);
    if (k === "insta") v = v.replace(/^@+/, "").replace(/[^\w.]/g, "");
    if (k === "whats") v = v.replace(/\D/g, "").slice(0, 13);
    if (k === "cor") { v = v.replace(/[^0-9a-f]/gi, ""); if (v.length !== 6) v = ""; }
    return v;
  }

  const params = new URLSearchParams(location.search);
  KEYS.forEach((k) => { const v = clean(k, params.get(k)); if (v) state[k] = v; });

  const isDefault = (k) => state[k] === DEFAULTS[k];

  function initials(name) {
    const w = name.split(/\s+/).filter(Boolean);
    if (!w.length) return "SN";
    return ((w[0][0] || "") + (w.length > 1 ? w[w.length - 1][0] : (w[0][1] || ""))).toUpperCase();
  }

  function luminance(hex) {
    const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function setAccent(hex) {
    root.style.setProperty("--accent", "#" + hex);
    const L = luminance(hex);
    const inkL = luminance("1A1411");
    const onInk = (L + 0.05) / (inkL + 0.05);
    const onWhite = 1.05 / (L + 0.05);
    root.style.setProperty("--on-accent", onInk >= onWhite ? "#1A1411" : "#FFFFFF");
  }

  function splitChars(el, text) {
    el.textContent = "";
    el.setAttribute("aria-label", text);
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", i);
      s.textContent = ch === " " ? " " : ch;
      el.appendChild(s);
    });
  }

  function waLink(msg) {
    let n = state.whats;
    if (!n) return null;
    if (n.length <= 11) n = "55" + n; // número brasileiro sem DDI
    return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
  }

  function apply() {
    $$("[data-slot]").forEach((el) => {
      const k = el.dataset.slot;
      const v = state[k] || DEFAULTS[k];
      if (el.hasAttribute("data-split")) {
        if (el.getAttribute("aria-label") !== v) splitChars(el, v);
      } else if (el.textContent !== v) {
        el.textContent = v;
      }
      if (el.classList.contains("slot")) el.classList.toggle("is-default", isDefault(k));
    });
    // slots de texto livre (sem chave) continuam marcados como "edite aqui"
    $$(".slot:not([data-slot])").forEach((el) => el.classList.add("is-default"));

    $$("[data-initials]").forEach((el) => (el.textContent = initials(state.nome)));
    document.title = `${state.nome} · Personal Trainer`;
    root.classList.toggle("is-personalized", !isDefault("nome"));
    setAccent(state.cor);

    $$("[data-wa]").forEach((a) => {
      const href = waLink(a.dataset.wa);
      if (href) { a.href = href; a.target = "_blank"; a.rel = "noopener"; }
      else { a.href = "#contato"; a.removeAttribute("target"); }
    });
    $$("[data-insta-href]").forEach((a) => {
      a.href = isDefault("insta") ? "#contato" : `https://instagram.com/${state.insta}`;
    });
    fitName();
  }

  /* =======================================================
     2. Nome gigante do topo: cabe exato na largura
     ======================================================= */
  const fitEl = $(".fit");
  function fitName() {
    if (!fitEl) return;
    const box = fitEl.parentElement;
    fitEl.style.fontSize = "100px";
    const w = fitEl.scrollWidth || 1;
    const target = box.clientWidth * 0.98;
    const max = innerWidth <= 820 ? 400 : Math.min(300, innerHeight * 0.27);
    fitEl.style.fontSize = Math.max(40, Math.min(max, (100 * target) / w)) + "px";
  }

  /* =======================================================
     3. Textos automáticos: mês da agenda e ano
     ======================================================= */
  const now = new Date();
  const monthDate = now.getDate() >= 22 ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : now;
  $$("[data-month]").forEach((el) => (el.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(monthDate)));
  $$("[data-year]").forEach((el) => (el.textContent = now.getFullYear()));

  /* =======================================================
     4. Reveal: cards surgem com blur + leve subida
     ======================================================= */
  $$("[data-stagger]").forEach((group) => {
    $$(":scope > [data-reveal]", group).forEach((el, i) => {
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
    });
  });
  $$(".hero__copy [data-reveal]").forEach((el, i) => el.style.setProperty("--d", (0.55 + i * 0.1).toFixed(2) + "s"));
  $(".hero__eyebrow")?.style.setProperty("--d", ".2s");

  const counters = new Set($$("[data-count]"));
  function runCounter(el) {
    const end = +el.dataset.count;
    const sep = el.hasAttribute("data-sep");
    const fmt = (n) => (sep ? n.toLocaleString("pt-BR") : String(n));
    if (reduce) { el.textContent = fmt(end); return; }
    const dur = 1600;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach((c) => { if (counters.delete(c)) setTimeout(() => runCounter(c), 250); });
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* =======================================================
     5. Celular do card Online: exercícios sendo concluídos
     ======================================================= */
  const phone = $(".phone");
  if (phone) {
    const items = $$(".phone__list li", phone);
    const bar = $(".phone__bar i", phone);
    let step = 0, timer = null;
    const tick = () => {
      if (step < items.length) {
        items[step].classList.add("done");
        step++;
        bar.style.width = (step / items.length) * 100 + "%";
        bar.style.transition = "width .6s cubic-bezier(.22,1,.36,1)";
      } else {
        step = 0;
        items.forEach((li) => li.classList.remove("done"));
        bar.style.width = "0%";
      }
    };
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting && !reduce) timer = setInterval(tick, 1100);
      if (reduce) { items.forEach((li) => li.classList.add("done")); bar.style.width = "100%"; }
    }, { threshold: 0.3 }).observe(phone);
  }

  /* =======================================================
     6. Scroll: nav, parallax do topo, caminho do método, FAB
     ======================================================= */
  const nav = $("#nav");
  const fab = $(".fab-wa");
  const hero = $(".hero");
  const figure = $(".hero__figure");
  const path = $(".steps__path path");
  const steps = $(".steps");
  if (path) steps.style.setProperty("--len", Math.ceil(path.getTotalLength()));

  let lastY = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    if (!nav.classList.contains("is-open")) nav.classList.toggle("is-hidden", y > 700 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove("is-hidden");
    lastY = y;
    fab.classList.toggle("is-on", y > innerHeight * 0.55);

    if (!reduce && y < hero.offsetHeight * 1.2) {
      fitEl.style.setProperty("--py", (y * 0.3).toFixed(1) + "px");
      figure.style.setProperty("--fy", (y * 0.1).toFixed(1) + "px");
    }
    if (path) {
      const r = steps.getBoundingClientRect();
      const p = (innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.35);
      steps.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* cartões de vidro acompanham o mouse de leve */
  if (finePointer && !reduce) {
    const cards = $$(".gcard");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach((c, i) => {
        const f = 14 + i * 8;
        c.style.setProperty("--tx", (dx * f).toFixed(1) + "px");
        c.style.setProperty("--ty", (dy * f).toFixed(1) + "px");
      });
    });
    hero.addEventListener("pointerleave", () => cards.forEach((c) => { c.style.setProperty("--tx", "0px"); c.style.setProperty("--ty", "0px"); }));

    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left) / r.width - 0.5) * 12}px ${((e.clientY - r.top) / r.height - 0.5) * 10}px`;
      });
      b.addEventListener("pointerleave", () => (b.style.translate = ""));
    });
  }

  /* =======================================================
     7. Menu mobile
     ======================================================= */
  const burger = $(".nav__burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
    nav.classList.remove("is-hidden");
  });
  $$(".nav__links a, .nav__cta").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }));

  /* =======================================================
     8. Planos: mensal x trimestral
     ======================================================= */
  const sw = $(".switch");
  function placeKnob() {
    const on = $("button.is-on", sw);
    sw.style.setProperty("--kw", on.offsetWidth + "px");
    sw.style.setProperty("--kx", on.offsetLeft - 5 + "px");
    $(".switch__knob", sw).style.width = on.offsetWidth + "px";
    $(".switch__knob", sw).style.translate = on.offsetLeft - 5 + "px 0";
  }
  $$("button", sw).forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-on")) return;
    $$("button", sw).forEach((x) => x.classList.toggle("is-on", x === b));
    placeKnob();
    const period = b.dataset.period;
    $$(".price b").forEach((p, i) => {
      p.classList.add("swap");
      setTimeout(() => { p.textContent = p.dataset[period]; p.classList.remove("swap"); }, 180 + i * 60);
    });
  }));

  /* =======================================================
     9. FAQ: abre uma por vez
     ======================================================= */
  $$(".faq details").forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) $$(".faq details").forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* =======================================================
     10. Toast + botões sem contato configurado
     ======================================================= */
  const toastEl = $(".toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 3600);
  }
  document.addEventListener("click", (e) => {
    const wa = e.target.closest("[data-wa]");
    if (wa && !state.whats && (wa.closest("#contato") || wa.classList.contains("fab-wa"))) {
      e.preventDefault();
      if (wa.classList.contains("fab-wa")) $("#contato").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      toast("✎ Coloque o seu WhatsApp em “Ver com o seu nome” para ativar o botão.");
    }
    const ig = e.target.closest("[data-insta-href]");
    if (ig && isDefault("insta")) { e.preventDefault(); toast("✎ Coloque o seu @ do Instagram em “Ver com o seu nome”."); }
  });

  /* =======================================================
     11. Editor "Ver com o seu nome"
     ======================================================= */
  const editor = $("#editor");
  if (params.get("editor") === "0") editor.remove();
  else {
    const form = $("#editor-panel");
    const toggle = $(".editor__toggle");
    toggle.addEventListener("click", () => {
      const open = editor.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
      if (open) setTimeout(() => form.elements.nome.focus({ preventScroll: true }), 250);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") editor.classList.remove("is-open"); });

    const fill = () => {
      ["nome", "cidade", "insta", "whats", "cref"].forEach((k) => (form.elements[k].value = isDefault(k) ? "" : state[k]));
      $$("[data-cor]", form).forEach((b) => b.classList.toggle("is-on", b.dataset.cor.toLowerCase() === state.cor.toLowerCase()));
    };
    const shareUrl = () => {
      const u = new URL(location.href.split("?")[0].split("#")[0]);
      KEYS.forEach((k) => { if (!isDefault(k)) u.searchParams.set(k, state[k]); });
      return u.toString();
    };
    const sync = () => { apply(); history.replaceState(null, "", shareUrl() + location.hash); };

    form.addEventListener("input", (e) => {
      const k = e.target.name;
      if (!KEYS.includes(k)) return;
      state[k] = clean(k, e.target.value) || DEFAULTS[k];
      sync();
    });
    form.addEventListener("submit", (e) => e.preventDefault());
    $$("[data-cor]", form).forEach((b) => b.addEventListener("click", () => {
      state.cor = b.dataset.cor;
      fill(); sync();
    }));
    $("[data-reset]", form).addEventListener("click", () => {
      Object.assign(state, DEFAULTS);
      fill(); sync();
      toast("Prévia voltou ao modelo.");
    });
    $("[data-copy]", form).addEventListener("click", async () => {
      const url = shareUrl();
      try { await navigator.clipboard.writeText(url); }
      catch {
        const t = Object.assign(document.createElement("textarea"), { value: url });
        document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
      }
      toast("Link copiado! É só colar no WhatsApp.");
    });
    fill();
  }

  /* =======================================================
     12. Início
     ======================================================= */
  apply();
  onScroll();
  placeKnob();
  const ready = () => { fitName(); placeKnob(); root.classList.add("is-loaded"); };
  (document.fonts?.ready || Promise.resolve()).then(ready);
  setTimeout(() => root.classList.add("is-loaded"), 1500);
  let rz;
  addEventListener("resize", () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { fitName(); placeKnob(); onScroll(); }); });
})();
