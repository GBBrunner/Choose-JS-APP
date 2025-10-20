// mediaCarousel.js file handles the media carousel functionality and API handling
import {mediaCarousel, API_URLS} from './mediaCarousel.js';
// Create multiple movie carousels
// You can adjust the tileSize parameter to change the size of the movie cards in each carousel
mediaCarousel(API_URLS.movie.popular, 'Popular Movies', 200);
mediaCarousel(API_URLS.movie.upcoming, 'Upcoming Movies', 175);
mediaCarousel(API_URLS.movie.topRated, 'Top Rated Movies', 230);

addEventListener('DOMContentLoaded', () => {
    const searchDiv = document.getElementById('searchDiv');
    const searchInput = document.createElement('input');
            searchInput.id = "searchInput";
        searchInput.type = "text";
        searchInput.placeholder = "Search all movies . . .";
        searchInput.className = "border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[30rem]";
    searchDiv.appendChild(searchInput);
});