/* MEMBER 2 — Marvel data, dynamic characters and the Newbies reading tools. */
(function (A) {
  'use strict';
  const stories = [
    {id:'m1', title:'Ultimate Spider-Man: Power and Responsibility', hero:'Spider-Man', category:'Marvel', pages:200, level:'Beginner', image:'marvel/character/spider_man/spider_man.JPG', description:'Peter Parker learns what his new powers demand of him.'},
    {id:'m2', title:'Iron Man: Extremis', hero:'Iron Man', category:'Marvel', pages:160, level:'Intermediate', image:'marvel/character/iron-man/iron_man_portrait_1.jpg', description:'Tony Stark confronts a dangerous step in human enhancement.'},
    {id:'m3', title:'Captain America: The Winter Soldier', hero:'Captain America', category:'Marvel', pages:304, level:'Intermediate', image:'marvel/captain_america.JPG', description:'A spy mystery challenges Steve Rogers and his past.'},
    {id:'m4', title:'Thor: The God Butcher', hero:'Thor', category:'Marvel', pages:136, level:'Intermediate', image:'marvel/character/thor/thor.JPG', description:'Thor follows a threat across different eras of his life.'},
    {id:'m5', title:'Black Panther: A Nation Under Our Feet', hero:'Black Panther', category:'Marvel', pages:144, level:'Intermediate', image:'marvel/character/black_panther/black_panther.JPG', description:'T’Challa faces a crisis of leadership in Wakanda.'},
    {id:'m6', title:'Wolverine: Origin', hero:'Wolverine', category:'Marvel', pages:160, level:'Intermediate', image:'marvel/wolverine.JPG', description:'A story about Logan’s early life and the roots of his identity.'},
    {id:'m7', title:'Astonishing X-Men: Gifted', hero:'X-Men', category:'Marvel', pages:152, level:'Beginner', image:'marvel/x_men.JPG', description:'The X-Men debate a discovery that could change mutant life.'},
    {id:'m8', title:'Avengers: The Final Host', hero:'Avengers', category:'Marvel', pages:160, level:'Beginner', image:'marvel/avamgers.JPG', description:'A new Avengers team assembles against a cosmic threat.'}
  ];
  A.stories.push(...stories);
  A.heroesMarvel = [
    {name:'Spider-Man', identity:'Peter Parker', team:'Spider family', image:'marvel/character/spider_man/spider_man.JPG', description:'A New York hero balancing ordinary life with extraordinary responsibility.'},
    {name:'Iron Man', identity:'Tony Stark', team:'Avengers', image:'marvel/character/iron-man/iron_man_portrait_1.jpg', description:'An inventor whose armor turns engineering into a superpower.'},
    {name:'Captain America', identity:'Steve Rogers', team:'Avengers', image:'marvel/captain_america.JPG', description:'A soldier who tries to put principle ahead of authority.'},
    {name:'Thor', identity:'Thor Odinson', team:'Avengers', image:'marvel/character/thor/thor.JPG', description:'An Asgardian thunder god learning what it means to be worthy.'},
    {name:'Black Panther', identity:'T’Challa', team:'Wakanda', image:'marvel/character/black_panther/black_panther.JPG', description:'Wakanda’s protector combines tradition, strategy and technology.'},
    {name:'Wolverine', identity:'Logan', team:'X-Men', image:'marvel/wolverine.JPG', description:'A resilient mutant with a long past and a fierce protective streak.'},
    {name:'Storm', identity:'Ororo Munroe', team:'X-Men', image:null, description:'A weather-controlling mutant and experienced leader of the X-Men.'},
    {name:'Black Widow', identity:'Natasha Romanoff', team:'Avengers', image:null, description:'A highly trained spy who uses skill and judgment rather than superpowers.'}
  ];
  const glossary = [
    {title:'Single issue', category:'Format', description:'One serialized installment of a comic.', example:'One issue can be read in a short session.'},
    {title:'Trade paperback', category:'Format', description:'A paperback collection of several issues.', example:'A convenient way to read a complete story arc.'},
    {title:'Run', category:'Creators', description:'A sequence of issues associated with a creative team.', example:'A writer’s run can span several collections.'},
    {title:'Crossover', category:'Stories', description:'A story that connects characters or multiple series.', example:'Check a reading order before a large crossover.'},
    {title:'Continuity', category:'Stories', description:'The shared history a story treats as established.', example:'Different universes can have different histories.'},
    {title:'Origin story', category:'Stories', description:'An account of how a character becomes a hero.', example:'Origins are often accessible starting points.'},
    {title:'Panel', category:'Format', description:'One framed image or moment on a comic page.', example:'Follow panel order before reading the next page.'},
    {title:'Story arc', category:'Stories', description:'A connected plot spread over several issues.', example:'A collection often contains one complete arc.'}
  ];
  A.modules['2'] = function () {
    const root = document.querySelector('#feature');
    if (document.body.dataset.page === 'marvel') {
      A.catalog(root, stories); A.heroGallery(document.querySelector('#characters'), A.heroesMarvel);
    } else {
      A.renderQuiz(document.querySelector('#newbie-quiz'));
      const label = A.el('label', {class: 'form-label'}, 'Search the comic glossary');
      const search = A.el('input', {class:'form-control', type:'search', id:'glossary-search'}); label.append(search);
      const results = A.el('div', {class:'glossary-results'}); root.append(label, results);
      function render() {
        results.replaceChildren();
        const rows = glossary.filter(item => `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(search.value.toLowerCase().trim()));
        if (!rows.length) results.append(A.el('p', {class:'empty-state', role:'status'}, 'No terms found. Try “panel” or “story”.'));
        rows.forEach(item => {
          const article = A.el('article', {class:'glossary-row'});
          article.append(A.el('h3', {}, item.title), A.el('p', {}, item.description + ' ' + item.example)); results.append(article);
        });
      }
      search.addEventListener('input', render); render();
    }
    A.planForm(document.querySelector('#form-area'), 'Plan your first reading week', document.body.dataset.page === 'marvel' ? 'Marvel' : null);
    A.accordion(document.querySelector('#help'), [
      ['Do I need to read everything from issue one?', 'No. Choose a collected story that interests you and check whether it introduces its characters.'],
      ['What should I do after the superhero quiz?', 'Use the explanations to learn the characters, then choose a title and save it to your reading list.'],
      ['Where did these pictures come from?', 'The artwork is inherited from the team’s Midterm archive. Character cards and reading recommendations are generated from JavaScript arrays. See Credits for attribution.']
    ]);
  };
})(Archive);
