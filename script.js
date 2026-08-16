// Handles: favoriting recipes (saved in localStorage), search/filter by
// name or ingredient, and dynamically rendering the favorites page.
 
document.addEventListener('DOMContentLoaded', () => {
    initFavoriteButtons();
    initSearch();
    if (document.body.dataset.page === 'favorites') {
        renderFavorites();
    }
});

function getFavorites() {
    return JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
}

// turn string into url friendly lowercase hyphenated version safe for web addresses
function slugify(text) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function isFavorited(id) {
    return getFavorites().some(r => r.id === id);
}

// ---------- Favoriting (works on category pages) ----------
function initFavoriteButtons() {
    document.querySelectorAll('.recipe-card').forEach(card => {
        const heart = card.querySelector('.heart');
        if (!heart) return;

        const titleEl = card.querySelector('h3');
        const title = titleEl.childNodes[0].textContent.trim();
        const id = slugify(title);
        const img = card.querySelector('img');
        const category = document.body.dataset.category || '';
        const ingredients = card.querySelector('.recipe-info p')?.textContent || '';
        const stepsHtml = card.querySelector('ol') ? card.querySelector('ol').outerHTML : '';
        const resultText = card.querySelector('.result-text')?.textContent || '';

        heart.dataset.id = id;
        updateHeartDisplay(heart, isFavorited(id));

        heart.addEventListener('click', () => {
            let favorites = getFavorites();
            const alreadySaved = favorites.some(r => r.id === id);

            if (alreadySaved) {
                favorites = favorites.filter(r => r.id !== id);
            } else {
                favorites.push({
                    id, title, category, ingredients, stepsHtml, resultText,
                    img: img.src,
                    alt: img.alt
                });
            }

            saveFavorites(favorites);
            updateHeartDisplay(heart, !alreadySaved);
        });
    });
}

function updateHeartDisplay(heartEl, saved) {
    heartEl.textContent = saved ? '\u2665' : '\u2661'; // filled vs outline heart
    heartEl.classList.toggle('active', saved);
}

// ---------- Search (works on category pages with a #recipe-search input) ----------
function initSearch() {
    const input = document.getElementById('recipe-search');
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        document.querySelectorAll('.recipe-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// ---------- Favorites page rendering ----------
function renderFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    const favorites = getFavorites();

    if (favorites.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorites saved yet. Click the heart on any recipe to save it here.</p>';
        return;
    }

    container.innerHTML = `<div class="recipe-grid">${favorites.map(favoriteCardHtml).join('')}</div>`;

    container.querySelectorAll('.heart').forEach(heart => {
        const id = heart.dataset.id;
        heart.addEventListener('click', () => {
            const updated = getFavorites().filter(r => r.id !== id);
            saveFavorites(updated);
            renderFavorites();
        });
    });
}

function favoriteCardHtml(recipe) {
    return `
    <div class="recipe-card">
        <img src="${recipe.img}" alt="${recipe.alt}">
        <div class="recipe-info">
            <h3>${recipe.title} <span class="heart active" data-id="${recipe.id}">&#9829;</span></h3>
            <p>${recipe.ingredients}</p>
            ${recipe.stepsHtml}
            <p class="result-text">${recipe.resultText}</p>
        </div>
    </div>`;
}