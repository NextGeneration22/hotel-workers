// Generate unique key for each cell using table, row and column index
function generateCellKey(tableIndex, rowIdx, colIdx) {
  return `cell-${tableIndex}-${rowIdx}-${colIdx}`;
}

// Save time to localStorage
function saveTime(cell, tableIndex, rowIdx, colIdx) {
  const key = generateCellKey(tableIndex, rowIdx, colIdx);
  localStorage.setItem(key, cell.textContent);
}

// Load saved times from localStorage
function restoreSavedTimes() {
  const tables = document.querySelectorAll('#attendance-table');
  
  tables.forEach((table, tableIndex) => {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, rowIdx) => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, colIdx) => {
        if (cell.classList.contains('clickable')) {
          const key = generateCellKey(tableIndex, rowIdx, colIdx);
          const savedTime = localStorage.getItem(key);
          if (savedTime) {
            cell.textContent = savedTime;
            cell.classList.add('handwritten');
          }
        }
      });
    });
  });
}

// Restore saved signatures from localStorage
function restoreSignatures() {
  const tables = document.querySelectorAll('#attendance-table');
  
  tables.forEach((table, tableIndex) => {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, rowIdx) => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, colIdx) => {
        if (cell.classList.contains('signCell')) {
          // Store original text if not already set
          if (!cell.dataset.originalText) {
            cell.dataset.originalText = cell.textContent;
          }
          
          const key = `signature-${tableIndex}-${rowIdx}-${colIdx}`;
          const savedSignature = localStorage.getItem(key);
          if (savedSignature) {
            cell.innerHTML = `<img src="${savedSignature}" style="height:40px;" />`;
          }
        }
      });
    });
  });
}

// Format time as HH:MM
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Signature pad modal functionality
const modal = document.getElementById("myModal");
const closeBtn = document.querySelector(".close");
let currentCell = null;

// Initialize canvas
const canvas = document.getElementById('signatureCanvas');
const context = canvas.getContext('2d');
let drawing = false;

// Canvas drawing functions
function getPosition(e) {
  let x, y;
  if (e.touches) {
    x = e.touches[0].clientX - canvas.offsetLeft;
    y = e.touches[0].clientY - canvas.offsetTop;
  } else {
    x = e.clientX - canvas.offsetLeft;
    y = e.clientY - canvas.offsetTop;
  }
  return { x, y };
}

function startDrawing(e) {
  drawing = true;
  const pos = getPosition(e);
  context.beginPath();
  context.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing) return;
  const pos = getPosition(e);
  context.lineTo(pos.x, pos.y);
  context.stroke();
}

function stopDrawing() {
  drawing = false;
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Modal functions
function openSignaturePad(cell) {
  modal.style.display = "block";
  currentCell = cell;
  document.getElementById('signatureModal').style.display = 'block';
}

function saveSignature() {
  const canvas = document.getElementById('signatureCanvas');
  const dataURL = canvas.toDataURL();
  currentCell.innerHTML = `<img src="${dataURL}" style="height:40px;"></img>`;

  // Get the table, row, and column indices
  const table = currentCell.closest('table');
  const tables = document.querySelectorAll('#attendance-table');
  const tableIndex = Array.from(tables).indexOf(table);
  const row = currentCell.parentElement;
  const rowIdx = Array.from(row.parentElement.children).indexOf(row);
  const colIdx = currentCell.cellIndex;
  
  // Include table index in the key
  const key = `signature-${tableIndex}-${rowIdx}-${colIdx}`;
  localStorage.setItem(key, dataURL);

  document.getElementById('signatureModal').style.display = 'none';
  clearCanvas();
  modal.style.display = "none";
}

// On page load
window.addEventListener('DOMContentLoaded', () => {
  restoreSavedTimes();
  restoreSignatures();

  // Time-related click handlers
  const tables = document.querySelectorAll('#attendance-table');
  
  tables.forEach((table, tableIndex) => {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, rowIdx) => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, colIdx) => {
        if (cell.classList.contains('clickable')) {
          cell.addEventListener('click', () => {
            if (!cell.textContent.trim()) {
              const currentTime = getCurrentTime();
              cell.textContent = currentTime;
              cell.classList.add('handwritten');
              saveTime(cell, tableIndex, rowIdx, colIdx);
            }
          });

          cell.addEventListener('dblclick', () => {
            if (cell.textContent.trim()) {
              cell.textContent = '';
              cell.classList.remove('handwritten');
              localStorage.removeItem(generateCellKey(tableIndex, rowIdx, colIdx));
            }
          });
        }
      });
    });
  });

  // Signature cell handlers with improved double-click detection
  document.querySelectorAll('.signCell').forEach(cell => {
    let clickTimer = null;
    
    cell.addEventListener('click', function(e) {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        // Double-click action
        if (this.querySelector('img')) {
          this.innerHTML = this.dataset.originalText || 'Sign';
          const table = this.closest('table');
          const tables = document.querySelectorAll('#attendance-table');
          const tableIndex = Array.from(tables).indexOf(table);
          const row = this.parentElement;
          const rowIdx = Array.from(row.parentElement.children).indexOf(row);
          const colIdx = this.cellIndex;
          const key = `signature-${tableIndex}-${rowIdx}-${colIdx}`;
          localStorage.removeItem(key);
        }
      } else {
        clickTimer = setTimeout(() => {
          clickTimer = null;
          // Single-click action
          openSignaturePad(this);
        }, 300); // 300ms delay to detect double-click
      }
    });
  });

  // Close modal button
  closeBtn.onclick = () => {
    modal.style.display = "none";
    document.getElementById('signatureModal').style.display = 'none';
    clearCanvas();
  };

  // Canvas event listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('touchstart', startDrawing);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDrawing);
});


/////

const resetBtn = document.getElementById("resetBtn");
const modal2 = document.getElementById("passwordModal");
const closeBtn2 = document.querySelector(".close2");
const confirmBtn = document.getElementById("confirmReset");
const passwordInput = document.getElementById("passwordInput");

// Change this to your secure password
const ADMIN_PASSWORD = "Ayoud";

resetBtn.onclick = () => {
  modal2.style.display = "block";
};

closeBtn2.onclick = () => {
  modal2.style.display = "none";
  passwordInput.value = "";
};

confirmBtn.onclick = () => {
  const enteredPassword = passwordInput.value;
  if (enteredPassword === ADMIN_PASSWORD) {
    localStorage.clear();
    alert("Local storage has been reset!");
    modal2.style.display = "none";
    passwordInput.value = "";
  } else {
    alert("Incorrect password. Try again.");
  }
};

window.onclick = (e) => {
  if (e.target === modal2) {
    modal2.style.display = "none";
    passwordInput.value = "";
  }
};
