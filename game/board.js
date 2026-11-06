// ==========================================================================
// 보드 생성(17x10 = 170개 만다린 타일) · 타일 선택 · 합계 10 판정
// ==========================================================================
const BOARD_COLS = 17;
const BOARD_ROWS = 10;
export const TOTAL_TILES = BOARD_COLS * BOARD_ROWS; // 170

let tilesData = []; // { index, row, col, value, isCleared, el }
let selectedTileIndexes = new Set();
let cachedTileRects = []; // 성능 최적화를 위한 바운딩 캐시

export function generateBoard() {
  const board = document.getElementById('mandarin-board');
  board.innerHTML = '';
  tilesData = [];
  selectedTileIndexes.clear();

  // 1~9 사이의 숫자를 무작위 배정
  const fragment = document.createDocumentFragment();

  for (let idx = 0; idx < TOTAL_TILES; idx++) {
    const row = Math.floor(idx / BOARD_COLS);
    const col = idx % BOARD_COLS;
    const val = Math.floor(Math.random() * 9) + 1;

    const tileEl = document.createElement('div');
    tileEl.className = 'mandarin-tile';
    tileEl.dataset.index = idx;
    tileEl.dataset.row = row;
    tileEl.dataset.col = col;
    tileEl.dataset.val = val;

    tileEl.innerHTML = `
        <img src="images/mandarin.png" alt="귤" class="tile-bg-mandarin" draggable="false">
        <span class="tile-number">${val}</span>
      `;

    fragment.appendChild(tileEl);

    tilesData.push({
      index: idx,
      row,
      col,
      value: val,
      isCleared: false,
      el: tileEl
    });
  }

  board.appendChild(fragment);
}

// 성능 최적화: boardContainer 기준으로 타일 BoundingBox 캐싱
export function cacheTileBoundingBoxes() {
  const container = document.getElementById('board-container');
  if (!container) return;
  const containerRect = container.getBoundingClientRect();

  cachedTileRects = tilesData.map((tile) => {
    if (tile.isCleared) return null;
    const r = tile.el.getBoundingClientRect();
    return {
      left: r.left - containerRect.left,
      top: r.top - containerRect.top,
      right: r.right - containerRect.left,
      bottom: r.bottom - containerRect.top,
      width: r.width,
      height: r.height
    };
  });
}

// 타일 충돌 검사 (AABB 박스 충돌) 후 선택 표시를 갱신하고 현재 합계를 반환
export function selectTilesInBox(boxLeft, boxTop, boxRight, boxBottom) {
  let currentSum = 0;
  const newlySelected = new Set();

  for (let i = 0; i < TOTAL_TILES; i++) {
    const tile = tilesData[i];
    if (!tile || tile.isCleared) continue;

    const rect = cachedTileRects[i];
    if (!rect) continue;

    const isOverlap =
      rect.right > boxLeft &&
      rect.left < boxRight &&
      rect.bottom > boxTop &&
      rect.top < boxBottom;

    if (isOverlap) {
      newlySelected.add(i);
      currentSum += tile.value;
    }
  }

  // 클래스 토글
  for (let i = 0; i < TOTAL_TILES; i++) {
    const tile = tilesData[i];
    if (!tile || tile.isCleared) continue;

    const isNowSelected = newlySelected.has(i);
    if (isNowSelected) {
      tile.el.classList.add('selected');
    } else {
      tile.el.classList.remove('selected');
      tile.el.classList.remove('is-ten');
    }
  }

  selectedTileIndexes = newlySelected;

  // 합계 10 도달 여부 시각화
  selectedTileIndexes.forEach((idx) => {
    if (currentSum === 10) tilesData[idx].el.classList.add('is-ten');
    else tilesData[idx].el.classList.remove('is-ten');
  });

  return currentSum;
}

// 드래그 종료 시 선택된 미수확 타일과 합계를 돌려주고 선택을 비운다
export function takeSelection() {
  let sum = 0;
  const targets = [];
  selectedTileIndexes.forEach((idx) => {
    const tile = tilesData[idx];
    if (tile && !tile.isCleared) {
      sum += tile.value;
      targets.push(tile);
    }
  });
  selectedTileIndexes.clear();
  return { sum, targets };
}

// 실패: 합이 10이 아님 -> Shake 연출 후 선택 해제
export function shakeTiles(targets) {
  targets.forEach((t) => {
    t.el.classList.add('shake-fail');
    setTimeout(() => {
      t.el.classList.remove('shake-fail');
      t.el.classList.remove('selected');
      t.el.classList.remove('is-ten');
    }, 300);
  });
}

// 성공: 타일을 수확 처리하고 팝 애니메이션을 적용한 뒤 중심 좌표(boardContainer 기준)를 반환
export function clearTiles(targetTiles) {
  let sumX = 0;
  let sumY = 0;
  const container = document.getElementById('board-container');
  const containerRect = container.getBoundingClientRect();

  targetTiles.forEach((tile) => {
    tile.isCleared = true;
    cachedTileRects[tile.index] = null;

    const r = tile.el.getBoundingClientRect();
    sumX += (r.left + r.width / 2) - containerRect.left;
    sumY += (r.top + r.height / 2) - containerRect.top;

    // 통통 튀며 터지는 팝 애니메이션 적용
    tile.el.classList.remove('selected', 'is-ten');
    tile.el.classList.add('clearing-pop');

    setTimeout(() => {
      tile.el.classList.remove('clearing-pop');
      tile.el.classList.add('cleared');
    }, 280);
  });

  return { x: sumX / targetTiles.length, y: sumY / targetTiles.length };
}

export function clearSelectionVisuals() {
  tilesData.forEach((t) => {
    if (t && t.el) {
      t.el.classList.remove('selected', 'is-ten', 'shake-fail');
    }
  });
  selectedTileIndexes.clear();
}
