(function () {
  'use strict';

  const character = document.querySelector('[data-tanuki]');
  if (!character) {
    return;
  }

  const tail = character.querySelector('.about-content__tail');
  const body = character.querySelector('.about-content__photo');
  const isTouchDevice = navigator.maxTouchPoints > 0
    || window.matchMedia('(pointer: coarse)').matches;
  const canAnimate = !isTouchDevice
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!tail || !body || !canAnimate) {
    return;
  }

  // The bounds are the non-transparent pixels in tanu.png at its native size.
  const bodyVisibleBounds = { left: 223 / 1254, top: 13 / 1254, right: 1145 / 1254, bottom: 1221 / 1254 };
  const startDistance = 100;
  const stopDistance = 130;
  let isWagging = false;
  let pendingPoint = null;
  let frameRequested = false;

  function distanceToVisibleBody(point) {
    const rect = body.getBoundingClientRect();
    const left = rect.left + rect.width * bodyVisibleBounds.left;
    const top = rect.top + rect.height * bodyVisibleBounds.top;
    const right = rect.left + rect.width * bodyVisibleBounds.right;
    const bottom = rect.top + rect.height * bodyVisibleBounds.bottom;
    const dx = Math.max(left - point.x, 0, point.x - right);
    const dy = Math.max(top - point.y, 0, point.y - bottom);
    return Math.hypot(dx, dy);
  }

  function restoreTail() {
    const currentTransform = window.getComputedStyle(tail).transform;
    if (currentTransform !== 'none') {
      tail.style.transform = currentTransform;
      tail.offsetWidth;
    }
    tail.classList.remove('is-wagging');
    tail.style.transform = '';
  }

  function updateTail(point) {
    const distance = distanceToVisibleBody(point);
    if (!isWagging && distance <= startDistance) {
      isWagging = true;
      tail.classList.add('is-wagging');
    } else if (isWagging && distance >= stopDistance) {
      isWagging = false;
      restoreTail();
    }
  }

  function handlePointerMove(event) {
    pendingPoint = { x: event.clientX, y: event.clientY };
    if (frameRequested) {
      return;
    }
    frameRequested = true;
    window.requestAnimationFrame(function () {
      frameRequested = false;
      if (pendingPoint) {
        updateTail(pendingPoint);
        pendingPoint = null;
      }
    });
  }

  document.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && isWagging) {
      isWagging = false;
      restoreTail();
      pendingPoint = null;
    }
  });
}());
