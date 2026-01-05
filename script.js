// Data Definitions
const CATEGORIES = {
    politics: [
        "UK PM and Chancellor remain",
        "Ukraine war continues",
        "China military enters Taiwan",
        "US sends Greenland ultimatum",
        "US caught spying on EU",
        "Greens win more seats than Reform",
        "UK/EU Customs Union talks",
        "Badenoch replaced as Tory Leader",
        "Major African–EU Trade Deal"
    ],
    technology: [
        "Waymo launches in London",
        "Major AI data breach >1M users",
        "AI video app hits Top 10",
        "Grok adult content hits >5%",
        "AI Agents used at work",
        "AI model >95% on ARC-AGI-2",
        "AI film in box office top 10"
    ],
    economics: [
        "Bitcoin falls below $25k",
        "BoE base rate drops to 3.0%",
        "Global stocks drop >10% in month",
        "Alphabet stock reaches $500",
        "SpaceX IPO",
        "Oil drops below $50/barrel",
        "EUR/GBP parity"
    ],
    science: [
        "Artemis II lunar flyby",
        "Archaeologist reveals Pyramid chamber",
        "Renewables surpass coal",
        "Commercial Quantum advantage",
        "3D-printed organ trial begins",
        "Energy storage >120 GW",
        "Official London heatwave"
    ],
    trump: [
        // Free space is handled separately
        "Trump hospitalised",
        "Cabinet member fired over drugs",
        "GTA VI delayed beyond 2026",
        "Mamdani announces Prez run"
    ]
};

const FREE_SPACE_TEXT = "Trump abducts Maduro";
let lastWinningLines = new Set(); // Stores IDs of winning lines (e.g. "row-0", "col-2")

// Utility: Fisher-Yates Shuffle
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function generateGridData() {
    let selectedItems = [];
    let pool = [];

    // Process each category to ensure 2 items from each
    for (const [key, items] of Object.entries(CATEGORIES)) {
        // Create a copy to shuffle
        let categoryItems = [...items];
        shuffle(categoryItems);

        // Take first 2
        selectedItems.push(categoryItems.pop());
        selectedItems.push(categoryItems.pop());

        // Add the rest to the common pool
        pool = pool.concat(categoryItems);
    }

    // Now we have 10 items (2 from each of 5 categories).
    // We need 24 items total (excluding free space).
    // So we need 14 more from the pool.

    shuffle(pool);
    for (let i = 0; i < 14; i++) {
        selectedItems.push(pool[i]);
    }

    // Shuffle the final 24 items so categories aren't clumped
    shuffle(selectedItems);

    // Insert Free Space at the center (index 12 in 0-24 grid)
    selectedItems.splice(12, 0, FREE_SPACE_TEXT);

    return selectedItems;
}

function renderGrid() {
    const grid = document.getElementById('bingo-grid');
    if (!grid) return; // Guard for testing environments without full DOM setup if called early

    grid.innerHTML = ''; // Clear existing
    lastWinningLines = new Set(); // Reset winning lines history

    const items = generateGridData();

    items.forEach((text, index) => {
        const cell = document.createElement('div');
        cell.classList.add('bingo-cell');
        cell.dataset.index = index; // Store index for win check

        const content = document.createElement('div');
        content.classList.add('content');
        content.innerText = text;
        cell.appendChild(content);

        // Handle Free Space
        if (index === 12 && text === FREE_SPACE_TEXT) {
            cell.classList.add('free-space');
            cell.classList.add('stamped'); // Pre-stamped
        } else {
            // Add click listener for normal cells
            cell.addEventListener('click', () => {
                toggleStamp(cell);
            });
        }

        // Stamp Container (clips the stamp)
        const stampContainer = document.createElement('div');
        stampContainer.classList.add('stamp-container');

        // Add stamp element (hidden by default unless .stamped)
        const stamp = document.createElement('div');
        stamp.classList.add('stamp-mark');
        // Random rotation for realism
        const rotation = Math.floor(Math.random() * 60) - 30; // -30 to 30 deg
        const scale = 0.9 + Math.random() * 0.2; // slight size variation
        stamp.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;

        stampContainer.appendChild(stamp);
        cell.appendChild(stampContainer);

        // Strike Lines
        ['row', 'col', 'diag-main', 'diag-anti'].forEach(type => {
            const line = document.createElement('div');
            line.className = `strike-line ${type}`;
            cell.appendChild(line);
        });

        grid.appendChild(cell);
    });
}

