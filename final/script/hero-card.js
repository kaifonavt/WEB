async function loadHeroes() {
    const container = document.getElementById('heroes-list');
    const template = document.getElementById('hero-template');
    const status = document.getElementById('heroes-status');

    try {
        const response = await fetch('./hero-card.json');
        if (!response.ok) {
            throw new Error(`cannot load JSON: HTTP ${response.status}`);
        }

        const heroes = await response.json();
        if (!Array.isArray(heroes)) {
            throw new Error('No heroes array in heroes.json.');
        }

        const cards = document.createDocumentFragment();

        for (const hero of heroes) {
            const card = template.content.cloneNode(true);
            const image = card.querySelector('img');
            image.src = hero.image;
            image.alt = hero.alt || hero.name;

            card.querySelector('[data-field="name"]').textContent = hero.name;
            card.querySelector('[data-field="realName"]').textContent = hero.realName;
            card.querySelector('[data-field="description"]').textContent = hero.description;

            const tags = card.querySelector('[data-field="tags"]');
            for (const tag of hero.tags || []) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary-subtle text-dark border fw-normal';
                badge.textContent = tag;
                tags.append(badge);
            }

            const link = card.querySelector('[data-field="link"]');
            link.href = hero.link || '#';
            link.textContent = hero.linkText || 'Learn more';
            cards.append(card);
        }

        container.replaceChildren(cards);
        status.textContent = heroes.length ? '' : 'No heroes added.';
        status.hidden = heroes.length > 0;
    } catch (error) {
        console.error(error);
        status.textContent = 'Cannot load JSON.';
        status.hidden = false;
    }
}

loadHeroes();