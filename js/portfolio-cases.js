// /js/portfolio-cases.js  (replace all)
(() => {
  function setup(drawer){
    // 啟用某個 panel 內的某顆按鈕（含懶載入）
    async function activate(panelEl, btn){
      // 1) aria-selected 樣式
      panelEl.querySelectorAll('.case-btn').forEach(b =>
        b.setAttribute('aria-selected', String(b === btn))
      );

      const choice = btn.getAttribute('data-choice');

      // 2) 顯示對應 .case
      panelEl.querySelectorAll('.case').forEach(c => {
        c.hidden = c.getAttribute('data-case') !== choice;
      });

      // 3) 懶載入：把 partial 塞進 .case-slot
      const slot = panelEl.querySelector(`.case[data-case="${choice}"] .case-slot`);
      if (slot && !slot.dataset.loaded) {
        const url = slot.getAttribute('data-src');
        if (!url) return;
        try {
          const res = await fetch(url, { credentials: 'same-origin' });
          if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
          const html = await res.text();
          slot.innerHTML = html;
          slot.dataset.loaded = '1';
        } catch (err) {
          slot.innerHTML = `<p style="color:#ffdede">載入失敗：${url}</p>`;
          console.error('Load case failed:', err);
        }
      }
    }

    // 點 tab 時（事件委派）
    drawer.addEventListener('click', (e) => {
      const btn = e.target.closest('.case-btn');
      if (!btn) return;
      const panel = btn.closest('[data-panel]');
      if (!panel) return;
      // 確保被操作的 panel 先顯示
      panel.hidden = false;
      activate(panel, btn);
    });

    // 啟動目前可見的 panel（或沒有可見時啟動第一個）
    function bootVisiblePanel(){
      let panel = drawer.querySelector('.drawer-body [data-panel]:not([hidden])');
      if (!panel) {
        panel = drawer.querySelector('.drawer-body [data-panel]');
        if (!panel) return;
        panel.hidden = false; // 讓第一個 panel 顯示
      }
      const btn =
        panel.querySelector('.case-nav .case-btn[aria-selected="true"]') ||
        panel.querySelector('.case-nav .case-btn');
      if (btn) activate(panel, btn);
    }


    


    // 1) 頁面載入就跑一次（若 drawer 初始顯示某 panel）
    bootVisiblePanel();

    // 2) 抽屜打開時再跑一次
    const mo = new MutationObserver(() => {
      if (drawer.getAttribute('aria-hidden') === 'false') {
        bootVisiblePanel();
      }
    });
    mo.observe(drawer, { attributes: true, attributeFilter: ['aria-hidden'] });
  }

  // ---- 等待 #drawer 出現（因為 portfolio.html 是動態插入） ----
  const now = document.getElementById('drawer');
  if (now) {
    setup(now);
  } else {
    const watch = new MutationObserver(() => {
      const d = document.getElementById('drawer');
      if (d) { setup(d); watch.disconnect(); }
    });
    watch.observe(document.body, { childList: true, subtree: true });
  }
})();
