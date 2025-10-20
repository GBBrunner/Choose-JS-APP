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
function createFooter() {
    // Avoid duplicating footer if already added
    if (document.querySelector('footer.site-footer')) return;

    const footer = document.createElement('footer');
    footer.className = 'site-footer flex flex-wrap justify-center items-center h-[6rem] gap-3 w-screen p-4 bg-indigo-700 mt-8 text-white text-center';

    // Simple footer content; customize as needed
    const year = new Date().getFullYear();
    footer.innerHTML = `
      <div class="w-full flex items-center justify-center gap-3">
      <a href="/index.html" class="underline hover:no-underline">Movies</a>
        <span class="opacity-70">\u2022</span>
        <a href="/src/html/tv_shows.html" class="underline hover:no-underline">TV Shows</a>
        <span class="opacity-70">\u2022</span>
        <a href="/src/html/favorites.html" class="underline hover:no-underline">Favorites</a>
        <span class="opacity-70">\u2022</span>
        <a href="/src/html/movie_requirements.html" class="underline hover:no-underline">Movie App Requirements</a>
        <span class="opacity-70">\u2022</span>
        <a href="/src/html/project_criteria.html" class="underline hover:no-underline">Project Criteria</a>
      </div>
    `;

    document.body.appendChild(footer);
}
export { createHeader, createFooter };

