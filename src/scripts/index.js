// Import the API Access Token from env.js
// This keeps sensitive information out of the main codebase
// It is in .gitignore and not tracked by git so a new token will be needed for others to run this code
import { API_ACCESS_TOKEN } from './env.js';
// API endpoints for fetching movies
const URL = {
  // User's favorite movies
  favorites: 'https://api.themoviedb.org/3/account/22367794/favorite/movies?language=en-US&page=1&sort_by=created_at.asc&limit=100',
  // Search for movies (query will be appended)
  search: 'https://api.themoviedb.org/3/search/movie?language=en-US&limit=100&query=',
  // Popular movies
  popular: 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&limit=100'
};
const Options = { headers: { accept: 'application/json', Authorization: `Bearer ${API_ACCESS_TOKEN}` } };

document.addEventListener('DOMContentLoaded', async () => {
  const getById = id => document.getElementById(id);
  const [wrapperEl, stripEl, searchInputEl, nextBtnEl, prevBtnEl] = ['movie-wrapper','movie-strip','searchInput','nextBtn','prevBtn'].map(getById);
  let favorites = [], list = [], currentIndex = 0, animating = false, debounceTimer = null;
  const TILE = 200, cache = new Map(), REGION = 'US';

  const fetchJson = url => fetch(url, Options).then(response => response.json());
  const size = () => TILE + (+getComputedStyle(stripEl).gap || 0);
  const visibleItemsCount = () => Math.max(1, Math.floor((wrapperEl.clientWidth + size() - TILE) / size()));

  const CARD_CONFIG = {
    linkHref: '/src/html/title_details.html',
    cardClass: 'movie-card bg-white rounded-2xl shadow-md p-4 flex flex-col justify-around items-center min-w-[200px] max-w-[200px] h-[400px] hover:rounded-none hover:scale-105 transition-transform duration-200',
    imgClass: 'w-36 h-54 object-cover mb-2 rounded-lg',
    titleClass: 'font-semibold text-sm text-center mb-1 line-clamp-2',
    yearClass: 'text-xs text-gray-600 mb-1',
    ratingClass: 'bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-md',
    certClass: 'hidden bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-md',
    certIdPrefix: 'cert-',
    blankImage: '/src/images/blank_thumbnail.png'
  };

  const card = (movie, config = CARD_CONFIG) => {
    const imgSrc = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : config.blankImage;
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
    const rating = (movie.vote_average != null) ? movie.vote_average.toFixed(1) : 'N/A';

    const a = document.createElement('a');
    a.href = config.linkHref;

    const container = document.createElement('div');
    container.className = config.cardClass;

    const imgEl = document.createElement('img');
    imgEl.src = imgSrc;
    imgEl.className = config.imgClass;
    imgEl.alt = movie.title || '';
    imgEl.onerror = function () { this.onerror = null; this.src = config.blankImage; };
    container.appendChild(imgEl);

    const titleEl = document.createElement('h3');
    titleEl.className = config.titleClass;
    titleEl.textContent = movie.title || '';
    container.appendChild(titleEl);

    const yearEl = document.createElement('p');
    yearEl.className = config.yearClass;
    yearEl.textContent = year;
    container.appendChild(yearEl);

    const meta = document.createElement('div');
    meta.className = 'flex items-center gap-2 mt-1';

    const ratingEl = document.createElement('span');
    ratingEl.className = config.ratingClass;
    ratingEl.textContent = `★ ${rating}`;
    meta.appendChild(ratingEl);

    const ratings = document.createElement('span');
    ratings.id = `${config.certIdPrefix}${movie.id}`;
    ratings.className = config.certClass;
    ratings.title = 'Content rating';
    ratings.textContent = 'Rated: —';
    meta.appendChild(ratings);

    const addToFavButton = document.createElement('button');
      addToFavButton.className = "fa-solid fa-heart hover:text-red-400";
      addToFavButton.addEventListener('click', () => {
        addToFavButton.classList.toggle('text-red-600');
        addToFavButton.classList.toggle('hover:text-pink-900');
      });
    meta.appendChild(addToFavButton);
    container.appendChild(meta);

    a.appendChild(container);

    // Return the actual element (not HTML string) so we can update children later
    return a;
  };
  // Removed unused button block that referenced undefined variables (select, addToCart, product, div).

  const showCert = (id, cert) => {
    const elem = document.getElementById(`cert-${id}`);
    if (elem && cert) { elem.textContent = `Rated: ${cert}`; elem.classList.remove('hidden'); }
  };

  const certify = async movieId => {
    if (!movieId) return null;
    if (cache.has(movieId)) return cache.get(movieId);
    try {
      const data = await fetchJson(`https://api.themoviedb.org/3/movie/${movieId}/release_dates`);
      const resultsList = data.results || [];
      const regionMatch = resultsList.find(resultItem => resultItem.iso_3166_1 === REGION);
      const pickCertification = entries => (entries || []).map(entry => entry.certification).find(certification => certification && certification.trim()) || null;
      let certification = regionMatch ? pickCertification(regionMatch.release_dates) : null;
      if (!certification) {
        for (const resultBlock of resultsList) { certification = pickCertification(resultBlock.release_dates); if (certification) break; }
      }
      cache.set(movieId, certification || null);
      showCert(movieId, certification);
      return certification;
    } catch {
      cache.set(movieId, null);
      return null;
    }
  };

  const render = () => {
    if (!list.length) {
      stripEl.innerHTML = '<div class="text-center text-gray-500 w-full py-8">No movies found.</div>';
      [nextBtnEl, prevBtnEl].forEach(buttonElement => buttonElement?.classList.add('hidden'));
      return;
    }

    const visibleCount = visibleItemsCount();
    const navigationNeeded = list.length > visibleCount;
    [nextBtnEl, prevBtnEl].forEach(buttonElement => buttonElement?.classList.toggle('hidden', !navigationNeeded));
    stripEl.classList.toggle('justify-center', !navigationNeeded);

    // determine which movies to show starting from currentIndex
    const showCount = Math.min(visibleCount, list.length);
    const visibleMovies = [];
    for (let offsetIndex = 0; offsetIndex < showCount; offsetIndex++) {
      visibleMovies.push(list[(currentIndex + offsetIndex) % list.length]);
    }

    // build real DOM nodes (not HTML strings) so certify/showCert can find and update the certification element
    stripEl.innerHTML = '';
    for (const movie of visibleMovies) {
      const cardElement = card(movie);
      stripEl.appendChild(cardElement);
      const cachedCertification = cache.get(movie.id);
      cachedCertification ? showCert(movie.id, cachedCertification) : certify(movie.id);
    }
  };

  const slide = function (direction) {
    // don't run if an animation is already playing or all movies fit in view
    if (animating || list.length <= visibleItemsCount()) return;
    animating = true;

    // how far to move in pixels
    const step = size();
    // next -> move left, prev -> move right
    const translateValue = direction === 'next' ? -step : step;

    // animate the strip
    stripEl.style.transition = 'transform 0.25s ease';
    stripEl.style.transform = `translateX(${translateValue}px)`;

    // after animation, update index, reset transform, and re-render
    const handleTransitionEnd = function () {
      if (direction === 'next') {
        currentIndex = (currentIndex + 1) % list.length;
      } else {
        currentIndex = (currentIndex - 1 + list.length) % list.length;
      }

      stripEl.style.transition = 'none';
      stripEl.style.transform = 'translateX(0)';
      render();
      animating = false;
      stripEl.removeEventListener('transitionend', handleTransitionEnd);
    };

    stripEl.addEventListener('transitionend', handleTransitionEnd);
  };

  const search = async () => {
    const query = searchInputEl.value.trim();
    if (!query) { list = [...favorites]; currentIndex = 0; return render(); }
    try {
      stripEl.innerHTML = '<div class="text-center text-blue-500 w-full py-8">Searching...</div>';
      const data = await fetchJson(`${URL.search}${encodeURIComponent(query)}`);
      list = data.results || [];
      currentIndex = 0;
      render();
    } catch {
      stripEl.innerHTML = '<div class="text-center text-red-500 w-full py-8">Search failed.</div>';
    }
  };

  searchInputEl?.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(search, 500); });
  nextBtnEl?.addEventListener('click', () => slide('next'));
  prevBtnEl?.addEventListener('click', () => slide('prev'));
  window.addEventListener('resize', render);

  try {
    stripEl.innerHTML = '<div class="text-center text-blue-500 w-full py-8">Loading...</div>';
    const data = await fetchJson(URL.favorites);
    favorites = data.results?.length ? data.results : (await fetchJson(URL.popular)).results || [];
    list = [...favorites];
    render();
  } catch {
    stripEl.innerHTML = '<div class="text-center text-red-500 w-full py-8">Error loading movies.</div>';
  }
});
