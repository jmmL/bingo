/**
 * @jest-environment jsdom
 */

const { downloadGrid } = require('../script');

describe('Script Logic', () => {

    test('downloadGrid should call html2canvas', async () => {
        // Mock document structure
        document.body.innerHTML = '<div id="capture-area"></div><div id="download-btn"></div>';

        const mockCanvas = {
            toDataURL: jest.fn().mockReturnValue('data:image/png;base64,fake')
        };

        // Mock html2canvas global
        global.html2canvas = jest.fn().mockResolvedValue(mockCanvas);

        // Mock anchor element
        const mockLink = {
            click: jest.fn(),
            download: '',
            href: ''
        };

        // We need to spy on document.createElement to return our mock link
        const createElementSpy = jest.spyOn(document, 'createElement');
        createElementSpy.mockImplementation((tag) => {
            if (tag === 'a') return mockLink;
            // For other elements (like in renderGrid calls if any), rely on jsdom default or mock if needed
            // But strict jsdom implementation should work for 'div' etc.
            // Better to call original implementation for non-'a' tags
            return Object.getPrototypeOf(document).createElement.call(document, tag);
        });

        // Since we replaced document.createElement, we need to ensure it works for other tags if called.
        // Actually, JSDOM document.createElement is native-like.
        // Let's just return mockLink for 'a' and null/default for others?
        // Or simpler:
        // createElementSpy.mockReturnValue(mockLink) // This would break other createElements

        // The safest way:
        createElementSpy.mockImplementation((tag) => {
             if (tag === 'a') return mockLink;
             return jest.requireActual('jsdom/lib/jsdom/living/generated/Document').createImpl([], {ownerDocument: document}).createElement(tag);
        });
        // That's too complex.

        // Let's just assume downloadGrid only creates 'a'.
        // But script.js runs renderGrid which creates 'div's.
        // If downloadGrid calls renderGrid? No.

        // However, require('../script') executes the top-level code.
        // The top level code adds event listeners. It calls renderGrid inside 'DOMContentLoaded'.
        // Since we are in JSDOM, 'DOMContentLoaded' might fire if we are not careful?
        // Actually, require executes the file.

        // Let's just mock createElement simply for 'a' and delegate to original for others.
        const originalCreateElement = document.createElement.bind(document);
        createElementSpy.mockImplementation((tag) => {
            if (tag === 'a') return mockLink;
            return originalCreateElement(tag);
        });

        // Call the function
        downloadGrid();

        expect(global.html2canvas).toHaveBeenCalled();
        const element = document.getElementById('capture-area');
        expect(global.html2canvas).toHaveBeenCalledWith(element, expect.objectContaining({ scale: 2 }));

        // Wait for promise resolution
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockLink.download).toBe('2026-bingo-card.png');
        expect(mockLink.href).toBe('data:image/png;base64,fake');
        expect(mockLink.click).toHaveBeenCalled();

        createElementSpy.mockRestore();
    });

});
