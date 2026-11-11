(() => {
  // Every post, newest first. The island at the top shows the first one and lists them all.
  // Add a new post here, and to index.html, posts.html, and search.html.
  const POSTS = [
    ['posts/moving-off-testflight.html', 'Moving My Apps Off TestFlight', 'Nov 11'],
    ['posts/folding-at-home.html', 'Folding@home on My Framework', 'Oct 19'],
    ['posts/building-cozy-crafter.html', 'Building Cozy Crafter', 'Oct 3'],
    ['posts/ai-for-good-mimecast.html', 'AI for Good at Mimecast', 'Oct 1'],
    ['posts/building-cozy-reader.html', 'Building Cozy Reader', 'Sep 29'],
    ['posts/building-gamelog.html', 'Building Gamelog', 'Sep 27'],
    ['posts/what-is-support-engineering.html', 'What is Support Engineering?', 'Sep 20'],
  ];

  const root = document.documentElement;
  // The site root, worked out from this script's own address, so links work from any folder.
  const home = new URL('..', document.currentScript.src);

  const button = document.querySelector('[data-theme-toggle]');
  function label() { button?.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'); }
  label();
  button?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('zv-theme', root.dataset.theme); } catch {}
    label();
  });

  const input = document.querySelector('#search');
  if (input) {
    const rows = [...document.querySelectorAll('[data-search-item]')];
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let count = 0;
      rows.forEach(row => { row.hidden = !row.textContent.toLowerCase().includes(query); if (!row.hidden) count++; });
      document.querySelector('#search-status').textContent = count ? `${count} ${count === 1 ? 'result' : 'results'}` : 'No matches. Try “homelab”, “AI”, or “apps”.';
    });
  }

  // Mark post tiles from the last 7 days as New. The pages are static, so this runs on each visit.
  for (const time of document.querySelectorAll('.tile time[datetime]')) {
    const days = (Date.now() - new Date(time.dateTime).getTime()) / 86400000;
    // A post dated today can read as slightly in the future west of UTC, so allow a day's slack.
    if (days > -1 && days < 7) time.append(Object.assign(document.createElement('span'), { className: 'tag new', textContent: 'New' }));
  }

  // The island (class notch).
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const notch = el('div', 'notch');
  const inner = el('div', 'notch-inner');
  const head = el('button', 'notch-head');
  head.type = 'button';
  head.setAttribute('aria-expanded', 'false');
  head.setAttribute('aria-controls', 'notch-list');
  const icon = el('span', 'notch-icon');
  icon.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 2.5h5M3.5 6h5M3.5 9.5h3"/></svg>';
  const line = el('span');
  line.append(el('em', '', 'Latest post · '), POSTS[0][1]);
  head.append(icon, line);
  const list = el('ul', 'notch-list');
  list.id = 'notch-list';
  list.setAttribute('aria-label', 'All posts');
  for (const [href, title, date] of POSTS) {
    const a = el('a', 'notch-row');
    a.href = new URL(href, home);
    a.append(el('span', 'notch-name', title), el('span', 'notch-val mono', date));
    const li = el('li');
    li.append(a);
    list.append(li);
  }
  inner.append(head, list);
  notch.append(inner);
  document.body.prepend(notch);

  const still = matchMedia('(prefers-reduced-motion: reduce)');
  function setOpen(open) {
    if (notch.classList.contains('open') === open) return;
    const from = inner.getBoundingClientRect();
    notch.classList.toggle('open', open);
    head.setAttribute('aria-expanded', open);
    const to = inner.getBoundingClientRect();
    if (still.matches || !inner.animate) return;
    // Grow or shrink the box between its two measured sizes.
    inner.animate(
      [{ width: `${from.width}px`, height: `${from.height}px` }, { width: `${to.width}px`, height: `${to.height}px` }],
      { duration: 300, easing: 'cubic-bezier(.32, .72, 0, 1)' },
    );
  }
  const isOpen = () => notch.classList.contains('open');
  // A mouse opens it on hover. Touch and keyboard use the button.
  if (matchMedia('(hover: hover)').matches) {
    notch.addEventListener('mouseenter', () => setOpen(true));
    notch.addEventListener('mouseleave', () => setOpen(false));
  }
  head.addEventListener('click', () => setOpen(!isOpen() || matchMedia('(hover: hover)').matches));
  document.addEventListener('click', (e) => { if (!notch.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { setOpen(false); head.focus(); } });
  notch.addEventListener('focusout', (e) => { if (!notch.contains(e.relatedTarget)) setOpen(false); });
})();
