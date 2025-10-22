import { createFooter } from './header.js';
import { createFavoriteButton } from './favorites.js';
import { API_URLS, fetchJson } from './mediaCarousel.js';
import { closeModal } from './index.js';

let userCheck = localStorage.getItem('priorUser');
userCheck = JSON.parse(userCheck);

closeModal();

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
            const reviewSection = document.getElementById('rate_and_review');
            if (reviewSection.style.display === 'block') {
                reviewSection.style.display = 'none';
                return;
            }
                reviewSection.style.display = 'block';

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
        }
        // If media fetch fails, do nothing special; page will remain minimal
    })();
});
