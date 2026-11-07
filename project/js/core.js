(function (global) {
  'use strict';
  const A = global.Archive = {stories: [], modules: {}, memory: {}, failedStorage: new Set()};
  A.today = function () {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  A.validateField = function (field, raw, today = A.today()) {
    const value = String(raw ?? '').trim();
    if (!value) return 'Please complete this field.';
    if (field === 'name' && (value.length < 2 || value.length > 60)) return 'Use 2 to 60 characters for your name.';
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a full email address, for example reader@example.com.';
    if (field === 'phone' && (!/^\+?[\d ()-]{10,24}$/.test(value) || !/^\d{10,15}$/.test(value.replace(/\D/g, '')))) return 'Enter 10–15 digits; spaces, brackets, a leading + and hyphens are allowed.';
    const ranges = {minutes: [5, 180], weeks: [1, 52], guests: [1, 5]};
    if (ranges[field]) {
      const [min, max] = ranges[field];
      if (!/^\d+$/.test(value) || +value < min || +value > max) return `Enter a whole number from ${min} to ${max}.`;
    }
    if (field === 'date') {
      const parsed = new Date(`${value}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return 'Choose a valid calendar date.';
      if (value < today) return 'Choose today or a future date.';
    }
    return '';
  };
  A.filterItems = function (items, query, category, sort) {
    const term = query.trim().toLowerCase();
    return items.filter(item => (!category || item.category === category) &&
      [item.title, item.description, item.hero].filter(Boolean).join(' ').toLowerCase().includes(term))
      .sort((a, b) => sort === 'short' ? a.pages - b.pages : a.title.localeCompare(b.title));
  };
  A.estimateDays = (pages, minutes) => Number.isFinite(+minutes) && +minutes > 0 ? Math.ceil(pages / minutes) : null;
  A.el = function (tag, attrs = {}, text) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  A.read = function (key, fallback = []) {
    if (A.failedStorage.has(key)) return A.memory[key] || fallback;
    try {
      const value = JSON.parse(localStorage.getItem('multiverse-' + key) || 'null');
      return Array.isArray(value) ? value : fallback;
    } catch (_) { return A.memory[key] || fallback; }
  };
  A.write = function (key, value) {
    A.memory[key] = value;
    try { localStorage.setItem('multiverse-' + key, JSON.stringify(value)); }
    catch (_) { A.failedStorage.add(key); A.notify('Browser storage is unavailable. Changes will last for this page visit only.'); }
  };
  A.duration = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
  A.notify = function (text) {
    const box = document.querySelector('#site-message');
    if (!box) return;
    box.textContent = text;
    global.jQuery(box).stop(true, true).hide().fadeIn(A.duration());
  };
  A.accordion = function (root, rows) {
    const wrap = A.el('div', {class: 'help-accordion'});
    rows.forEach(([title, text], i) => {
      const id = `${root.id}-help-${i}`;
      const button = A.el('button', {type: 'button', class: 'help-toggle', 'aria-expanded': 'false', 'aria-controls': id}, title);
      const panel = A.el('div', {id, class: 'help-panel'}, text);
      panel.style.display = 'none';
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        global.jQuery(panel).stop(true, true)[open ? 'slideDown' : 'slideUp'](A.duration());
      });
      const heading = A.el('h3'); heading.append(button);
      wrap.append(heading, panel);
    });
    root.append(wrap);
  };
  A.saved = () => A.read('saved').filter(id => typeof id === 'string' && A.stories.some(s => s.id === id));
  A.saveButton = function (story) {
    const button = A.el('button', {class: 'btn btn-outline-dark save-story', type: 'button', 'data-id': story.id});
    function sync() {
      const saved = A.saved().includes(story.id);
      button.textContent = saved ? 'Remove from list' : 'Save to reading list';
      button.setAttribute('aria-pressed', String(saved));
    }
    button.addEventListener('click', () => {
      const saved = A.saved();
      const next = saved.includes(story.id) ? saved.filter(id => id !== story.id) : [...saved, story.id];
      A.write('saved', next);
      document.dispatchEvent(new Event('reading-list-change'));
      A.notify(`${story.title}: ${next.includes(story.id) ? 'saved to' : 'removed from'} your reading list.`);
      sync();
    });
    sync(); return button;
  };
  A.catalog = function (root, items, options = {}) {
    const controls = A.el('div', {class: 'catalog-controls'});
    const searchLabel = A.el('label', {class: 'form-label'}, 'Search titles or heroes');
    const search = A.el('input', {class: 'form-control catalog-search', type: 'search', placeholder: 'Try Batman or Spider-Man'});
    searchLabel.append(search);
    const categoryLabel = A.el('label', {class: 'form-label'}, 'Universe');
    const category = A.el('select', {class: 'form-select catalog-category'});
    ['', ...new Set(items.map(item => item.category))].forEach(value => category.append(A.el('option', {value}, value || 'All universes')));
    categoryLabel.append(category);
    const sortLabel = A.el('label', {class: 'form-label'}, 'Sort by');
    const sort = A.el('select', {class: 'form-select catalog-sort'});
    sort.append(A.el('option', {value: 'title'}, 'Title A–Z'), A.el('option', {value: 'short'}, 'Shortest first'));
    sortLabel.append(sort); controls.append(searchLabel, categoryLabel, sortLabel);
    const count = A.el('p', {class: 'result-count', role: 'status'});
    const grid = A.el('div', {class: 'story-grid'});
    root.append(controls, count, grid);
    function render() {
      const results = A.filterItems(items, search.value, category.value, sort.value);
      count.textContent = `${results.length} stories · ${results.reduce((sum, item) => sum + item.pages, 0)} pages in this selection`;
      grid.replaceChildren();
      if (!results.length) grid.append(A.el('p', {class: 'empty-state'}, 'No stories found. Try a different title or reset the universe filter.'));
      results.forEach(story => {
        const card = A.el('article', {class: 'story-card'});
        const image = A.el('img', {src: A.base + 'media/image/' + story.image, alt: story.hero + ' artwork from the Midterm archive', loading: 'lazy'});
        const content = A.el('div', {class: 'story-content'});
        content.append(A.el('p', {class: 'story-meta'}, `${story.category} / ${story.pages} pages / ${story.level}`),
          A.el('h3', {}, story.title), A.el('p', {}, story.description), A.saveButton(story));
        card.append(image, content); grid.append(card);
      });
    }
    search.addEventListener('input', render); category.addEventListener('change', render); sort.addEventListener('change', render);
    render();
  };
  A.heroGallery = function (root, heroes) {
    const label = A.el('label', {class: 'form-label'}, 'Find a character');
    const input = A.el('input', {class: 'form-control hero-search', type: 'search', placeholder: 'Search name, identity or team'});
    label.append(input);
    const count = A.el('p', {role: 'status'});
    const grid = A.el('div', {class: 'hero-grid'});
    root.append(label, count, grid);
    function render() {
      const term = input.value.trim().toLowerCase();
      const matches = heroes.filter(hero => `${hero.name} ${hero.identity} ${hero.team}`.toLowerCase().includes(term));
      count.textContent = `${matches.length} characters`;
      grid.replaceChildren();
      if (!matches.length) grid.append(A.el('p', {class: 'empty-state'}, 'No characters found. Try another name or team.'));
      matches.forEach(hero => {
        const card = A.el('article', {class: 'hero-card', id:hero.name.toLowerCase().replace(/\s+/g,'-'), tabindex:'-1'});
        if (hero.image) card.append(A.el('img', {src: A.base + 'media/image/' + hero.image, alt: hero.name, loading: 'lazy'}));
        const content = A.el('div', {class: 'story-content'});
        content.append(A.el('h3', {}, hero.name), A.el('p', {class: 'story-meta'}, hero.identity + ' / ' + hero.team), A.el('p', {}, hero.description));
        card.append(content); grid.append(card);
      });
    }
    input.addEventListener('input', render); render();
    heroes.forEach(hero => {
      const id=hero.name.toLowerCase().replace(/\s+/g,'-');
      document.querySelectorAll(`a[href="#${id}"]`).forEach(link => link.addEventListener('click', event => {
        event.preventDefault(); input.value=''; render();
        const target=document.getElementById(id); target.scrollIntoView(); target.focus({preventScroll:true});
      }));
    });
  };
  A.form = function (root, title, fields, onSuccess) {
    const section = A.el('section', {class: 'interactive-form'});
    section.append(A.el('h2', {}, title), A.el('p', {class: 'muted'}, 'Local demo: nothing is sent by email or to a server. Contact details are not saved.'));
    const form = A.el('form', {novalidate: '', class: 'row g-3'});
    const success = A.el('div', {class: 'form-success', role: 'status', tabindex: '-1'});
    success.style.display = 'none';
    fields.forEach(field => {
      const id = `${root.id}-${field.name}`;
      const wrap = A.el('div', {class: 'col-12 col-md-6'});
      const label = A.el('label', {for: id, class: 'form-label'}, field.label);
      const control = A.el(field.options ? 'select' : 'input', {id, name: field.name, required: '', class: field.options ? 'form-select' : 'form-control', 'aria-describedby': id + '-error'});
      if (field.options) {
        control.append(A.el('option', {value: ''}, 'Choose an option'));
        field.options.forEach(option => control.append(A.el('option', {value: option.value ?? option}, option.label ?? option)));
      } else {
        control.type = field.type || 'text';
        if (field.name === 'date') control.min = A.today();
        if (field.min !== undefined) control.min = field.min;
        if (field.max !== undefined) control.max = field.max;
        if (field.type === 'number') control.step = '1';
        if (field.name === 'name') { control.maxLength = 60; control.autocomplete = 'name'; }
        if (field.name === 'email') control.autocomplete = 'email';
        if (field.name === 'phone') control.autocomplete = 'tel';
      }
      const error = A.el('div', {id: id + '-error', class: 'invalid-feedback'});
      wrap.append(label, control, error); form.append(wrap);
      function validate() {
        const message = A.validateField(field.name, control.value);
        error.textContent = message; control.classList.toggle('is-invalid', !!message);
        control.setAttribute('aria-invalid', String(!!message)); return !message;
      }
      control.addEventListener('input', () => { if (control.dataset.touched) validate(); });
      control.addEventListener('change', () => { if (control.dataset.touched) validate(); });
      control.checkField = validate;
    });
    const submitWrap = A.el('div', {class: 'col-12'});
    submitWrap.append(A.el('button', {type: 'submit', class: 'btn btn-dark'}, 'Create my local plan'));
    form.append(submitWrap);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const controls = [...form.querySelectorAll('input, select')];
      let firstInvalid;
      controls.forEach(control => { control.dataset.touched = 'true'; if (!control.checkField() && !firstInvalid) firstInvalid = control; });
      if (firstInvalid) { global.jQuery(success).stop(true, true).hide(); firstInvalid.focus(); return; }
      const values = Object.fromEntries(new FormData(form));
      success.textContent = onSuccess(values);
      form.reset();
      controls.forEach(control => { delete control.dataset.touched; control.classList.remove('is-invalid'); control.removeAttribute('aria-invalid'); });
      global.jQuery(success).stop(true, true).hide().fadeIn(A.duration()); success.focus();
    });
    section.append(form, success); root.append(section); return form;
  };
  A.planForm = function (root, title, universe) {
    return A.form(root, title, [
      {name: 'name', label: 'Reader name'}, {name: 'email', label: 'Email address', type: 'email'},
      {name: 'minutes', label: 'Minutes per day (5–180)', type: 'number', min: 5, max: 180},
      {name: 'weeks', label: 'Number of weeks (1–52)', type: 'number', min: 1, max: 52},
      {name: 'date', label: 'Starting date', type: 'date'},
      {name: 'universe', label: 'Preferred universe', options: universe ? [universe] : ['Marvel', 'DC', 'Both']}
    ], values => `${values.name}, your ${values.universe} plan starts on ${values.date}: ${+values.minutes * +values.weeks * 7} estimated pages over ${values.weeks} weeks. Estimate: one page per minute. Your form has been cleared.`);
  };
  A.boot = function () {
    A.base = document.body.dataset.base;
    const menu = document.querySelector('#menu-toggle');
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open)); document.querySelector('#main-nav').classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { menu.click(); menu.focus(); }
    });
    document.querySelectorAll('[data-scroll]').forEach(link => link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      global.jQuery('html, body').stop(true).animate({scrollTop: target.getBoundingClientRect().top + scrollY - 24}, A.duration() * 2);
      target.focus({preventScroll: true});
    }));
    if (A.modules[document.body.dataset.owner]) A.modules[document.body.dataset.owner]();
  };
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', A.boot);
})(globalThis);
