
//    Generated with AI, I still need to make the code my own and understand it better.

   
   const API = 'https://pokeapi.co/api/v2/pokemon?limit=1025';
    const [wrapper, strip, searchInput, nextBtn, prevBtn] = ['pokemon-wrapper', 'pokemon-strip', 'searchInput', 'nextBtn', 'prevBtn'].map(id => document.getElementById(id));
    const navBtns = [nextBtn, prevBtn];
    const TILE_SIZE = 180;
    let allPokemon = [], filtered = [], startIndex = 0, isAnimating = false, visibleCount = 0, searchTimer = null;
    const cache = new Map();

    const fetchJson = async url => (await fetch(url)).json();
    const getDetail = async url => {
      if (cache.has(url)) return cache.get(url);
      const j = await fetchJson(url);
      cache.set(url, j);
      new Image().src = j.sprites?.other?.['official-artwork']?.front_default || j.sprites?.front_default || '';
      return j;
    };
    const getTileSize = () => TILE_SIZE + (+getComputedStyle(strip).gap || 0);
    const computeFit = () => Math.max(1, Math.floor((wrapper.clientWidth + getTileSize() - TILE_SIZE) / getTileSize()));

    const createCard = p => `<div class="pokemon-card bg-white rounded-2xl shadow-md p-4 flex flex-col items-center justify-center min-w-[180px] max-w-[180px] h-[180px]"><img src="${p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || ''}" class="w-20 h-20 object-contain mb-2" alt="${p.name}"/><h3 class="font-semibold text-base capitalize mb-1">${p.name}</h3><p class="text-sm text-gray-600 mb-2">Weight: ${p.weight}</p><div class="flex flex-wrap justify-center gap-1">${p.types.map(t => `<span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md">${t.type.name}</span>`).join(' ')}</div></div>`;

    const render = async () => {
      strip.style.transition = 'none';
      if (!filtered.length) {
        strip.innerHTML = '<div class="text-center text-gray-500 w-full py-8">No Pokémon found.</div>';
        navBtns.forEach(b => b.classList.add('hidden'));
        return;
      }
      
      visibleCount = computeFit();
      const needsNav = filtered.length > visibleCount;
      navBtns.forEach(b => b.classList.toggle('hidden', !needsNav));
      strip.classList.toggle('justify-center', !needsNav);
      strip.classList.toggle('justify-start', needsNav);

      const indices = Array.from({ length: Math.min(visibleCount, filtered.length) }, (_, i) => (startIndex + i) % filtered.length);
      strip.innerHTML = (await Promise.all(indices.map(i => getDetail(filtered[i].url)))).map(createCard).join('');
      
      if (needsNav) [(startIndex + visibleCount) % filtered.length, (startIndex - 1 + filtered.length) % filtered.length].forEach(i => getDetail(filtered[i].url).catch(() => {}));
    };

    const slide = async dir => {
      if (isAnimating || filtered.length <= visibleCount) return;
      isAnimating = true;
      const shift = (dir === 'next' ? 1 : -1) * getTileSize();
      
      strip.style.transition = 'transform .25s ease, opacity .25s ease';
      strip.style.transform = `translateX(${-shift}px)`;
      await new Promise(r => strip.addEventListener('transitionend', r, { once: true }));
      
      startIndex = (startIndex + (dir === 'next' ? 1 : -1) + filtered.length) % filtered.length;
      strip.style.transition = 'none';
      strip.style.transform = 'translateX(0)';
      await render();
      isAnimating = false;
    };

    const handleSearch = async () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { filtered = [...allPokemon]; startIndex = 0; return render(); }
      
      filtered = allPokemon.filter(p => p.name.includes(q));
      const remaining = allPokemon.filter(p => !filtered.includes(p));
      const typeMatches = remaining.filter(p => cache.has(p.url) && cache.get(p.url).types.some(t => t.type.name.includes(q)));
      
      const toFetch = remaining.filter(p => !cache.has(p.url)).slice(0, 60);
      await Promise.all(toFetch.map(p => getDetail(p.url).catch(() => null)));
      
      filtered = [...filtered, ...typeMatches, ...toFetch.filter(p => cache.has(p.url) && cache.get(p.url).types.some(t => t.type.name.includes(q)))];
      startIndex = 0;
      await render();
    };

    // Event listeners and initialization
    searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(handleSearch, 250); });
    nextBtn.addEventListener('click', () => slide('next'));
    prevBtn.addEventListener('click', () => slide('prev'));
    window.addEventListener('resize', render);

    (async () => {
      allPokemon = (await fetchJson(API)).results;
      filtered = [...allPokemon];
      await render();
    })();
