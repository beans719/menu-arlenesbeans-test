(() => {
  const frame = document.getElementById('menu-frame');
  if (!frame) return;

  const TABLE_CSS = `
    .retail-bulk-table{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
      column-gap:20px!important;
      row-gap:0!important;
      width:100%!important;
      break-inside:avoid!important;
      align-items:start!important;
    }
    .retail-bulk-table > .category-head{
      grid-column:1 / -1!important;
    }
    .retail-bulk-table > .category-intro,
    .retail-bulk-table > .protein-banner{
      grid-column:1 / -1!important;
    }
    .retail-bulk-table > .item{
      min-width:0!important;
      margin:0!important;
    }
    .retail-bulk-table > .item .top{
      min-width:0!important;
    }
    .retail-bulk-table > .item .name{
      white-space:normal!important;
    }
    .retail-bulk-table > .item .price{
      flex:0 0 auto!important;
    }
  `;

  function apply(doc) {
    if (!doc || !doc.head || !doc.body) return;

    if (!doc.getElementById('screen-3-retail-bulk-table-style')) {
      const style = doc.createElement('style');
      style.id = 'screen-3-retail-bulk-table-style';
      style.textContent = TABLE_CSS;
      doc.head.appendChild(style);
    }

    doc.querySelectorAll('.category').forEach(section => {
      const title = section.querySelector('.category-title');
      if (!title) return;
      const name = (title.textContent || '').trim().toLowerCase();
      if (name === 'retail / bulk' || name === 'retail/bulk' || name === 'bulk') {
        section.classList.add('retail-bulk-table');
      }
    });
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
      observer.observe(doc.body, { childList:true, subtree:true });
    }

    [250, 750, 1500, 3000].forEach(ms => setTimeout(() => apply(doc), ms));
  }

  frame.addEventListener('load', activate);
  if (frame.contentDocument?.readyState === 'complete') activate();
})();
