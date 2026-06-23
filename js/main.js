/* ════════════════════════════════════════
   Денис & Александра · интерактив лендинга
   ════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Конверт-интро «старое письмо» ── */
  const scene = document.getElementById('envelope');
  const body = document.body;

  function openEnvelope() {
    if (!scene || scene.classList.contains('is-opening')) return;
    scene.classList.add('is-opening');                 // печать тает, клапан откидывается
    setTimeout(() => scene.classList.add('is-open'), 650);   // письмо выезжает
    setTimeout(() => {                                  // сцена уходит, сайт открыт
      scene.classList.add('is-gone');
      body.classList.remove('is-locked');
    }, 4200);
    setTimeout(() => scene && scene.remove(), 5100);
  }

  if (scene) {
    scene.addEventListener('click', openEnvelope);
    scene.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
    });
  } else {
    body.classList.remove('is-locked');
  }

  /* ── 2. Обратный отсчёт ── */
  const cd = document.getElementById('countdown');
  if (cd) {
    const target = new Date(cd.dataset.date).getTime();
    const cells = {
      d: cd.querySelector('[data-u="d"]'),
      h: cd.querySelector('[data-u="h"]'),
      m: cd.querySelector('[data-u="m"]'),
      s: cd.querySelector('[data-u="s"]'),
    };
    const pad = (n) => String(n).padStart(2, '0');

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        cd.innerHTML = '<p class="cd-done">Сегодня тот самый день ❤</p>';
        clearInterval(timer);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (cells.d) cells.d.textContent = d;
      if (cells.h) cells.h.textContent = pad(h);
      if (cells.m) cells.m.textContent = pad(m);
      if (cells.s) cells.s.textContent = pad(s);
    }
    tick();
    const timer = setInterval(tick, 1000);
  }

  /* ── 3. Навигация: фон при скролле + бургер ── */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('navMenu');

  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let savedScrollY = 0;
  function lockScroll() {
    savedScrollY = window.scrollY;
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0'; body.style.right = '0'; body.style.width = '100%';
  }
  function unlockScroll(restore) {
    if (body.style.position !== 'fixed') return;
    body.style.position = ''; body.style.top = '';
    body.style.left = ''; body.style.right = ''; body.style.width = '';
    if (restore) window.scrollTo(0, savedScrollY);
  }
  function closeMenu() {
    navMenu && navMenu.classList.remove('is-open');
    body.classList.remove('menu-open');
    burger && burger.setAttribute('aria-expanded', 'false');
    unlockScroll(false);   // не возвращаем позицию — даём ссылке-якорю сработать
  }
  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (open) lockScroll(); else unlockScroll(true);   // крестик — вернуть на место
    });
    navMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ── 4. Появление секций при скролле ── */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ── 5. Лайтбокс галереи ── */
  const lb = document.getElementById('lightbox');
  const items = Array.from(document.querySelectorAll('.gallery__item'));
  if (lb && items.length) {
    const lbMedia = document.getElementById('lbMedia');
    const lbCap = document.getElementById('lbCap');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');
    let idx = 0;

    function render() {
      const item = items[idx];
      const full = item.dataset.full;        // когда появятся фото — подставится <img>
      if (full) {
        lbMedia.classList.remove('placeholder');
        lbMedia.style.backgroundImage = `url("${full}")`;
        lbMedia.style.backgroundSize = 'cover';
        lbMedia.style.backgroundPosition = 'center';
        lbMedia.removeAttribute('data-ph');
      } else {
        lbMedia.classList.add('placeholder');
        lbMedia.style.backgroundImage = '';
        lbMedia.setAttribute('data-ph', item.dataset.ph || 'фото');
      }
      lbCap.textContent = item.dataset.cap || '';
    }
    function open(i) {
      idx = i; render();
      lb.classList.add('is-open');
      body.classList.add('is-locked');
    }
    function close() {
      lb.classList.remove('is-open');
      if (!scene || scene.classList.contains('is-gone')) body.classList.remove('is-locked');
    }
    const go = (step) => { idx = (idx + step + items.length) % items.length; render(); };

    items.forEach((item, i) => item.addEventListener('click', () => open(i)));
    lbClose && lbClose.addEventListener('click', close);
    lbPrev && lbPrev.addEventListener('click', () => go(-1));
    lbNext && lbNext.addEventListener('click', () => go(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
  }
})();
