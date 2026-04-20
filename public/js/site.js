/* ============================================================
   site.js — Main logic for the personal portfolio
   ============================================================ */

// ─── Theme Toggle ──────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const iconSun  = themeToggle.querySelector('.icon-sun');
const iconMoon = themeToggle.querySelector('.icon-moon');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  iconSun.style.display  = theme === 'dark' ? 'block' : 'none';
  iconMoon.style.display = theme === 'light' ? 'block' : 'none';
}

// Respect saved preference or system preference
const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});


// ─── Mobile Nav ────────────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});


// ─── Scroll Reveal ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ─── Smooth scroll for anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ─── Data: Projects ────────────────────────────────────────
// This is the central data store. To add a new project, just add
// an object to this array. Every field is optional except title.
//
// Supported fields:
//   title       (string)  — Project name
//   type        (string)  — Category label, e.g. "Software", "Research", "VR", "Design", "Writing"
//   description (string)  — Short description (1-2 sentences)
//   tags        (array)   — Tech/tool tags
//   thumbnail   (string)  — Path to thumbnail image (relative to root, e.g. "assets/projects/my-project.jpg")
//   link        (string)  — URL to live project, repo, or detail page
//   date        (string)  — Date or year
//   file        (string)  — Path to an attached file (PDF, etc.) in the projects/ folder
//
const projects = [
  {
    title: "Sample Project One",
    type: "Software",
    description: "A full-stack web application built to demonstrate what a project card looks like on this portfolio. Replace this with your real work.",
    tags: ["JavaScript", "Node.js", "PostgreSQL"],
    thumbnail: "",
    link: "#",
    date: "2026"
  },
  {
    title: "Research Paper Example",
    type: "Research",
    description: "An example research entry. Link to a PDF, a journal page, or a detailed write-up. Any format works.",
    tags: ["Machine Learning", "Python", "LaTeX"],
    thumbnail: "",
    link: "#",
    date: "2025",
    file: "projects/sample-project/README.md"
  },
  {
    title: "VR Experience Demo",
    type: "Creative",
    description: "A virtual reality experience showcasing immersive interaction design. This card demonstrates the flexibility of the portfolio system.",
    tags: ["Unity", "C#", "VR", "3D"],
    thumbnail: "",
    link: "#",
    date: "2025"
  },
  {
    title: "Design System",
    type: "Design",
    description: "A comprehensive design system with components, tokens, and documentation. Shows how design work can live alongside code.",
    tags: ["Figma", "Design Tokens", "CSS"],
    thumbnail: "",
    link: "#",
    date: "2024"
  }
];


// ─── Data: Resume ──────────────────────────────────────────
const experience = [
  {
    date: "2024 — Present",
    role: "Your Current Role",
    company: "Company or Organization",
    description: "Describe what you do, what you've built, and the impact you've made. Keep it concise but specific."
  },
  {
    date: "2022 — 2024",
    role: "Previous Role",
    company: "Previous Company",
    description: "What you accomplished here. Mention key projects, technologies used, and measurable outcomes."
  },
  {
    date: "2020 — 2022",
    role: "Earlier Role or Education",
    company: "University or Organization",
    description: "Relevant education, internships, or early career experience. Highlight what set the foundation for your work."
  }
];

const skills = [
  "JavaScript / TypeScript",
  "Python",
  "React & Next.js",
  "Node.js",
  "Machine Learning",
  "UI/UX Design",
  "Unity / VR Development",
  "Technical Writing",
  "Data Analysis",
  "Project Management"
];


// ─── Data: Blog ────────────────────────────────────────────
const blogPosts = [
  {
    title: "Your First Blog Post Title",
    date: "March 2026",
    excerpt: "A short preview of the article. This is where the first couple of sentences appear to give readers a reason to click through.",
    link: "#"
  },
  {
    title: "Another Article Example",
    date: "February 2026",
    excerpt: "Blog posts can link to external platforms (Medium, Substack), or to HTML pages you host right in the /blog folder.",
    link: "#"
  },
  {
    title: "Thoughts on Building in Public",
    date: "January 2026",
    excerpt: "Reflections on sharing work openly, the feedback loop it creates, and why transparency accelerates growth.",
    link: "#"
  }
];


// ─── Render: Projects ──────────────────────────────────────
const projectsGrid = document.getElementById('projectsGrid');
const filterBar    = document.getElementById('filterBar');

function renderProjects(filter = 'all') {
  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.type.toLowerCase() === filter.toLowerCase());

  projectsGrid.innerHTML = filtered.map(p => `
    <a href="${p.link || '#'}" class="project-card reveal" ${p.link && p.link !== '#' ? 'target="_blank"' : ''}>
      ${p.thumbnail
        ? `<div class="project-card-thumb"><img src="${p.thumbnail}" alt="${p.title}"></div>`
        : `<div class="project-card-thumb">${p.type || 'Project'}</div>`
      }
      <div class="project-card-type">
        <span class="dot"></span>
        ${p.type || 'Project'}${p.date ? ' — ' + p.date : ''}
      </div>
      <h3 class="project-card-title">${p.title}</h3>
      <p class="project-card-desc">${p.description || ''}</p>
      <div class="project-card-tags">
        ${(p.tags || []).map(t => `<span>${t}</span>`).join('')}
      </div>
      <div class="project-card-arrow">
        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/>
        </svg>
      </div>
    </a>
  `).join('');

  // Re-observe new elements
  projectsGrid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Build filter buttons from project types
function buildFilters() {
  const types = [...new Set(projects.map(p => p.type).filter(Boolean))];
  types.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = type.toLowerCase();
    btn.textContent = type;
    filterBar.appendChild(btn);
  });
}

// Filter click handler
filterBar.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;
  filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  renderProjects(e.target.dataset.filter);
});

buildFilters();
renderProjects();


// ─── Render: Resume ────────────────────────────────────────
const timeline   = document.getElementById('timeline');
const skillsGrid = document.getElementById('skillsGrid');

timeline.innerHTML = experience.map(e => `
  <div class="timeline-item reveal">
    <span class="timeline-date">${e.date}</span>
    <h3 class="timeline-role">${e.role}</h3>
    <span class="timeline-company">${e.company}</span>
    <p class="timeline-desc">${e.description}</p>
  </div>
`).join('');

skillsGrid.innerHTML = skills.map(s => `
  <div class="skill-item reveal">${s}</div>
`).join('');


// ─── Render: Blog ──────────────────────────────────────────
const blogGrid = document.getElementById('blogGrid');

blogGrid.innerHTML = blogPosts.map(p => `
  <a href="${p.link || '#'}" class="blog-card reveal" ${p.link && p.link !== '#' ? 'target="_blank"' : ''}>
    <span class="blog-card-date">${p.date}</span>
    <h3 class="blog-card-title">${p.title}</h3>
    <p class="blog-card-excerpt">${p.excerpt}</p>
    <span class="blog-card-link">
      Read More
      <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
      </svg>
    </span>
  </a>
`).join('');


// ─── Re-observe all dynamically added .reveal elements ────
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ─── Nav background on scroll ─────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 50 ? 'var(--border)' : 'transparent';
});


// ─── Cursor glow effect (subtle, Palantir-inspired) ───────
const glow = document.createElement('div');
glow.style.cssText = `
  position: fixed; pointer-events: none; z-index: 9997;
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
  opacity: 0;
`;
document.body.appendChild(glow);

document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
  glow.style.opacity = '1';
});
document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
