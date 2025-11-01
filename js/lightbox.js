// /js/lightbox.js  — add video support (drop-in)

let clickGuardUntil = 0;

(() => {
  const root = document.querySelector('[data-lb-root]');
  if (!root) return;

  const imgEl     = root.querySelector('[data-lb-img]');
  const videoEl   = root.querySelector('[data-lb-video-el]'); // 👈 新增
  const capEl     = root.querySelector('[data-lb-cap]');
  const closeBtn  = root.querySelector('[data-lb-close]');
  const prevBtn   = root.querySelector('[data-lb-prev]');
  const nextBtn   = root.querySelector('[data-lb-next]');
  const backdrop  = root.querySelector('[data-lb-backdrop]');

  // 目前圖組資料
  // items: [{ type:'image'|'video', src, cap, el }]
  let currentGroup = null;
  let lastActive = null;

  // 事件委派：監聽「圖片 或 影片」觸發
  document.addEventListener('click', (e) => {
    if (performance.now() < clickGuardUntil) {
   e.stopPropagation();
   e.preventDefault();
   return;
   }
    if (e.target.closest('[data-lb-root]')) return;
    const trigger = e.target.closest('[data-lb-src], [data-lb-video]'); // 👈 加入 data-lb-video
    if (!trigger) return;
    
    e.preventDefault();
    openFromTrigger(trigger);
  });

  function itemFromEl(el){
    if (el.hasAttribute('data-lb-video')){
      return {
        type: 'video',
        src: el.getAttribute('data-lb-video'),
        cap: el.getAttribute('data-lb-cap') || el.getAttribute('alt') || '',
        el
      };
    }
    return {
      type: 'image',
      src: el.getAttribute('data-lb-src') || el.getAttribute('src'),
      cap: el.getAttribute('data-lb-cap') || el.getAttribute('alt') || '',
      el
    };
  }

  function collectGroup(trigger){
    const groupId = trigger.getAttribute('data-lb-group') || null;

    if (!groupId){
      // 單一媒體
      return {
        id: null,
        items: [ itemFromEl(trigger) ],
        index: 0
      };
    }

    // 同一容器下、同 group 的圖片＋影片都收
    const scope = trigger.closest('[data-lb-scope]') || document;
    const nodes = [
      ...scope.querySelectorAll(`[data-lb-group="${groupId}"][data-lb-src], [data-lb-group="${groupId}"][data-lb-video]`)
    ];
    const items = nodes.map(itemFromEl);
    const index = Math.max(0, nodes.indexOf(trigger));
    return { id: groupId, items, index };
  }

  function openFromTrigger(trigger){
    lastActive = document.activeElement;
    currentGroup = collectGroup(trigger);
    root.dataset.lbSingle = currentGroup.items.length === 1 ? 'true' : 'false';
    render();
    root.classList.add('is-open');
    root.removeAttribute('aria-hidden');
    closeBtn.focus();
    bindKeys(true);
  }

  function render(){
    const item = currentGroup.items[currentGroup.index];
    capEl.textContent = item.cap || '';

    // 顯示/隱藏舞台
    if (item.type === 'video'){
      // 關閉圖片、切影片
      if (imgEl){ imgEl.removeAttribute('src'); imgEl.style.display = 'none'; }
      if (videoEl){
        videoEl.style.display = 'block';
        if (videoEl.src !== item.src){
          videoEl.pause();
          videoEl.src = item.src;
          videoEl.load?.();
        }
        // 嘗試自動播放（若被阻擋，仍可手動按播放）
        const p = videoEl.play();
        if (p && typeof p.catch === 'function') p.catch(()=>{});
      }
    } else {
      // 關閉影片、切圖片
      if (videoEl){
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load?.();
        videoEl.style.display = 'none';
      }
      if (imgEl){
        imgEl.src = item.src;
        imgEl.alt = item.cap || '';
        imgEl.style.display = 'block';
      }
    }

    // 左右鍵
    const single = currentGroup.items.length === 1;
    prevBtn.style.display = single ? 'none' : '';
    nextBtn.style.display = single ? 'none' : '';
  }

  function close(){
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');

    // 清理媒體
    if (imgEl){
      imgEl.removeAttribute('src');
      imgEl.style.display = 'none';
    }
    if (videoEl){
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load?.();
      videoEl.style.display = 'none';
    }
    capEl.textContent = '';

    bindKeys(false);
    if (lastActive) lastActive.focus();
  }

  function prev(){
    if (!currentGroup || currentGroup.items.length <= 1) return;
    currentGroup.index = (currentGroup.index - 1 + currentGroup.items.length) % currentGroup.items.length;
    render();
  }

  function next(){
    if (!currentGroup || currentGroup.items.length <= 1) return;
    currentGroup.index = (currentGroup.index + 1) % currentGroup.items.length;
    render();
  }

  // 點背景或按鈕關閉
 backdrop.addEventListener('click', (e) => { 
  e.stopPropagation(); 
  e.preventDefault(); 
  close(); 
  if (lastActive) lastActive.focus();
  // 防幽靈點擊：關閉後的短時間吃掉全域 click
  clickGuardUntil = performance.now() + 300;
  });

  closeBtn.addEventListener('click', (e) => { 
  e.stopPropagation(); 
  e.preventDefault(); 
  close(); 
  });

prevBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  prev();
});

nextBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  next();
});

  function onKey(e){
    if (!root.classList.contains('is-open')) return;
    if (e.key === 'Escape')      close();
    else if (e.key === 'ArrowLeft')  prev();
    else if (e.key === 'ArrowRight') next();
  }
  function bindKeys(on){
    (on ? document.addEventListener : document.removeEventListener)('keydown', onKey);
  }

  // （可選）暴露測試 API
  window.LB = {
    open(src, cap=''){
      const type = /\.mp4$|\.webm$|\.ogg$/i.test(src) ? 'video' : 'image';
      lastActive = document.activeElement;
      currentGroup = { id:null, items:[{type, src, cap, el:null}], index:0 };
      render();
      root.classList.add('is-open');
      root.removeAttribute('aria-hidden');
      bindKeys(true);
      closeBtn.focus();
    },
    close, prev, next
  };
})();
