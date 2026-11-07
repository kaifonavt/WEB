(function (A) {
  'use strict';
  A.readingPaces = [
    {id:'tiny',title:'A few panels daily',minutes:5,days:7,description:'A gentle habit for a busy week.'},
    {id:'coffee',title:'Coffee-break reader',minutes:10,days:7,description:'A short chapter alongside your daily break.'},
    {id:'starter',title:'First comic week',minutes:15,days:7,description:'A comfortable introduction to a new story.'},
    {id:'steady',title:'Steady daily reader',minutes:20,days:7,description:'Make reading part of your evening routine.'},
    {id:'weekend',title:'Weekend explorer',minutes:30,days:2,description:'Two relaxed sessions over the weekend.'},
    {id:'lunch',title:'Lunch-break arc',minutes:25,days:5,description:'Read a little on each weekday.'},
    {id:'deep',title:'Deep-dive weekend',minutes:60,days:2,description:'Set aside two longer sessions for a complete arc.'},
    {id:'month',title:'Month of stories',minutes:15,days:30,description:'Build a sustainable month-long reading habit.'}
  ];
  A.modules['1'] = function () {
    const root = document.querySelector('#feature');
    if (document.body.dataset.page === 'home') {
      A.catalog(root, A.stories);
      const section = A.el('section', {class:'pace-picker'});
      section.append(A.el('h2', {}, 'Find your reading pace'));
      const label = A.el('label', {class:'form-label'}, 'Choose a routine');
      const select = A.el('select', {class:'form-select', id:'reading-pace'});
      A.readingPaces.forEach(pace => select.append(A.el('option', {value:pace.id}, pace.title)));
      const result = A.el('p', {role:'status', class:'pace-result'});
      function showPace() {
        const pace = A.readingPaces.find(item => item.id === select.value);
        result.textContent = `${pace.description} ${pace.minutes} minutes × ${pace.days} days = about ${pace.minutes * pace.days} pages at one page per minute.`;
      }
      label.append(select); section.append(label,result); root.append(section);
      select.addEventListener('change',showPace); showPace();
    } else {
      const budgetLabel = A.el('label', {class: 'form-label'}, 'Daily reading budget in minutes (5–180)');
      const budget = A.el('input', {type: 'number', min: '5', max: '180', value: '20', class: 'form-control', id: 'daily-budget'});
      budgetLabel.append(budget);
      const summary = A.el('p', {class: 'reading-summary', role: 'status'});
      const progress = A.el('progress', {max: '100', value: '0', 'aria-label': 'Reading list completion'});
      const list = A.el('div', {class: 'reading-list'});
      root.append(budgetLabel, summary, progress, list);
      function render() {
        const focused = document.activeElement;
        const focusedRow = focused?.closest('.reading-row');
        const focusedId = focusedRow?.dataset.story;
        const focusSelector = focused?.matches('input') ? 'input' : 'button';
        const saved = A.saved();
        const done = A.read('done').filter(id => saved.includes(id));
        const stories = A.stories.filter(story => saved.includes(story.id));
        const pages = stories.filter(story => !done.includes(story.id)).reduce((sum, story) => sum + story.pages, 0);
        const error = A.validateField('minutes', budget.value);
        budget.setAttribute('aria-invalid', String(!!error));
        summary.textContent = error || `${done.length}/${stories.length} completed · ${pages} pages left · about ${A.estimateDays(pages, budget.value)} days at one page per minute.`;
        progress.value = stories.length ? Math.round(done.length / stories.length * 100) : 0;
        list.replaceChildren();
        if (!stories.length) {
          list.append(A.el('p', {class: 'empty-state'}, 'Your next adventure starts with one story. Save a title from Home, Marvel or DC.'), A.el('a', {href: A.base + 'index.html#feature', class: 'btn btn-dark'}, 'Browse the archive'));
        }
        stories.forEach(story => {
          const row = A.el('article', {class: 'reading-row', 'data-story':story.id});
          const text = A.el('div'); text.append(A.el('h3', {}, story.title), A.el('p', {}, `${story.pages} pages · ${story.category}`));
          const label = A.el('label', {class: 'form-check-label'}, ' Finished reading');
          const checkbox = A.el('input', {type: 'checkbox', class: 'form-check-input me-2'});
          checkbox.checked = done.includes(story.id); label.prepend(checkbox);
          checkbox.addEventListener('change', () => {
            A.write('done', checkbox.checked ? [...new Set([...done, story.id])] : done.filter(id => id !== story.id)); render();
          });
          row.append(text, label, A.saveButton(story)); list.append(row);
        });
        if (focusedId) {
          const replacement = list.querySelector(`[data-story="${focusedId}"] ${focusSelector}`) || list.querySelector('input,button,a');
          replacement?.focus({preventScroll:true});
        }
      }
      budget.addEventListener('input', render); document.addEventListener('reading-list-change', render); render();
    }
    A.planForm(document.querySelector('#form-area'), 'Build your reading passport');
    A.accordion(document.querySelector('#help'), [
      ['How does my reading passport work?', 'Save a story, mark it finished, and see how many reading days remain. Your list stays in this browser when local storage is available.'],
      ['Are these exact reading times?', 'No. The calculator uses one page per minute. Edition lengths vary, and the catalog uses approximate planning lengths.'],
      ['Can I read the comics here?', 'This is a discovery archive, not a comic download service. Find the selected titles through your library or a licensed retailer.']
    ]);
  };
})(Archive);
