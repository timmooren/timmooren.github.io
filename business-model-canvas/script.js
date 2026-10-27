// The nine blocks, in the order we fill them in: left to right, column by column, then the bottom row.
// group: desire (customer side), value (the centre), feas (infrastructure), viab (money)
const BLOCKS = [
  { id: 'kp', group: 'feas' },
  { id: 'ka', group: 'feas' },
  { id: 'kr', group: 'feas' },
  { id: 'vp', group: 'value' },
  { id: 'cr', group: 'desire' },
  { id: 'ch', group: 'desire' },
  { id: 'cs', group: 'desire' },
  { id: 'co', group: 'viab' },
  { id: 'rs', group: 'viab' },
];

// Block content per language
const BLOCK_TEXT = {
  en: {
    kp: {
      name: 'Key partners', short: 'Partners',
      question: 'Who do we rely on outside our own organisation?',
      text: 'The network of suppliers and partners. You partner to reduce risk, to get resources you don’t have or because someone else does it better.',
      ask: ['Who are our key partners and suppliers?', 'Which resources do we get from them?', 'Which activities do they perform for us?'],
      notes: ['Record labels', 'Podcast creators', 'Device makers', 'Mobile operators', 'Cloud hosting'],
    },
    ka: {
      name: 'Key activities', short: 'Activities',
      question: 'What do we need to do well?',
      text: 'The most important things the organisation does to make the model work: producing, solving problems or running a platform.',
      ask: ['Which activities do our value propositions require?', 'And our channels, relationships and revenue streams?', 'Which activity, if it stopped tomorrow, would hurt most?'],
      notes: ['Product development', 'Negotiating licences', 'Curating playlists', 'Selling ads'],
    },
    kr: {
      name: 'Key resources', short: 'Resources',
      question: 'What do we need to have to deliver this?',
      text: 'The assets the model can’t do without. They can be physical, intellectual, human or financial.',
      ask: ['Which resources do our value propositions need?', 'What about our channels and relationships?', 'Which of these are hard for competitors to copy?'],
      notes: ['Licensed catalogue', 'Listening data', 'Recommendation algorithms', 'Engineers and designers', 'The brand'],
    },
    vp: {
      name: 'Value propositions', short: 'Value',
      question: 'Which problem do we solve, and for whom?',
      text: 'The reason customers pick you over someone else. Each segment gets its own value proposition. Spotify gives listeners music and advertisers attention.',
      ask: ['Which customer problem are we helping to solve?', 'What do we offer each segment?', 'Why is it better than the alternative, including doing nothing?'],
      notes: ['Almost all music, anywhere', 'Personal discovery', 'Free with ads', 'Ad-free and offline', 'Reach targeted listeners'],
    },
    cr: {
      name: 'Customer relationships', short: 'Relations',
      question: 'What kind of relationship does each segment expect?',
      text: 'From personal help to fully automated self-service. Relationships are how you win customers, keep them and get them to use more.',
      ask: ['What kind of relationship does each segment expect?', 'Is it personal, automated, a community?', 'How do we keep people coming back?'],
      notes: ['Automated personalisation', 'Self-service', 'Wrapped, once a year', 'Account managers for advertisers'],
    },
    ch: {
      name: 'Channels', short: 'Channels',
      question: 'How do we reach our customers?',
      text: 'The routes between you and your customers: how people hear about you, try you, buy you, use you and get help afterwards.',
      ask: ['Through which channels do our segments want to be reached?', 'Which channels work best, and which are cheapest?', 'How do they fit into customers’ daily routines?'],
      notes: ['Mobile and desktop apps', 'Cars and smart speakers', 'Telecom bundles', 'Shared playlists'],
    },
    cs: {
      name: 'Customer segments', short: 'Customers',
      question: 'For whom are we creating value?',
      text: 'The groups of people or organisations you want to reach and serve. Groups count as separate segments when they have different needs, reach you through different channels or pay differently.',
      ask: ['Who are our most important customers?', 'Do we serve one mass market or several niches?', 'Is this a multi-sided platform where segments need each other?'],
      notes: ['Free listeners', 'Premium subscribers', 'Podcast fans', 'Advertisers', 'Artists'],
    },
    co: {
      name: 'Cost structure', short: 'Costs',
      question: 'What does running this model cost?',
      text: 'All the costs that come from the blocks above. Some models are driven by cost (as cheap as possible), others by value (premium, personal).',
      ask: ['What are the biggest costs in our model?', 'Which resources and activities are the most expensive?', 'Are costs fixed, or do they grow with usage?'],
      notes: ['Royalties to rights holders', 'Research and development', 'Marketing', 'Servers and streaming'],
    },
    rs: {
      name: 'Revenue streams', short: 'Revenue',
      question: 'What are customers willing to pay for?',
      text: 'The money each segment brings in. Subscriptions, advertising, one-off sales, licensing, usage fees. Check which segments pay and which are subsidised by the others.',
      ask: ['What are customers really willing to pay for?', 'How do they pay now, and how would they prefer to pay?', 'How much does each stream contribute?'],
      notes: ['Premium subscriptions', 'Family, Duo and Student plans', 'Advertising'],
    },
  },
  nl: {
    kp: {
      name: 'Kernpartners', short: 'Partners',
      question: 'Op wie zijn we buiten onze eigen organisatie aangewezen?',
      text: 'Het netwerk van leveranciers en partners. Je werkt samen om risico te verkleinen, om middelen te krijgen die je zelf niet hebt, of omdat een ander het beter kan.',
      ask: ['Wie zijn onze belangrijkste partners en leveranciers?', 'Welke middelen krijgen we van hen?', 'Welke activiteiten voeren zij voor ons uit?'],
      notes: ['Platenlabels', 'Podcastmakers', 'Apparaatfabrikanten', 'Telecomproviders', 'Cloudhosting'],
    },
    ka: {
      name: 'Kernactiviteiten', short: 'Activiteiten',
      question: 'Waar moeten we goed in zijn?',
      text: 'De belangrijkste dingen die de organisatie doet om het model te laten werken: produceren, problemen oplossen of een platform draaiende houden.',
      ask: ['Welke activiteiten vragen onze waardeproposities?', 'En onze kanalen, klantrelaties en inkomstenstromen?', 'Welke activiteit doet het meeste pijn als die morgen stopt?'],
      notes: ['Productontwikkeling', 'Licenties onderhandelen', 'Playlists samenstellen', 'Advertenties verkopen'],
    },
    kr: {
      name: 'Kernmiddelen', short: 'Middelen',
      question: 'Wat moeten we hebben om dit te leveren?',
      text: 'De bezittingen waar het model niet zonder kan. Dat kan fysiek zijn, intellectueel, menselijk of financieel.',
      ask: ['Welke middelen vragen onze waardeproposities?', 'En onze kanalen en klantrelaties?', 'Welke daarvan zijn voor concurrenten lastig na te maken?'],
      notes: ['Gelicentieerde catalogus', 'Luisterdata', 'Aanbevelingsalgoritmes', 'Developers en designers', 'Het merk'],
    },
    vp: {
      name: 'Waardeproposities', short: 'Waarde',
      question: 'Welk probleem lossen we op, en voor wie?',
      text: 'De reden dat klanten voor jou kiezen en niet voor een ander. Elk segment krijgt zijn eigen waardepropositie. Spotify geeft luisteraars muziek en adverteerders aandacht.',
      ask: ['Bij welk klantprobleem helpen we?', 'Wat bieden we elk segment?', 'Waarom is het beter dan het alternatief, ook als dat niets doen is?'],
      notes: ['Bijna alle muziek, overal', 'Persoonlijke ontdekkingen', 'Gratis met reclame', 'Zonder reclame en offline', 'Gericht luisteraars bereiken'],
    },
    cr: {
      name: 'Klantrelaties', short: 'Relaties',
      question: 'Wat voor relatie verwacht elk segment?',
      text: 'Van persoonlijke hulp tot volledig geautomatiseerde selfservice. Met relaties win je klanten, houd je ze vast en zorg je dat ze meer gebruiken.',
      ask: ['Wat voor relatie verwacht elk segment?', 'Is die persoonlijk, geautomatiseerd of een community?', 'Hoe zorgen we dat mensen terugkomen?'],
      notes: ['Automatische personalisatie', 'Selfservice', 'Wrapped, eens per jaar', 'Accountmanagers voor adverteerders'],
    },
    ch: {
      name: 'Kanalen', short: 'Kanalen',
      question: 'Hoe bereiken we onze klanten?',
      text: 'De routes tussen jou en je klanten: hoe mensen van je horen, je uitproberen, je kopen, je gebruiken en daarna hulp krijgen.',
      ask: ['Via welke kanalen willen onze segmenten bereikt worden?', 'Welke kanalen werken het best, en welke zijn het goedkoopst?', 'Hoe passen ze in de dagelijkse routine van klanten?'],
      notes: ['Apps voor mobiel en desktop', 'Auto’s en slimme speakers', 'Telecombundels', 'Gedeelde playlists'],
    },
    cs: {
      name: 'Klantsegmenten', short: 'Klanten',
      question: 'Voor wie creëren we waarde?',
      text: 'De groepen mensen of organisaties die je wilt bereiken en bedienen. Groepen zijn aparte segmenten als ze andere behoeften hebben, via andere kanalen komen of anders betalen.',
      ask: ['Wie zijn onze belangrijkste klanten?', 'Bedienen we één massamarkt of meerdere niches?', 'Is dit een platform waar segmenten elkaar nodig hebben?'],
      notes: ['Gratis luisteraars', 'Premium-abonnees', 'Podcastfans', 'Adverteerders', 'Artiesten'],
    },
    co: {
      name: 'Kostenstructuur', short: 'Kosten',
      question: 'Wat kost het om dit model te draaien?',
      text: 'Alle kosten die uit de blokken hierboven voortkomen. Sommige modellen draaien om kosten (zo goedkoop mogelijk), andere om waarde (premium, persoonlijk).',
      ask: ['Wat zijn de grootste kosten in ons model?', 'Welke middelen en activiteiten zijn het duurst?', 'Zijn de kosten vast, of groeien ze mee met het gebruik?'],
      notes: ['Royalty’s voor rechthebbenden', 'Onderzoek en ontwikkeling', 'Marketing', 'Servers en streaming'],
    },
    rs: {
      name: 'Inkomstenstromen', short: 'Inkomsten',
      question: 'Waar willen klanten voor betalen?',
      text: 'Het geld dat elk segment oplevert. Abonnementen, advertenties, losse verkoop, licenties, gebruikskosten. Kijk welke segmenten betalen en welke door de andere worden gesponsord.',
      ask: ['Waar willen klanten echt voor betalen?', 'Hoe betalen ze nu, en hoe zouden ze het liefst betalen?', 'Hoeveel draagt elke stroom bij?'],
      notes: ['Premium-abonnementen', 'Family-, Duo- en Studentenabonnementen', 'Advertenties'],
    },
  },
};

