(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileMenu();
    initMegaMenu();
    initScrollReveal();
    initPointerLift();
    initFormValidation();
    initCookieBanner();
    initMeetingPanel();
    initTenderFile();
    initRoutePreselect();
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header background on scroll ---------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 12) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile hamburger menu ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("primary-navigation");
    if (!toggle || !nav) return;

    function closeAll() {
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.classList.remove("mobile-open");
      var drop = document.querySelector("[data-navdrop]");
      if (drop) {
        drop.classList.remove("open");
        var btn = drop.querySelector("[data-services-toggle]");
        var menu = document.getElementById("services-menu");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (menu) menu.setAttribute("aria-hidden", "true");
      }
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("mobile-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      if (!isOpen) closeAll();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeAll();
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });

    // Close the mobile menu after following a link
    nav.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (link) closeAll();
    });
  }

  /* ---------- Services mega menu (hover on desktop, click on mobile) ---------- */
  function initMegaMenu() {
    var drop = document.querySelector("[data-navdrop]");
    if (!drop) return;
    var btn = drop.querySelector("[data-services-toggle]");
    var menu = document.getElementById("services-menu");

    function open() {
      drop.classList.add("open");
      if (btn) btn.setAttribute("aria-expanded", "true");
      if (menu) menu.setAttribute("aria-hidden", "false");
    }
    function close() {
      drop.classList.remove("open");
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (menu) menu.setAttribute("aria-hidden", "true");
    }

    drop.addEventListener("mouseenter", function () {
      if (window.innerWidth > 980) open();
    });
    drop.addEventListener("mouseleave", function () {
      if (window.innerWidth > 980) close();
    });

    if (btn) {
      btn.addEventListener("click", function () {
        if (window.innerWidth <= 980) {
          if (drop.classList.contains("open")) close(); else open();
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Subtle pointer-tilt on cards ---------- */
  function initPointerLift() {
    if (reduceMotion || !window.matchMedia("(pointer:fine)").matches) return;
    var cards = document.querySelectorAll(".bento, .route-card");
    cards.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (y * -1.2) + "deg) rotateY(" + (x * 1.2) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Native form validation on submit ---------- */
  function initFormValidation() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        if (!form.checkValidity()) {
          e.preventDefault();
          form.reportValidity();
        }
      });
    });
  }

  /* ---------- Cookie banner ---------- */
  function initCookieBanner() {
    var cookie = document.getElementById("cookieBanner");
    if (!cookie) return;
    try {
      if (!localStorage.getItem("alioth_cookie_ack")) cookie.classList.add("show");
    } catch (e) {
      cookie.classList.add("show");
    }
    cookie.querySelectorAll("[data-cookie]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem("alioth_cookie_ack", "1"); } catch (e) {}
        cookie.classList.remove("show");
      });
    });
  }

  /* ---------- "Start a meeting" panel ---------- */
  function initMeetingPanel() {
    var panel = document.getElementById("meetingPanel");
    if (!panel) return;

    function openPanel() {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    }
    function closePanel() {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    }

    document.addEventListener("click", function (e) {
      var target = e.target;
      if (target.closest && target.closest("[data-meeting]")) {
        e.preventDefault();
        openPanel();
      }
      if (target.closest && target.closest("[data-close-meeting]")) {
        closePanel();
      }
      if (target.id === "meetingPanel") {
        closePanel();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });
  }

  /* ---------- Tender file input: show selected filename + basic validation ---------- */
  function initTenderFile() {
    var file = document.getElementById("tenderFile");
    var fileName = document.getElementById("fileName");
    if (!file) return;

    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      if (!f) {
        if (fileName) fileName.textContent = "No file selected.";
        return;
      }
      var allowed = ["pdf", "doc", "docx", "xls", "xlsx", "zip"];
      var ext = (f.name.split(".").pop() || "").toLowerCase();
      if (allowed.indexOf(ext) === -1 || f.size > 15 * 1024 * 1024) {
        alert("Please choose a PDF, DOC, DOCX, XLS, XLSX or ZIP file under 15 MB.");
        file.value = "";
        if (fileName) fileName.textContent = "No file selected.";
        return;
      }
      if (fileName) {
        fileName.textContent = f.name + " \u00B7 " + (f.size / 1024 / 1024).toFixed(2) + " MB";
      }
    });
  }

  /* ---------- Pre-select the contact form "route" dropdown from ?route= ---------- */
  function initRoutePreselect() {
    var params = new URLSearchParams(window.location.search);
    var route = params.get("route");
    var select = document.getElementById("route");
    if (!select || !route || select.tagName !== "SELECT") return;

    var map = { proposal: "proposal", recruitment: "recruitment", grow: "grow", "just-talk": "just" };
    var target = map[route];
    if (!target) return;

    for (var i = 0; i < select.options.length; i++) {
      var opt = select.options[i];
      var text = (opt.value + " " + opt.textContent).toLowerCase();
      if (text.indexOf(target) !== -1) {
        select.value = opt.value;
        break;
      }
    }
  }
})();
