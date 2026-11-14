async function loadComics() {
    const container = document.getElementById('comics-list');
    const template = document.getElementById('comics-template');
    const status = document.getElementById('comics-status');

    if (!container || !template) return;
    const STORAGE_KEY = 'multiverse_reading_list';
    let savedIds = new Set();
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        savedIds = new Set(saved.map((item) => String(item.id)));
    } catch (error) {
        console.error('Cannot read reading list from localStorage:', error);
    }
    try {
        const response = await fetch('./comics.json');
        if (!response.ok) {
            throw new Error(`Cannot load JSON: HTTP ${response.status}`);
        }
        const comics = await response.json();
        if (!Array.isArray(comics)) {
            throw new Error('No comics array in comics.json.');
        }
        const cards = document.createDocumentFragment();
        for (const comic of comics) {
            const card = template.content.cloneNode(true);
            const image = card.querySelector('img');
            image.src = comic.image;
            image.alt = comic.alt || comic.title;
            const badge = card.querySelector('[data-field="universe"]');
            badge.textContent = comic.universe;
            badge.classList.add(comic.universe === 'Marvel' ? 'bg-danger' : 'bg-primary');
            card.querySelector('[data-field="title"]').textContent = comic.title;
            card.querySelector('[data-field="info"]').textContent = comic.info;
            const btn = card.querySelector('[data-field="toggleBtn"]');
            btn.dataset.id = comic.id;
            btn.dataset.title = comic.title;
            btn.dataset.universe = comic.universe;
            btn.dataset.image = comic.image;
            btn.dataset.info = comic.info;
            const isAdded = savedIds.has(String(comic.id));
            if (isAdded) {
                btn.classList.remove('btn-outline');
                btn.classList.add('btn-danger');
                btn.innerHTML = '<i class="bi bi-trash me-1"></i>Remove';
            } else {
                btn.classList.remove('btn-danger');
                btn.classList.add('btn-outline');
                btn.innerHTML = '<i class="bi bi-bookmark-plus me-1"></i>Add to Reading List';
            }
            cards.append(card);
        }

        container.replaceChildren(cards);
        if (status) {
            status.textContent = comics.length ? '' : 'No comics added.';
            status.classList.toggle('d-none', comics.length > 0);
        }
        document.dispatchEvent(new CustomEvent('comics:loaded'));
    } catch (error) {
        console.error(error);
        if (status) {
            status.classList.remove('alert-info');
            status.classList.add('alert-danger');
            status.textContent = 'Cannot load comics.json. Make sure you are running on a local server.';
            status.classList.remove('d-none');
        }
    }
}

loadComics();