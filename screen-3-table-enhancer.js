(() => {
  const frame = document.getElementById('menu-frame');
  if (!frame) return;

  const TABLE_CSS = `
    .retail-bulk-table{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
      column-gap:24px!important;
      row-gap:0!important;
      width:100%!important;
      align-items:start!important;
      break-inside:avoid!important;
    }
    .retail-bulk-table > .category-head,
    .retail-bulk-table > .category-intro,
    .retail-bulk-table > .protein-banner{
      grid-column:1 / -1!important;
    }
    .retail-bulk-table > .item{
      min-width:0!important;
      width:100%!important;
      margin:0!important;
    }
    .retail-bulk-table > .item .top{
      min-width:0!important;
      width:100%!important;
    }
    .retail-bulk-table > .item .name{
      white-space:normal!important;
      min-width:0!important;
    }
    .retail-bulk-table > .item .dots{
      min-width:8px!important;
    }
    .retail-bulk-table > .item .price{
      flex:0 0 auto!important;
    }
  `;

  function normalize(s){
    return String(s || '').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function findContainer(title){
    let node = title.parentElement;
    while (node && node !== title.ownerDocument.body) {
      const directItems = Array.from(node.children || []).filter(el => el.classList && el.classList.contains('item'));
      if (directItems.length >= 2) return node;
      node = node.parentElement;
    }
    return null;
  }

  function apply(doc) {
    if (!doc || !doc.head || !doc.body) return false;

    if (!doc.getElementById('screen-3-retail-bulk-table-style')) {
      const style = doc.createElement('style');
      style.id = 'screen-3-retail-bulk-table-style';
      style.textContent = TABLE_CSS;
      doc.head.appendChild(style);
    }

    let applied = false;
    doc.querySelectorAll('.category-title, h2').forEach(title => {
      const name = normalize(title.textContent);
      if (!(name === 'retail / bulk' || name === 'retail/bulk' || name === 'retail & bulk' || name === 'bulk')) return;
      const container = findContainer(title);
      if (!container) return;
      container.classList.add('retail-bulk-table');
      container.dataset.retailBulkTable = '2-column';
      applied = true;
    });

    return applied;
  }

  function activate() {
    let doc;
    try { doc = frame.contentDocument || frame.contentWindow.document; } catch (_) { return; }
    if (!doc) return;

    apply(doc);

    if (doc.body && !doc.body.dataset.retailBulkObserver) {
      doc.body.dataset.retailBulkObserver = '1';
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

    [100, 300, 700, 1200, 2200, 4000].forEach(ms => setTimeout(() => apply(doc), ms));
  }

  frame.addEventListener('load', activate);
  if (frame.contentDocument && frame.contentDocument.readyState !== 'loading') activate();
})();
