/* ============================================================
   ASIJA — Personal Portfolio 2026
   Vanilla JS interactions & animations
   ============================================================ */

/* ---------- Data: edit these to update the site ---------- */
const SKILLS = [
  { name: "JavaScript / TypeScript", level: 95 },
  { name: "React & React Native", level: 90 },
  { name: "PHP & MySQL", level: 88 },
  { name: "Python", level: 90 },
  { name: "HTML & CSS", level: 98 },
  { name: "Node & REST APIs", level: 85 },
];

const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ---------- Render skills ---------- */
function renderSkills() {
  const list = document.getElementById("skillsList");
  if (!list) return;
  list.innerHTML = SKILLS.map(
    (s) => `
      <li class="skill reveal">
        <span class="skill__pct">${s.level}%</span>
        <span class="skill__track">
          <span class="skill__fill" style="width:${s.level}%"></span>
        </span>
        <span class="skill__name">${s.name}</span>
      </li>`
  ).join("");
}

/* ---------- Loader ---------- */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  const done = () => loader.classList.add("is-done");
  if (prefersReduced) {
    done();
    return;
  }
  window.addEventListener("load", () => setTimeout(done, 800));
  // Fallback in case load already fired
  setTimeout(done, 2000);
}

/* ---------- Custom cursor + magnetic buttons ---------- */
function initCursor() {
  const cursor = document.getElementById("cursor");
  const dot = document.getElementById("cursorDot");
  if (!cursor || !dot) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx;
  let cy = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  function loop() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  const hoverables = document.querySelectorAll(
    "a, button, [data-magnetic], [data-magnetic-card]"
  );
  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () =>
      cursor.classList.remove("is-hover")
    );
  });

  // Magnetic effect
  const magnets = document.querySelectorAll("[data-magnetic]");
  magnets.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

/* ---------- Hero word reveal + parallax grid ---------- */
function initHero() {
  const words = document.querySelectorAll(".hero__word");
  if (!prefersReduced) {
    words.forEach((w, i) => {
      setTimeout(() => w.classList.add("is-in"), 250 + i * 120);
    });
  } else {
    words.forEach((w) => w.classList.add("is-in"));
  }

  const grid = document.getElementById("heroGrid");
  if (grid && !prefersReduced) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        grid.style.transform = `translateY(${y * 0.15}px)`;
      },
      { passive: true }
    );
  }
}

/* ---------- Scroll reveal + skill bars ---------- */
function initReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");

        // Animate skill bar inside, if present
        const fill = entry.target.querySelector
          ? entry.target.querySelector(".skill__fill")
          : null;
        if (fill) {
          const level = fill.getAttribute("data-level");
          requestAnimationFrame(() => {
            fill.style.width = level + "%";
          });
        }

        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

/* ---------- Count-up stats ---------- */
function initCounters() {
  const nums = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10);
        const suffix = el.getAttribute("data-suffix") || "";
        if (prefersReduced) {
          el.textContent = target + suffix;
          io.unobserve(el);
          return;
        }
        const dur = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach((el) => io.observe(el));
}

/* ---------- Navbar: scrolled state, mobile menu, active link ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.querySelectorAll("[data-nav]");
  const sections = [...links]
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    },
    { passive: true }
  );

  // Mobile menu
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.forEach((l) =>
      l.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Active link on scroll
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        links.forEach((l) =>
          l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`)
        );
      });
    },
    { threshold: 0.4, rootMargin: "-20% 0px -40% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

/* ---------- Back to top ---------- */
function initToTop() {
  const btn = document.getElementById("toTop");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("is-visible", window.scrollY > 700);
    },
    { passive: true }
  );
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderSkills();

  requestAnimationFrame(() => {
    initReveal();
  });

  initLoader();
  initCursor();
  initHero();
  initCounters();
  initNav();
  initToTop();
});