// Interface text per language. Values may contain HTML; they are our own strings, never user input.
const STRINGS = {
  en: {
    title: 'Business Model Canvas',
    description: 'An interactive explainer of the nine building blocks of the Business Model Canvas, with a worked example and a canvas to fill in yourself.',
    about: 'About this page',
    credits: 'The Business Model Canvas is by Strategyzer AG and is licensed under CC BY-SA 3.0. The Spotify example is a simplified illustration for teaching.',
    language: 'Language',
    view: 'View',
    explain: 'Explain',
    create: 'Create',
    lede: 'The Business Model Canvas describes how an organisation creates, delivers and captures value. Select a block to see what goes in it, with Spotify as the example.',
    highlight: 'Highlight part of the canvas',
    allBlocks: 'All blocks',
    desire: 'Desirability',
    feas: 'Feasibility',
    viab: 'Viability',
    story: 'Read as one story',
    loadExample: 'Load the Spotify example',
    clear: 'Clear all notes',
    print: 'Print canvas',
    blockOf: (n) => `Block ${n} of 9`,
    blocks: 'Blocks',
    previous: 'Previous',
    next: 'Next',
    askYourself: 'Ask yourself',
    atSpotify: 'At Spotify',
    howToRead: 'How to read the canvas',
    readingCanvas: 'Reading the canvas',
    addNote: (name) => `Add a note to ${name}`,
    note: 'Note',
    removeNote: 'Remove note',
    intro: {
      meta: 'Start here',
      title: 'Why a canvas?',
      text: [
        'Business plans run to dozens of pages and nobody rereads them. Alexander Osterwalder and Yves Pigneur put the essentials on a single sheet in <em>Business Model Generation</em> (2010).',
        'For UX designers it is a shared language. When product owners talk about “the business goal”, the canvas shows where your design fits: which customers, which value, and which behaviour keeps it all running.',
        'The numbers follow the canvas from left to right, then along the bottom. Many teams start with customers instead. The order matters less than filling in every block.',
      ],
      start: 'Start with block 1',
    },
    lenses: {
      desire: {
        title: 'The right side is about desirability',
        text: ['Customers, value, channels and relationships. Does anyone actually want this?', 'This is where most UX research lives: interviews, personas, customer journeys.'],
      },
      feas: {
        title: 'The left side is about feasibility',
        text: ['Partners, activities and resources. Can we actually deliver it?', 'The right side is what customers see. The left side is the backstage that makes it possible.'],
      },
      viab: {
        title: 'The bottom row is about viability',
        text: ['Revenue minus costs. Can we keep doing it?', 'A design that users love but that nobody pays for will not survive the next budget round.'],
      },
      flow: {
        title: 'Read it as one story',
        text: ['The value proposition reaches customers through channels and relationships, and they pay for it. Delivering it takes resources, activities and partners, and those cost money.', 'Change one block and follow the line through the others. Make Premium cheaper and you change revenue, the deal with the labels and maybe the segments too.'],
      },
    },
    tipsTitle: 'Five habits of good canvases',
    tips: [
      '<strong>One idea per note.</strong> If you can’t move it to another block on its own, split it.',
      '<strong>Be specific.</strong> “Everyone” is not a customer segment. “Students on a tight budget who listen on the train” is.',
      '<strong>Write value, not features.</strong> “Offline playback” is a feature. “Music on the plane without a signal” is value.',
      '<strong>Colour by segment.</strong> Give each segment its own note colour, then use the same colour for its value, channels and revenue. You’ll see where the gaps are.',
      '<strong>Revisit it.</strong> A canvas is a hypothesis, not a deliverable. Test it, then move the notes.',
    ],
  },
  nl: {
    title: 'Business Model Canvas',
    description: 'Een interactieve uitleg van de negen bouwstenen van het Business Model Canvas, met een uitgewerkt voorbeeld en een canvas om zelf in te vullen.',
    about: 'Over deze pagina',
    credits: 'Het Business Model Canvas is van Strategyzer AG en valt onder de licentie CC BY-SA 3.0. Het Spotify-voorbeeld is een vereenvoudigde illustratie voor lesdoeleinden.',
    language: 'Taal',
    view: 'Weergave',
    explain: 'Uitleg',
    create: 'Maken',
    lede: 'Het Business Model Canvas beschrijft hoe een organisatie waarde creëert, levert en te gelde maakt. Kies een blok om te zien wat erin hoort, met Spotify als voorbeeld.',
    highlight: 'Markeer een deel van het canvas',
    allBlocks: 'Alle blokken',
    desire: 'Wenselijkheid',
    feas: 'Haalbaarheid',
    viab: 'Levensvatbaarheid',
    story: 'Lees als één verhaal',
    loadExample: 'Laad het Spotify-voorbeeld',
    clear: 'Wis alle notities',
    print: 'Print canvas',
    blockOf: (n) => `Blok ${n} van 9`,
    blocks: 'Blokken',
    previous: 'Vorige',
    next: 'Volgende',
    askYourself: 'Vraag jezelf af',
    atSpotify: 'Bij Spotify',
    howToRead: 'Hoe lees je het canvas',
    readingCanvas: 'Het canvas lezen',
    addNote: (name) => `Notitie toevoegen aan ${name}`,
    note: 'Notitie',
    removeNote: 'Notitie verwijderen',
    intro: {
      meta: 'Begin hier',
      title: 'Waarom een canvas?',
      text: [
        'Ondernemingsplannen beslaan tientallen pagina’s en niemand leest ze nog eens terug. Alexander Osterwalder en Yves Pigneur zetten de kern op één vel in <em>Business Model Generation</em> (2010).',
        'Voor UX-designers is het een gedeelde taal. Als product owners het over “het businessdoel” hebben, laat het canvas zien waar jouw ontwerp past: welke klanten, welke waarde en welk gedrag alles draaiende houdt.',
        'De nummers volgen het canvas van links naar rechts, en dan de onderste rij. Veel teams beginnen juist bij de klanten. De volgorde maakt minder uit dan dat je elk blok invult.',
      ],
      start: 'Begin bij blok 1',
    },
    lenses: {
      desire: {
        title: 'De rechterkant gaat over wenselijkheid',
        text: ['Klanten, waarde, kanalen en relaties. Wil iemand dit eigenlijk wel?', 'Hier zit het meeste UX-onderzoek: interviews, persona’s, klantreizen.'],
      },
      feas: {
        title: 'De linkerkant gaat over haalbaarheid',
        text: ['Partners, activiteiten en middelen. Kunnen we het echt leveren?', 'De rechterkant is wat klanten zien. De linkerkant is de backstage die het mogelijk maakt.'],
      },
      viab: {
        title: 'De onderste rij gaat over levensvatbaarheid',
        text: ['Inkomsten min kosten. Kunnen we dit volhouden?', 'Een ontwerp waar gebruikers dol op zijn maar waar niemand voor betaalt, overleeft de volgende begrotingsronde niet.'],
      },
      flow: {
        title: 'Lees het als één verhaal',
        text: ['De waardepropositie bereikt klanten via kanalen en relaties, en zij betalen ervoor. Om dat te leveren zijn middelen, activiteiten en partners nodig, en die kosten geld.', 'Verander één blok en volg de lijn door de andere. Maak Premium goedkoper en je verandert de inkomsten, de deal met de labels en misschien ook de segmenten.'],
      },
    },
    tipsTitle: 'Vijf gewoontes van goede canvassen',
    tips: [
      '<strong>Eén idee per notitie.</strong> Kun je het niet los naar een ander blok verplaatsen? Splits het dan.',
      '<strong>Wees specifiek.</strong> “Iedereen” is geen klantsegment. “Studenten met een krap budget die in de trein luisteren” wel.',
      '<strong>Schrijf waarde op, geen features.</strong> “Offline afspelen” is een feature. “Muziek in het vliegtuig zonder bereik” is waarde.',
      '<strong>Geef elk segment een kleur.</strong> Gebruik per segment één notitiekleur, ook voor de bijbehorende waarde, kanalen en inkomsten. Zo zie je waar de gaten zitten.',
      '<strong>Kom erop terug.</strong> Een canvas is een hypothese, geen eindproduct. Test het en verschuif dan de notities.',
    ],
  },
};

