// moveCarousel.js file handles the movie carousel functionality and API handling
import {movieCarousel, URL} from './movieCarousel.js';
import {createHeader} from './header.js';

// Create the header dynamically
createHeader();

// Create multiple movie carousels
// You can adjust the tileSize parameter to change the size of the movie cards in each carousel
movieCarousel(URL.popular, 'Popular Movies', 200);
movieCarousel(URL.upcoming, 'Upcoming Movies', 175);
movieCarousel(URL.topRated, 'Top Rated Movies', 230);

addEventListener('DOMContentLoaded', () => {
    const searchDiv = document.getElementById('searchDiv');
    const searchInput = document.createElement('input');
            searchInput.id = "searchInput";
        searchInput.type = "text";
        searchInput.placeholder = "Search all TV Shows . . .";
        searchInput.className = "border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[30rem]";
    searchDiv.appendChild(searchInput);
});