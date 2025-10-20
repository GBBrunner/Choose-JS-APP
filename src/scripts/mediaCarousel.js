// Media Carousel - handles carousel functionality for both Movies and TV Shows from TMDB API
// Import the API Access Token from env.js
import { API_ACCESS_TOKEN } from './env.js';
import { getCurrentUser, isFavorite, addToFavorites, removeFromFavorites } from './favorites.js';

// getCurrentUser now imported from favorites.js

// API configuration
const API_OPTIONS = {
  headers: {
    accept: 'application/json',
    // The Access Token should have been set up in env.js as per README instructions. 
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  },
};
const API_URLS = {
  search: 'https://api.themoviedb.org/3/search/collection?include_adult=false&language=en-US&page=1',
  movie: {
    search: 'https://api.themoviedb.org/3/search/movie?language=en-US&page=1&query=',
    popular: 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1',
    upcoming: 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1',
    topRated: 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1',
  },
  tv: {
    search: 'https://api.themoviedb.org/3/search/tv?language=en-US&page=1&query=',
    popular: 'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1',
    airingToday: 'https://api.themoviedb.org/3/tv/airing_today?language=en-US&page=1',
    topRated: 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1',
  }
};
  // Favorite button logic moved to favorites.js

// --- Global State ---
let carouselIdCounter = 0;
const initialCarousels = [];
let isSearchHandlerAttached = false;

// --- Utility Functions ---
const fetchJson = async (url) => {
  try {
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch JSON:', error);
    return null;
  }
};

