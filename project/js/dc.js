(function (A) {
  'use strict';
  const stories = [
    {id:'d1', title:'Batman: Year One', hero:'Batman', category:'DC', pages:144, level:'Beginner', image:'dc/batman_year_one.jpg', description:'Bruce Wayne and James Gordon begin their work in Gotham.'},
    {id:'d2', title:'Batman: The Long Halloween', hero:'Batman', category:'DC', pages:384, level:'Intermediate', image:'dc/character/batman/batman.jpg', description:'A long-running mystery tests Gotham’s uneasy alliances.'},
    {id:'d3', title:'Superman: Birthright', hero:'Superman', category:'DC', pages:304, level:'Beginner', image:'dc/character/superman/superman.jpg', description:'Clark Kent decides how to use his powers in the wider world.'},
    {id:'d4', title:'All-Star Superman', hero:'Superman', category:'DC', pages:320, level:'Intermediate', image:'dc/character/superman/superman.jpg', description:'A self-contained celebration of Superman’s compassion and imagination.'},
    {id:'d5', title:'Wonder Woman: The Hiketeia', hero:'Wonder Woman', category:'DC', pages:96, level:'Intermediate', image:'dc/character/wonder_woman/wonder_woman.jpg', description:'Diana must weigh an ancient duty against a modern demand for justice.'},
    {id:'d6', title:'Wonder Woman: Year One', hero:'Wonder Woman', category:'DC', pages:168, level:'Beginner', image:'dc/character/wonder_woman/wonder_woman.jpg', description:'Diana leaves Themyscira and encounters the outside world.'},
    {id:'d7', title:'Justice League: Origin', hero:'Justice League', category:'DC', pages:192, level:'Beginner', image:'dc/justice_league.jpg', description:'DC’s heroes learn to work together against a shared threat.'},
    {id:'d8', title:'DC: The New Frontier', hero:'Justice League', category:'DC', pages:416, level:'Intermediate', image:'dc/character/dc_trinity.jpg', description:'A period adventure about heroes and a changing society.'}
  ]; A.stories.push(...stories);
  A.heroesDC = [
    {name:'Batman', identity:'Bruce Wayne', team:'Justice League', image:'dc/character/batman/batman.jpg', description:'Gotham’s detective relies on training, preparation and investigation.'},
    {name:'Superman', identity:'Clark Kent', team:'Justice League', image:'dc/character/superman/superman.jpg', description:'A Kryptonian raised on Earth who chooses to help others.'},
    {name:'Wonder Woman', identity:'Diana', team:'Justice League', image:'dc/character/wonder_woman/wonder_woman.jpg', description:'An Amazon champion seeking peace through courage and compassion.'},
    {name:'The Flash', identity:'Barry Allen', team:'Justice League', image:null, description:'A forensic scientist connected to the Speed Force.'},
    {name:'Green Lantern', identity:'Hal Jordan', team:'Green Lantern Corps', image:null, description:'A pilot whose ring gives form to willpower and imagination.'},
    {name:'Aquaman', identity:'Arthur Curry', team:'Justice League', image:null, description:'A hero with responsibilities to the ocean and the surface world.'},
    {name:'Cyborg', identity:'Victor Stone', team:'Titans / Justice League', image:null, description:'A hero whose technology is part of his body and identity.'},
    {name:'Nightwing', identity:'Dick Grayson', team:'Titans', image:null, description:'An acrobat and former Robin who builds his own heroic identity.'}
  ];
  A.questions = [
    {id:'q1', title:'Who is the original Spider-Man?', category:'Marvel', options:['Peter Parker','Tony Stark','Steve Rogers'], correct:0, explanation:'Peter Parker is the original Spider-Man; Miles Morales is another Spider-Man.'},
    {id:'q2', title:'Which city does Batman primarily protect?', category:'DC', options:['Metropolis','Gotham','Wakanda'], correct:1, explanation:'Batman operates in Gotham City.'},
    {id:'q3', title:'What is Thor’s famous hammer called?', category:'Marvel', options:['Vibranium','Mjolnir','Kryptonite'], correct:1, explanation:'Mjolnir is Thor’s enchanted hammer.'},
    {id:'q4', title:'What is Superman’s home planet?', category:'DC', options:['Mars','Asgard','Krypton'], correct:2, explanation:'Superman was born on Krypton and raised on Earth.'},
    {id:'q5', title:'Which nation is associated with Black Panther?', category:'Marvel', options:['Wakanda','Themyscira','Atlantis'], correct:0, explanation:'T’Challa is the Black Panther of Wakanda.'},
    {id:'q6', title:'Which hero is Diana of Themyscira?', category:'DC', options:['Storm','Wonder Woman','Black Widow'], correct:1, explanation:'Diana is Wonder Woman, an Amazon champion.'},
    {id:'q7', title:'Which team is Wolverine most associated with?', category:'Marvel', options:['Green Lantern Corps','Fantastic Four','X-Men'], correct:2, explanation:'Wolverine is a long-standing member of the X-Men.'},
    {id:'q8', title:'Who uses powered armor as Iron Man?', category:'Marvel', options:['Tony Stark','Bruce Wayne','Clark Kent'], correct:0, explanation:'Tony Stark designs and uses the Iron Man armor.'}
  ];
  A.scoreQuiz = function (answers) {
    let score = 0, answered = 0;
    A.questions.forEach(q => {
      if (Number.isInteger(answers[q.id]) && answers[q.id] >= 0 && answers[q.id] < q.options.length) { answered++; if (answers[q.id] === q.correct) score++; }
    }); return {score, answered};
  };
  A.renderQuiz = function (root) {
    const form = A.el('form', {class:'quiz-form'});
    const status = A.el('p', {class:'quiz-status', role:'status'}, '0 of 8 answered');
    const result = A.el('div', {class:'quiz-result', role:'status', tabindex:'-1'});
    const answers = {};
    A.questions.forEach((q, index) => {
      const group = A.el('fieldset', {class:'quiz-question'});
      group.append(A.el('legend', {}, `${index + 1}. ${q.title}`));
      q.options.forEach((option, number) => {
        const label = A.el('label', {class:'quiz-option'});
        const input = A.el('input', {type:'radio', name:q.id, value:number, class:'form-check-input'});
        input.addEventListener('change', () => {
          answers[q.id] = number; status.textContent = `${A.scoreQuiz(answers).answered} of 8 answered`;
          result.replaceChildren();
        });
        label.append(input, document.createTextNode(' ' + option)); group.append(label);
      }); form.append(group);
    });
    const submit = A.el('button', {type:'submit', class:'btn btn-dark'}, 'Check my answers');
    const reset = A.el('button', {type:'button', class:'btn btn-outline-dark ms-2'}, 'Try again');
    reset.addEventListener('click', () => { form.reset(); Object.keys(answers).forEach(key => delete answers[key]); status.textContent='0 of 8 answered'; result.replaceChildren(); form.querySelector('input').focus(); });
    form.addEventListener('submit', event => {
      event.preventDefault(); const {score, answered} = A.scoreQuiz(answers); result.replaceChildren();
      if (answered < 8) {
        result.append(A.el('p', {class:'validation-note'}, `Answer the remaining ${8 - answered} questions before checking your score.`));
        form.querySelector(`input[name="${A.questions.find(q => answers[q.id] === undefined).id}"]`).focus(); return;
      }
      result.append(A.el('h3', {}, `${score} / 8 — ${Math.round(score / 8 * 100)}% correct`));
      const review = A.el('ol');
      A.questions.forEach(q => review.append(A.el('li', {}, `${answers[q.id] === q.correct ? 'Correct' : 'Review'}: ${q.explanation}`)));
      result.append(review); globalThis.jQuery(result).stop(true,true).hide().fadeIn(A.duration()); result.focus();
    });
    form.append(submit, reset); root.append(status, form, result);
  };
  A.modules['3'] = function () {
    if (document.body.dataset.page === 'dc') { A.catalog(document.querySelector('#feature'), stories); A.heroGallery(document.querySelector('#characters'), A.heroesDC); }
    else A.renderQuiz(document.querySelector('#feature'));
    A.planForm(document.querySelector('#form-area'), 'Create a hero reading plan', document.body.dataset.page === 'dc' ? 'DC' : null);
    A.accordion(document.querySelector('#help'), [
      ['Can I retry the superhero quiz?', 'Yes. Try again clears all eight answers and the result. Explanations appear after a complete attempt.'],
      ['Do I need to know every DC timeline?', 'No. Begin with a self-contained story such as Batman: Year One, then explore other characters.'],
      ['How do the character cards work?', 'A JavaScript array stores each name, identity, team and description. Search filters that array and rebuilds the visible cards.']
    ]);
  };
})(Archive);
