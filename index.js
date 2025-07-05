// Generate unique key for each cell using row and column index
function generateCellKey(rowIdx, colIdx) {
  return `cell-${rowIdx}-${colIdx}`;
}

// Save time to localStorage
function saveTime(cell, rowIdx, colIdx) {
  const key = generateCellKey(rowIdx, colIdx);
  localStorage.setItem(key, cell.textContent);
}

// Load saved times from localStorage
function restoreSavedTimes() {
  const rows = document.querySelectorAll('#attendance-table tbody tr');
  rows.forEach((row, rowIdx) => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, colIdx) => {
      if (cell.classList.contains('clickable')) {
        const key = generateCellKey(rowIdx, colIdx);
        const savedTime = localStorage.getItem(key);
        if (savedTime) {
          cell.textContent = savedTime;
          cell.classList.add('handwritten');
        }
      }
    });
  });
}

// On page load
window.addEventListener('DOMContentLoaded', () => {
  restoreSavedTimes();

  const rows = document.querySelectorAll('#attendance-table tbody tr');
  rows.forEach((row, rowIdx) => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, colIdx) => {
      if (cell.classList.contains('clickable')) {
        cell.addEventListener('click', () => {
          if (!cell.textContent.trim()) {
            const currentTime = getCurrentTime();
            cell.textContent = currentTime;
            cell.classList.add('handwritten');
            saveTime(cell, rowIdx, colIdx);
          }
        });

        cell.addEventListener('dblclick', () => {
          if (cell.textContent.trim()) {
            cell.textContent = '';
            cell.classList.remove('handwritten');
            localStorage.removeItem(generateCellKey(rowIdx, colIdx));
          }
        });
      }
    });
  });
});

// Format time as HH:MM
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
