(() => {
  "use strict";

  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector(".menu");
  const serviceDrop = document.querySelector(".navdrop");
  const serviceButton = serviceDrop?.querySelector(":scope > button");

  // Header state
  const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  function closeServices(){
    serviceDrop?.classList.remove("open");
    serviceButton?.setAttribute("aria-expanded","false");
  }

  function closeMenu(){
    body.classList.remove("mobile-open");
    menu?.classList.remove("is-open");
    menu?.setAttribute("aria-expanded","false");
    menu?.setAttribute("aria-label","Open menu");
    closeServices();
  }

  menu?.addEventListener("click", () => {
    const open = !body.classList.contains("mobile-open");
    body.classList.toggle("mobile-open", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if(!open) closeServices();
  });

  serviceButton?.addEventListener("click", e => {
    e.preventDefault();
    const open = !serviceDrop.classList.contains("open");
    serviceDrop.classList.toggle("open", open);
    serviceButton.setAttribute("aria-expanded", String(open));
  });

  // On phones, Services is deliberately a simple 3-route picker.
  // The desktop mega-menu remains fully interactive and unchanged.
  serviceDrop?.querySelectorAll(".mega-group").forEach(group => {
    group.addEventListener("click", e => {
      if(!window.matchMedia("(max-width: 800px)").matches) return;
      if(e.target.closest("a")) return;
      const route = group.classList.contains("compete")
        ? "proposal-development.html"
        : group.classList.contains("build")
          ? "recruitment.html"
          : group.classList.contains("grow")
            ? "services.html#grow"
            : null;
      if(route) window.location.href = route;
    });
  });

  document.addEventListener("click", e => {
    if(serviceDrop && !serviceDrop.contains(e.target)) closeServices();
    if(e.target.closest(".navlinks a") && window.matchMedia("(max-width: 980px)").matches) closeMenu();
    if(body.classList.contains("mobile-open") && !e.target.closest(".navlinks") && !e.target.closest(".menu")) closeMenu();
  });

  document.addEventListener("keydown", e => {
    if(e.key === "Escape") closeMenu();
  });

  // If the viewport changes from phone/tablet to desktop, never leave the
  // document locked in the mobile-navigation state.
  window.addEventListener("resize", () => {
    if(window.innerWidth > 980 && body.classList.contains("mobile-open")) closeMenu();
  }, {passive:true});

  // Scroll reveal
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduceMotion && "IntersectionObserver" in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:"0px 0px -30px"});
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }

  // Subtle pointer lift for premium cards — disabled on touch/reduced motion.
  if(!reduceMotion && window.matchMedia("(pointer:fine)").matches){
    document.querySelectorAll(".bento,.route-card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        card.style.transform = `perspective(900px) rotateX(${y*-1.2}deg) rotateY(${x*1.2}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });
  }

  // Meeting panel (preserves the existing component where present)
  const meeting = document.querySelector("#meetingPanel");
  let lastFocus = null;
  function openMeeting(){
    if(!meeting) return;
    lastFocus = document.activeElement;
    meeting.classList.add("open");
    meeting.setAttribute("aria-hidden","false");
    body.classList.add("no-scroll");
    meeting.querySelector(".close")?.focus();
  }
  function closeMeeting(){
    if(!meeting) return;
    meeting.classList.remove("open");
    meeting.setAttribute("aria-hidden","true");
    body.classList.remove("no-scroll");
    lastFocus?.focus?.();
  }
  document.querySelectorAll("[data-meeting]").forEach(b => b.addEventListener("click", openMeeting));
  document.querySelectorAll("[data-close-meeting]").forEach(b => b.addEventListener("click", closeMeeting));
  meeting?.addEventListener("click", e => { if(e.target === meeting) closeMeeting(); });

  // Cookie banner
  const cookie = document.querySelector("#cookieBanner");
  if(cookie && !localStorage.getItem("alioth_cookie_ack")) cookie.classList.add("show");
  document.querySelectorAll("[data-cookie]").forEach(b => b.addEventListener("click", () => {
    localStorage.setItem("alioth_cookie_ack","1");
    cookie?.classList.remove("show");
  }));

  // Tender upload validation
  const file = document.querySelector("#tenderFile");
  const fileName = document.querySelector("#fileName");
  file?.addEventListener("change", () => {
    const f = file.files?.[0];
    if(!f){ if(fileName) fileName.textContent="No file selected."; return; }
    const allowed = ["pdf","doc","docx","xls","xlsx","zip"];
    const ext = f.name.split(".").pop().toLowerCase();
    if(!allowed.includes(ext) || f.size > 15*1024*1024){
      alert("Please choose a PDF, DOC, DOCX, XLS, XLSX or ZIP file under 15 MB.");
      file.value="";
      if(fileName) fileName.textContent="No file selected.";
      return;
    }
    if(fileName) fileName.textContent = `${f.name} · ${(f.size/1024/1024).toFixed(2)} MB`;
  });

  document.querySelectorAll("form[data-validate]").forEach(form =>
    form.addEventListener("submit", e => {
      if(!form.checkValidity()){ e.preventDefault(); form.reportValidity(); }
    })
  );

  // Preserve route preselection for contact page
  const params = new URLSearchParams(location.search);
  const route = params.get("route");
  const select = document.querySelector("#route");
  if(select && route){
    const map = {proposal:"proposal", recruitment:"recruitment", grow:"grow", "just-talk":"just"};
    const target = map[route];
    if(target){
      [...select.options].some(opt => {
        const match = (opt.value+" "+opt.textContent).toLowerCase().includes(target);
        if(match){ select.value=opt.value; return true; }
        return false;
      });
    }
  }
})();