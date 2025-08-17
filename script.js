function placeWords() {
  const oldWords = container.querySelectorAll('.word');
  oldWords.forEach((w) => w.remove());

  const placedBoxes = [];
  const padding = 8; // Increased padding for better spacing
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const polyCenter = {
    x: polyBox.x + polyBox.width / 2,
    y: polyBox.y + polyBox.height / 2,
  };

  const fontWeights = [400, 500, 600, 700];
  const fontSizes = [
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  ];
  const maxDistance = Math.sqrt(containerWidth ** 2 + containerHeight ** 2) / 2;

  function boxesOverlapWithPadding(a, b, pad = 0) {
    return !(
      a.x + a.width + pad < b.x - pad ||
      a.x - pad > b.x + b.width + pad ||
      a.y + a.height + pad < b.y - pad ||
      a.y - pad > b.y + b.height + pad
    );
  }

  for (const word of words) {
    let tries = 0;
    while (tries < 500) {
      const rotation = randInt(-40, 40);

      const span = document.createElement('span');
      span.textContent = word;
      span.style.position = 'absolute';
      span.style.whiteSpace = 'nowrap';
      container.appendChild(span);

      // Temporarily set fontSize & fontWeight for sizing
      // We'll decide them after position is checked, so initially mid font size for measurement
      span.style.fontSize = fontSizes[Math.floor(fontSizes.length / 2)] + 'px';
      span.style.fontWeight = fontWeights[Math.floor(fontWeights.length / 2)];

      let wordWidth = span.offsetWidth;
      let wordHeight = span.offsetHeight;

      const x = randInt(padding, containerWidth - wordWidth - padding);
      const y = randInt(padding, containerHeight - wordHeight - padding);
      const box = { x, y, width: wordWidth, height: wordHeight };

      // Check overlap with already placed words using increased padding
      const overlapsWord = placedBoxes.some((p) =>
        boxesOverlapWithPadding(box, p, padding)
      );

      // Check overlap with polygon bounding box using padding
      const overlapsPolyBox = boxesOverlapWithPadding(box, polyBox, padding);

      // Check if inside polygon triangle area
      const inTriangle = pointInTriangleContainerCoords({
        x: x + wordWidth / 2,
        y: y + wordHeight / 2,
      });

      if (overlapsWord || overlapsPolyBox || inTriangle) {
        span.remove();
        tries++;
        continue;
      }

      // Calculate distance for font size and weight
      const wordCenter = { x: x + wordWidth / 2, y: y + wordHeight / 2 };
      const dx = wordCenter.x - polyCenter.x;
      const dy = wordCenter.y - polyCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normDist = Math.min(distance / maxDistance, 1);

      // Pick fontSize from array (larger for closer)
      const fontSizeIndex = Math.min(
        fontSizes.length - 1,
        Math.floor((1 - normDist) * fontSizes.length)
      );
      const fontSize = fontSizes[fontSizeIndex];
      span.style.fontSize = fontSize + 'px';

      // Update wordWidth, wordHeight after font size change
      wordWidth = span.offsetWidth;
      wordHeight = span.offsetHeight;

      // Update box with new dimensions and check overlap again to be safe
      box.width = wordWidth;
      box.height = wordHeight;

      // If after font size update it overlaps, retry
      if (
        placedBoxes.some((p) => boxesOverlapWithPadding(box, p, padding)) ||
        boxesOverlapWithPadding(box, polyBox, padding) ||
        pointInTriangleContainerCoords({
          x: x + wordWidth / 2,
          y: y + wordHeight / 2,
        })
      ) {
        span.remove();
        tries++;
        continue;
      }

      // Pick fontWeight from array for closeness
      const fontWeightIndex = Math.min(
        fontWeights.length - 1,
        Math.floor((1 - normDist) * fontWeights.length)
      );
      span.style.fontWeight = fontWeights[fontWeightIndex];

      // Class name assignment based on updated fontSize
      if (fontSize === 19 || fontSize === 23) {
        span.className = 'word prime';
      } else if (fontSize === 18) {
        span.className = 'word first';
      } else if (fontSize === 22) {
        span.className = 'word middle';
      } else if (fontSize === 28) {
        span.className = 'word last';
      } else if (fontSize % 2 === 0) {
        span.className = 'word even';
      } else {
        span.className = 'word odd';
      }

      span.style.transform = `rotate(${rotation}deg)`;
      span.style.left = `${polyCenter.x}px`;
      span.style.top = `${polyCenter.y}px`;
      requestAnimationFrame(() => {
        span.style.transition = 'left 0.7s ease, top 0.7s ease';
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;
      });

      placedBoxes.push(box);
      break;
    }
  }
}

window.addEventListener('resize', () => {
  // Update bounding rects and scales
  const containerRect = container.getBoundingClientRect();
  const svgRect = logoSVG.getBoundingClientRect();
  scaleX = svgRect.width / 800;
  scaleY = svgRect.height / 800;

  // Update polyBox coordinates accordingly
  const polyMinX =
    Math.min(...trianglePoints.map((p) => p.x)) * scaleX +
    (svgRect.left - containerRect.left);
  const polyMaxX =
    Math.max(...trianglePoints.map((p) => p.x)) * scaleX +
    (svgRect.left - containerRect.left);
  const polyMinY =
    Math.min(...trianglePoints.map((p) => p.y)) * scaleY +
    (svgRect.top - containerRect.top);
  const polyMaxY =
    Math.max(...trianglePoints.map((p) => p.y)) * scaleY +
    (svgRect.top - containerRect.top);

  polyBox.x = polyMinX;
  polyBox.y = polyMinY;
  polyBox.width = polyMaxX - polyMinX;
  polyBox.height = polyMaxY - polyMinY;

  // Clear and reposition words with updated sizes
  placeWords();
});