const LANG_KEY = 'bmc-lang';
let lang = 'en';
try {
  lang = localStorage.getItem(LANG_KEY) || (navigator.language.toLowerCase().startsWith('nl') ? 'nl' : 'en');
} catch { /* storage unavailable: fall back to English */ }
if (!STRINGS[lang]) lang = 'en';

const t = (key) => STRINGS[lang][key];
const text = (id) => BLOCK_TEXT[lang][id];

// Order in which the highlight travels through the canvas in "read it as one story"
const FLOW = ['vp', 'ch', 'cr', 'cs', 'rs', 'kr', 'ka', 'kp', 'co'];

// Little rotations so the notes look stuck on by hand
const tilt = (i, j) => `${(((i * 7 + j * 13) % 9) - 4) * 0.6}deg`;

function buildCanvas(root, { clickable = false } = {}) {
  BLOCKS.forEach((b, order) => {
    const el = document.createElement(clickable ? 'button' : 'div');
    el.className = 'block';
    if (clickable) el.type = 'button';
    el.dataset.id = b.id;
    el.dataset.group = b.group;
    el.style.gridArea = b.id;
    el.style.setProperty('--order', order);
    el.style.setProperty('--flow', FLOW.indexOf(b.id));
    el.innerHTML = `<span class="block-head"><span class="num">${order + 1}</span><span class="name"></span><span class="short"></span></span><span class="notes"></span>`;
    root.appendChild(el);
  });
}

