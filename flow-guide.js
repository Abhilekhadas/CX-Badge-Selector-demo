/* ============================================================================
   flow-guide.js  —  Friendly floating navigation for the Vantage Circle
   catalogue journey.  Drop <script src="flow-guide.js"></script> before
   </body> on any flow page and it wires itself up automatically.

   What it does
   ------------
   • Shows a small floating "guide" in the bottom-right corner.
   • Tells the client exactly where they are ("Step 3 of 6") and what to do.
   • Big Next / Back buttons. Next reuses each page's OWN continue button, so
     all existing data-saving / URL params keep working untouched.
   • A tap-to-open step map lets them jump back to finished steps. Steps they
     haven't reached yet are gently locked so they can't get lost.
   • Smooth fade page transitions (no jarring jumps).

   It never touches the locked PERSIST_KEY data — it only reads/writes its own
   "cxFlow.maxStep" marker for the step map.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__flowGuideLoaded) return;
  window.__flowGuideLoaded = true;

  /* ---- The journey, in order ------------------------------------------- */
  /* step = the number shown to the client (two pages share step 4 "Style") */
  var FLOW = [
    { file: "signin.html",       step: 1, cta: "#continueBtn", tip: "Add your company name, then tap Next." },
    { file: "bundles.html",      step: 2, cta: "#continueBtn", tip: "Tap the bundles you like, then Next." },
    { file: "style.html",        step: 3, cta: "#continueBtn", tip: "Pick a look you love." },
    { file: "design-style.html", step: 3, cta: "#nextBtn",     tip: "Choose your badges, then Next." },
    { file: "customize.html",    step: 4, cta: "#saveBtn",     tip: "Tweak the details, then save." },
    { file: "catalogue.html",    step: 5, cta: null,           tip: "All done — this is your catalogue!" }
  ];

  /* Labels shown in the step map (one per step number) */
  var STEP_LABELS = ["Sign in", "Bundles", "Style", "Customize", "Catalogue"];
  /* Which page to open when a client jumps to a given step number */
  var STEP_ENTRY  = { 1: "signin.html", 2: "bundles.html", 3: "style.html", 4: "customize.html", 5: "catalogue.html" };
  var TOTAL_STEPS = STEP_LABELS.length;
  var MAX_KEY = "cxFlow.maxStep";

  /* ---- Where are we? ---------------------------------------------------- */
  var here = (location.pathname.split("/").pop() || "").toLowerCase();
  var idx  = FLOW.findIndex(function (f) { return f.file === here; });
  if (idx === -1) return;                 // not a flow page → do nothing
  var current = FLOW[idx];
  var prevFile = idx > 0 ? FLOW[idx - 1].file : null;
  var nextFile = idx < FLOW.length - 1 ? FLOW[idx + 1].file : null;

  /* Remember the furthest step reached so the map can unlock it */
  var maxStep = current.step;
  try {
    var saved = parseInt(sessionStorage.getItem(MAX_KEY) || "0", 10);
    if (saved > maxStep) maxStep = saved;
    sessionStorage.setItem(MAX_KEY, String(maxStep));
  } catch (e) { /* private mode — fine */ }

  /* ===== Styles ========================================================= */
  var css = document.createElement("style");
  css.textContent = [
    "@view-transition { navigation: auto; }",
    "::view-transition-old(root),::view-transition-new(root){animation-duration:.32s;}",

    ":root{--fg-accent:#FF6D05;--fg-accent-soft:#FFE6D4;--fg-ink:#1F2125;--fg-muted:#6B6E72;--fg-line:#ECECEE;--fg-white:#fff;}",

    /* fade overlay used for transitions we control */
    "#fgFade{position:fixed;inset:0;background:#F7F7F8;z-index:2147483646;opacity:1;pointer-events:none;transition:opacity .42s ease;}",
    "#fgFade.gone{opacity:0;}",

    /* floating guide shell */
    "#fgGuide{position:fixed;right:22px;bottom:22px;z-index:2147483645;font-family:inherit;-webkit-font-smoothing:antialiased;}",
    "#fgGuide *{box-sizing:border-box;}",

    /* collapsed pill */
    "#fgPill{display:flex;align-items:center;gap:12px;background:var(--fg-white);border:1px solid var(--fg-line);border-radius:100px;padding:8px 8px 8px 16px;box-shadow:0 14px 36px rgba(31,33,37,.16);cursor:pointer;transition:transform .25s cubic-bezier(.22,.9,.28,1),box-shadow .25s ease;}",
    "#fgPill:hover{transform:translateY(-2px);box-shadow:0 18px 44px rgba(31,33,37,.22);}",
    "#fgRing{position:relative;width:34px;height:34px;flex:none;}",
    "#fgRing svg{transform:rotate(-90deg);display:block;}",
    "#fgRing .fg-rtrack{stroke:var(--fg-line);}",
    "#fgRing .fg-rfill{stroke:var(--fg-accent);stroke-linecap:round;transition:stroke-dashoffset .6s cubic-bezier(.22,.9,.28,1);}",
    "#fgRing b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--fg-ink);}",
    "#fgPillText{display:flex;flex-direction:column;line-height:1.15;}",
    "#fgPillText .fg-now{font-size:13px;font-weight:700;color:var(--fg-ink);}",
    "#fgPillText .fg-sub{font-size:11px;color:var(--fg-muted);}",
    "#fgNext{flex:none;display:inline-flex;align-items:center;gap:6px;border:none;background:var(--fg-accent);color:#fff;font:inherit;font-size:13px;font-weight:700;padding:9px 16px;border-radius:100px;cursor:pointer;transition:transform .2s ease,opacity .2s ease,background .2s ease;}",
    "#fgNext:hover{transform:translateX(2px);}",
    "#fgNext:disabled{opacity:.45;cursor:not-allowed;transform:none;}",
    "#fgNext svg{transition:transform .2s ease;}",
    "#fgNext:hover:not(:disabled) svg{transform:translateX(2px);}",

    /* expanded panel */
    "#fgPanel{position:absolute;right:0;bottom:0;width:300px;max-width:calc(100vw - 32px);background:var(--fg-white);border:1px solid var(--fg-line);border-radius:20px;box-shadow:0 24px 60px rgba(31,33,37,.24);padding:18px;opacity:0;transform:translateY(12px) scale(.96);transform-origin:bottom right;pointer-events:none;transition:opacity .26s ease,transform .3s cubic-bezier(.22,.9,.28,1);}",
    "#fgGuide.open #fgPanel{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}",
    "#fgGuide.open #fgPill{opacity:0;transform:scale(.9);pointer-events:none;transition:opacity .18s ease;}",
    "#fgHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}",
    "#fgHead h4{margin:0;font-size:14px;font-weight:800;color:var(--fg-ink);}",
    "#fgClose{border:none;background:transparent;color:var(--fg-muted);font-size:20px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:8px;transition:background .2s,color .2s;}",
    "#fgClose:hover{background:#F3F3F4;color:var(--fg-ink);}",
    "#fgTip{margin:0 0 14px;font-size:12.5px;color:var(--fg-muted);line-height:1.4;}",
    "#fgTip.pulse{animation:fgPulse .5s ease;color:var(--fg-accent);}",
    "@keyframes fgPulse{0%,100%{transform:translateX(0);}25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}",

    /* step list */
    "#fgSteps{list-style:none;margin:0 0 16px;padding:0;}",
    ".fg-step{display:flex;align-items:center;gap:11px;padding:7px 8px;border-radius:11px;cursor:pointer;transition:background .2s ease;}",
    ".fg-step:hover{background:#F6F6F7;}",
    ".fg-step.locked{cursor:default;opacity:.5;}",
    ".fg-step.locked:hover{background:transparent;}",
    ".fg-dot{flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid var(--fg-line);color:var(--fg-muted);background:var(--fg-white);transition:all .25s ease;}",
    ".fg-step.done .fg-dot{background:#29294c;border-color:#29294c;color:#fff;}",
    ".fg-step.active .fg-dot{background:var(--fg-accent);border-color:var(--fg-accent);color:#fff;box-shadow:0 0 0 4px var(--fg-accent-soft);}",
    ".fg-name{font-size:13px;font-weight:600;color:var(--fg-ink);}",
    ".fg-step.locked .fg-name{font-weight:500;}",
    ".fg-step.active .fg-name{color:var(--fg-accent);font-weight:700;}",
    ".fg-lock{margin-left:auto;font-size:12px;color:var(--fg-muted);}",

    /* panel buttons */
    "#fgBtns{display:flex;gap:10px;}",
    ".fg-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-size:13px;font-weight:700;padding:11px 14px;border-radius:12px;cursor:pointer;transition:transform .2s ease,opacity .2s ease,background .2s ease,border-color .2s ease;}",
    ".fg-back{background:var(--fg-white);border:1px solid var(--fg-line);color:var(--fg-ink);}",
    ".fg-back:hover{border-color:var(--fg-muted);transform:translateX(-2px);}",
    ".fg-fwd{background:var(--fg-accent);border:1px solid var(--fg-accent);color:#fff;}",
    ".fg-fwd:hover:not(:disabled){transform:translateX(2px);}",
    ".fg-fwd:disabled{opacity:.45;cursor:not-allowed;transform:none;}",
    ".fg-hidden{display:none!important;}",

    "@media (max-width:520px){#fgPillText{display:none;}#fgGuide{right:14px;bottom:14px;}}",
    "@media (prefers-reduced-motion:reduce){*{transition-duration:.01ms!important;animation-duration:.01ms!important;}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ===== Fade-in on arrival ============================================= */
  var fade = document.createElement("div");
  fade.id = "fgFade";
  function showFade(cb) { fade.classList.remove("gone"); if (cb) setTimeout(cb, 430); }
  function hideFade() { requestAnimationFrame(function () { fade.classList.add("gone"); }); }
  function mountFade() {
    if (document.body) { document.body.appendChild(fade); hideFade(); }
  }

  /* ===== Build the guide ================================================ */
  var ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
  var ARROWL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>';

  var R = 15, C = 2 * Math.PI * R;
  var pct = current.step / TOTAL_STEPS;

  var guide = document.createElement("div");
  guide.id = "fgGuide";
  guide.setAttribute("aria-label", "Catalogue guide");

  var stepsHtml = STEP_LABELS.map(function (label, i) {
    var n = i + 1;
    var state = n < current.step ? "done" : (n === current.step ? "active" : "");
    var locked = n > maxStep;
    var cls = "fg-step " + state + (locked ? " locked" : "");
    var dotInner = n < current.step ? "✓" : String(n);
    var lock = locked ? '<span class="fg-lock">🔒</span>' : "";
    return '<li class="' + cls + '" data-step="' + n + '" ' + (locked ? "" : 'role="button" tabindex="0"') + '>' +
             '<span class="fg-dot">' + dotInner + "</span>" +
             '<span class="fg-name">' + label + "</span>" + lock +
           "</li>";
  }).join("");

  guide.innerHTML =
    '<button id="fgPill" aria-label="Open guide">' +
      '<span id="fgRing">' +
        '<svg width="34" height="34" viewBox="0 0 34 34">' +
          '<circle class="fg-rtrack" cx="17" cy="17" r="' + R + '" fill="none" stroke-width="3"/>' +
          '<circle class="fg-rfill" cx="17" cy="17" r="' + R + '" fill="none" stroke-width="3" ' +
                  'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct)).toFixed(1) + '"/>' +
        "</svg>" +
        "<b>" + current.step + "</b>" +
      "</span>" +
      '<span id="fgPillText">' +
        '<span class="fg-now">' + STEP_LABELS[current.step - 1] + "</span>" +
        '<span class="fg-sub">Step ' + current.step + " of " + TOTAL_STEPS + "</span>" +
      "</span>" +
      (nextFile || current.cta ?
        '<button id="fgNext" aria-label="Next step">Next ' + ARROW + "</button>" :
        '<button id="fgNext" aria-label="Finish">Done</button>') +
    "</button>" +

    '<div id="fgPanel" role="dialog" aria-label="Where you are">' +
      '<div id="fgHead"><h4>Your progress</h4><button id="fgClose" aria-label="Close">×</button></div>' +
      '<p id="fgTip">' + current.tip + "</p>" +
      '<ul id="fgSteps">' + stepsHtml + "</ul>" +
      '<div id="fgBtns">' +
        '<button class="fg-btn fg-back' + (prevFile ? "" : " fg-hidden") + '" id="fgBack">' + ARROWL + " Back</button>" +
        '<button class="fg-btn fg-fwd" id="fgFwd">' + (nextFile || current.cta ? "Next " + ARROW : "Finish") + "</button>" +
      "</div>" +
    "</div>";

  /* ===== Behaviour ====================================================== */
  function carry(file) { return file + (location.search || ""); }

  function navTo(file) {
    showFade(function () { location.href = carry(file); });
  }

  /* Next: reuse the page's own button if it has one (keeps params/saving) */
  function goNext() {
    var cta = current.cta ? document.querySelector(current.cta) : null;
    if (cta) {
      if (cta.disabled) { pulseTip(); return; }
      cta.click();                       // page handles params + navigation + its own transitions
    } else if (nextFile) {
      navTo(nextFile);
    }
  }

  function goBack() { if (prevFile) navTo(prevFile); }

  function pulseTip() {
    var tip = guide.querySelector("#fgTip");
    if (!tip) return;
    open();
    tip.classList.remove("pulse");
    void tip.offsetWidth;
    tip.classList.add("pulse");
  }

  function open()  { guide.classList.add("open"); }
  function close() { guide.classList.remove("open"); }

  function wire() {
    guide.querySelector("#fgPill").addEventListener("click", function (e) {
      if (e.target.closest("#fgNext")) return;   // Next handled separately
      open();
    });
    guide.querySelector("#fgNext").addEventListener("click", function (e) { e.stopPropagation(); goNext(); });
    guide.querySelector("#fgClose").addEventListener("click", close);
    guide.querySelector("#fgFwd").addEventListener("click", goNext);
    var back = guide.querySelector("#fgBack");
    if (back) back.addEventListener("click", goBack);

    guide.querySelectorAll(".fg-step:not(.locked)").forEach(function (li) {
      var go = function () {
        var n = parseInt(li.getAttribute("data-step"), 10);
        if (n === current.step) { close(); return; }
        navTo(STEP_ENTRY[n]);
      };
      li.addEventListener("click", go);
      li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });

    /* Esc closes the panel */
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    /* Mirror the page CTA's enabled/disabled state on our Next buttons */
    var cta = current.cta ? document.querySelector(current.cta) : null;
    if (cta && "disabled" in cta) {
      var sync = function () {
        var off = !!cta.disabled;
        guide.querySelector("#fgNext").disabled = off;
        guide.querySelector("#fgFwd").disabled = off;
      };
      sync();
      new MutationObserver(sync).observe(cta, { attributes: true, attributeFilter: ["disabled", "class"] });
    }
  }

  function mount() {
    mountFade();
    document.body.appendChild(guide);
    wire();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
  /* Catch back/forward cache restores so the fade clears */
  window.addEventListener("pageshow", function () { hideFade(); });
})();
