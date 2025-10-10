// Import the API Access Token from env.js
import { API_ACCESS_TOKEN } from './env.js';

// API configuration
const API_OPTIONS = {
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  },
};

const URL = {
  search: 'https://api.themoviedb.org/3/search/movie?language=en-US&limit=100&query=',
  popular: 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&limit=100',
  upcoming: 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1&limit=100',
  topRated: 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&limit=100',
};

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

  if (title) {
    const titleFontSize = Math.max(18, Math.floor(24 * (tileSize / 200)));
    wrapper.innerHTML = `<h2 class="text-[${titleFontSize}px] font-bold text-gray-800 px-4 py-2">${title}</h2>`;
  }

  const btnClass = 'absolute bottom-4 bg-indigo-600 opacity-75 hover:opacity-90 text-white p-3 rounded-full shadow-md hover:bg-indigo-700 transition z-10 hidden';
  
  const prevBtn = Object.assign(document.createElement('button'), { id: `prevBtn-${carouselId}`, className: `${btnClass} left-2`, innerHTML: '<i class="fa-solid fa-chevron-left text-lg"></i>' });
  const nextBtn = Object.assign(document.createElement('button'), { id: `nextBtn-${carouselId}`, className: `${btnClass} right-2`, innerHTML: '<i class="fa-solid fa-chevron-right text-lg"></i>' });
  const strip = Object.assign(document.createElement('div'), { id: `movie-strip-${carouselId}`, className: 'flex flex-row gap-4 items-stretch' });

  wrapper.append(prevBtn, nextBtn, strip);
  document.getElementById('carousels-container').appendChild(wrapper);

  return { wrapper, strip, prevBtn, nextBtn };
};

