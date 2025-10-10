const obj = {Name: "favButtonTest", Type: "file", Path: "src/scripts/favButtonTest", Content: "cwnjo ms  fhuvncibdc"};
const btn = document.createElement('button');
btn.id = 'addFavBtn';
btn.textContent = 'Add to Favorites';
btn.style.cursor = 'pointer';
document.body.appendChild(btn);

btn.addEventListener('click', () => {
    const key = 'favorites';
    let items = [];
    try {
        items = JSON.parse(localStorage.getItem(key)) || [];
        if (!Array.isArray(items)) items = [];
    } catch (e) {
        items = [];
    }

    const exists = items.some(it => it.Path === obj.Path && it.Name === obj.Name);
    if (!exists) {
        items.push(obj);
        localStorage.setItem(key, JSON.stringify(items));
        btn.textContent = 'Added';
        setTimeout(() => (btn.textContent = 'Add to Favorites'), 1500);
    } else {
        btn.textContent = 'Already added';
        setTimeout(() => (btn.textContent = 'Add to Favorites'), 1500);
    }
});