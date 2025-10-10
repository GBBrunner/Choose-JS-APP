// moveCarousel.js file handles the movie carousel functionality and API handling
import {movieCarousel, URL} from './movieCarousel.js';

// Create multiple movie carousels
// You can adjust the tileSize parameter to change the size of the movie cards in each carousel
movieCarousel(URL.popular, 'Popular Movies', 200);
movieCarousel(URL.upcoming, 'Upcoming Movies', 175);
movieCarousel(URL.topRated, 'Top Rated Movies', 230);
