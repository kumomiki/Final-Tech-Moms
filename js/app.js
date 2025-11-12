// /js/app.js
(function () {
  const content = document.getElementById('content');
  const navGroup = document.getElementById('nav-group');
  const toggleBtn = document.querySelector('.nav-toggle');

  // 路由表：hash path -> 對應片段檔案
  const routes = {
    '/home': 'home.html',
    '/about': 'about.html',
    '/portfolio': 'portfolio.html',
    '/resume': 'resume.html',
    '/contact': 'contact.html',
  };

  // ---- 漢堡選單 ----
  toggleBtn?.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!expanded));
    navGroup.classList.toggle('is-open', !expanded);
  });

  // 點選任何 data-route 連結後，自動收起選單（行動裝置體驗）
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-route]');
    if (!a) return;
    toggleBtn?.setAttribute('aria-expanded', 'false');
    navGroup?.classList.remove('is-open');
  });

  // ---- Router ----
  function getPathFromHash() {
    const raw = location.hash.replace(/^#/, '');
    return raw && raw.startsWith('/') ? raw : '/home';
  }

  function setActiveLink(path) {
    document.querySelectorAll('a[data-route]').forEach((a) => {
      const isActive = a.getAttribute('href') === `#${path}`;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }


  async function render(path) {
  const file = routes[path] || routes['/home'];
  setActiveLink(path in routes ? path : '/home');

  // 先顯示 loading
  content.innerHTML = '<div class="loading">Loading...</div>';

  // 暫時關掉 scroll anchoring，避免圖片/字型載入把畫面又推下去
  document.documentElement.classList.add('no-anchor');

  // 立刻把視窗捲回頂端（確保一進頁就回到 0,0）
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  try {
    const html = await fetch(file, { cache: 'no-cache' }).then((r) => r.text());
    content.innerHTML = html;

    // 讓 #content 可聚焦，但不要觸發捲動
    if (!content.hasAttribute('tabindex')) content.setAttribute('tabindex', '-1');
    content.focus({ preventScroll: true });

  } catch (err) {
    content.innerHTML = `<section><h1>Oops</h1><p>Page failed to load.</p></section>`;
    console.error(err);
  } finally {
    // 等一個 frame 讓 layout 穩定，再恢復 anchoring
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-anchor');
    });
  }
}


  window.addEventListener('hashchange', () => render(getPathFromHash()));
  window.addEventListener('DOMContentLoaded', () => render(getPathFromHash()));
})();







// Resume page - Model
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById("expModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText  = document.getElementById("modalText");
  const closeBtn   = document.getElementById("modalClose");

  const experienceInfo = {
    freelancer: { 
      title: "Freelance Web & Graphic Designer", 
      text: "• Designed and launched custom websites and blogs using Wix and WordPress.\n• Created brand identities and visual assets for small businesses and research teams.\n• Improved UX and layout readability through user-centered design and responsive structure.\n• Collaborated with clients to define content strategy, site architecture, and visual direction.\n• Delivered engaging, easy-to-manage sites optimized for performance and client independence." },
    taitra:     { 
      title: "TAITRA — Project Manager",               text: "• Organized 10+ job fairs, connecting 100+ companies with candidates (85% satisfaction).\n• Led cross-media campaigns (YouTuber & podcast) boosting brand reach and engagement.\n• Conducted marketing analysis, achieving 30% customer growth and improved website UX.\n• Managed 10+ events with 100+ attendees each, enhancing brand exposure.\n• Introduced AR marketing for anniversary event, raising alumni satisfaction by 10%.\n• Awarded “Most Innovative” at TAITRA Hackathon and Smartphone Film Competition winner."
   },
    bionet:     { 
      title: "Bionet — Product Specialist",            text: "• Trained sales teams on stem cell products and communication skills.\n• Conducted market research and advised on product strategy.\n• Increased sign-ups by 7% through international expo campaigns.\n• Represented Bionet at BIO Asia–Taiwan with product demonstrations." }
  };

  // 事件委派：點任何 .card-info 都能找到所在卡片
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-info');
    if (!btn) return;

    const card = btn.closest('.cv-card');
    const key =
      card.classList.contains('freelancer') ? 'freelancer' :
      card.classList.contains('taitra')     ? 'taitra'     :
      card.classList.contains('bionet')     ? 'bionet'     : null;

    if (!key) return;

    modalTitle.innerText = experienceInfo[key].title;
    modalText.innerText  = experienceInfo[key].text;
    modal.classList.add('active');
  });

  // 關閉
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
});




