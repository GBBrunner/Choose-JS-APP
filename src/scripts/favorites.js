import {createHeader} from './header.js';
import { favList, addToFavorites, removeFromFavorites } from './movieCarousel.js';
const storedFavorites = localStorage.getItem('favorites');
const parsedFavorites = JSON.parse(storedFavorites);


document.addEventListener('DOMContentLoaded', () => {
    // Create the header dynamically
    createHeader();
    // Display the list of favorite movies
    const main = document.querySelector('main')
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
        localStorage.setItem('favDisplay', JSON.stringify(this.list));
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
                <p class="flex">Remove <i class="fa-solid fa-x"></i></p>
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
