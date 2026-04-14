/* SouthWest Renovations & Joinery — site behaviour */

/* —— loadIncludes —— */
async function loadIncludes() {
  const headerPh = document.getElementById("header-placeholder");
  const footerPh = document.getElementById("footer-placeholder");
  if (!headerPh || !footerPh) return;

  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch("includes/header.html"),
      fetch("includes/footer.html"),
    ]);
    if (headerRes.ok) {
      headerPh.innerHTML = await headerRes.text();
    }
    if (footerRes.ok) {
      footerPh.innerHTML = await footerRes.text();
    }
  } catch (e) {
    /* Network or file:// may fail; page still usable */
  }

  initNav();
  setActiveNavLink();
}

/* —— initNav —— */
function initNav() {
  const header = document.querySelector(".header");
  const burger = document.querySelector(".header__burger");
  const drawer = document.querySelector(".nav-drawer");
  const overlay = document.querySelector(".nav-overlay");
  const drawerLinks = document.querySelectorAll(".nav-drawer__link[href], .nav-drawer__cta");

  function closeDrawer() {
    document.body.classList.remove("nav-open");
    burger?.classList.remove("is-open");
    drawer?.classList.remove("is-open");
    overlay?.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
  }

  function openDrawer() {
    document.body.classList.add("nav-open");
    burger?.classList.add("is-open");
    drawer?.classList.add("is-open");
    overlay?.classList.add("is-open");
    burger?.setAttribute("aria-expanded", "true");
  }

  function toggleDrawer() {
    if (drawer?.classList.contains("is-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  burger?.addEventListener("click", toggleDrawer);
  overlay?.addEventListener("click", closeDrawer);
  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  let ticking = false;
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();
}

/* —— setActiveNavLink —— */
function setActiveNavLink() {
  const path = window.location.pathname || "";
  let file = path.split("/").pop() || "";
  if (!file || !file.includes(".")) {
    file = "index.html";
  }
  const normalized = file;
  const serviceFiles = new Set([
    "services.html",
    "custom-cabinetry-design-install.html",
    "kitchen-renovations.html",
    "bathroom-renovations.html",
    "whole-home-renovations-extensions.html",
    "decks-outdoor-areas.html",
  ]);

  document.querySelectorAll(".header__link, .header__sublink, .nav-drawer__link").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    const linkFile = href.split("/").pop();
    if (linkFile === normalized || (normalized === "" && linkFile === "index.html")) {
      link.classList.add("is-active");
    }
  });

  if (serviceFiles.has(normalized)) {
    document.querySelectorAll("[data-nav-services]").forEach((link) => {
      link.classList.add("is-active");
    });
    document.querySelectorAll(".nav-drawer__group").forEach((group) => {
      group.setAttribute("open", "");
    });
  }
}

/* —— initSmoothScroll —— */
function initSmoothScroll() {
  if (window.__swrjSmoothScroll) return;
  window.__swrjSmoothScroll = true;
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = document.querySelector(".header")?.offsetHeight || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
    window.scrollTo({ top, behavior: "smooth" });
  });
}

/* —— initScrollAnimations —— */
function initScrollAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
  document.querySelectorAll(".animate-stagger").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      observer.observe(child);
    });
  });
}

/* —— initCounters —— */
function initCounters() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".stat-number").forEach((el) => {
      el.textContent = el.dataset.target + (el.dataset.suffix || "");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        const decimals = parseInt(el.dataset.decimals, 10) || 0;
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent =
            (target * eased).toFixed(decimals) + (progress === 1 ? suffix : "");
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".stat-number").forEach((el) => observer.observe(el));
}

/* —— initCallBar —— */
function initCallBar() {
  const bar = document.querySelector(".call-bar");
  if (!bar) return;

  const storageKey = "swrj_call_bar_dismissed";
  if (sessionStorage.getItem(storageKey) === "1") {
    bar.classList.remove("is-visible");
    return;
  }

  window.setTimeout(() => {
    bar.classList.add("is-visible");
  }, 2000);

  const dismiss = bar.querySelector(".call-bar__dismiss");
  dismiss?.addEventListener("click", () => {
    sessionStorage.setItem(storageKey, "1");
    bar.classList.remove("is-visible");
  });
}

/* —— initContactForm —— */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const success = document.getElementById("contactSuccess");
  if (!success) return;
  const phoneEl = document.querySelector("[data-site-phone-display]");
  const displayPhone = phoneEl?.getAttribute("data-site-phone-display") || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll(".form-group").forEach((g) => g.classList.remove("is-invalid"));
    success?.classList.remove("is-visible");

    const name = form.querySelector("#contactName");
    const email = form.querySelector("#contactEmail");
    const phone = form.querySelector("#contactPhone");
    const service = form.querySelector("#contactService");
    const message = form.querySelector("#contactMessage");

    function markInvalid(field) {
      valid = false;
      field?.closest(".form-group")?.classList.add("is-invalid");
    }

    if (!name?.value.trim()) markInvalid(name);
    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      markInvalid(email);
    }
    if (!phone?.value.trim()) markInvalid(phone);
    if (!service?.value) markInvalid(service);
    if (!message?.value.trim()) markInvalid(message);

    if (!valid) return;

    success.textContent =
      "Thanks — we'll be in touch soon! For urgent jobs call " +
      displayPhone +
      " directly.";
    success.classList.add("is-visible");
    form.reset();
  });
}

/* —— initFaq —— */
function initFaq() {
  /* FAQ accordion uses native <details>/<summary> with CSS max-height transitions on .faq__answer. */
}

/* —— DOM ready —— */
document.addEventListener("DOMContentLoaded", () => {
  loadIncludes();
  initSmoothScroll();
  initScrollAnimations();
  initCounters();
  initCallBar();
  initContactForm();
  initFaq();
});
