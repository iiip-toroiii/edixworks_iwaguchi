(function () {
  'use strict';

  const wrapper = document.querySelector('.contact-popover');
  if (!wrapper) {
    return;
  }

  const trigger = wrapper.querySelector('.button--contact');
  const panel = wrapper.querySelector('.contact-map');
  const frame = panel.querySelector('iframe');
  const openDelay = 150;
  const closeDelay = 200;
  let openTimer;
  let closeTimer;
  let closeAnimationTimer;
  let isPointerInside = false;
  let isFocusedInside = false;

  function loadMap() {
    if (!frame.getAttribute('src')) {
      frame.src = frame.dataset.src;
    }
  }

  function openPanel() {
    window.clearTimeout(closeTimer);
    window.clearTimeout(closeAnimationTimer);
    loadMap();
    panel.hidden = false;
    panel.classList.remove('is-closing');
    window.requestAnimationFrame(function () {
      panel.classList.add('is-open');
    });
    trigger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closePanel() {
    window.clearTimeout(openTimer);
    if (isPointerInside || isFocusedInside) {
      return;
    }
    panel.classList.remove('is-open');
    panel.classList.add('is-closing');
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    closeAnimationTimer = window.setTimeout(function () {
      if (!isPointerInside && !isFocusedInside) {
        panel.hidden = true;
        panel.classList.remove('is-closing');
      }
    }, 500);
  }

  function scheduleOpen() {
    window.clearTimeout(closeTimer);
    if (!panel.classList.contains('is-open')) {
      openTimer = window.setTimeout(openPanel, openDelay);
    }
  }

  function scheduleClose() {
    window.clearTimeout(openTimer);
    closeTimer = window.setTimeout(closePanel, closeDelay);
  }

  wrapper.addEventListener('mouseenter', function () {
    isPointerInside = true;
    scheduleOpen();
  });
  wrapper.addEventListener('mouseleave', function () {
    isPointerInside = false;
    scheduleClose();
  });
  wrapper.addEventListener('focusin', function () {
    isFocusedInside = true;
    openPanel();
  });
  wrapper.addEventListener('focusout', function (event) {
    isFocusedInside = wrapper.contains(event.relatedTarget);
    if (!isFocusedInside) {
      scheduleClose();
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && (isPointerInside || isFocusedInside || panel.classList.contains('is-open'))) {
      isPointerInside = false;
      isFocusedInside = false;
      closePanel();
      trigger.focus();
    }
  });
}());