function toggleStamp(cell) {
    if (cell.classList.contains('locked')) return;

    cell.classList.toggle('stamped');
    checkWin();
}

function checkWin() {
    const cells = document.querySelectorAll('.bingo-cell');
    if (cells.length === 0) return;

    const size = 5;

    let currentWinningLines = new Set();

    // Check Rows
    for (let r = 0; r < size; r++) {
        let allStamped = true;
        for (let c = 0; c < size; c++) {
            if (!cells[r * size + c].classList.contains('stamped')) {
                allStamped = false;
                break;
            }
        }
        if (allStamped) {
            currentWinningLines.add(`row-${r}`);
        }
    }

    // Check Columns
    for (let c = 0; c < size; c++) {
        let allStamped = true;
        for (let r = 0; r < size; r++) {
            if (!cells[r * size + c].classList.contains('stamped')) {
                allStamped = false;
                break;
            }
        }
        if (allStamped) {
            currentWinningLines.add(`col-${c}`);
        }
    }

    // Check Diagonals
    let diag1 = [0, 6, 12, 18, 24];
    if (diag1.every(i => cells[i].classList.contains('stamped'))) {
        currentWinningLines.add('diag-main');
    }

    let diag2 = [4, 8, 12, 16, 20];
    if (diag2.every(i => cells[i].classList.contains('stamped'))) {
        currentWinningLines.add('diag-anti');
    }

    // Determine if we have any NEW wins
    let hasNewWin = false;
    for (let lineId of currentWinningLines) {
        if (!lastWinningLines.has(lineId)) {
            hasNewWin = true;
            break;
        }
    }

    // Trigger Confetti if new win
    if (hasNewWin) {
        if (window.confetti) {
            window.confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    // Update persistent state
    lastWinningLines = currentWinningLines;

    // Update Visuals
    updateStrikeLines(cells, currentWinningLines);
}

function updateStrikeLines(cells, winningLines) {
    // First, deactivate all lines
    document.querySelectorAll('.strike-line').forEach(el => el.classList.remove('active'));

    // Then activate current wins
    winningLines.forEach(lineId => {
        if (lineId.startsWith('row-')) {
            const r = parseInt(lineId.split('-')[1]);
            for (let c = 0; c < 5; c++) {
                const index = r * 5 + c;
                const line = cells[index].querySelector('.strike-line.row');
                if (line) line.classList.add('active');
            }
        } else if (lineId.startsWith('col-')) {
            const c = parseInt(lineId.split('-')[1]);
            for (let r = 0; r < 5; r++) {
                const index = r * 5 + c;
                const line = cells[index].querySelector('.strike-line.col');
                if (line) line.classList.add('active');
            }
        } else if (lineId === 'diag-main') {
            [0, 6, 12, 18, 24].forEach(index => {
                const line = cells[index].querySelector('.strike-line.diag-main');
                if (line) line.classList.add('active');
            });
        } else if (lineId === 'diag-anti') {
            [4, 8, 12, 16, 20].forEach(index => {
                const line = cells[index].querySelector('.strike-line.diag-anti');
                if (line) line.classList.add('active');
            });
        }
    });
}

function downloadGrid() {
    const element = document.getElementById('capture-area');
    html2canvas(element, {
        backgroundColor: null,
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = '2026-bingo-card.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Initial Render
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        renderGrid();

        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                renderGrid();
            });
        }

        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadGrid);
        }
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateGridData,
        checkWin,
        downloadGrid,
        renderGrid,
        CATEGORIES,
        FREE_SPACE_TEXT
    };
}
