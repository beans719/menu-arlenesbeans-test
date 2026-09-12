(() => {
  const frame = document.getElementById('menu-frame');
  if (!frame) return;

  const BADGE_CSS = `
    .gf-friendly-badge{
      display:inline-flex!important;
      align-items:center;
      justify-content:center;
      vertical-align:middle;
      margin-left:4px;
      padding:1px 5px 1.5px;
      min-width:23px;
      border:1px solid rgba(87,105,74,.68);
      border-radius:999px;
      background:rgba(87,105,74,.10);
      color:#57694A!important;
      font-family:'Work Sans',Segoe UI,Arial,sans-serif;
      font-size:.78em!important;
      line-height:1.05!important;
      font-weight:700!important;
      letter-spacing:.045em;
      white-space:nowrap;
    }
    .gf-friendly-badge::before{
      content:'';
      display:inline-block;
      width:5px;
      height:8px;
      margin-right:3px;
      border-radius:80% 0 80% 0;
      background:#57694A;
      transform:rotate(-32deg);
      opacity:.9;
    }
  `;

  function badge(doc) {
    const el = doc.createElement('span');
    el.className = 'gf-friendly-badge';
    el.textContent = 'GF';
    el.title = 'Gluten Friendly';
    el.setAttribute('aria-label', 'Gluten Friendly');
    return el;
  }

  function transformTextNode(node, doc) {
    const text = node.nodeValue || '';
    if (!/\(\s*GF\s*\)/i.test(text)) return;
    const parent = node.parentElement;
    if (!parent || parent.closest('.gf-friendly-badge,script,style,noscript,textarea')) return;

    const parts = text.split(/(\(\s*GF\s*\))/ig);
    if (parts.length < 2) return;
    const frag = doc.createDocumentFragment();
    for (const part of parts) {
      if (/^\(\s*GF\s*\)$/i.test(part)) frag.appendChild(badge(doc));
      else if (part) frag.appendChild(doc.createTextNode(part));
    }
    node.replaceWith(frag);
  }

  function apply(doc) {
    if (!doc || !doc.head || !doc.body) return;
    if (!doc.getElementById('gf-friendly-test-style')) {
      const style = doc.createElement('style');
      style.id = 'gf-friendly-test-style';
      style.textContent = BADGE_CSS;
      doc.head.appendChild(style);
    }

    doc.querySelectorAll('.dietary').forEach(el => {
      const normalized = (el.textContent || '').replace(/[()\s]/g, '').toUpperCase();
      if (normalized === 'GF' && !el.classList.contains('gf-friendly-badge')) {
        el.textContent = 'GF';
        el.classList.add('gf-friendly-badge');
        el.title = 'Gluten Friendly';
        el.setAttribute('aria-label', 'Gluten Friendly');
      }
    });

    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let current;
    while ((current = walker.nextNode())) nodes.push(current);
    nodes.forEach(node => transformTextNode(node, doc));
  }

  function activate() {
    let doc;
    try { doc = frame.contentDocument || frame.contentWindow.document; } catch (_) { return; }
    if (!doc) return;
    apply(doc);
    if (doc.body) {
      let scheduled = false;
      const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          apply(doc);
        });
      });
      observer.observe(doc.body, { childList:true, subtree:true, characterData:true });
    }
    [250, 750, 1500, 3000].forEach(ms => setTimeout(() => apply(doc), ms));
  }

  frame.addEventListener('load', activate);
  if (frame.contentDocument?.readyState === 'complete') activate();
})();
