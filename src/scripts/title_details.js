import { createFooter } from './header.js';
import { createFavoriteButton } from './favorites.js';
import { API_URLS, fetchJson } from './mediaCarousel.js';
import { closeModal } from './index.js';

let userCheck = localStorage.getItem('priorUser');
userCheck = JSON.parse(userCheck);

closeModal();

// ------------------------------
// Local Storage Review Utilities
// ------------------------------
const getStorageKey = (titleId) => `reviews:${titleId}`; // movie/tv id as key

function loadReviews(titleId) {
    try {
        const raw = localStorage.getItem(getStorageKey(titleId));
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to load reviews:', e);
        return [];
    }
}

function saveReviews(titleId, reviews) {
    try {
        localStorage.setItem(getStorageKey(titleId), JSON.stringify(reviews));
    } catch (e) {
        console.error('Failed to save reviews:', e);
    }
}

function addReview(titleId, review) {
    const reviews = loadReviews(titleId);
    reviews.unshift(review);
    saveReviews(titleId, reviews);
}

function deleteReview(titleId, reviewId) {
    const reviews = loadReviews(titleId).filter(r => r.id !== reviewId);
    saveReviews(titleId, reviews);
}

function formatDate(d) {
    const date = (d instanceof Date) ? d : new Date(d);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// ------------------------------
// Rendering Reviews
// ------------------------------
function renderReviews(titleId, currentUserEmail) {
    const listEl = document.getElementById('reviewsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    const reviews = loadReviews(titleId);
    if (!reviews.length) {
        const empty = document.createElement('p');
        empty.className = 'text-gray-500';
        empty.textContent = 'No reviews yet. Be the first to write one!';
        listEl.appendChild(empty);
        return;
    }

    reviews.forEach(r => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded border border-gray-200 bg-gray-50';

        const header = document.createElement('div');
        header.className = 'flex items-start justify-between gap-2';

        const left = document.createElement('div');
        left.className = 'flex items-center gap-2';

        const ratingBadge = document.createElement('span');
        ratingBadge.className = 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-semibold';
        ratingBadge.textContent = r.rating;
        left.appendChild(ratingBadge);

        const meta = document.createElement('div');
        meta.className = 'text-sm';
        const author = document.createElement('div');
        author.className = 'font-medium';
        author.textContent = r.authorName || r.authorEmail;
        const dateEl = document.createElement('div');
        dateEl.className = 'text-gray-500';
        dateEl.textContent = formatDate(r.createdAt);
        meta.appendChild(author);
        meta.appendChild(dateEl);
        left.appendChild(meta);
        header.appendChild(left);

        if (currentUserEmail && r.authorEmail === currentUserEmail) {
            const delBtn = document.createElement('button');
            delBtn.className = 'text-red-600 hover:text-red-800';
            delBtn.setAttribute('title', 'Delete review');
            delBtn.setAttribute('aria-label', 'Delete review');
            delBtn.dataset.action = 'delete-review';
            delBtn.dataset.reviewId = r.id;
            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-trash';
            delBtn.appendChild(icon);
            header.appendChild(delBtn);
        }

        item.appendChild(header);

        const body = document.createElement('p');
        body.className = 'mt-2 text-gray-800';
        body.textContent = r.text;
        item.appendChild(body);

        listEl.appendChild(item);
    });
}

function displayTitleDetails(media) {
    const container = document.getElementById('titleDetailsContainer');
    if (!container) return;

    const blankImage = '/src/images/blank_thumbnail.png';
    const titleImg = document.createElement('img');
        titleImg.src = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : blankImage;
        titleImg.alt = media.title || media.name || 'No Title Available';
        titleImg.className = 'w-64 h-auto rounded-lg shadow mb-4';
    container.appendChild(titleImg);

    const headerRow = document.createElement('div');
        headerRow.className = 'flex items-center gap-3 mb-2';
        const titleHeading = document.createElement('h2');
            titleHeading.textContent = media.title || media.name || 'N/A';
            titleHeading.className = 'text-2xl font-semibold';
        headerRow.appendChild(titleHeading);

        const releaseDate = media.release_date || media.first_air_date || 'Unknown';
        const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown';
        const yearSpan = document.createElement('span');
            yearSpan.textContent = `(${releaseYear})`;
            yearSpan.className = 'text-gray-600 text-lg';
        headerRow.appendChild(yearSpan);
        
        const favLabel = document.createElement('span');
            favLabel.textContent = 'Add to Favorites';
            favLabel.className = 'text-sm text-gray-600';
        headerRow.appendChild(favLabel);
        const favBtn = createFavoriteButton(media, window.__mediaType || 'movie', 20);
            headerRow.appendChild(favBtn);
        const writeReviewBtn = document.createElement('button');
            writeReviewBtn.textContent = 'Write a Review';
            writeReviewBtn.className = 'ml-4 bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors duration-150 text-sm';
            const reviewIcon = document.createElement('span');
                reviewIcon.className = 'fa-solid fa-pencil mr-2';
            writeReviewBtn.prepend(reviewIcon);
        headerRow.appendChild(writeReviewBtn);
            writeReviewBtn.addEventListener('click', () => {
                if (userCheck === null){
                    alert('Please log in to write a review.');
                    return;
                }
                openWriteReviewPanel();
            });

        // View Reviews button to open sliding modal
        const viewReviewsBtn = document.createElement('button');
            viewReviewsBtn.textContent = 'View Reviews';
            viewReviewsBtn.className = 'ml-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors duration-150 text-sm';
            const viewIcon = document.createElement('span');
                viewIcon.className = 'fa-solid fa-comments mr-2';
            viewReviewsBtn.prepend(viewIcon);
        headerRow.appendChild(viewReviewsBtn);
        viewReviewsBtn.addEventListener('click', () => {
            openReviewsPanel();
        });

    container.appendChild(headerRow);

    const titleOverview = document.createElement('p');
        titleOverview.textContent = media.overview || 'No overview available.';
        titleOverview.className = 'text-gray-700 mb-4';
    container.appendChild(titleOverview);
}



function createIframe(video) {
    const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${video.key}`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.className = 'w-[32rem] h-[18rem] rounded-xl shadow mb-4';
    return iframe;
}

function renderVideos(videos) {
    const container = document.getElementById('titleDetailsContainer');
    if (!container) return;

    const items = Array.isArray(videos?.results) ? videos.results : [];
    // Only proceed if there are videos
    if (items.length === 0) return;
    const section = document.createElement('section');
    section.className = 'mt-6';

    const heading = document.createElement('h3');
        heading.textContent = 'Videos';
        heading.className = 'text-xl font-semibold mb-3';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'flex flex-col items-start';

    // Append videos in the order provided by TMDB; only embed supported platforms
    let appended = 0;
    items.forEach(v => {
            list.appendChild(createIframe(v));
            appended++;
    });

    if (appended === 0) return; // nothing embeddable to show
    section.appendChild(list);
    container.appendChild(section);
    const newBreak = document.createElement('br');
    container.appendChild(newBreak);
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const titleId = params.get('id');
    const mediaType = (params.get('type') === 'tv') ? 'tv' : 'movie';
    // Expose the detected media type so displayTitleDetails can access it
    window.__mediaType = mediaType;

    createFooter();

    // Fetch and display the title details
    (async () => {
        if (!titleId) return;
        const media = await fetchJson(`${API_URLS[mediaType].byID}${titleId}`);
        const mediaVideos = await fetchJson(`${API_URLS[mediaType].byID}${titleId}/videos?language=en-US`);
        if (media) {
          displayTitleDetails(media);
          renderVideos(mediaVideos);
          document.title = media.title || media.name || 'Title Details';
          // Render reviews and wire up interactions
          renderReviews(titleId, userCheck?.email);

          const submitBtn = document.getElementById('submit_review');
          const ratingInput = document.getElementById('media_rating');
          const reviewInput = document.getElementById('media_review');
          const closeBtn = document.getElementById('close_button');

          if (closeBtn) {
              closeBtn.addEventListener('click', () => {
                  closeWriteReviewPanel();
              });
          }

          if (submitBtn && ratingInput && reviewInput) {
              submitBtn.addEventListener('click', () => {
                  if (!userCheck) {
                      alert('Please log in to submit a review.');
                      return;
                  }
                  const rating = Number(ratingInput.value);
                  const text = (reviewInput.value || '').trim();
                  if (!rating || rating < 1 || rating > 10) {
                      alert('Please enter a rating between 1 and 10.');
                      return;
                  }
                  if (!text) {
                      alert('Please enter a review.');
                      return;
                  }
                  const review = {
                      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                      rating,
                      text,
                      authorEmail: userCheck.email,
                      authorName: `${userCheck.firstName ?? ''} ${userCheck.lastName ?? ''}`.trim() || userCheck.email,
                      createdAt: new Date().toISOString()
                  };
                  addReview(titleId, review);
                  // Clear inputs and hide panel
                  ratingInput.value = '';
                  reviewInput.value = '';
                  closeWriteReviewPanel();
                  // Re-render list
                  renderReviews(titleId, userCheck.email);
              });
          }

          const reviewsPanel = document.getElementById('reviewsPanel');
          const reviewsBackdrop = document.getElementById('reviewsBackdrop');
          const closeReviewsBtn = document.getElementById('close_reviews_panel');
          const writePanel = document.getElementById('rate_and_review');
          // helpers for sliding modals
          window.openReviewsPanel = function openReviewsPanel() {
              if (writePanel) writePanel.classList.add('-translate-x-full'); // ensure write panel is closed (left panel)
              if (reviewsPanel) reviewsPanel.classList.remove('translate-x-full');
              if (reviewsBackdrop) {
                  reviewsBackdrop.classList.remove('pointer-events-none');
                  // trigger opacity transition
                  requestAnimationFrame(() => reviewsBackdrop.classList.add('opacity-100'));
              }
              // refresh list on open
              renderReviews(titleId, userCheck?.email);
          };
          window.closeReviewsPanel = function closeReviewsPanel() {
              if (reviewsPanel) reviewsPanel.classList.add('translate-x-full');
              if (reviewsBackdrop) {
                  reviewsBackdrop.classList.remove('opacity-100');
                  // after transition, make it non-interactive
                  setTimeout(() => reviewsBackdrop.classList.add('pointer-events-none'), 200);
              }
          };

          window.openWriteReviewPanel = function openWriteReviewPanel() {
              if (reviewsPanel) reviewsPanel.classList.add('translate-x-full'); // ensure reviews panel is closed (right panel)
              if (writePanel) writePanel.classList.remove('-translate-x-full');
              if (reviewsBackdrop) {
                  reviewsBackdrop.classList.remove('pointer-events-none');
                  requestAnimationFrame(() => reviewsBackdrop.classList.add('opacity-100'));
              }
          };
          window.closeWriteReviewPanel = function closeWriteReviewPanel() {
              if (writePanel) writePanel.classList.add('-translate-x-full');
              if (reviewsBackdrop) {
                  reviewsBackdrop.classList.remove('opacity-100');
                  setTimeout(() => reviewsBackdrop.classList.add('pointer-events-none'), 200);
              }
          };

          if (closeReviewsBtn) closeReviewsBtn.addEventListener('click', window.closeReviewsPanel);
          if (reviewsBackdrop) reviewsBackdrop.addEventListener('click', () => { window.closeReviewsPanel(); window.closeWriteReviewPanel(); });
          if (reviewsPanel) {
              reviewsPanel.addEventListener('click', (e) => {
                  const target = e.target;
                  const btn = target.closest ? target.closest('button[data-action="delete-review"]') : null;
                  if (!btn) return;
                  if (!userCheck) return; // safety
                  const reviewId = btn.dataset.reviewId;
                  if (!reviewId) return;
                  deleteReview(titleId, reviewId);
                  renderReviews(titleId, userCheck.email);
              });
          }
        }
        // If media fetch fails, do nothing special; page will remain minimal
    })();
});
