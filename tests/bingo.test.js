const { generateGridData, CATEGORIES, FREE_SPACE_TEXT } = require('../script');

describe('Bingo Grid Generation', () => {
    test('should generate 25 items including free space', () => {
        const gridData = generateGridData();
        expect(gridData).toHaveLength(25);
    });

    test('should have free space in the center (index 12)', () => {
        const gridData = generateGridData();
        expect(gridData[12]).toBe(FREE_SPACE_TEXT);
    });

    test('should include at least 2 items from each category', () => {
        const gridData = generateGridData();
        const categoryCounts = {};

        // Flatten categories for easy lookup
        const reverseMap = {};
        for (const [cat, items] of Object.entries(CATEGORIES)) {
            items.forEach(item => {
                reverseMap[item] = cat;
            });
            categoryCounts[cat] = 0;
        }

        gridData.forEach((item, index) => {
            if (index === 12) return; // Skip free space
            const cat = reverseMap[item];
            if (cat) {
                categoryCounts[cat]++;
            }
        });

        // Verify counts
        for (const cat in CATEGORIES) {
            expect(categoryCounts[cat]).toBeGreaterThanOrEqual(2);
        }
    });

    test('should contain unique items', () => {
        const gridData = generateGridData();
        const uniqueItems = new Set(gridData);
        expect(uniqueItems.size).toBe(25);
    });
});