// Write the block names (and, for the example canvas, the Spotify notes) in the current language
function labelCanvas(root, { withNotes = false } = {}) {
  root.querySelectorAll('.block').forEach((el, order) => {
    const b = text(el.dataset.id);
    el.querySelector('.name').textContent = b.name;
    el.querySelector('.short').textContent = b.short;
    if (!withNotes) return;
    el.querySelector('.notes').replaceChildren(...b.notes.map((note, i) => {
      const n = document.createElement('span');
      n.className = 'note';
      n.textContent = note;
      n.style.setProperty('--i', i);
      n.style.setProperty('--r', tilt(order, i));
      return n;
    }));
  });
}

/* ---------- Explorer: click a block, read about it ---------- */

const canvas = document.getElementById('explore-canvas');
const panel = document.getElementById('panel');
const lensButtons = [...document.querySelectorAll('[data-lens-button]')];
buildCanvas(canvas, { clickable: true });
const blockEls = [...canvas.querySelectorAll('.block')];

// What the Explain panel shows, so it can be redrawn when the language changes
let explainState = { type: 'intro' };

// The fill-in animation runs once; after that, dimming and highlighting take over
setTimeout(() => canvas.classList.remove('is-loading'), 3600);

function renderPanel(html, target = panel) {
  target.innerHTML = html;
  target.classList.remove('panel-in');
  void target.offsetWidth; // restart the entrance animation
  target.classList.add('panel-in');
}

