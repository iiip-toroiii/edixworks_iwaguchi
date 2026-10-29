(function () {
  'use strict';

  const grid = document.querySelector('.works-grid');
  const dots = Array.from(document.querySelectorAll('.works-carousel-dot'));
  if (!grid || !dots.length) {
    return;
  }

  const mobileQuery = window.matchMedia('(max-width: 767px)');

  function setActiveDot(index) {
    dots.forEach(function (dot, dotIndex) {
      const active = dotIndex === index;
      dot.classList.toggle('is-active', active);
      if (active) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  function updateFromScroll() {
    if (!mobileQuery.matches) {
      return;
    }
    const cards = grid.querySelectorAll('.work-card');
    const cardWidth = cards[0] ? cards[0].getBoundingClientRect().width : grid.clientWidth;
    const gap = parseFloat(window.getComputedStyle(grid).columnGap) || 0;
    const index = Math.round(grid.scrollLeft / (cardWidth + gap));
    setActiveDot(Math.min(index, dots.length - 1));
  }

  grid.addEventListener('scroll', updateFromScroll, { passive: true });
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (!mobileQuery.matches) {
        return;
      }
      const card = grid.querySelectorAll('.work-card')[index];
      if (card) {
        grid.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('resize', updateFromScroll);
  updateFromScroll();
}());
