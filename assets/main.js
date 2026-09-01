(function(){
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]qa=1/.test(location.search)) { document.documentElement.classList.add('is-qa'); reduce = true; }

  /* ローディング：文字分解 → 1.2秒以内に必ず開幕 */
  var split = document.querySelector('.js-split');
  if (split) {
    var t = split.textContent.trim(); split.textContent = '';
    t.split('').forEach(function(ch, i){ var s=document.createElement('span'); s.textContent=ch; s.style.setProperty('--i', i); split.appendChild(s); });
  }
  var loading = document.getElementById('loading');
  function openSite(){ if(loading) loading.classList.add('is-done'); }
  if (reduce) openSite(); else setTimeout(openSite, 1050);
  setTimeout(openSite, 1200); /* 保険 */

  /* IntersectionObserver 1本で reveal / stagger を束ねる */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, {rootMargin:'0px 0px -10% 0px', threshold:.12});
  var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal,.stagger'));
  pending.forEach(function(el){ io.observe(el); });

  /* 高速スクロールでIOを素通りした要素の保険（既にファーストビューより上にあるものは即時表示） */
  function sweepMissed(){
    pending = pending.filter(function(el){
      if (el.classList.contains('is-in')) return false;
      if (el.getBoundingClientRect().top < innerHeight * .9){
        el.classList.add('is-in'); io.unobserve(el); return false;
      }
      return true;
    });
  }

  /* ヘッダーの色をゾーン（暗/明）に合わせて切り替え */
  var header = document.querySelector('.js-header');
  var darkZones = Array.prototype.slice.call(document.querySelectorAll('.section-dark,.footer'));
  function syncHeader(){
    var probe = 40; /* ヘッダー中心付近 */
    var onDark = darkZones.some(function(el){
      var r = el.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    header.classList.toggle('on-light', !onDark);
  }
  var ticking = false;
  addEventListener('scroll', function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){ syncHeader(); sweepMissed(); ticking = false; });
  }, {passive:true});
  syncHeader();

  /* 固定ヘッダー分のアンカー補正 */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){ a.addEventListener('click', function(ev){
    var id=a.getAttribute('href'); if(id.length<2) return; var el=document.querySelector(id); if(!el) return;
    ev.preventDefault(); var y=el.getBoundingClientRect().top+scrollY-64; scrollTo({top:y, behavior: reduce?'auto':'smooth'}); }); });

  /* YouTubeライトエンベッド：クリックで初めてiframeを読み込む（全ページ共通） */
  document.addEventListener('click', function(ev){
    var b = ev.target.closest('.yt-thumb');
    if (!b || !b.isConnected) return;
    var f = b.parentElement;
    var ifr = document.createElement('iframe');
    ifr.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.id + '?autoplay=1&rel=0';
    ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    ifr.allowFullscreen = true;
    ifr.title = b.getAttribute('aria-label') || '動画プレーヤー';
    f.replaceChild(ifr, b);
  });
})();