// ==========================================================================
// 드래그 인터랙션 (Desktop Mouse & Mobile Touch 지원) · 선택 박스 · 합계 배지
// ==========================================================================
import { selectTilesInBox, takeSelection, shakeTiles, clearSelectionVisuals } from './board.js';

// isRunning: 게임 진행 여부 조회, onSuccess: 합계 10 달성 타일 처리
export function initDragEvents(boardContainer, { isRunning, onSuccess }) {
  const selectionBox = document.getElementById('selection-box');
  const sumBadge = document.getElementById('sum-badge');
  const sumBadgeVal = document.getElementById('sum-badge-val');

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  function getPointerPos(e) {
    const containerRect = boardContainer.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
      rawClientX: clientX,
      rawClientY: clientY
    };
  }

  // 타일 선택을 갱신하고 합계 10 도달 여부를 선택 박스·배지에 표시
  function updateSelection(boxLeft, boxTop, boxRight, boxBottom) {
    const currentSum = selectTilesInBox(boxLeft, boxTop, boxRight, boxBottom);
    if (currentSum === 10) {
      selectionBox.classList.add('is-ten');
      sumBadge.classList.add('is-ten');
      sumBadgeVal.textContent = '10 ✨';
    } else {
      selectionBox.classList.remove('is-ten');
      sumBadge.classList.remove('is-ten');
      sumBadgeVal.textContent = currentSum;
    }
  }

  // 드래그 시작 핸들러
  function onDragStart(e) {
    if (!isRunning()) return;
    // 터치 시 스크롤 방지
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    isDragging = true;
    const pos = getPointerPos(e);
    dragStartX = pos.x;
    dragStartY = pos.y;

    selectionBox.style.display = 'block';
    selectionBox.style.left = `${dragStartX}px`;
    selectionBox.style.top = `${dragStartY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.classList.remove('is-ten');

    sumBadge.style.display = 'block';
    sumBadge.classList.remove('is-ten');
    sumBadgeVal.textContent = '0';

    updateSelection(dragStartX, dragStartY, dragStartX, dragStartY);
  }

  // 드래그 이동 핸들러
  function onDragMove(e) {
    if (!isDragging || !isRunning()) return;
    if (e.type === 'touchmove') {
      e.preventDefault();
    }

    const pos = getPointerPos(e);
    const curX = pos.x;
    const curY = pos.y;

    const left = Math.min(dragStartX, curX);
    const top = Math.min(dragStartY, curY);
    const width = Math.abs(curX - dragStartX);
    const height = Math.abs(curY - dragStartY);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    // 합계 배지 위치
    sumBadge.style.left = `${curX + 15}px`;
    sumBadge.style.top = `${curY - 30}px`;

    // 타일 충돌 검사 및 합계 산출
    updateSelection(left, top, left + width, top + height);
  }

  // 드래그 종료 핸들러
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    selectionBox.style.display = 'none';
    selectionBox.classList.remove('is-ten');
    sumBadge.style.display = 'none';
    sumBadge.classList.remove('is-ten');

    if (!isRunning()) {
      clearSelectionVisuals();
      return;
    }

    // 합계 검사
    const { sum, targets } = takeSelection();
    if (sum === 10 && targets.length > 0) {
      // 🍊 성공: 합계가 10!
      onSuccess(targets);
    } else {
      shakeTiles(targets);
    }
  }

  // 마우스 이벤트 등록
  boardContainer.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  // 터치 이벤트 등록 (모바일)
  boardContainer.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd);
  window.addEventListener('touchcancel', onDragEnd);
}
