/* Original Logo Word Placement Script */
const container = document.getElementById('container');
const logoSVG = document.getElementById('logo-svg');
const logoLink = document.getElementById('logo-link');

const words = [
  'Royalties',
  'Marketing',
  'Invention',
  'Prototyping',
  'Appraisals',
  'Innovation',
  'Confidentiality',
  'Trade Marks',
  'CopyRights',
  'Ideas',
  'Crowdfunding',
  'Design',
  'Rights',
  'Protect',
  'Your Idea',
  'Creative',
  'Funding',
  'Patents',
  'Patent Attorneys',
  'Investors',
  'Designs',
  'Licensing',
  'Branding',
  'TradeMarks',
  'DesignRights',
  'Branding',
  'Prototyping',
  'Appraisals',
  'Patents',
  'IP',
  'Innovation',
  'Business',
  'Support',
  'Practical',
  'Creative',
  'Workshops',
  'CopyRights',
  'Marketing',
  'Invention',
  'Crowdfunding',
  'PatentPending',
  'TradeSecrets',
  'Investors',
  'Branding',
  'Trade Marks',
  'Design',
  'Rights',
  'Patents',
  'Prototyping',
  'Appraisals',
  'Patents',
  'Innovation',
  'Busines',
  'Support',
  'Licensing',
  'NDA',
  'Investors',
  'Funding',
];

const trianglePoints = [
  { x: 400, y: 120 },
  { x: 680, y: 680 },
  { x: 120, y: 680 },
];

function pointInTriangle(pt, v1, v2, v3) {
  const dX = pt.x - v3.x;
  const dY = pt.y - v3.y;
  const dX21 = v3.x - v2.x;
  const dY12 = v2.y - v3.y;
  const D = dY12 * (v1.x - v3.x) + dX21 * (v1.y - v3.y);
  const s = dY12 * dX + dX21 * dY;
  const t = (v3.y - v1.y) * dX + (v1.x - v3.x) * dY;
  if (D < 0) return s <= 0 && t <= 0 && s + t >= D;
  return s >= 0 && t >= 0 && s + t <= D;
}

const containerRect = container.getBoundingClientRect();
const svgRect = logoSVG.getBoundingClientRect();
const scaleX = svgRect.width / 800;
const scaleY = svgRect.height / 800;

function svgToContainer(pt) {
  return {
    x: svgRect.left - containerRect.left + pt.x * scaleX,
    y: svgRect.top - containerRect.top + pt.y * scaleY,
  };
}
function containerToSVG(pt) {
  return {
    x: (pt.x - (svgRect.left - containerRect.left)) / scaleX,
    y: (pt.y - (svgRect.top - containerRect.top)) / scaleY,
  };
}
function pointInTriangleContainerCoords(pt) {
  const svgPt = containerToSVG(pt);
  return pointInTriangle(svgPt, ...trianglePoints);
}

const logoCenter = svgToContainer({ x: 400, y: 460 });

function overlapsAny(box, boxes, padding = 0) {
  return boxes.some(
    (b) =>
      !(
        box.x + box.width + padding < b.x - padding ||
        box.x - padding > b.x + b.width + padding ||
        box.y + box.height + padding < b.y - padding ||
        box.y - padding > b.y + b.height + padding
      )
  );
}

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

const polyBox = {
  x: polyMinX,
  y: polyMinY,
  width: polyMaxX - polyMinX,
  height: polyMaxY - polyMinY,
};

function boxesOverlap(boxA, boxB) {
  return !(
    boxA.x + boxA.width < boxB.x ||
    boxA.x > boxB.x + boxB.width ||
    boxA.y + boxA.height < boxB.y ||
    boxA.y > boxB.y + boxB.height
  );
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function placeWords() {
  const oldWords = container.querySelectorAll('.word');
  oldWords.forEach((w) => w.remove());

  const placedBoxes = [];
  const padding = 10;
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

  for (const word of words) {
    let tries = 0;
    while (tries < 500) {
      const rotation = randInt(-40, 40);

      const span = document.createElement('span');
      span.textContent = word;
      span.style.position = 'absolute';
      span.style.whiteSpace = 'nowrap';
      container.appendChild(span);

      // Temporarily set mid fontSize for measurement
      span.style.fontSize = fontSizes[Math.floor(fontSizes.length / 2)] + 'px';

      const wordWidth = span.offsetWidth;
      const wordHeight = span.offsetHeight;

      const x = randInt(padding, containerWidth - wordWidth - padding);
      const y = randInt(padding, containerHeight - wordHeight - padding);
      const box = { x, y, width: wordWidth, height: wordHeight };

      const overlapsWord = placedBoxes.some(
        (p) =>
          p.x < box.x + box.width + 2 &&
          p.x + p.width + 2 > box.x &&
          p.y < box.y + box.height + 2 &&
          p.y + p.height + 2 > box.y
      );
      if (
        overlapsWord ||
        boxesOverlap(box, polyBox) ||
        pointInTriangleContainerCoords({
          x: x + wordWidth / 2,
          y: y + wordHeight / 2,
        })
      ) {
        span.remove();
        tries++;
        continue;
      }

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

      // Pick fontWeight from array (bolder for closer)
      const fontWeightIndex = Math.min(
        fontWeights.length - 1,
        Math.floor((1 - normDist) * fontWeights.length)
      );
      span.style.fontWeight = fontWeights[fontWeightIndex];

      // Class names as before
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

placeWords();

logoLink.addEventListener('click', (e) => {
  e.preventDefault();
  const rect = container.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (pointInTriangleContainerCoords({ x: clickX, y: clickY })) {
    window.open('https://google.com', '_blank');
  } else {
    placeWords();
  }
});

container.addEventListener('click', (e) => {
  if (!logoSVG.contains(e.target)) {
    placeWords();
  }
});
