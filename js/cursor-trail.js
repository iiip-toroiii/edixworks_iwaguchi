(function () {
  'use strict';

  const canUseTrail = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canUseTrail || reducedMotion) {
    return;
  }

  const trailImage = './assets/ashiato.png';
  const spacing = 45;
  const maxFootprints = 30;
  const sideOffset = 10;
  const backOffset = 8;
  const footprints = [];
  let previousPoint = null;
  let distanceSinceFootprint = 0;
  let side = 1;
  let pendingPoint = null;
  let frameRequested = false;

  function removeFootprint(footprint) {
    const index = footprints.indexOf(footprint);
    if (index !== -1) {
      footprints.splice(index, 1);
    }
    footprint.remove();
  }

  function createFootprint(x, y, angle) {
    const footprint = document.createElement('img');
    footprint.className = 'cursor-trail';
    footprint.src = trailImage;
    footprint.alt = '';
    footprint.setAttribute('aria-hidden', 'true');
    footprint.style.left = `${x - 14}px`;
    footprint.style.top = `${y - 10}px`;
    footprint.style.transform = `rotate(${angle + (side * 0.08)}rad)`;
    footprint.addEventListener('animationend', function () {
      removeFootprint(footprint);
    }, { once: true });

    footprints.push(footprint);
    document.body.appendChild(footprint);
    if (footprints.length > maxFootprints) {
      removeFootprint(footprints[0]);
    }
    side *= -1;
  }

  function processPoint(currentPoint) {
    if (document.hidden) {
      previousPoint = null;
      distanceSinceFootprint = 0;
      return;
    }

    if (!previousPoint) {
      previousPoint = currentPoint;
      return;
    }

    const dx = currentPoint.x - previousPoint.x;
    const dy = currentPoint.y - previousPoint.y;
    const segmentLength = Math.hypot(dx, dy);
    if (!segmentLength) {
      return;
    }

    const directionX = dx / segmentLength;
    const directionY = dy / segmentLength;
    const perpendicularX = -directionY;
    const perpendicularY = directionX;
    const angle = Math.atan2(directionY, directionX) + Math.PI / 2;
    let distanceAlongSegment = spacing - distanceSinceFootprint;
    let lastFootprintDistance = null;

    while (distanceAlongSegment <= segmentLength) {
      const progress = distanceAlongSegment / segmentLength;
      const pathX = previousPoint.x + dx * progress - directionX * backOffset;
      const pathY = previousPoint.y + dy * progress - directionY * backOffset;
      createFootprint(
        pathX + perpendicularX * sideOffset,
        pathY + perpendicularY * sideOffset,
        angle
      );
      lastFootprintDistance = distanceAlongSegment;
      distanceAlongSegment += spacing;
    }

    distanceSinceFootprint = lastFootprintDistance === null
      ? distanceSinceFootprint + segmentLength
      : segmentLength - lastFootprintDistance;
    previousPoint = currentPoint;
  }

  function handlePointerMove(event) {
    pendingPoint = { x: event.clientX, y: event.clientY };
    if (!frameRequested) {
      frameRequested = true;
      window.requestAnimationFrame(function () {
        frameRequested = false;
        if (pendingPoint) {
          processPoint(pendingPoint);
          pendingPoint = null;
        }
      });
    }
  }

  document.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      previousPoint = null;
      distanceSinceFootprint = 0;
      pendingPoint = null;
    }
  });
}());
