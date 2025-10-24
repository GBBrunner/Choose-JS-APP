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

    // Append videos in the order provided by TMDB
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
// Review and Comments System
class CommentItem {
    constructor(comment, rating, titleId, username = 'Anonymous', timestamp, mediaType = 'movie') {
        this.comment = comment;
        this.rating = rating;
        this.id = titleId;
        this.mediaType = mediaType;
        this.username = username;
        this.timestamp = timestamp;
    }
    render(area) {
        const d = this.timestamp ? new Date(this.timestamp) : null;
        const pad = n => String(n).padStart(2, '0');
        const formattedTimestamp = d ? `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${String(d.getFullYear()).slice(-2)}` : '';
        const commentItem = document.createElement('div');
        commentItem.className = 'comment bg-indigo-200 p-2 rounded-lg mb-2';
        commentItem.innerHTML = `
            <h3><strong>${this.username}</strong><span class="mx-2">${formattedTimestamp}</span></h3>
            <p>${this.comment}</p>
            <div class="flex items-center justify-between mt-2">
            <p class="flex items-center gap-2 mb-0">
                Rating: ${this.rating}
                <span class="fa fa-solid fa-star text-orange-500"></span>
            </p>
            <span class="delete-placeholder"></span>
            </div>
        `;
        // Always show the comment so every review for the title is visible
        area.appendChild(commentItem);

        // Only show a delete button to the author of the review
        const currentUserName = userCheck ? (userCheck.firstName + ' ' + userCheck.lastName) : null;
        if (currentUserName && currentUserName === this.username) {
            const delete_reviewBtn = document.createElement('button');
            delete_reviewBtn.className = 'fa fa-solid fa-trash bg-red-600 text-white px-2 py-1 rounded-full hover:bg-red-800 transition-colors duration-150 text-sm';
            const placeholder = commentItem.querySelector('.delete-placeholder');
            if (placeholder) placeholder.appendChild(delete_reviewBtn);

            delete_reviewBtn.addEventListener('click', () => {
                commentItem.remove();
                const index = reviews.comments.indexOf(this);
                if (index > -1) {
                    reviews.comments.splice(index, 1);
                    localStorage.setItem('myComments', JSON.stringify(reviews.comments));
                }

            });
        }
}
};
class ReviewWrap {
    constructor() {
        this.comments = [];
    }
    add(newCommentItem) {
        this.comments.unshift(newCommentItem);
        localStorage.setItem('myComments', JSON.stringify(this.comments))
    }
}
const reviews = new ReviewWrap();
function searchComments(id, type) {
    const searchInput = id;
    const searchType = type;
    const searchDisplayArea = document.getElementById('searchDisplayArea');
    searchDisplayArea.innerHTML = ' ';
    let foundComments = false;
    for (const review of reviews.comments) {
        if (review.id === searchInput && review.mediaType === searchType) {
            review.render(searchDisplayArea);
            foundComments = true;
        }
    }
    if (!foundComments) {
        const noCommentsMsg = document.createElement('p');
        noCommentsMsg.textContent = 'No comments for this title have been made yet';
        noCommentsMsg.className = 'text-gray-600 italic px-4 py-1';
        searchDisplayArea.appendChild(noCommentsMsg);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let storedReviews = JSON.parse(localStorage.getItem('myComments')) || [];
    storedReviews = storedReviews.reverse();
    for (const review of storedReviews) {
        const myNewReview = new CommentItem(
            review.comment,
            review.rating !== undefined ? review.rating : 'N/A',
            review.id,
            review.username,
            review.timestamp,
            review.mediaType || 'movie'
        );
        reviews.add(myNewReview);
    }

    const params = new URLSearchParams(window.location.search);
    const titleId = params.get('id');
    const mediaType = (params.get('type') === 'tv') ? 'tv' : 'movie';
    // Expose the detected media type so displayTitleDetails can access it
    window.__mediaType = mediaType;
    searchComments(titleId, mediaType);

    // Set up review submit button with titleId
    const reviewSubmitButton = document.getElementById('submit_review');
    reviewSubmitButton.addEventListener('click', () => {
        const review_input = document.getElementById('review_input').value;
        const rating_input = document.getElementById('rating_input').value;
        if (review_input.length === 0) {
            alert('Please enter a comment before submitting.');
            return;
        }
        if (!rating_input || isNaN(rating_input) || rating_input < 1 || rating_input > 10) {
            alert('Please enter a valid rating between 1 and 10.');
            return;
        }
        const timestamp = new Date(); 
        const newComment = new CommentItem(review_input, rating_input, titleId, userCheck ? userCheck.firstName + ' ' + userCheck.lastName : 'Anonymous', timestamp, mediaType);
        reviews.add(newComment);
        // Optionally, clear the form after submit
        document.getElementById('review_input').value = '';
        document.getElementById('rating_input').value = '';
        // Refresh the displayed comments for this title
        searchComments(titleId, mediaType);
        // Close the modal and hide the review section after submitting
        if (typeof closeModal === 'function') closeModal();
        const reviewSection = document.getElementById('rate_and_review');
        if (reviewSection) reviewSection.style.display = 'none';
    });

        // Create the footer after rendering videos so it appears after the generated content
        // (ensures footer is placed beneath any dynamically added iframes)
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