// --- DOM Creation ---
const createCarouselShell = (title, tileSize) => {
  const carouselId = `carousel-${carouselIdCounter++}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'relative overflow-hidden w-screen h-auto my-6';

  // Set the title if provided
  if (title) {
    // Dynamically adjust title font size based on tileSize
    const titleFontSize = Math.max(18, Math.floor(24 * (tileSize / 200)));
    wrapper.innerHTML = `<h2 class="text-[${titleFontSize}px] font-bold text-gray-800 px-4 py-2">${title}</h2>`;
  }

  const btnClass = 'absolute bottom-4 bg-indigo-600 opacity-75 hover:opacity-90 text-white p-3 rounded-full shadow-md hover:bg-indigo-700 transition z-10 hidden';
  
  const prevBtn = Object.assign(document.createElement('button'), { id: `prevBtn-${carouselId}`, className: `${btnClass} left-2`, innerHTML: '<i class="fa-solid fa-chevron-left text-lg"></i>' });
  const nextBtn = Object.assign(document.createElement('button'), { id: `nextBtn-${carouselId}`, className: `${btnClass} right-2`, innerHTML: '<i class="fa-solid fa-chevron-right text-lg"></i>' });
  const strip = Object.assign(document.createElement('div'), { id: `media-strip-${carouselId}`, className: 'flex flex-row gap-4 items-stretch' });

  wrapper.append(prevBtn, nextBtn, strip);
  document.getElementById('carousels-container').appendChild(wrapper);

  return { wrapper, strip, prevBtn, nextBtn, carouselId };
};

const createMediaCard = (media, tileSize, mediaType = 'movie', carouselId) => {
  const scale = tileSize / 200;
  const scaledSize = (base, min = 8) => Math.max(min, Math.floor(base * scale));

  const imgWidth = Math.floor(tileSize * 0.72);
  const imgHeight = Math.floor(imgWidth * 1.5);
  const cardHeight = Math.floor(tileSize * 2);
  const padding = scaledSize(16);
  const fontSizes = { title: scaledSize(14, 10), year: scaledSize(12), rating: scaledSize(12) };
  
  const blankImage = '/src/images/blank_thumbnail.png';
  const imgSrc = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : blankImage;
  
  // Handle both movie and TV show field names
  const title = media.title || media.name || '';
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown';
  const rating = media.vote_average?.toFixed(1) ?? 'N/A';

  const card = document.createElement('div');
  card.className = `media-card bg-white rounded-2xl shadow-md p-[${padding}px] flex flex-col justify-around items-center min-w-[${tileSize}px] max-w-[${tileSize}px] h-[${cardHeight}px] hover:rounded-none hover:scale-105 transition-transform duration-200`;
  
  card.innerHTML = `
    <a href="/src/html/title_details.html">
      <img src="${imgSrc}" class="w-[${imgWidth}px] h-[${imgHeight}px] object-cover mb-2 rounded-lg" alt="${title}" onerror="this.onerror=null;this.src='${blankImage}';">
      <h3 class="font-semibold text-[${fontSizes.title}px] text-center mb-1 line-clamp-2">${title}</h3>
      <p class="text-[${fontSizes.year}px] text-gray-600 mb-1">${year}</p>
    </a>
    <div class="flex items-center gap-2 mt-1">
      <span class="bg-yellow-200 text-yellow-800 text-[${fontSizes.rating}px] px-2 py-1 rounded-md">★ ${rating}</span>
    </div>
  `;
  // Favorite button
  const favBtn = document.createElement('button');
    favBtn.className = "fa-solid fa-heart";
    favBtn.type = 'button';
    favBtn.title = 'Add to favorites';
    favBtn.style.fontSize = `${scaledSize(18)}px`;
    favBtn.style.cursor = 'pointer';
  // set initial color based on stored favorites
    try {
      favBtn.style.color = isFavorite(media.id) ? 'red' : 'black';
      favBtn.setAttribute('aria-pressed', isFavorite(media.id) ? 'true' : 'false');
    } catch (err) {
      favBtn.style.color = 'black';
    }

    favBtn.onclick = (evt) => {
      const currentUser = getCurrentUser();
      if (currentUser === null) {
        alert('Please log in to add to favorites.');
        return;
      }
      evt.stopPropagation();
      // toggle favorite state and persist
      if (isFavorite(media.id)) {
        removeFromFavorites(media.id);
        favBtn.style.color = 'black';
        favBtn.setAttribute('aria-pressed', 'false');
      } else {
        addToFavorites(media, mediaType);
        favBtn.style.color = 'red';
        favBtn.setAttribute('aria-pressed', 'true');
      }
    };
  card.querySelector('.flex.items-center.gap-2.mt-1').appendChild(favBtn);
  return card;
};
// --- Carousel Core Logic ---
async function createCarousel(url, title = '', isSearch = false, tileSize = 200) {
  const container = document.getElementById('carousels-container');
  if (!container) return console.error('carousels-container not found');

  if (isSearch) {
    container.innerHTML = '';
    carouselIdCounter = 0;
  }

  // Detect if this is a TV show URL or movie URL
  const isTVShow = url.includes('/tv/') || url.includes('/search/tv');

  const { wrapper, strip, prevBtn, nextBtn, carouselId } = createCarouselShell(title, tileSize);
  
  let mediaItems = [];
  let currentIndex = 0;
  let isAnimating = false;

  const getVisibleCount = () => {
    const gap = parseInt(getComputedStyle(strip).gap) || 0;
    return Math.max(1, Math.floor((wrapper.clientWidth + gap) / (tileSize + gap)));
  };

  const render = async () => {
    if (!mediaItems.length) {
      strip.innerHTML = '<div class="text-center text-gray-500 w-full py-8">No content found.</div>';
      prevBtn.classList.add('hidden');
      nextBtn.classList.add('hidden');
      return;
    }

    const visibleCount = getVisibleCount();
    const showNav = mediaItems.length > visibleCount;
    prevBtn.classList.toggle('hidden', !showNav);
    nextBtn.classList.toggle('hidden', !showNav);
    strip.classList.toggle('justify-center', !showNav);

    strip.innerHTML = '';
    const visibleMedia = Array.from({ length: Math.min(visibleCount, mediaItems.length) }, (_, i) => mediaItems[(currentIndex + i) % mediaItems.length]);
    
    visibleMedia.forEach(media => {
      strip.appendChild(createMediaCard(media, tileSize, isTVShow ? 'tv' : 'movie', carouselId));
    });
  };

  const slide = (direction) => {
    if (isAnimating || mediaItems.length <= getVisibleCount()) return;
    isAnimating = true;

    const gap = parseInt(getComputedStyle(strip).gap) || 0;
    const step = direction === 'next' ? -(tileSize + gap) : (tileSize + gap);
    strip.style.transition = 'transform 0.25s ease';
    strip.style.transform = `translateX(${step}px)`;

    strip.addEventListener('transitionend', async () => {
      currentIndex = (currentIndex + (direction === 'next' ? 1 : -1) + mediaItems.length) % mediaItems.length;
      strip.style.transition = 'none';
      strip.style.transform = 'translateX(0)';
      await render();
      isAnimating = false;
    }, { once: true });
  };

  nextBtn.addEventListener('click', () => slide('next'));
  prevBtn.addEventListener('click', () => slide('prev'));
  window.addEventListener('resize', () => render());

  strip.innerHTML = '<div class="text-center text-blue-500 w-full py-8">Loading...</div>';
  const data = await fetchJson(url);
  mediaItems = data?.results || [];
  await render();
}
// --- Initialization ---
function setupSearchHandler() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  let debounceTimer;
  
  const handleSearch = async () => {
    const query = searchInput.value.trim();
    const container = document.getElementById('carousels-container');

    if (!query) {
      container.innerHTML = '';
      carouselIdCounter = 0;
      for (const config of initialCarousels) {
        await createCarousel(config.url, config.title, false, config.tileSize);
      }
      return;
    }
    
    const searchUrl = `${API_URLS.movie.search}${encodeURIComponent(query)}`;
    await createCarousel(searchUrl, `Search Results for "${query}"`, true, 200);
  };
  
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleSearch, 500);
  });
}

function mediaCarousel(url, title = '', tileSize = 200) {
  initialCarousels.push({ url, title, tileSize });
}
// Initialize all carousels sequentially when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  for (const config of initialCarousels) {
    await createCarousel(config.url, config.title, false, config.tileSize);
  }
  setupSearchHandler();
  isSearchHandlerAttached = true;
});

// Exports for functional use in other modules
export { mediaCarousel, createCarousel, API_URLS, API_OPTIONS, fetchJson};
// Exports for Jasmine tests
export default{createCarouselShell, createMediaCard};