const arrow = (dir) => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="${dir === 'next' ? 'M4 10h11M11 5l5 5-5 5' : 'M16 10H5M9 5l-5 5 5 5'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Block info, shared by the Explain and Create panels. `lastButton` is extra nav for after block 9.
function renderBlockInfo(target, order, onGo, lastButton = '') {
  const b = text(BLOCKS[order].id);
  const prev = BLOCKS[order - 1] && text(BLOCKS[order - 1].id);
  const next = BLOCKS[order + 1] && text(BLOCKS[order + 1].id);
  renderPanel(`
    <div class="panel-head">
      <p class="panel-meta">${t('blockOf')(order + 1)}</p>
      <nav class="panel-arrows" aria-label="${t('blocks')}">
        <button type="button" class="arrow-button" data-dir="prev" ${prev ? `data-go="${order - 1}" aria-label="${t('previous')}: ${prev.name}"` : `disabled aria-label="${t('previous')}"`}>${arrow('prev')}</button>
        <button type="button" class="arrow-button" data-dir="next" ${next ? `data-go="${order + 1}" aria-label="${t('next')}: ${next.name}"` : `disabled aria-label="${t('next')}"`}>${arrow('next')}</button>
      </nav>
    </div>
    <h2>${b.name}</h2>
    <p class="question">${b.question}</p>
    <p>${b.text}</p>
    <h3>${t('askYourself')}</h3>
    <ul class="ask">${b.ask.map((q) => `<li>${q}</li>`).join('')}</ul>
    <h3>${t('atSpotify')}</h3>
    <ul class="example" data-group="${BLOCKS[order].group}">${b.notes.map((n, i) => `<li class="note" style="--r:${tilt(order, i)};--i:${i}">${n}</li>`).join('')}</ul>
    ${!next && lastButton ? `<nav class="panel-nav">${lastButton}</nav>` : ''}`, target);
  target.querySelectorAll('[data-go]').forEach((btn) => btn.addEventListener('click', () => {
    const { dir } = btn.dataset;
    onGo(Number(btn.dataset.go));
    // The panel was redrawn, so put focus back on the same arrow for keyboard users
    (target.querySelector(`.arrow-button[data-dir="${dir}"]:not(:disabled)`) || target.querySelector('.arrow-button:not(:disabled)'))?.focus();
  }));
}

