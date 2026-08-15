// Handles: favoriting recipes (saved in localStorage), search/filter by
// name or ingredient, and dynamically rendering the favorites page.
 
document.addEventListener('DOMContentLoaded', () => {
    initFavoriteButtons();
    initSearch();
    if (document.body.dataset.page === 'favorites') {
        renderFavorites();
    }
});