// Certificate & Education



// Portfolio page
/* =========================
   Puzzle module (safe attach)
   ========================= */
(function () {
  'use strict';

  // ---- 版面配置（9欄×6列）----
  var PZ_LAYOUT = [
    { word:'card',     interactive:true,  start:{row:1, col:3}, dir:'across' }, // 第1列：CARD（3~6）
    { word:'poster',   interactive:true,  start:{row:2, col:2}, dir:'across' }, // 第2列：POSTER（2~7）
    { word:'website',  interactive:true,  start:{row:3, col:3}, dir:'across' }, // 第3列：WEBSITE（3~9）
    { word:'creative', interactive:false, start:{row:4, col:1}, dir:'across' }, // 第4列：CREATIVE（1~8）
    { word:'logo',     interactive:true,  start:{row:5, col:4}, dir:'across' }, // 第5列：LOGO（4~7）
    { word:'science',  interactive:false, start:{row:6, col:2}, dir:'across' }, // 第6列：SCIENCE（2~8）
    { word:'design',   interactive:false, start:{row:1, col:6}, dir:'down'   }, // 直向：DESIGN（1~6）
  ];

  function pzBuild(grid) {
    if (!grid || grid.dataset.pzInited === '1') return;

    var drawer = document.getElementById('drawer');
    var title  = document.getElementById('drawer-title');
    var close  = drawer ? drawer.querySelector('.drawer-close') : null;
    var panels = drawer ? Array.prototype.slice.call(drawer.querySelectorAll('[data-panel]')) : [];

    var occupied = new Map();
    for (var a = 0; a < PZ_LAYOUT.length; a++) {
      var item = PZ_LAYOUT[a];
      var letters = item.word.toUpperCase().split('');
      for (var i = 0; i < letters.length; i++) {
        var ch = letters[i];
        var r = item.start.row + (item.dir === 'down' ? i : 0);
        var c = item.start.col + (item.dir === 'across' ? i : 0);
        var key = r + ',' + c;
        var btn = occupied.get(key);

        if (!btn) {
          btn = document.createElement('button');
          btn.className = 'cell';
          btn.setAttribute('role', 'gridcell');
          btn.style.gridRow = r;
          btn.style.gridColumn = c;
          btn.textContent = ch;
          btn.dataset.word = item.word;
          btn.dataset.interactive = item.interactive ? 'true' : 'false';
          btn.dataset.idx = i; // 索引，之後精準上色用
          grid.appendChild(btn);
          occupied.set(key, btn);
        } else {
          if (btn.textContent !== ch) {
            console.warn('[Puzzle] conflict at', key, btn.textContent, 'vs', ch);
          }
          if (item.interactive) btn.dataset.interactive = 'true';
        }
      }
    }

    // 精準把 CARD 的 D、POSTER 的 E、WEBSITE 的 S、LOGO 的 G 上色為 #777777
    function mark(word, idx) {
      var sel = '.cell[data-word="' + word + '"][data-idx="' + idx + '"]';
      var el = grid.querySelector(sel);
      if (el) el.classList.add('is-cross');
    }
    mark('card', 3);    // D
    mark('poster', 4);  // E
    mark('website', 3); // S
    mark('logo', 2);    // G

    // 互動狀態
    function setHover(word) {
      if (word) grid.dataset.hover = word; else delete grid.dataset.hover;
    }
    function setActive(word) {
      if (!drawer) return;
      if (word) grid.dataset.active = word; else delete grid.dataset.active;
      for (var k = 0; k < panels.length; k++) {
        panels[k].hidden = panels[k].dataset.panel !== word;
      }
      drawer.setAttribute('aria-hidden', word ? 'false' : 'true');
      if (word && title) title.textContent = word.toUpperCase();

      // >>> 新增：如果該 panel 有 case-nav，就預設選第一個
    if (word) {
    const panel = drawer.querySelector(`[data-panel="${word}"]`);
    if (panel) initPanelCases(panel);   // 呼叫下面的函式
    // ★ 開啟時把焦點放到關閉鈕，避免之前的 video 留焦點
    const closeBtn = drawer.querySelector('.drawer-close');
    closeBtn && closeBtn.focus({ preventScroll: true });

    } else {
    // ★ 關閉前，若目前焦點落在 drawer 裡，先移走
    if (drawer.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    // ★ 再隱藏抽屜
    drawer.setAttribute('aria-hidden', 'true');

    // 把 hover/active 狀態清掉
    delete grid.dataset.active;
    delete grid.dataset.hover;
    }
    }

    // 啟用指定 panel 的 case 切換（預設選第一個）
  function initPanelCases(panel){
  const nav = panel.querySelector('.case-nav');
  if (!nav) return; // 沒有二階段就跳過

  const btns = [...nav.querySelectorAll('.case-btn')];
  const cases = [...panel.querySelectorAll('.case')];
  if (btns.length === 0 || cases.length === 0) return;

  // 預設選第一個
  btns.forEach((b, i) => b.setAttribute('aria-selected', i === 0 ? 'true' : 'false'));
  cases.forEach((c, i) => c.hidden = i !== 0);

  

}

// 事件委派：點按 case 按鈕切換內容
drawer.addEventListener('click', (e) => {
  const btn = e.target.closest('.case-btn');
  if (!btn) return;

  const panel = e.target.closest('[data-panel]');
  if (!panel) return;

  const choice = btn.getAttribute('data-choice');
  const nav = btn.parentElement;
  const btns = [...nav.querySelectorAll('.case-btn')];
  const cases = [...panel.querySelectorAll('.case')];

  // 切換 selected 狀態
  btns.forEach(b => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));

  // 顯示對應 case
  cases.forEach(c => c.hidden = (c.getAttribute('data-case') !== choice));
});




    // 事件（只對可互動的四個字）
    // grid.addEventListener('mouseover', function (e) {
    //   var btn = e.target.closest && e.target.closest('.cell');
    //   if (!btn || btn.dataset.interactive !== 'true') return;
    //   setHover(btn.dataset.word);
    // });
    // grid.addEventListener('mouseout', function () { setHover(''); });

    // grid.addEventListener('click', function (e) {
    //   var btn = e.target.closest && e.target.closest('.cell');
    //   if (!btn || btn.dataset.interactive !== 'true') return;
    //   setActive(btn.dataset.word);
    // });

    // grid.addEventListener('keydown', function (e) {
    //   if (e.key === 'Enter' || e.key === ' ') {
    //     var btn = e.target.closest && e.target.closest('.cell');
    //     if (btn && btn.dataset && btn.dataset.interactive === 'true') {
    //       e.preventDefault();
    //       setActive(btn.dataset.word);
    //     }
    //   }
    // });

    // 事件（只對可互動的四個字）
function isLiveWord(w){
  return w && /^(card|poster|website|logo)$/.test(w);
}

grid.addEventListener('mouseover', function (e) {
  var btn = e.target.closest && e.target.closest('.cell');
  if (!btn || !isLiveWord(btn.dataset.word)) return;
  setHover(btn.dataset.word);
});

grid.addEventListener('mouseout', function () { setHover(''); });

grid.addEventListener('click', function (e) {
  var btn = e.target.closest && e.target.closest('.cell');
  if (!btn || !isLiveWord(btn.dataset.word)) return;
  setActive(btn.dataset.word);
});

grid.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var btn = e.target.closest && e.target.closest('.cell');
  if (!btn || !isLiveWord(btn.dataset.word)) return;
  e.preventDefault();
  setActive(btn.dataset.word);
});


    if (close) close.addEventListener('click', function () { setActive(null); });
    if (drawer) drawer.addEventListener('keydown', function (e) { if (e.key === 'Escape') setActive(null); });

    /* === 點畫面空白處關閉抽屜 === */
  document.addEventListener('click', function(e){
  var isDrawer = e.target.closest && e.target.closest('.drawer');
  var isCell   = e.target.closest && e.target.closest('.cell');
  if (drawer && drawer.getAttribute('aria-hidden') === 'false' && !isDrawer && !isCell) {
    setActive(null);
  }
  });

    grid.dataset.pzInited = '1';
    console.log('[Puzzle] initialized');
  }

  // 嘗試初始化（DOM ready / SPA 載入 / hash 切換）
  function pzTryInit() {
    try {
      var grid = document.querySelector('.grid');
      if (grid) pzBuild(grid);
    } catch (err) {
      console.error('[Puzzle] init error:', err);
    }
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pzTryInit);
  } else {
    pzTryInit();
  }

  // 監聽 SPA 動態載入
  try {
    var mo = new MutationObserver(function () { pzTryInit(); });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', pzTryInit);
  } catch (e) {
    // 舊瀏覽器就不監聽了
  }
})();

