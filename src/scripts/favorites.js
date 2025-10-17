import { createHeader } from './header.js';

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

// Get stored favorites (user-specific)
const storedFavorites = getUserFavorites();
const parsedFavorites = storedFavorites;

document.addEventListener('DOMContentLoaded', async() => {
    // Create the header dynamically
    createHeader();
    // Display the list of favorite movies
    const main = document.getElementById('favorites-container');
    if (!main) {
        console.error('favorites-container not found');
        return;
    }
    const myFavWrap = new favDisplay(parsedFavorites || []);
    myFavWrap.render(main);
    createFavMovies(myFavWrap);
});

class favDisplay {
    constructor(list) {
        this.list = list || [];
    }
    render(main) {
        this.container = document.createElement('div');
        this.container.classList.add('fav-list');
        this.container.innerHTML = `
            <h1>Your Favorite Movies</h1>
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
            <img src="${this.poster}" alt="movie image">
            <h2>${this.title}</h2>
            <p>${this.id}</p>
        `;
        return favItem;
    }
}

function createFavMovies(obj) {
    for (const movie of obj.list) {
        const favMovie = new favoriteMovie(movie.id, movie.title, movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
        obj.container.appendChild(favMovie.render());
    }
}