const createMovieCard = (movie, tileSize) => {
  const scale = tileSize / 200;
  const scaledSize = (base, min = 8) => Math.max(min, Math.floor(base * scale));

  const imgWidth = Math.floor(tileSize * 0.72);
  const imgHeight = Math.floor(imgWidth * 1.5);
  const cardHeight = Math.floor(tileSize * 2);
  const padding = scaledSize(16);
  const fontSizes = { title: scaledSize(14, 10), year: scaledSize(12), rating: scaledSize(12), cert: scaledSize(10) };
  
  const blankImage = '/src/images/blank_thumbnail.png';
  const imgSrc = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : blankImage;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
  const rating = movie.vote_average?.toFixed(1) ?? 'N/A';

  const card = document.createElement('div');
  card.className = `movie-card bg-white rounded-2xl shadow-md p-[${padding}px] flex flex-col justify-around items-center min-w-[${tileSize}px] max-w-[${tileSize}px] h-[${cardHeight}px] hover:rounded-none hover:scale-105 transition-transform duration-200`;
  
  card.innerHTML = `
    <a href="/src/html/title_details.html">
      <img src="${imgSrc}" class="w-[${imgWidth}px] h-[${imgHeight}px] object-cover mb-2 rounded-lg" alt="${movie.title || ''}" onerror="this.onerror=null;this.src='${blankImage}';">
      <h3 class="font-semibold text-[${fontSizes.title}px] text-center mb-1 line-clamp-2">${movie.title || ''}</h3>
      <p class="text-[${fontSizes.year}px] text-gray-600 mb-1">${year}</p>
    </a>
    <div class="flex items-center gap-2 mt-1">
      <span class="bg-yellow-200 text-yellow-800 text-[${fontSizes.rating}px] px-2 py-1 rounded-md">★ ${rating}</span>
      <span id="cert-${movie.id}" class="hidden bg-blue-100 text-blue-800 text-[${fontSizes.cert}px] px-2 py-0.5 rounded-md" title="Content rating">Rated: —</span>
    </div>
  `;

  const favBtn = document.createElement('button');
  favBtn.className = "fa-solid fa-heart hover:text-red-400";
  favBtn.onclick = () => favBtn.classList.toggle('text-red-600');
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

  const { wrapper, strip, prevBtn, nextBtn } = createCarouselShell(title, tileSize);
  
  let movies = [];
  let currentIndex = 0;
  let isAnimating = false;
  const certCache = new Map();

  const getVisibleCount = () => {
    const gap = parseInt(getComputedStyle(strip).gap) || 0;
    return Math.max(1, Math.floor((wrapper.clientWidth + gap) / (tileSize + gap)));
  };

async function fetchCertification(movieId) {
    // Basic guard clauses
    if (!movieId) return;                      // nothing to do for falsy id
    if (certCache.has(movieId)) return;        // already fetched/cached

    try {
        // Fetch release date information for the movie
        const url = `https://api.themoviedb.org/3/movie/${movieId}/release_dates`;
        const data = await fetchJson(url);    // assumes fetchJson handles API key and JSON parsing

        // If the shape of the response is unexpected, cache null and exit
        if (!data || !Array.isArray(data.results)) {
            certCache.set(movieId, null);
            updateCertElement(movieId, null);
            return;
        }

        // Look for a US entry first
        const usEntry = data.results.find(entry => entry.iso_3166_1 === 'US');

        // Try to find a certification inside an entry's release_dates
        const certFromUs = findFirstCertification(usEntry);
        const certFromAny = certFromUs || findFirstCertificationInAll(data.results);

        // Cache the found certification (or null if none)
        const certification = certFromAny || null;
        certCache.set(movieId, certification);

        // Update the DOM to show (or hide) the certification
        updateCertElement(movieId, certification);
    } catch (err) {
        // Fail gracefully: cache null and log error
        console.error('Error fetching certification for', movieId, err);
        certCache.set(movieId, null);
        updateCertElement(movieId, null);
    }
}
// Helper: return the first non-empty certification inside a single country entry
function findFirstCertification(countryEntry) {
  if (!countryEntry || !Array.isArray(countryEntry.release_dates)) return null;
  for (const releaseDate of countryEntry.release_dates) {
    if (releaseDate && releaseDate.certification) return releaseDate.certification;
  }
  return null;
}

// Helper: scan all country entries until a certification is found
function findFirstCertificationInAll(results) {
  for (const entry of results) {
    const cert = findFirstCertification(entry);
    if (cert) return cert;
  }
  return null;
}

// Helper: update the DOM element with id `cert-{movieId}`
function updateCertElement(movieId, certification) {
    const elem = document.getElementById(`cert-${movieId}`);
    if (!elem) return;
    if (certification) {
        elem.textContent = `Rated: ${certification}`;
        elem.classList.remove('hidden');
    } else {
        // hide or clear if no certification
        elem.textContent = '';
        elem.classList.add('hidden');
    }
}

  const render = () => {
    if (!movies.length) {
      strip.innerHTML = '<div class="text-center text-gray-500 w-full py-8">No movies found.</div>';
      prevBtn.classList.add('hidden');
      nextBtn.classList.add('hidden');
      return;
    }

    const visibleCount = getVisibleCount();
    const showNav = movies.length > visibleCount;
    prevBtn.classList.toggle('hidden', !showNav);
    nextBtn.classList.toggle('hidden', !showNav);
    strip.classList.toggle('justify-center', !showNav);

    strip.innerHTML = '';
    const visibleMovies = Array.from({ length: Math.min(visibleCount, movies.length) }, (_, i) => movies[(currentIndex + i) % movies.length]);
    
    visibleMovies.forEach(movie => {
      strip.appendChild(createMovieCard(movie, tileSize));
      fetchCertification(movie.id);
    });
  };

  const slide = (direction) => {
    if (isAnimating || movies.length <= getVisibleCount()) return;
    isAnimating = true;

    const gap = parseInt(getComputedStyle(strip).gap) || 0;
    const step = direction === 'next' ? -(tileSize + gap) : (tileSize + gap);
    strip.style.transition = 'transform 0.25s ease';
    strip.style.transform = `translateX(${step}px)`;

    strip.addEventListener('transitionend', () => {
      currentIndex = (currentIndex + (direction === 'next' ? 1 : -1) + movies.length) % movies.length;
      strip.style.transition = 'none';
      strip.style.transform = 'translateX(0)';
      render();
      isAnimating = false;
    }, { once: true });
  };

  nextBtn.addEventListener('click', () => slide('next'));
  prevBtn.addEventListener('click', () => slide('prev'));
  window.addEventListener('resize', render);

  strip.innerHTML = '<div class="text-center text-blue-500 w-full py-8">Loading...</div>';
  const data = await fetchJson(url);
  movies = data?.results || [];
  render();
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
    
    const searchUrl = `${URL.search}${encodeURIComponent(query)}`;
    await createCarousel(searchUrl, `Search Results for "${query}"`, true, 200);
  };
  
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleSearch, 500);
  });
}

function movieCarousel(url, title = '', tileSize = 200) {
  initialCarousels.push({ url, title, tileSize });
  
  document.addEventListener('DOMContentLoaded', async () => {
    await createCarousel(url, title, false, tileSize);
    
    if (!isSearchHandlerAttached) {
      setupSearchHandler();
      isSearchHandlerAttached = true;
    }
  });
}

export { movieCarousel, URL };