(() => {
  const frame = document.getElementById('menu-frame');
  if (!frame) return;

  function normalize(s){
    return String(s || '').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function isBulkTitle(text){
    const n = normalize(text);
    return n.includes('bulk') && n.includes('retail');
  }

  function findSourceSection(title){
    let node = title.closest('section');
    if (node && node.querySelectorAll('.item').length) return node;
    node = title.parentElement;
    while (node && node !== title.ownerDocument.body) {
      if (node.querySelectorAll && node.querySelectorAll('.item').length) return node;
      node = node.parentElement;
    }
    return null;
  }

  function convertBulkToNativeTable(doc){
    if (!doc || !doc.body) return false;
    if (doc.querySelector('.bulk-native-table')) return true;

    const title = [...doc.querySelectorAll('.category-title,h2')].find(el => isBulkTitle(el.textContent));
    if (!title) return false;

    const source = findSourceSection(title);
    if (!source) return false;

    const items = [...source.querySelectorAll(':scope > .item')];
    if (items.length < 2) return false;

    const table = doc.createElement('section');
    table.className = 'compact-frame sides-frame bulk-native-table';
    table.setAttribute('data-layout','native-two-column');

    const head = doc.createElement('div');
    head.className = 'category-head';
    const heading = doc.createElement('h2');
    heading.className = 'category-title';
    heading.textContent = title.textContent.trim();
    head.appendChild(heading);

    const grid = doc.createElement('div');
    grid.className = 'compact-items';
    items.forEach(item => grid.appendChild(item));

    table.appendChild(head);
    table.appendChild(grid);
    source.replaceWith(table);
    return true;
  }

  function activate(){
    let doc;
    try { doc = frame.contentDocument || frame.contentWindow.document; } catch (_) { return; }
    if (!doc) return;

    const run = () => convertBulkToNativeTable(doc);
    run();

    if (doc.body && !doc.body.dataset.bulkNativeObserver) {
      doc.body.dataset.bulkNativeObserver = '1';
      const observer = new MutationObserver(() => run());
      observer.observe(doc.body,{childList:true,subtree:true});
    }

    [100,300,700,1200,2200,4000].forEach(ms => setTimeout(run,ms));
  }

  frame.addEventListener('load',activate);
  if (frame.contentDocument && frame.contentDocument.readyState !== 'loading') activate();
})();
