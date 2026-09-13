(() => {
  const frame = document.getElementById('menu-frame');
  if (!frame) return;

  const BADGE_CSS = `
    .gf-friendly-badge,.vegan-badge{
      display:inline-flex!important;align-items:center;justify-content:center;vertical-align:middle;
      margin-left:4px;padding:1px 5px 1.5px;border-radius:999px;
      font-family:'Work Sans',Segoe UI,Arial,sans-serif;font-size:.78em!important;
      line-height:1.05!important;font-weight:700!important;letter-spacing:.045em;white-space:nowrap;
    }
    .gf-friendly-badge{min-width:23px;border:1px solid rgba(87,105,74,.68);background:rgba(87,105,74,.10);color:#57694A!important}
    .vegan-badge{border:1px solid rgba(47,119,85,.72);background:rgba(47,119,85,.10);color:#2F7755!important}
    .gf-friendly-badge::before,.vegan-badge::before{
      content:'';display:inline-block;width:5px;height:8px;margin-right:3px;border-radius:80% 0 80% 0;
      background:currentColor;transform:rotate(-32deg);opacity:.9;
    }
  `;

  function makeBadge(doc,type){
    const vegan=type==='vegan';
    const el=doc.createElement('span');
    el.className=vegan?'vegan-badge':'gf-friendly-badge';
    el.textContent=vegan?'VEGAN':'GF';
    el.title=vegan?'Vegan':'Gluten Friendly';
    el.setAttribute('aria-label',el.title);
    return el;
  }

  function transformTextNode(node,doc){
    const text=node.nodeValue||'';
    if (!/(\(\s*GF\s*\)|\bVegan\b)/i.test(text)) return;
    const parent=node.parentElement;
    if(!parent||parent.closest('.gf-friendly-badge,.vegan-badge,script,style,noscript,textarea')) return;
    const parts=text.split(/(\(\s*GF\s*\)|\bVegan\b)/ig);
    if(parts.length<2)return;
    const frag=doc.createDocumentFragment();
    for(const part of parts){
      if(/^\(\s*GF\s*\)$/i.test(part))frag.appendChild(makeBadge(doc,'gf'));
      else if(/^Vegan$/i.test(part))frag.appendChild(makeBadge(doc,'vegan'));
      else if(part)frag.appendChild(doc.createTextNode(part));
    }
    node.replaceWith(frag);
  }

  function apply(doc){
    if(!doc||!doc.head||!doc.body)return;
    if(!doc.getElementById('dietary-badge-test-style')){
      const old=doc.getElementById('gf-friendly-test-style');if(old)old.remove();
      const style=doc.createElement('style');style.id='dietary-badge-test-style';style.textContent=BADGE_CSS;doc.head.appendChild(style);
    }
    doc.querySelectorAll('.dietary').forEach(el=>{
      if(el.querySelector('.gf-friendly-badge,.vegan-badge'))return;
      const walker=doc.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];let current;
      while((current=walker.nextNode()))nodes.push(current);nodes.forEach(node=>transformTextNode(node,doc));
    });
    const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);const nodes=[];let current;
    while((current=walker.nextNode()))nodes.push(current);nodes.forEach(node=>transformTextNode(node,doc));
  }

  function activate(){
    let doc;try{doc=frame.contentDocument||frame.contentWindow.document}catch(_){return}if(!doc)return;apply(doc);
    if(doc.body&&!doc.body.dataset.dietaryBadgeObserver){
      doc.body.dataset.dietaryBadgeObserver='1';let scheduled=false;
      const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply(doc)})});
      observer.observe(doc.body,{childList:true,subtree:true,characterData:true});
    }
    [250,750,1500,3000].forEach(ms=>setTimeout(()=>apply(doc),ms));
  }
  frame.addEventListener('load',activate);
  if(frame.contentDocument?.readyState==='complete')activate();
})();