function showIntro() {
  explainState = { type: 'intro' };
  const intro = t('intro');
  renderPanel(`
    <p class="panel-meta">${intro.meta}</p>
    <h2>${intro.title}</h2>
    ${intro.text.map((p) => `<p>${p}</p>`).join('')}
    <nav class="panel-nav"><button type="button" class="button" data-start>${intro.start}</button></nav>`);
  panel.querySelector('[data-start]').addEventListener('click', () => selectBlock(0));
}

function selectBlock(order, { scroll = true } = {}) {
  setLens(null);
  explainState = { type: 'block', order };
  canvas.dataset.selected = BLOCKS[order].id;
  blockEls.forEach((el, i) => {
    el.classList.toggle('selected', i === order);
    el.setAttribute('aria-pressed', String(i === order));
  });

  renderBlockInfo(panel, order, selectBlock, `<button type="button" class="button" data-lens-jump="desire">${t('howToRead')}</button>`);
  panel.querySelector('[data-lens-jump]')?.addEventListener('click', () => setLens('desire', true));

  // On small screens the panel sits below the canvas, so bring it into view
  if (scroll && matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearSelection() {
  delete canvas.dataset.selected;
  blockEls.forEach((el) => { el.classList.remove('selected'); el.setAttribute('aria-pressed', 'false'); });
}

function setLens(lens, render = false) {
  lensButtons.forEach((btn) => btn.setAttribute('aria-pressed', String((btn.dataset.lensButton || null) === lens)));
  delete canvas.dataset.lens;
  delete canvas.dataset.mode;
  if (!lens) return;
  if (lens === 'flow') canvas.dataset.mode = 'flow';
  else canvas.dataset.lens = lens;
  if (render) {
    clearSelection();
    explainState = { type: 'lens', lens };
    const l = t('lenses')[lens];
    renderPanel(`<p class="panel-meta">${t('readingCanvas')}</p><h2>${l.title}</h2>${l.text.map((p) => `<p>${p}</p>`).join('')}`);
  }
}

blockEls.forEach((el, order) => el.addEventListener('click', () => selectBlock(order)));

lensButtons.forEach((btn) => btn.addEventListener('click', () => {
  const lens = btn.dataset.lensButton;
  if (lens) setLens(lens, true);
  else { setLens(null); clearSelection(); showIntro(); }
}));

addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (canvas.dataset.selected || canvas.dataset.lens || canvas.dataset.mode)) {
    setLens(null); clearSelection(); showIntro();
  }
});