/// ========== Visitor Counter (ID version, SPA + session-safe, Worker API) ==========
(() => {
  const SEL_CONTAINER = '.visitor-container';
  const SEL_TODAY = '#todayCount';
  const SEL_TOTAL = '#totalCount';

  // ① 改成你的 Worker /visits URL
  const API = 'https://mikilin-portfolio.iammi7lin.workers.dev/visits';

  const TODAY_KEY = new Date().toISOString().slice(0, 10);
  const inited = new WeakSet();

  function animateCount(el, to, duration = 900) {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(to * p).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ② 用自己的 API 取值／加一
  async function fetchCounts({ increment }) {
    const url = increment ? `${API}?hit=1` : API;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Worker 會回傳 { total, today }
    return res.json();
  }

  async function initCounter(container) {
    if (!container || inited.has(container)) return;
    const todayEl = container.querySelector(SEL_TODAY);
    const totalEl = container.querySelector(SEL_TOTAL);
    if (!todayEl || !totalEl) return;

    inited.add(container);
    todayEl.textContent = '0';
    totalEl.textContent = '0';

    // 同一瀏覽 session 只 +1 一次
    const seenTotal = sessionStorage.getItem('counter:hit:total') === '1';
    const seenToday = sessionStorage.getItem(`counter:hit:today:${TODAY_KEY}`) === '1';
    const increment = !(seenTotal && seenToday);

    try {
      const { total, today } = await fetchCounts({ increment });
      if (increment) {
        sessionStorage.setItem('counter:hit:total', '1');
        sessionStorage.setItem(`counter:hit:today:${TODAY_KEY}`, '1');
      }
      animateCount(todayEl, today, 1200);
      animateCount(totalEl, total, 1400);
    } catch (e) {
      console.warn('[counter] fetch failed; keep zeros', e);
    }
  }

  function watchAndInit() {
    document.querySelectorAll(SEL_CONTAINER).forEach(initCounter);
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches?.(SEL_CONTAINER)) initCounter(node);
          node.querySelectorAll?.(SEL_CONTAINER).forEach(initCounter);
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', watchAndInit);
  window.addEventListener('load', watchAndInit);
  document.addEventListener('page:rendered', watchAndInit);
  window.addEventListener('popstate', watchAndInit);
})();
