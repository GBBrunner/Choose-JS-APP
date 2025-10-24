function createHeader() {
    // Avoid duplicating header if already added
    if (document.querySelector('header.site-header')) return;

    // Check if user is logged in
    let linkStyles ="text-white no-underline hover:underline hover:decoration-2 hover:decoration-white hover:underline-offset-5 mx-2 transition-all duration-150";
    let userCheck = localStorage.getItem('priorUser');
    userCheck = JSON.parse(userCheck);

    const header = document.createElement('header');
    header.className = 'site-header flex flex-wrap justify-between gap-3 w-screen p-2 bg-indigo-700';
    
    const title = document.createElement('a');
        title.className = "flex items-center no-underline";
        title.href = "/index.html";
        const logo = document.createElement('img');
            logo.src = "/src/images/logo.svg";
            logo.alt = "Watchin' Waffles logo";
            logo.className = "inline w-20 h-14 mr-2";
        title.appendChild(logo);
        const titleText = document.createElement('span');
        titleText.className ="align-middle";
            titleText.innerHTML = `<h1 class="text-4xl align-middle font-bold mb-4 text-white"><span class="title px-2">WACHA'</span><span class="title px-2">WAFFLES?</span></h1>`;
        title.appendChild(titleText);

        // style="font-family: Impact, Charcoal, sans-serif;
        // title.innerHTML = `<h1 class="text-3xl font-bold mb-4 text-white"><span class="title px-2">Watchin'</span><span class="title px-2">Waffles</span></h1>`;
        

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
    const titleTextFont = document.getElementsByClassName('title');
    for (let i = 0; i < titleTextFont.length; i++) {
        titleTextFont[i].style.fontFamily = "Impact, Charcoal, sans-serif";
    }
    const iconLink = document.createElement('link');

// Set the favicon attributes
iconLink.rel = 'icon';
iconLink.type = 'image/x-icon';
iconLink.href = '/src/images/favicon.ico';

// Remove any existing favicon
const existingFavicon = document.querySelector('link[rel="icon"]');
if (existingFavicon) {
  existingFavicon.parentNode.removeChild(existingFavicon);
}

// Append the new favicon
document.head.appendChild(iconLink);
}
function createFooter() {
    // Avoid duplicating footer if already added
    if (document.querySelector('footer.site-footer')) return;

    const footer = document.createElement('footer');
    // Ensure the footer participates in stacking context and sits above embedded content
    footer.className = 'site-footer relative z-50 flex flex-wrap justify-center items-center h-[6rem] gap-3 w-screen p-4 bg-indigo-700 mt-8 text-white text-center';

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

