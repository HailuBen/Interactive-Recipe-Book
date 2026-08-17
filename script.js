// Run setup once the page's HTML has fully loadeds
document.addEventListener('DOMContentLoaded', () => {
    initFavoriteButtons();  // heart buttons on recipe cards
    initSearch();   // live search box

    //only favourites page needs to render saved list
    if (document.body.dataset.page === 'favorites') {
        renderFavorites();
    }
});

// read saved recipe list from browser storage (if non yet it is empty array)
function getFavorites() {
    return JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
}

// write recipe list back into browser storage
function saveFavorites(favorites) {
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
}

// turn string into url friendly lowercase hyphenated version safe for web addresses
//e.g. "Tomato Soup!" -> "tomato-soup"
function slugify(text) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Check whether a recipe id is already in the saved list
function isFavorited(id) {
    return getFavorites().some(r => r.id === id);
}

// Find every recipe card and set up its heart button
function initFavoriteButtons() {
    document.querySelectorAll('.recipe-card').forEach(card => {
        const heart = card.querySelector('.heart');
        if (!heart) return; // cards with no heart element are skipped 

        // collect recipe details from card's HTML
        const titleEl = card.querySelector('h3');
        const title = titleEl.childNodes[0].textContent.trim();
        const id = slugify(title);  // unique id built from title
        const img = card.querySelector('img');
        const category = document.body.dataset.category || '';
        const ingredients = card.querySelector('.recipe-info p')?.textContent || '';
        const stepsHtml = card.querySelector('ol') ? card.querySelector('ol').outerHTML : '';
        const resultText = card.querySelector('.result-text')?.textContent || '';

        heart.dataset.id = id;  // tag eart to know which recipe it belongs to
        updateHeartDisplay(heart, isFavorited(id)); // show filled heart if already saved

        // toggle save/unsave when the heart is clicked
        heart.addEventListener('click', () => {
            let favorites = getFavorites();
            const alreadySaved = favorites.some(r => r.id === id);

            if (alreadySaved) {
                favorites = favorites.filter(r => r.id !== id); // remove it
            } else {
                favorites.push({    // add it, with everything needed to rebuild the card later
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

// Swap the heart icon between filled (saved) and outline (not saved)
function updateHeartDisplay(heartEl, saved) {
    heartEl.textContent = saved ? '\u2665' : '\u2661'; // filled vs outline heart
    heartEl.classList.toggle('active', saved);
}

// Live-filter recipe cards as the user types in the search box
function initSearch() {
    const input = document.getElementById('recipe-search');
    if (!input) return; // no search box on this page

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        document.querySelectorAll('.recipe-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// Build the saved-recipe grid on the favorites page
function renderFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return;  // not the favorites page

    const favorites = getFavorites();

    // Show a message when nothing is saved yet
    if (favorites.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorites saved yet. Click the heart on any recipe to save it here.</p>';
        return;
    }

    // Turn each saved recipe into a card and place them all in a grid
    container.innerHTML = `<div class="recipe-grid">${favorites.map(favoriteCardHtml).join('')}</div>`;

    // Clicking a heart here un-saves the recipe and re-renders the list
    container.querySelectorAll('.heart').forEach(heart => {
        const id = heart.dataset.id;
        heart.addEventListener('click', () => {
            const updated = getFavorites().filter(r => r.id !== id);
            saveFavorites(updated);
            renderFavorites();  // refresh the page's list
        });
    });
}

// Build the HTML for one recipe card on the favorites page
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
