
(() => {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  function label() { button?.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
  label();
  button?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
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
      document.querySelector('#search-status').textContent = count ? `${count} ${count === 1 ? 'result' : 'results'}` : 'No matches. Try “homelab”, “AI”, or “tools”.';
    });
  }
  const faq = document.querySelector('[data-faq]');
  const faqToggle = document.querySelector('[data-faq-toggle]');
  if (faq && faqToggle) {
    const items = [...faq.querySelectorAll('details')];
    const sync = () => {
      const allOpen = items.every(item => item.open);
      const text = allOpen ? 'Collapse all questions' : 'Expand all questions';
      faqToggle.setAttribute('aria-expanded', allOpen);
      faqToggle.setAttribute('aria-label', text);
      faqToggle.title = text;
    };
    faqToggle.addEventListener('click', () => {
      const open = !items.every(item => item.open);
      items.forEach(item => { item.open = open; });
      sync();
    });
    faq.addEventListener('toggle', sync, true);
    faqToggle.hidden = false;
    sync();
  }
})();
