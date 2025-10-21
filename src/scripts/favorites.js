import { createHeader,createFooter } from './header.js';
let userCheck = localStorage.getItem('priorUser');
userCheck = JSON.parse(userCheck);

// Helper functions for user-specific favorites
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('priorUser'));
  } catch {
    return null;
  }
};

export const getUserFavoritesKey = () => {
  const user = getCurrentUser();
  return user ? `favorites_${user.email}` : null;
};

// Get favorites for the current logged-in user
const getUserFavorites = () => {
  const key = getUserFavoritesKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (err) {
    console.error('Failed to parse favorites from localStorage', err);
    return [];
  }
};

// Export for use in mediaCarousel.js
export const getFavList = getUserFavorites;

export const isFavorite = (mediaId) => {
  const favList = getUserFavorites();
  return favList.some((favItem) => favItem && favItem.id === mediaId);
};

export const addToFavorites = (media, mediaType = 'movie') => {
  if (!media || !media.id) return;
  const key = getUserFavoritesKey();
  if (!key) return; // No user logged in
  const favList = getUserFavorites();
  if (isFavorite(media.id)) return; // avoid duplicates
  const title = media.title || media.name;
  const releaseDate = media.release_date || media.first_air_date;
  const payload = {
    id: media.id,
    title,
    poster_path: media.poster_path,
    release_date: releaseDate,
    vote_average: media.vote_average,
    media_type: mediaType,
  };
  favList.push(payload);
  try {
    localStorage.setItem(key, JSON.stringify(favList));
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
};

export const removeFromFavorites = (mediaId) => {
  const key = getUserFavoritesKey();
  if (!key) return; // No user logged in
  const favList = getUserFavorites();
  const idx = favList.findIndex((favItem) => favItem && favItem.id === mediaId);
  if (idx === -1) return;
  favList.splice(idx, 1);
  try {
    localStorage.setItem(key, JSON.stringify(favList));
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
};

// Factory to create a configured Favorites toggle button for a media item
export const createFavoriteButton = (media, mediaType = 'movie', fontSizePx = 18) => {
  const btn = document.createElement('button');
  btn.className = 'fa-solid fa-heart';
  btn.type = 'button';
  btn.title = 'Add to favorites';
  btn.style.fontSize = `${Math.max(8, Math.floor(fontSizePx))}px`;
  btn.style.cursor = 'pointer';

  // Initialize visual state
  try {
    const fav = isFavorite(media.id);
    btn.style.color = fav ? 'red' : 'black';
    btn.setAttribute('aria-pressed', fav ? 'true' : 'false');
  } catch {
    btn.style.color = 'black';
    btn.setAttribute('aria-pressed', 'false');
  }

  // Toggle handler
  btn.onclick = (evt) => {
    const currentUser = getCurrentUser();
    if (currentUser === null) {
      alert('Please log in to add to favorites.');
      return;
    }
    evt.stopPropagation();
    if (isFavorite(media.id)) {
      removeFromFavorites(media.id);
      btn.style.color = 'black';
      btn.setAttribute('aria-pressed', 'false');
    } else {
      addToFavorites(media, mediaType);
      btn.style.color = 'red';
      btn.setAttribute('aria-pressed', 'true');
    }
  };

  return btn;
};

// Simple renderer to draw both Movies and TV sections
function renderFavoritesSections() {
  const allFavs = getUserFavorites();
  // Backward compatibility: default missing media_type to 'movie'
  const movies = allFavs.filter((f) => (f?.media_type || 'movie') === 'movie');
  const tvShows = allFavs.filter((f) => (f?.media_type || 'movie') === 'tv');

  const favContainer = document.getElementById('favorites-container');
  const moviesContainer = document.getElementById('favorite-movies-container');
  const tvContainer = document.getElementById('favorite-tv-container');

  // If containers don't exist (e.g., script imported on a different page), safely exit
  if (!moviesContainer || !tvContainer) {
    return;
  }

  // Clear existing
  moviesContainer.innerHTML = '';
  tvContainer.innerHTML = '';


  // Movies section
  if (userCheck === null) {
    if (favContainer) {
      favContainer.innerHTML = '<div class="text-center text-indigo-800 w-full py-8 mt-6"><h2 class="text-2xl font-bold mb-2">Please Log In</h2><p>You must be logged in to view your favorites.</p></div>';
    }
    return;
  }
  if (!movies.length && !tvShows.length) {
    const emptyHtml = '<div class="text-center text-indigo-800 w-full py-8 mt-6"><h2 class="text-2xl font-bold mb-2">No Favorites Yet</h2><p>Start adding favorites from the Movies or TV Shows pages!</p></div>';
    if (favContainer) {
      favContainer.innerHTML = emptyHtml;
    } else if (moviesContainer) {
      moviesContainer.innerHTML = emptyHtml;
    }
    return;
  }

  const setDisplay = (container, arr) =>
    (container.style.display = (arr && arr.length) ? 'flex' : 'none');

  setDisplay(moviesContainer, movies);
  setDisplay(tvContainer, tvShows);

  // Movies section
  const moviesWrap = new favDisplay(movies || [], 'Your Favorite Movies');
  moviesWrap.render(moviesContainer);
  createFavMovies(moviesWrap);

  // TV section
  const tvWrap = new favDisplay(tvShows || [], 'Your Favorite TV Shows');
  tvWrap.render(tvContainer);
  createFavMovies(tvWrap);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Create the header dynamically
  createHeader();
  createFooter();
  // Initial render
  if (
    document.getElementById('favorite-movies-container') ||
    document.getElementById('favorite-tv-container')
  ) {
    renderFavoritesSections();
  }
});

// Re-render when favorites are updated elsewhere in the app
window.addEventListener('favoritesUpdated', () => {
  renderFavoritesSections();
});

class favDisplay {
  constructor(list, headingText = 'Your Favorites') {
    this.list = list || [];
    this.headingText = headingText;
  }
  render(main) {
    this.container = document.createElement('div');
    this.container.classList.add('fav-list');
    this.container.innerHTML = `
      <h1>${this.headingText}</h1>
    `;
    main.appendChild(this.container);
    return this.container;
  }

  add(data) {
    this.list.unshift(data);
    const key = getUserFavoritesKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(this.list));
    }
  }
}

class favoriteMovie {
    constructor(id, title, poster) {
        this.poster = poster;
        this.title = title;
        this.id = id;
    }
    render() {
        const favItem = document.createElement('div');
        favItem.classList.add('favItem');
        favItem.innerHTML = `
            <div class="flex flex-nowrap justify-between">
              <img src="${this.poster}" alt="movie image">
              <div class="flex flex-col justify-center px-4">
                <p class="text-xs px-2">TMBD ID:${this.id}</p>
                <h2 class="text-lg font-bold">${this.title}</h2>
              </div>
              
            </div>
            <i class="fas fa-trash text-xl cursor-pointer hover:text-red-900 removeFav" title="Remove from favorites"></i>
        `;

        // Attach remove handler (reuses removeFromFavorites from this module)
        const removeBtn = favItem.querySelector('.removeFav');
        if (removeBtn) {
          removeBtn.addEventListener('click', (evt) => {
            evt.stopPropagation();
            // remove by id; favoritesUpdated event will trigger re-render
            removeFromFavorites(this.id);
          });
        }
        return favItem;
    }
}

function createFavMovies(obj) {
    for (const movie of obj.list) {
        const favMovie = new favoriteMovie(movie.id, movie.title, movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
        obj.container.appendChild(favMovie.render());
    }
}