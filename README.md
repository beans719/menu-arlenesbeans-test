# menu-arlenesbeans
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Cache-Control" content="no-cache,no-store,must-revalidate">
  <title>Arlene's Beans — Select Screen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Work+Sans:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root{--paper:#F7F0E3;--ink:#352A20;--red:#8C3B2E;--green:#57694A;--turquoise:#356F68;--gold:#B8863E;--line:rgba(53,42,32,.16)}
    *{box-sizing:border-box}
    html,body{width:100%;height:100%;margin:0;overflow:hidden}
    body{font-family:'Work Sans',Segoe UI,Arial,sans-serif;color:var(--ink);background:var(--paper)}
    .launcher{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6vh 6vw}
    .brand{margin:0;font-family:'Fraunces',Georgia,serif;font-size:clamp(44px,5.4vw,104px);line-height:.95;color:var(--ink);letter-spacing:-.025em}
    .subtitle{margin:1.2vh 0 6vh;font-size:clamp(15px,1.25vw,26px);font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--red)}
    .screen-buttons{width:min(1280px,88vw);display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(22px,3vw,56px)}
    .screen-button{min-height:clamp(210px,28vh,390px);display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid currentColor;border-radius:28px;background:transparent;color:var(--red);text-decoration:none;box-shadow:0 9px 0 rgba(53,42,32,.08);transition:transform .16s ease,background .16s ease,color .16s ease,box-shadow .16s ease}
    .screen-button:nth-child(2){color:var(--turquoise)}
    .screen-button:nth-child(3){color:var(--green)}
    .screen-button:hover,.screen-button:focus-visible{outline:0;transform:translateY(-8px);background:currentColor;box-shadow:0 17px 0 rgba(53,42,32,.1)}
    .screen-button:hover .number,.screen-button:hover .label,.screen-button:focus-visible .number,.screen-button:focus-visible .label{color:var(--paper)}
    .number{font-family:'Fraunces',Georgia,serif;font-size:clamp(92px,10vw,190px);line-height:.76;color:currentColor}
    .label{margin-top:2.2vh;font-size:clamp(18px,1.55vw,32px);font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:currentColor}
    .hint{margin:5vh 0 0;font-size:clamp(13px,.9vw,19px);color:rgba(53,42,32,.58)}
    @media(orientation:portrait){.launcher{padding:5vh 8vw}.subtitle{margin-bottom:4vh}.screen-buttons{width:min(760px,82vw);grid-template-columns:1fr;gap:2.2vh}.screen-button{min-height:20vh;border-radius:24px}.number{font-size:11vh}.label{margin-top:1.2vh}.hint{margin-top:3vh}}
    @media(prefers-reduced-motion:reduce){.screen-button{transition:none}}
  </style>
</head>
<body>
  <main class="launcher">
    <h1 class="brand">Arlene's Beans</h1>
    <p class="subtitle">Select a menu screen</p>
    <nav class="screen-buttons" aria-label="Menu screens">
      <a class="screen-button" href="screen-1-portrait-tested.html" data-screen="1"><span class="number">1</span><span class="label">Screen 1</span></a>
      <a class="screen-button" href="screen-2-portrait.html" data-screen="2"><span class="number">2</span><span class="label">Screen 2</span></a>
      <a class="screen-button" href="screen-3-portrait.html" data-screen="3"><span class="number">3</span><span class="label">Screen 3</span></a>
    </nav>
    <p class="hint">Use the remote arrows and press OK, or press 1, 2 or 3.</p>
  </main>
  <script>
    const buttons=[...document.querySelectorAll('.screen-button')];
    let selected=0;
    function focusButton(index){selected=(index+buttons.length)%buttons.length;buttons[selected].focus()}
    document.addEventListener('keydown',event=>{
      if(['ArrowRight','ArrowDown'].includes(event.key)){event.preventDefault();focusButton(selected+1)}
      if(['ArrowLeft','ArrowUp'].includes(event.key)){event.preventDefault();focusButton(selected-1)}
      if(/^[123]$/.test(event.key))buttons[Number(event.key)-1].click();
    });
    buttons.forEach((button,index)=>button.addEventListener('focus',()=>selected=index));
    window.addEventListener('load',()=>focusButton(0));
  </script>
</body>
</html>
