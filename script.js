// Data Definitions
const CATEGORIES = {
    politics: [
        "UK PM and Chancellor both remain in post",
        "Ukraine war remains active without a formal ceasefire",
        "China military exercise enters Taiwan’s territorial waters/airspace",
        "US sends Greenland ultimatum to Denmark",
        "US caught spying on EU leadership",
        "Green Party wins more local council seats than Reform UK",
        "UK/EU formally begin Customs Union negotiations",
        "Kemi Badenoch replaced as Conservative Leader",
        "Major new African–EU Trade Deal signed"
    ],
    technology: [
        "Waymo launches public commercial service in London",
        "Major AI company confirms a data breach of >1M users",
        "AI-native video social app reaches Global Top 10 (App Store)",
        "Grok AI-generated adult content reaches >5% of porn traffic",
        "AI \"Agents\" used for autonomous multi-step tasks by a team member at work",
        "Frontier AI model achieves >95% on ARC-AGI-2 benchmark",
        "First feature-length AI-generated film enters box office top 10"
    ],
    economics: [
        "Bitcoin price touches or falls below $25,000 USD",
        "Bank of England base rate drops to 3.0% or lower",
        "Global stock market index (e.g., S&P 500) drops >10% in one month",
        "Alphabet (GOOGL) stock reaches $500",
        "SpaceX holds a public IPO",
        "Brent Crude Oil price drops below $50/barrel",
        "Euro (EUR) reaches 1:1 parity with the Pound (GBP)"
    ],
    science: [
        "Artemis II successfully completes crewed lunar flyby",
        "Zahi Hawass reveals new 30m corridor/chamber inside Great Pyramid",
        "Renewables surpass coal as the world's #1 electricity source",
        "Quantum advantage officially demonstrated by a commercial provider",
        "First clinical trial begins for 3D-printed organ transplant",
        "Global energy storage capacity exceeds 120 GW",
        "Official London heatwave (3+ days over 28°C)"
    ],
    trump: [
        // Free space is handled separately
        "Trump suffers a health event requiring hospitalisation",
        "US Cabinet member resigns or is fired following a drug scandal",
        "GTA VI release date officially delayed beyond 2026",
        "Zohran Mamdani officially announces US Presidential intent"
    ]
};

const FREE_SPACE_TEXT = "Trump abducts Nicolas Maduro";

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
        stamp.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        cell.appendChild(stamp);

        grid.appendChild(cell);
    });
}

function toggleStamp(cell) {
    cell.classList.toggle('stamped');
}

function downloadGrid() {
    const element = document.getElementById('bingo-container');
    // Use html2canvas
    html2canvas(element, {
        backgroundColor: null, // Transparent if possible, or matches CSS
        scale: 2 // Higher resolution
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

    document.getElementById('refresh-btn').addEventListener('click', renderGrid);
    document.getElementById('download-btn').addEventListener('click', downloadGrid);
});
