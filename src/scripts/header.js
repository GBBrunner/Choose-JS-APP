function createHeader() {
    // Check if user is logged in
    let linkStyles ="text-white no-underline hover:underline hover:decoration-2 hover:decoration-white hover:underline-offset-5 mx-2 transition-all duration-150";
    let userCheck = localStorage.getItem('priorUser');
    userCheck = JSON.parse(userCheck);

    const header = document.createElement('header');
    header.className = 'flex flex-wrap justify-between gap-3 w-screen p-2 bg-indigo-700';
    
    const title = document.createElement('a');
        title.href = "/index.html";
        title.innerHTML = `<h1 class="text-3xl font-bold mb-4 text-white">Logo and title</h1>`;
    header.appendChild(title);

    const searchInputDiv = document.createElement('div');
        searchInputDiv.id = "searchDiv";
    header.appendChild(searchInputDiv);

    // const searchInput = document.createElement('input');
    //     searchInput.id = "searchInput";
    //     searchInput.type = "text";
    //     searchInput.placeholder = "Search all movies . . .";
    //     searchInput.className = "border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[30rem]";
    // header.appendChild(searchInput);

    const nav = document.createElement('nav');
        const ul = document.createElement('ul');
            const homeLink = document.createElement('a');
                homeLink.href = "/index.html";
                homeLink.className = linkStyles;
                homeLink.innerHTML = `
                <span class="fa-solid fa-house"></span>
                <span>Home</span>
                `;
            ul.appendChild(homeLink);
            const TVShowsLink = document.createElement('a');
                TVShowsLink.href = "/src/html/tv_shows.html";
                TVShowsLink.className = linkStyles;
                TVShowsLink.innerHTML = `
                <span class="fa-solid fa-tv"></span>
                <span>TV Shows</span>
                `;
            ul.appendChild(TVShowsLink);
            const favoritesLink = document.createElement('a');
                favoritesLink.href = "/src/html/favorites.html";
                favoritesLink.className = linkStyles;
                favoritesLink.innerHTML = `
                <span class="fa-solid fa-bookmark"></span>
                <span>Favorites</span>
                `;
            ul.appendChild(favoritesLink);

        if (userCheck === null) {
            const loginLink = document.createElement('a');
                loginLink.href = "/src/html/login.html";
                loginLink.className = linkStyles;
                loginLink.innerHTML = `
                <span class="fa-solid fa-user rounded-full border border-white p-1"></span>
                <span>Login/Sign Up</span>
                `;
            ul.appendChild(loginLink);
        } else {
            const userPageLink = document.createElement('a');
                userPageLink.href = "/src/html/user.html";
                userPageLink.className = linkStyles;
                userPageLink.innerHTML = `
                <span class="fa-solid fa-user rounded-full border border-white p-1"></span>
                <span>Hello, ${userCheck.firstName}</span>
                `;
            ul.appendChild(userPageLink);
        }
        
        nav.appendChild(ul);
        header.appendChild(nav);
    
    document.body.prepend(header);
}
    
export { createHeader };