/* ---------- Workshop canvas ---------- */

const STORAGE_KEY = 'bmc-workshop-v1';
const workshop = document.getElementById('workshop-canvas');
buildCanvas(workshop);

workshop.querySelectorAll('.block').forEach((el) => {
  el.querySelector('.block-head').insertAdjacentHTML('afterend', '<p class="prompt"></p>');
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-note';
  add.textContent = '+';
  add.addEventListener('click', () => addNote(el, '', true));
  el.appendChild(add);
});

function labelWorkshop() {
  labelCanvas(workshop);
  workshop.querySelectorAll('.block').forEach((el) => {
    const b = text(el.dataset.id);
    el.querySelector('.prompt').textContent = b.question;
    el.querySelector('.add-note').setAttribute('aria-label', t('addNote')(b.name));
  });
  workshop.querySelectorAll('.note-text').forEach((n) => n.setAttribute('aria-label', t('note')));
  workshop.querySelectorAll('.note-remove').forEach((n) => n.setAttribute('aria-label', t('removeNote')));
}

function addNote(block, value, focus) {
  const notes = block.querySelector('.notes');
  const note = document.createElement('div');
  note.className = 'note';
  note.style.setProperty('--r', tilt(notes.children.length, block.dataset.id.charCodeAt(0)));

  const body = document.createElement('span');
  body.className = 'note-text';
  body.contentEditable = 'true';
  body.setAttribute('role', 'textbox');
  body.setAttribute('aria-label', t('note'));
  body.textContent = value;
  body.addEventListener('input', save);
  body.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); body.blur(); }
  });
  body.addEventListener('blur', () => {
    if (!body.textContent.trim()) note.remove();
    save();
  });

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'note-remove';
  remove.textContent = '×';
  remove.setAttribute('aria-label', t('removeNote'));
  remove.addEventListener('click', () => { note.remove(); save(); });

  note.append(body, remove);
  notes.appendChild(note);
  if (focus) body.focus();
}

function save() {
  const data = {};
  workshop.querySelectorAll('.block').forEach((el) => {
    data[el.dataset.id] = [...el.querySelectorAll('.note-text')].map((n) => n.textContent.trim()).filter(Boolean);
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage unavailable: notes live for this visit only */ }
}

function fill(data) {
  workshop.querySelectorAll('.block').forEach((el) => {
    el.querySelector('.notes').replaceChildren();
    (data[el.dataset.id] || []).forEach((v) => addNote(el, v, false));
  });
  save();
}

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved) fill(saved);
} catch { /* ignore unreadable storage */ }

