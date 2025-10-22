// Centralize API options (single import of env across project)
import { API_ACCESS_TOKEN } from './env.js';
export const API_OPTIONS = {
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_ACCESS_TOKEN}`,
    },
};

// mediaCarousel.js handles carousel functionality and exports API_URLS
import { mediaCarousel, API_URLS } from './mediaCarousel.js';
import { createHeader, createFooter } from './header.js';

// Home page initializer only (avoid side effects when this module is imported elsewhere)
export function initHomePage() {
    // Create multiple movie carousels
    // You can adjust the tileSize parameter to change the size of the movie cards in each carousel
    mediaCarousel(API_URLS.movie.popular, 'Popular Movies', 200);
    mediaCarousel(API_URLS.movie.upcoming, 'Upcoming Movies', 175);
    mediaCarousel(API_URLS.movie.topRated, 'Top Rated Movies', 230);

    addEventListener('DOMContentLoaded', () => {
        // Create footer before wiring search input (needs #searchDiv from header)
        createFooter();
        const searchDiv = document.getElementById('searchDiv');
        const searchInput = document.createElement('input');
        searchInput.id = 'searchInput';
        searchInput.type = 'text';
        searchInput.placeholder = 'Search all movies . . .';
        searchInput.className = 'border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[30rem]';
        if (searchDiv) {
            searchDiv.appendChild(searchInput);
        }
    });
}
initHomePage();
