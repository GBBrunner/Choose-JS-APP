// TV shows page using mediaCarousel functionality with TV show API endpoints
import {mediaCarousel, createCarousel, API_URLS} from './mediaCarousel.js';
import {createHeader} from './header.js';

// Create the header dynamically
createHeader();

// Store initial carousels configuration for restoring after search
const initialCarousels = [
  { url: API_URLS.tv.popular, title: 'Popular TV Shows', tileSize: 200 },
  { url: API_URLS.tv.airingToday, title: 'Airing Today', tileSize: 175 },
  { url: API_URLS.tv.topRated, title: 'Top Rated TV Shows', tileSize: 230 }
];

// Create TV show carousels using the mediaCarousel function
// Note: The mediaCarousel function works with both movies and TV shows
mediaCarousel(API_URLS.tv.popular, 'Popular TV Shows', 200);
mediaCarousel(API_URLS.tv.airingToday, 'Airing Today', 175);
mediaCarousel(API_URLS.tv.topRated, 'Top Rated TV Shows', 230);

// Custom search handler for TV shows
addEventListener('DOMContentLoaded', () => {
    const searchDiv = document.getElementById('searchDiv');
    const searchInput = document.createElement('input');
    searchInput.id = "searchInput";
    searchInput.type = "text";
    searchInput.placeholder = "Search all TV Shows . . .";
    searchInput.className = "border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[30rem]";
    searchDiv.appendChild(searchInput);

    let debounceTimer;
    
    searchInput.addEventListener('input', async () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = searchInput.value.trim();
            const container = document.getElementById('carousels-container');

            if (!query) {
                // Restore original carousels
                container.innerHTML = '';
                for (const config of initialCarousels) {
                    await createCarousel(config.url, config.title, false, config.tileSize);
                }
            } else {
                // Search TV shows - clear and show only search results
                const searchUrl = `${API_URLS.tv.search}${encodeURIComponent(query)}`;
                await createCarousel(searchUrl, `Search Results for "${query}"`, true, 200);
            }
        }, 500);
    });
});