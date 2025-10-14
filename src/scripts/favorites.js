import { createHeader } from './header.js';
import { API_ACCESS_TOKEN } from './env.js';

// Local API helper to avoid static import cycle with mediaCarousel
const API_OPTIONS = {
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  },
};

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

// Favorites service: single source of truth for favorites state
export const getFavList = () => {
  const key = getUserFavoritesKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (err) {
    console.error('Failed to parse favorites from localStorage', err);
    return [];
  }
};

export const isFavorite = (mediaId) => {
  const favList = getFavList();
  return favList.some((favItem) => favItem && favItem.id === mediaId);
};

export const addToFavorites = (media, mediaType = 'movie') => {
  if (!media || !media.id) return;
  const key = getUserFavoritesKey();
  if (!key) return; // No user logged in
  const favList = getFavList();
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
  const favList = getFavList();
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

const loadFavorites = async () => {
  const key = getUserFavoritesKey();
  if (!key) return { movies: [], tvShows: [] }; // No user logged in
  
  const favorites = JSON.parse(localStorage.getItem(key) || '[]');
  const movies = [];
  const tvShows = [];

  for (const fav of favorites) {
    // Use the stored media_type to categorize
    if (fav.media_type === 'tv') {
      const tvData = await fetchJson(`https://api.themoviedb.org/3/tv/${fav.id}?language=en-US`);
      if (tvData?.id) tvShows.push(tvData);
    } else {
      const movieData = await fetchJson(`https://api.themoviedb.org/3/movie/${fav.id}?language=en-US`);
      if (movieData?.id) movies.push(movieData);
    }
  }
  return { movies, tvShows };
};

const createFavoritesCarousel = async (items, title) => {
  // Lazy-load mediaCarousel to avoid circular dependency
  const { createCarousel } = await import('./mediaCarousel.js');
  const tempContainer = document.createElement('div');
  tempContainer.id = 'carousels-container';
  document.body.appendChild(tempContainer);
  
  const originalFetch = window.fetch;
  window.fetch = async () => ({ ok: true, json: async () => ({ results: items }) });
  await createCarousel('favorites', title, false, 200);
  window.fetch = originalFetch;
  
  const favContainer = document.getElementById('favorites-container');
  while (tempContainer.children.length) favContainer.appendChild(tempContainer.children[0]);
  tempContainer.remove();
};

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the Favorites page where the container exists
  const container = document.getElementById('favorites-container');
  if (!container) return;

  // Create header only on this page
  createHeader();

  container.innerHTML = '<div class="text-center text-blue-500 w-full py-8">Loading your favorites...</div>';

  const { movies, tvShows } = await loadFavorites();
  container.innerHTML = '';
  let userCheck = localStorage.getItem('priorUser');
  userCheck = JSON.parse(userCheck);
  if (userCheck === null) {
    container.innerHTML = '<div class="text-center text-indigo-800 w-full py-8 mt-6"><h2 class="text-4xl font-bold mb-2">Not Logged In</h2><p class="text-lg">Please log in to view and manage your favorites.</p></div>';
    return;
  }else{
    if (!movies.length && !tvShows.length) {
      container.innerHTML = '<div class="text-center text-indigo-800 w-full py-8 mt-6"><h2 class="text-2xl font-bold mb-2">No Favorites Yet</h2><p>Start adding favorites from the Movies or TV Shows pages!</p></div>';
      return;
    }
  }
  if (movies.length) await createFavoritesCarousel(movies, 'Favorite Movies');
  if (tvShows.length) await createFavoritesCarousel(tvShows, 'Favorite TV Shows');
});