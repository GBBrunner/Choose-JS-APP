import mediaCarousel from '../src/scripts/mediaCarousel.js';

describe('mediaCarousel', () => {
    it('exports createCarouselShell as a function', () => {
        expect(typeof mediaCarousel.createCarouselShell).toBe('function');
    });
    
});