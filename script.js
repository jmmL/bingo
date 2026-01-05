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
let winTimeout = null;

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
    grid.innerHTML = ''; // Clear existing

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
            // Add custom free space marker logic if needed, but 'stamped' class handles visual
        } else {
            // Add click listener for normal cells
            cell.addEventListener('click', () => {
                toggleStamp(cell);
            });
        }

        // Add stamp element (hidden by default unless .stamped)
        const stamp = document.createElement('div');
        stamp.classList.add('stamp-mark');
        // Random rotation for realism
        const rotation = Math.floor(Math.random() * 60) - 30; // -30 to 30 deg
        const scale = 0.9 + Math.random() * 0.2; // slight size variation
        stamp.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
        cell.appendChild(stamp);

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
    const size = 5;
    let winType = null; // 'row', 'col', 'diag-main', 'diag-anti'
    let winningLine = null;

    // Check Rows
    for (let r = 0; r < size; r++) {
        let rowIndices = [];
        let allStamped = true;
        for (let c = 0; c < size; c++) {
            let index = r * size + c;
            rowIndices.push(index);
            if (!cells[index].classList.contains('stamped')) {
                allStamped = false;
                break;
            }
        }
        if (allStamped) {
            winningLine = rowIndices;
            winType = 'row';
            break;
        }
    }

    // Check Columns
    if (!winningLine) {
        for (let c = 0; c < size; c++) {
            let colIndices = [];
            let allStamped = true;
            for (let r = 0; r < size; r++) {
                let index = r * size + c;
                colIndices.push(index);
                if (!cells[index].classList.contains('stamped')) {
                    allStamped = false;
                    break;
                }
            }
            if (allStamped) {
                winningLine = colIndices;
                winType = 'col';
                break;
            }
        }
    }

    // Check Diagonals
    if (!winningLine) {
        // Top-left to bottom-right
        let diag1 = [0, 6, 12, 18, 24];
        if (diag1.every(i => cells[i].classList.contains('stamped'))) {
            winningLine = diag1;
            winType = 'diag-main';
        }
    }
    if (!winningLine) {
        // Top-right to bottom-left
        let diag2 = [4, 8, 12, 16, 20];
        if (diag2.every(i => cells[i].classList.contains('stamped'))) {
            winningLine = diag2;
            winType = 'diag-anti';
        }
    }

    if (winningLine) {
        triggerWin(winningLine, winType);
    } else {
        removeStrikes();
    }
}

function triggerWin(indices, winType) {
    // Confetti immediately
    if (window.confetti) {
        window.confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Clear any pending timeout
    if (winTimeout) clearTimeout(winTimeout);

    // Delay strike through
    winTimeout = setTimeout(() => {
        const cells = document.querySelectorAll('.bingo-cell');

        // Remove old strikes to be clean
        cells.forEach(cell => {
             cell.classList.remove('won', 'won-row', 'won-col', 'won-diag-main', 'won-diag-anti');
        });

        indices.forEach(index => {
            cells[index].classList.add('won');
            cells[index].classList.add(`won-${winType}`);
        });
    }, 500);
}

function removeStrikes() {
    if (winTimeout) clearTimeout(winTimeout);
    const cells = document.querySelectorAll('.bingo-cell');
    cells.forEach(cell => {
        cell.classList.remove('won', 'won-row', 'won-col', 'won-diag-main', 'won-diag-anti');
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
document.addEventListener('DOMContentLoaded', () => {
    renderGrid();

    document.getElementById('refresh-btn').addEventListener('click', () => {
        renderGrid();
        removeStrikes();
    });
    document.getElementById('download-btn').addEventListener('click', downloadGrid);
});
