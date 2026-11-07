/* MEMBER 4 — Existing club registration and illustrative event booking. */
(function (A) {
  'use strict';
  A.events = [
    {id:'e1', title:'Gotham detective night', category:'DC', days:7, minutes:60, description:'Discuss clues and moral choices in Batman stories.'},
    {id:'e2', title:'Spider-Man first steps', category:'Marvel', days:14, minutes:45, description:'Compare Peter Parker’s early choices and responsibilities.'},
    {id:'e3', title:'Heroes without powers', category:'Both', days:21, minutes:50, description:'Explore preparation, courage and teamwork.'},
    {id:'e4', title:'Wonder Woman and mythology', category:'DC', days:28, minutes:60, description:'Talk about Themyscira, duty and compassion.'},
    {id:'e5', title:'Inside Wakanda', category:'Marvel', days:35, minutes:50, description:'Discuss leadership in Black Panther stories.'},
    {id:'e6', title:'Building your first reading list', category:'Both', days:42, minutes:40, description:'Choose a small, achievable selection of stories.'},
    {id:'e7', title:'The hope of Superman', category:'DC', days:49, minutes:45, description:'Explore stories driven by empathy and responsibility.'},
    {id:'e8', title:'X-Men and belonging', category:'Marvel', days:56, minutes:60, description:'Discuss community and identity through mutant stories.'}
  ];
  A.cleanBookings = function (rows) {
    const seen = new Set();
    return rows.filter(row => {
      if (!row || !A.events.some(e => e.id === row.id) || !Number.isInteger(row.guests) || row.guests < 1 || row.guests > 5 || seen.has(row.id)) return false;
      seen.add(row.id); return true;
    });
  };
  function eventDate(days) {
    const date = new Date(); date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
  }
  function enhanceClubForm() {
    const form = document.querySelector('#club-registration');
    form.noValidate = true;
    const fields = [...form.querySelectorAll('input, select, textarea')];
    fields.forEach(field => {
      field.name = field.id;
      const error = A.el('div', {id:field.id + '-error', class:'invalid-feedback'});
      field.insertAdjacentElement('afterend', error); field.setAttribute('aria-describedby', error.id);
      if (field.id === 'date') field.min = A.today();
      if (field.id === 'name') field.maxLength = 60;
      function check() {
        const message = field.required ? A.validateField(field.id, field.value) : '';
        error.textContent = message; field.classList.toggle('is-invalid', !!message); field.setAttribute('aria-invalid', String(!!message)); return !message;
      }
      field.checkField = check;
      field.addEventListener('input', () => { if (field.dataset.touched) check(); });
      field.addEventListener('change', () => { if (field.dataset.touched) check(); });
    });
    const success = A.el('div', {class:'form-success', role:'status', tabindex:'-1'}); success.style.display='none'; form.after(success);
    form.addEventListener('submit', event => {
      event.preventDefault(); let invalid;
      fields.forEach(field => { field.dataset.touched='true'; if (!field.checkField() && !invalid) invalid=field; });
      if (invalid) { globalThis.jQuery(success).stop(true,true).hide(); invalid.focus(); return; }
      const name = form.elements.name.value;
      const date = form.elements.date.value;
      const universe = form.elements.universe.options[form.elements.universe.selectedIndex].text;
      success.textContent = `${name}, your local club application for ${date} is complete. Interest: ${universe}. This demo does not send an application; your contact details were not saved.`;
      form.reset(); fields.forEach(field => { delete field.dataset.touched; field.classList.remove('is-invalid'); field.removeAttribute('aria-invalid'); });
      globalThis.jQuery(success).stop(true,true).hide().fadeIn(A.duration()); success.focus();
    });
  }
  A.modules['4'] = function () {
    const root = document.querySelector('#feature');
    root.append(A.el('p', {class:'muted'}, 'Practice club schedule. These are illustrative sessions, dated relative to today; no real meeting or seat is reserved.'));
    const controls = A.el('div', {class:'catalog-controls'});
    const searchLabel = A.el('label', {class:'form-label'}, 'Search sessions');
    const search = A.el('input', {type:'search', class:'form-control', id:'event-search'}); searchLabel.append(search);
    const filterLabel = A.el('label', {class:'form-label'}, 'Universe');
    const filter = A.el('select', {class:'form-select', id:'event-filter'});
    ['', 'Marvel', 'DC', 'Both'].forEach(value => filter.append(A.el('option', {value}, value || 'All sessions'))); filterLabel.append(filter);
    const count = A.el('p', {role:'status', class:'event-count'});
    const list = A.el('div', {class:'event-list'}); controls.append(searchLabel, filterLabel); root.append(controls, count, list);
    function render() {
      const rows = A.events.filter(event => (!filter.value || event.category === filter.value) && `${event.title} ${event.description}`.toLowerCase().includes(search.value.trim().toLowerCase()));
      const booked = A.cleanBookings(A.read('bookings'));
      count.textContent = `${rows.length} sessions · ${booked.length} saved bookings · ${booked.reduce((sum, b) => sum + b.guests, 0)} total participants`;
      list.replaceChildren();
      if (!rows.length) list.append(A.el('p', {class:'empty-state'}, 'No sessions found. Try a shorter search or another universe.'));
      rows.forEach(event => {
        const article = A.el('article', {class:'event-row'});
        const details = A.el('div'); details.append(A.el('p', {class:'story-meta'}, `${eventDate(event.days)} / ${event.minutes} min / ${event.category}`), A.el('h3', {}, event.title), A.el('p', {}, event.description));
        article.append(details);
        const reservation = booked.find(b => b.id === event.id);
        if (reservation) {
          const cancel = A.el('button', {type:'button', class:'btn btn-outline-dark'}, `Cancel local booking (${reservation.guests})`);
          cancel.addEventListener('click', () => { A.write('bookings', booked.filter(b => b.id !== event.id)); render(); A.notify('Local booking cancelled.'); }); article.append(cancel);
        } else {
          const button = A.el('button', {type:'button', class:'btn btn-dark'}, 'Choose session');
          button.addEventListener('click', () => {
            if (document.body.dataset.page === 'club') { location.href = A.base + 'events/index.html?event=' + event.id; return; }
            const field = document.querySelector('[name="event"]'); field.value = event.id; field.dispatchEvent(new Event('change')); field.focus();
            globalThis.jQuery('html, body').stop(true).animate({scrollTop: document.querySelector('#form-area').offsetTop - 24}, A.duration()*2);
          }); article.append(button);
        }
        list.append(article);
      });
    }
    search.addEventListener('input', render); filter.addEventListener('change', render);
    if (document.body.dataset.page === 'club') enhanceClubForm();
    else {
      const form = A.form(document.querySelector('#form-area'), 'Save a local session booking', [
        {name:'name',label:'Full name'}, {name:'email',label:'Email address',type:'email'},
        {name:'phone',label:'Phone number',type:'tel'},
        {name:'event',label:'Choose a session',options:A.events.map(e => ({value:e.id,label:e.title}))},
        {name:'guests',label:'Participants (1–5)',type:'number',min:1,max:5},
        {name:'universe',label:'Favorite universe',options:['Marvel','DC','Both']}
      ], values => {
        const bookings = A.cleanBookings(A.read('bookings'));
        const event = A.events.find(e => e.id === values.event);
        if (bookings.some(b => b.id === event.id)) return 'You already saved this session. Cancel its booking first if you want to change the participant count.';
        A.write('bookings', [...bookings, {id:event.id, guests:+values.guests}]); render();
        return `${values.name}, saved locally: ${event.title} for ${values.guests} participant(s). Contact details were not stored. No real seat was reserved.`;
      });
      form.querySelector('button[type="submit"]').textContent='Save local booking';
      const selected = new URLSearchParams(location.search).get('event');
      if (A.events.some(event => event.id === selected)) form.elements.event.value=selected;
    }
    render();
    A.accordion(document.querySelector('#help'), [
      ['Is this a real registration?', 'No. This frontend demonstration validates the form and shows a local result. It does not send messages or reserve real seats.'],
      ['Can I change my booking?', 'Cancel a saved booking in the session list, then submit a new one. Duplicate bookings are blocked.'],
      ['What is stored?', 'Only the event ID and participant count are saved in this browser. Your name, email and phone number are not stored.']
    ]);
  };
})(Archive);