// The Create view keeps the block info next to the canvas, following the block you work in
const workshopPanel = document.getElementById('workshop-panel');
const workshopBlocks = [...workshop.querySelectorAll('.block')];
let workshopSelected = -1;

function selectWorkshopBlock(order, { force = false } = {}) {
  if (order === workshopSelected && !force) return;
  workshopSelected = order;
  workshopBlocks.forEach((el, i) => el.classList.toggle('selected', i === order));
  renderBlockInfo(workshopPanel, order, selectWorkshopBlock);
}

workshopBlocks.forEach((el, order) => {
  el.addEventListener('click', () => selectWorkshopBlock(order));
  el.addEventListener('focusin', () => selectWorkshopBlock(order));
});

// Same highlight filters as in Explain, so you can focus on one part while writing
const workshopLensButtons = [...document.querySelectorAll('[data-workshop-lens]')];
workshopLensButtons.forEach((btn) => btn.addEventListener('click', () => {
  const lens = btn.dataset.workshopLens;
  workshopLensButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  if (lens) workshop.dataset.lens = lens;
  else delete workshop.dataset.lens;
}));

// The example is loaded in the current language
document.getElementById('load-example').addEventListener('click', () => {
  fill(Object.fromEntries(BLOCKS.map((b) => [b.id, text(b.id).notes])));
});
document.getElementById('clear-canvas').addEventListener('click', () => fill({}));
document.getElementById('print-canvas').addEventListener('click', () => print());

/* ---------- Explain / Create views ---------- */

const viewButtons = [...document.querySelectorAll('[data-view-button]')];

function showView(name) {
  viewButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.viewButton === name)));
  document.getElementById('view-explain').hidden = name !== 'explain';
  document.getElementById('view-create').hidden = name !== 'create';
}

viewButtons.forEach((btn) => btn.addEventListener('click', () => {
  const name = btn.dataset.viewButton;
  history.replaceState(null, '', name === 'create' ? '#create' : location.pathname);
  showView(name);
  scrollTo({ top: 0 });
}));

/* ---------- Language ---------- */

const langButtons = [...document.querySelectorAll('[data-lang-button]')];

// Rewrites every piece of text on the page. Notes people typed in Create are left alone.
function setLanguage(next) {
  lang = next;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* remembered for this visit only */ }
  document.documentElement.lang = lang;
  document.title = t('title');
  document.querySelector('meta[name="description"]').content = t('description');
  langButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.langButton === lang)));

  document.querySelectorAll('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.getElementById('tip-list').innerHTML = t('tips').map((tip) => `<li>${tip}</li>`).join('');

  labelCanvas(canvas, { withNotes: true });
  labelWorkshop();

  if (explainState.type === 'block') selectBlock(explainState.order, { scroll: false });
  else if (explainState.type === 'lens') setLens(explainState.lens, true);
  else showIntro();
  selectWorkshopBlock(Math.max(workshopSelected, 0), { force: true });
}

langButtons.forEach((btn) => btn.addEventListener('click', () => setLanguage(btn.dataset.langButton)));

setLens(null);
setLanguage(lang);
showView(location.hash === '#create' ? 'create' : 'explain');

/* ---------- Keyboard: left and right arrow keys step through the blocks ---------- */

addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target.isContentEditable || e.target.closest('input, textarea, select')) return; // let the cursor move while typing

  const step = e.key === 'ArrowRight' ? 1 : -1;
  const inCreate = !document.getElementById('view-create').hidden;
  const current = inCreate ? workshopSelected : BLOCKS.findIndex((b) => b.id === canvas.dataset.selected);
  // With no block selected in Explain, the right arrow starts at block 1
  const target = current === -1 ? (step === 1 ? 0 : -1) : current + step;
  if (target < 0 || target >= BLOCKS.length) return;

  e.preventDefault();
  if (inCreate) selectWorkshopBlock(target);
  else selectBlock(target, { scroll: false });
});
