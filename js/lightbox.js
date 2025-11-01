
(function(){
  'use strict';

  // Helpers
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }

  // Lightbox root & parts (assumed to exist in index.html as in user's code)
  var lb = document.querySelector('[data-lb-root]') || document.querySelector('.lb-root');
  if(!lb){
    console.warn('[lightbox] .lb-root not found; aborting.');
    return;
  }
  var elImg = lb.querySelector('[data-lb-img]');
  var elVideo = lb.querySelector('[data-lb-video-el]');
  var elCap = lb.querySelector('[data-lb-cap]');
  var btnClose = lb.querySelector('[data-lb-close]');
  var btnPrev = lb.querySelector('[data-lb-prev]');
  var btnNext = lb.querySelector('[data-lb-next]');
  var backdrop = lb.querySelector('[data-lb-backdrop]');

  var state = {
    items: [],  // {type: 'img'|'video', src, cap}
    index: 0
  };

  function getMediaFromEl(target){
    // Priority: data-lb-src -> href -> src
    var src = target.getAttribute('data-lb-src') || target.getAttribute('href') || target.getAttribute('src');
    if(!src) return null;
    var cap = target.getAttribute('data-caption') || target.getAttribute('alt') || target.title || '';
    var isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
    return { type: isVideo ? 'video' : 'img', src: src, cap: cap };
  }

  function openAt(index){
    if(!state.items.length) return;
    state.index = Math.max(0, Math.min(index, state.items.length - 1));
    var item = state.items[state.index];

    // Toggle media elements
    if(item.type === 'img'){
      elVideo.pause && elVideo.pause();
      elVideo.removeAttribute('src');
      elVideo.style.display = 'none';

      elImg.style.display = '';
      elImg.setAttribute('src', item.src);
      elImg.setAttribute('alt', item.cap || '');
    }else{
      elImg.removeAttribute('src');
      elImg.style.display = 'none';

      elVideo.style.display = '';
      elVideo.setAttribute('src', item.src);
      elVideo.setAttribute('controls', '');
      // don't autoplay by default to respect user gesture policies
    }
    elCap.textContent = item.cap || '';
    lb.dataset.lbSingle = (state.items.length <= 1) ? 'true' : 'false';
    lb.classList.add('is-open');
  }

  function close(){
    lb.classList.remove('is-open');
    // cleanup media to stop downloads
    elImg.removeAttribute('src');
    elVideo.pause && elVideo.pause();
    elVideo.removeAttribute('src');
  }

  function next(){ if(state.items.length){ openAt((state.index + 1) % state.items.length); } }
  function prev(){ if(state.items.length){ openAt((state.index - 1 + state.items.length) % state.items.length); } }

  // Keyboard support
  window.addEventListener('keydown', function(e){
    if(!lb.classList.contains('is-open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });

  // Buttons
  if(btnClose) btnClose.addEventListener('click', close);
  if(backdrop) backdrop.addEventListener('click', close);
  if(btnNext) btnNext.addEventListener('click', next);
  if(btnPrev) btnPrev.addEventListener('click', prev);

  // Event delegation for clicks
  document.addEventListener('click', function(e){
    // Find nearest candidate: [data-lb] or <a><img></a> or <img data-lb>
    var t = e.target;
    var candidate = t.closest('[data-lb]') || (t.tagName === 'IMG' && (t.closest('a') || t)) || (t.closest('a') && t.closest('a').querySelector('img'));
    if(!candidate) return;

    // Confirm: do we actually have a URL media?
    var media = getMediaFromEl(candidate.tagName === 'A' ? candidate : (candidate.closest('a') || candidate));
    if(!media) return;

    // prevent navigation if clicking an <a>
    if(candidate.tagName === 'A' || (candidate.closest && candidate.closest('a'))) e.preventDefault();

    // Build items list (gallery) from closest [data-gallery] container if present
    var galleryRoot = candidate.closest('[data-gallery]') || document;
    var candidates = $all('[data-lb], a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"], a[href$=".webp"], a[href$=".mp4"], a[href$=".webm"]', galleryRoot);

    state.items = candidates.map(function(el){
      var m = getMediaFromEl(el.tagName === 'A' ? el : (el.closest('a') || el));
      return m;
    }).filter(Boolean);

    // Pick index of clicked item
    var i = state.items.findIndex(function(it){ return it.src === media.src; });
    if(i < 0){ state.items.unshift(media); i = 0; }

    openAt(i);
  });

  console.log('[lightbox] ready');
})();
