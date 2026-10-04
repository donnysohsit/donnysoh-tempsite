/* Portfolio — vanilla JS. No dependencies, no build step. */
(function () {
  'use strict';

  var GITHUB_USER = 'donnysohsit';
  var REPOS_URL =
    'https://api.github.com/users/' + GITHUB_USER +
    '/repos?sort=updated&per_page=12';

  /* ---------- theme toggle ---------- */
  // The inline script in index.html has already applied any saved choice;
  // this only wires up the button and keeps the label in sync.
  var themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    var body = document.body;

    var prefersDark = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

    function isDark() {
      if (body.classList.contains('dark')) return true;
      if (body.classList.contains('light')) return false;
      return !!(prefersDark && prefersDark.matches);
    }

    function syncButton() {
      var dark = isDark();
      themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      themeToggle.querySelector('.theme-toggle__icon').textContent =
        dark ? '☀' : '☾';           // sun when dark, moon when light
      themeToggle.querySelector('.theme-toggle__label').textContent =
        dark ? 'Light mode' : 'Dark mode';
      themeToggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }

    themeToggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';

      // 'dark' is the class the styles key off; 'light' is what lets an
      // explicit light choice override a dark system preference.
      body.classList.toggle('dark', next === 'dark');
      body.classList.toggle('light', next === 'light');

      try {
        sessionStorage.setItem('theme', next);
      } catch (e) {
        // Private mode or blocked storage: the choice still applies to this page.
      }

      syncButton();
    });

    // Follow the system preference until the visitor picks a side.
    if (prefersDark && prefersDark.addEventListener) {
      prefersDark.addEventListener('change', function () {
        if (!body.classList.contains('dark') && !body.classList.contains('light')) {
          syncButton();
        }
      });
    }

    syncButton();
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- nav active state ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__list a[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle(
            'is-active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- back to top ---------- */
  // Shown once the hero has scrolled out of view above the viewport.
  var backToTop = document.getElementById('back-to-top');
  var hero = document.getElementById('hero');

  if (backToTop && hero) {
    var ticking = false;

    function syncBackToTop() {
      ticking = false;
      backToTop.classList.toggle('is-visible', hero.getBoundingClientRect().bottom <= 0);
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncBackToTop);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      // html { scroll-behavior } makes this smooth, or instant under
      // prefers-reduced-motion.
      window.scrollTo(0, 0);
    });

    syncBackToTop();
  }

  /* ---------- repositories ---------- */
  var grid = document.getElementById('repos-grid');
  var status = document.getElementById('repos-status');
  if (!grid || !status) return;

  // A few common languages get a recognisable dot colour; the rest fall back
  // to the muted text colour set in CSS.
  var LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572a5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    'Jupyter Notebook': '#da5b0b',
    Java: '#b07219',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Go: '#00add8',
    Rust: '#dea584',
    Shell: '#89e051',
    Ruby: '#701516',
    PHP: '#4f5d95',
    Swift: '#f05138',
    Kotlin: '#a97bff',
    R: '#198ce7',
    Dart: '#00b4ab',
    Vue: '#41b883'
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildCard(repo) {
    var card = el('article', 'card');

    card.appendChild(el('h3', 'card__title', repo.name));

    card.appendChild(
      el('p', 'card__body', repo.description || 'No description provided.')
    );

    var meta = el('div', 'card__meta');

    if (repo.language) {
      var lang = el('span');
      var dot = el('span', 'lang-dot');
      if (LANG_COLORS[repo.language]) {
        dot.style.background = LANG_COLORS[repo.language];
      }
      lang.appendChild(dot);
      lang.appendChild(document.createTextNode(repo.language));
      meta.appendChild(lang);
    }

    var stars = repo.stargazers_count || 0;
    var starEl = el('span');
    starEl.appendChild(document.createTextNode('★ ' + stars));
    starEl.setAttribute(
      'aria-label', stars === 1 ? '1 star' : stars + ' stars'
    );
    meta.appendChild(starEl);

    if (meta.childNodes.length) card.appendChild(meta);

    var link = el('a', 'card__link', 'View on GitHub →');
    link.href = repo.html_url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'View ' + repo.name + ' on GitHub');
    card.appendChild(link);

    return card;
  }

  function showMessage(message) {
    status.hidden = false;
    status.textContent = message;
  }

  fetch(REPOS_URL, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (response) {
      if (!response.ok) throw new Error('GitHub responded with ' + response.status);
      return response.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos) || repos.length === 0) {
        showMessage('No public repositories to show right now.');
        return;
      }

      var fragment = document.createDocumentFragment();
      repos.forEach(function (repo) { fragment.appendChild(buildCard(repo)); });
      grid.appendChild(fragment);

      status.hidden = true;
    })
    .catch(function (error) {
      if (window.console && console.warn) {
        console.warn('[portfolio] Could not load repositories:', error);
      }
      showMessage(
        'Repositories could not be loaded right now. ' +
        'You can browse them directly at github.com/' + GITHUB_USER + '.'
      );
    });
})();
