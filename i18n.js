// ============================================================
//  i18n.js — Sistema de traducciones / Translation system
//  Sitio web: GAUF Mentor & Speaker
//
//  Para editar las traducciones, buscá las secciones marcadas
//  con "✏️ EDITABLE" abajo. Cada clave tiene su versión en
//  español (es) e inglés (en) lado a lado.
//
//  To edit translations, look for sections marked "✏️ EDITABLE"
//  below. Each key has its Spanish (es) and English (en)
//  versions side by side.
// ============================================================

// ------------------------------------------------------------
//  ✏️ EDITABLE — TODAS LAS TRADUCCIONES / ALL TRANSLATIONS
// ------------------------------------------------------------
const TRANSLATIONS = {

  es: {

    // ✏️ TÍTULO DE PÁGINA / PAGE TITLE
    'page.title': 'GAUF · Mentor y Speaker',

    // ✏️ NAVEGACIÓN / NAVIGATION
    'nav.tagline':      'mentor y speaker con liderazgo humano',
    'nav.dolores':      '¿Te suena?',
    'nav.quien':        'Sobre mí',
    'nav.servicios':    'Servicios',
    'nav.proyectos':    'Proyectos',
    'nav.testimonios':  'Opiniones',
    'nav.valores':      'Valores',
    'nav.cta':          'Hablemos',
    'nav.back-top':     'Volver arriba',

    // ✏️ HERO
    'hero.title': 'Te acompaño a liderar<br>con más <em>claridad</em> y<br><em>humanidad</em>',
    'hero.sub1':  'Mentorías y charlas para equipos que buscan<br><strong>decidir mejor, construir</strong> y avanzar con propósito.',
    'hero.sub2':  'Trabajo con equipos, empresas y<br>programas de formación en LATAM.',
    'hero.cta':   'Agenda conmigo →',
    'hero.note':  'Primera conversación sin costo',

    // ✏️ MARQUEE DE SERVICIOS (barra superior animada)
    'marquee.mentoria':       'Mentoría 1:1',
    'marquee.charlas':        'Charlas & Conferencias',
    'marquee.liderazgo':      'Liderazgo',
    'marquee.comunicacion':   'Comunicación',
    'marquee.impro':          'Improvisación aplicada',
    'marquee.marca':          'Marca personal',
    'marquee.emprendimiento': 'Emprendimiento creativo',

    // ✏️ SECCIÓN DOLORES / PAIN POINTS SECTION
    'dolores.label': '¿Te suena algo de esto?',
    'dolores.01': 'Todos metidos en el proyecto como yo, no tengo con quién pensar a largo plazo.',
    'dolores.02': 'Sé lo que hago, pero no sé cómo comunicarlo para que llegue a quien tiene que llegar.',
    'dolores.03': 'El equipo no está alineado y no sé por dónde empezar a ordenarlo.',
    'dolores.04': 'Estoy metido en el día a día y no encuentro el momento para parar y pensar para dónde va esto.',
    'dolores.05': 'Siento que el proyecto da para mucho más, algo lo está trabando.',
    'dolores.06': 'Necesito a alguien que me haga las preguntas que nadie desde adentro puede hacerme.',

    // ✏️ SECCIÓN SOBRE MÍ / ABOUT ME SECTION
    'quien.label':   'Sobre mí',
    'quien.body1':   'Dirijo la agencia creativa <a href="https://5seis.com" target="_blank">5SEIS</a> y hace años que acompaño proyectos propios y ajenos para que tomen alto vuelo.',
    'quien.body2':   'Doy charlas sobre liderazgo, emprendimiento e improvisación aplicada al trabajo en equipo. Participo como mentor y speaker en eventos de industria, universidades, hackathones y programas formativos.',
    'quien.body3':   'Creo en los proyectos que nacen desde una búsqueda genuina y en las conversaciones que abren nuevas posibilidades. Mi trabajo consiste en escuchar, detectar patrones y ayudar a transformar intuiciones en decisiones concretas y sostenibles.',
    'quien.tagline': 'Aporto una mirada estratégica, <a href="https://gaufgang.com/preguntas">preguntas</a> valiosas y foco a largo plazo.',

    // ✏️ SECCIÓN SERVICIOS / SERVICES SECTION
    'servicios.label':       'Servicios',
    'servicios.card1.title': 'Mentoría para líderes y personas en momentos de decisión',
    'servicios.card1.body':  'Espacio para ordenar ideas, tomar decisiones con más claridad y mejorar cómo lideras, trabajas y acompañas a otros.',
    'servicios.card1.sub':   '· Plan anual · Encuentros periódicos<br>· Plan trimestral · 2 encuentros por mes<br>· Plan estratégico · Coaching esporádico',
    'servicios.card1.cta':   'Conversemos tu próximo paso →',
    'servicios.card2.title': 'Charlas & conferencias',
    'servicios.card2.body':  'Dos formatos pensados para equipos, universidades y programas de emprendedores.',
    'servicios.card2.sub':   '· <strong>Liderazgo y emprendimiento</strong> — Casos reales de error y aprendizaje en proyectos creativos.<br><br>· <strong>Impro aplicada al trabajo</strong> — Herramientas de improvisación para comunicación y toma de decisiones. <strong>Con <a href="https://docs.google.com/presentation/d/1JK7U9H6azAvt2NnKXozJtR1rJLz7ZCk0dZasKsct0xY/present" target="_blank">La Chispa Escuela de Impro</a>.</strong>',
    'servicios.card2.cta':   'Diseñemos la experiencia →',

	// ✏️ SECCIÓN BUEN MOMENTO
    'buenmomento.label': 'Es buen momento para conversar si...',
    'buenmomento.01': 'Estás en momentos de cambio y querés más perspectiva.',
    'buenmomento.02': 'Sentís que necesitás pensar antes de seguir haciendo.',
    'buenmomento.03': 'Hay una decisión importante que merece algo más que una respuesta rápida.',
    'buenmomento.04': 'Disfrutás las conversaciones honestas y las preguntas que invitan a mirar distinto.',
    
    // ✏️ SECCIÓN PARA ESTAR EN SINTONÍA
    'sintonia.label': 'Para estar en sintonía',
    'sintonia.01': 'Cada proceso es único. Lo construimos juntos.',
    'sintonia.02': 'Las personas están antes que los problemas.',
    'sintonia.03': 'Las decisiones siempre son tuyas.',
    'sintonia.04': 'Respeto tu forma de pensar y me gusta desafiarla con buenas preguntas.',
    'sintonia.05': 'Buscamos conversaciones profundas que generen claridad y acción.',
    'sintonia.06': 'Trabajamos con honestidad, curiosidad y apertura.',

    // ✏️ SECCIÓN PROYECTOS / PROJECTS SECTION
    'proyectos.label': 'Proyectos',
    'proyectos.title': 'Algunos proyectos que acompaño',
    'proyectos.easy-lunch.tooltip':     'Mentoría · Animación de venta',
    'proyectos.maldo.tooltip':          'Mentoría · UX research · Rebranding',
    'proyectos.chispa.tooltip':         'Mentoría · Reestructuración · Charlas',
    'proyectos.altamirano.tooltip':     'Mentoría · Website',
    'proyectos.mika.tooltip':           'Mentoría · Website',
    'proyectos.soriano.tooltip':        'Mentoría · Website',
    'proyectos.jesi.tooltip':           'Mentoría · Branding · Website',
    'proyectos.founder-school.tooltip': 'Mentoría · Charlas por cohort',
    'proyectos.marini.tooltip':         'Mentoría · Diseño · Website',
    'proyectos.eth-uy.tooltip':         'Mentoría · Workshop',
    'proyectos.eth-ar.tooltip':         'Mentoría · Workshop',
    'proyectos.fork.tooltip':           'Mentoría · Diseño · Website',
    'proyectos.defi.tooltip':           'Colaboración · Diseño',
    'proyectos.solow.tooltip':          'Mentoría · Diseño · Charlas',
    'proyectos.palermo.tooltip':         'Charlas',
    'proyectos.uade.tooltip':            'Jurado de tesis',

    // ✏️ SECCIÓN TESTIMONIOS / TESTIMONIALS SECTION
    'testimonios.title': 'Opiniones valiosas',
    'testimonios.tag':   'opinión',

    // ✏️ SECCIÓN VALORES / VALUES SECTION
    'valores.label':   'Cómo trabajo y qué me mueve',
    'valores.1.title': 'Claridad para decidir',
    'valores.1.body':  'Ayudo a tomar mejores decisiones con preguntas que buscan expandir el conocimiento, ordenar las ideas, detectar oportunidades y generar mayor claridad al momento de decidir.',
    'valores.2.title': 'Visión en acción',
    'valores.2.body':  'Trabajo junto a founders, líderes y equipos creativos para transformar visión en acción concreta, fortaleciendo proyectos, vínculos y formas de comunicar.',
    'valores.3.title': 'Acompañamiento estratégico',
    'valores.3.body':  'Busco acompañar procesos de crecimiento profesional y humano desde una mirada estratégica, práctica y cercana, integrando liderazgo, comunicación, validación de ideas y autoconocimiento.',
    'valores.4.title': 'Preguntas antes que respuestas',
    'valores.4.body':  'Las preguntas correctas abren más caminos que cualquier fórmula. Busco hacer las consultas que desde adentro nadie está realizando.',
    'valores.5.title': 'Alegría y compromiso',
    'valores.5.body':  'Disfruto haciendo, el proceso es tan o más importante que el resultado. Trabajo con transparencia, hablando desde el corazón.',
    'valores.6.title': 'Adaptabilidad',
    'valores.6.body':  'Cada proyecto es distinto, me adapto a las necesidades de cada uno y cada momento, con creatividad y propósito.',

    // ✏️ SECCIÓN CÓMO TRABAJAMOS / PROCESS SECTION
    'proceso.label':   'Cómo trabajamos',
    'proceso.1.title': 'Nos conocemos',
    'proceso.1.body':  'Tenemos una primera conversación para entender tu momento, tus desafíos y descubrir si realmente puedo aportarte valor.',
    'proceso.2.title': 'Definimos el foco',
    'proceso.2.body':  'Diseñamos juntos un proceso acorde a tu contexto, tus objetivos y el momento que estás atravesando.',
    'proceso.3.title': 'Empezamos el recorrido',
    'proceso.3.body':  'Cada encuentro busca abrir nuevas perspectivas, generar conversaciones profundas y transformar esas reflexiones en decisiones y acciones concretas. El camino se ajusta a medida que avanzamos.',

    // ✏️ SECCIÓN FAQ
    'faq.label': 'Preguntas frecuentes',
    'faq.q1': '¿Cómo es la primera reunión?',
    'faq.a1': 'Es una conversación sin costo para conocernos, entender tu contexto y evaluar juntos si este espacio puede ser valioso para vos.',
    'faq.q2': '¿Las mentorías son individuales o grupales?',
    'faq.a2': 'Trabajo tanto con personas como con equipos. El formato depende de los objetivos y del tipo de desafío.',
    'faq.q3': '¿Cuánto dura el acompañamiento?',
    'faq.a3': 'No trabajo con procesos idénticos. La duración se define según el momento y las necesidades de cada persona u organización.',
    'faq.q4': '¿Qué pasa si siento que no es lo que esperaba?',
    'faq.a4': 'Lo conversamos con total honestidad. Si creo que otro enfoque o profesional puede ayudarte más, también te lo voy a decir.',

    // ✏️ SECCIÓN CONTACTO / CONTACT SECTION
    'contacto.title':    '¿Te acompaño?',
    'contacto.sub':      'Charlemos unos minutos sin compromiso.',
    'contacto.cta':      'Agendá una llamada ↗',
    'contacto.fallback': '¿Preferís escribirme? <a href="mailto:hablemos@gaufgang.com">hablemos@gaufgang.com</a>',

    // ✏️ MARQUEE DE HOBBIES (barra inferior animada)
    'hobby.basket':      'Basket',
    'hobby.guitarra':    'Guitarra',
    'hobby.cine':        'Cine',
    'hobby.teatro':      'Teatro',
    'hobby.impro':       'Impro',
    'hobby.clown':       'Clown',
    'hobby.yoga':        'Yoga',
    'hobby.jardineria':  'Jardinería',
    'hobby.compostaje':  'Compostaje',
    'hobby.cocina':      'Cocina',
    'hobby.bici':        'Bici',
    'hobby.viajes':      'Viajes',
    'hobby.lectura':     'Lectura',
    'hobby.reciclaje':   'Reciclaje',
    'hobby.hongos':      'Hongos',
    'hobby.tantra':      'Tantra',
    'hobby.familia':     'Familia',
  },

  en: {

    // ✏️ TÍTULO DE PÁGINA / PAGE TITLE
    'page.title': 'GAUF · Mentor & Speaker',

    // ✏️ NAVEGACIÓN / NAVIGATION
    'nav.tagline':      'mentor & speaker for thoughtful leadership',
    'nav.dolores':      'Sounds familiar?',
    'nav.quien':        'About me',
    'nav.servicios':    'Services',
    'nav.proyectos':    'Projects',
    'nav.testimonios':  'Testimonials',
    'nav.valores':      'Values',
    'nav.cta':          "Let's talk",
    'nav.back-top':     'Back to top',

    // ✏️ HERO
    'hero.title': 'Helping leaders make thoughtful decisions<br>with more <em>clarity</em> and<br><em>humanity</em>',
    'hero.sub1': 'Mentoring and talks for people and teams looking to<br><strong>make better decisions, build meaningful projects</strong> and move forward with purpose.',
    'hero.sub2': 'I work with companies, founders, universities and<br>innovation programs across Latin America.',
    'hero.cta':   'Book a conversation →',
    'hero.note': 'First conversation at no cost',

    // ✏️ MARQUEE DE SERVICIOS (barra superior animada)
    'marquee.mentoria':       '1:1 Mentoring',
    'marquee.charlas':        'Talks & Conferences',
    'marquee.liderazgo':      'Leadership',
    'marquee.comunicacion':   'Communication',
    'marquee.impro':          'Applied Improvisation',
    'marquee.marca':          'Personal Brand',
    'marquee.emprendimiento': 'Creative Entrepreneurship',

    // ✏️ SECCIÓN DOLORES / PAIN POINTS SECTION
    'dolores.label': 'Does any of this sound familiar?',
    'dolores.01': "Everyone's so deep into the project that I have no one to think long-term with.",
    'dolores.02': "I know what I do, but I don't know how to communicate it so it reaches the right people.",
    'dolores.03': "The team feels disconnected and I don't know where to start.",
    'dolores.04': "I'm caught up in the day-to-day work and can't find time to stop and think about where this is heading.",
    'dolores.05': 'I feel the project has so much more potential — something is holding it back.',
    'dolores.06': 'I need someone who can ask the questions no one inside the project is asking.',

    // ✏️ SECCIÓN SOBRE MÍ / ABOUT ME SECTION
    'quien.label':   'About me',
    'quien.body1': 'I lead the creative agency <a href="https://5seis.com" target="_blank">5SEIS</a> and have spent years supporting founders, teams and creative projects as they grow.',
    'quien.body2': 'I speak about leadership, entrepreneurship and applied improvisation. I also mentor founders, leaders and teams through industry events, universities, hackathons and innovation programs.',
    'quien.body3': 'I believe in projects driven by genuine curiosity and in conversations that open new possibilities. My role is to listen carefully, recognize patterns and help transform intuition into thoughtful, sustainable decisions.',
    'quien.tagline': 'I bring strategic perspective, meaningful questions and a long-term view.',

    // ✏️ SECCIÓN SERVICIOS / SERVICES SECTION
    'servicios.label':       'Services',
    'servicios.card1.title': 'Mentoring for leaders and people navigating important decisions',
    'servicios.card1.body': 'A space to organize ideas, gain perspective and make thoughtful decisions about your work, leadership and future.',
    'servicios.card1.sub': 'Annual partnership · Ongoing mentoring<br>Quarterly program · Two sessions per month<br>Strategic sessions · On-demand mentoring',
    'servicios.card1.cta': "Let's talk about your next step →",
    'servicios.card2.title': 'Talks & Workshops',
    'servicios.card2.body': 'Two formats designed for companies, universities and entrepreneurship programs.',
    'servicios.card2.sub':   '· <strong>Leadership & entrepreneurship</strong> — Real cases of failure and learning in creative projects.<br><br>· <strong>Improv applied to work</strong> — Improvisation tools for communication and decision-making. <strong>With <a href="https://docs.google.com/presentation/d/1JK7U9H6azAvt2NnKXozJtR1rJLz7ZCk0dZasKsct0xY/present" target="_blank">La Chispa Escuela de Impro</a>.</strong>',
    'servicios.card2.cta':   "Let's design the experience →",

// buen momento
'buenmomento.title': 'It might be a good time for a conversation if...',
'buenmomento.1': 'You’re going through a period of change and looking for perspective.',
'buenmomento.2': 'You feel the need to pause before simply doing more.',
'buenmomento.3': 'An important decision deserves more than a quick answer.',
'buenmomento.4': 'You value honest conversations and thoughtful questions.',
'buenmomento.5': 'You’re open to challenging assumptions and exploring new possibilities.',

    // ✏️ SECCIÓN PARA ESTAR EN SINTONÍA / IN TUNE SECTION
    'sintonia.label': 'To be in tune',
    'sintonia.01': 'Every process is unique. We build it together.',
    'sintonia.02': 'People come before problems.',
    'sintonia.03': 'The decisions are always yours.',
    'sintonia.04': 'I respect the way you think, and I like challenging it with good questions.',
    'sintonia.05': 'We look for deep conversations that generate clarity and action.',
    'sintonia.06': 'We work with honesty, curiosity and openness.',

    // ✏️ SECCIÓN PROYECTOS / PROJECTS SECTION
    'proyectos.label': 'Projects',
    'proyectos.title': 'Some of the projects I support',
    'proyectos.easy-lunch.tooltip':     'Mentoring · Sales pitch',
    'proyectos.maldo.tooltip':          'Mentoring · UX research · Rebranding',
    'proyectos.chispa.tooltip':         'Mentoring · Restructuring · Talks',
    'proyectos.altamirano.tooltip':     'Mentoring · Website',
    'proyectos.mika.tooltip':           'Mentoring · Website',
    'proyectos.soriano.tooltip':        'Mentoring · Website',
    'proyectos.jesi.tooltip':           'Mentoring · Branding · Website',
    'proyectos.founder-school.tooltip': 'Mentoring · Cohort talks',
    'proyectos.marini.tooltip':         'Mentoring · Design · Website',
    'proyectos.eth-uy.tooltip':         'Mentoring · Workshop',
    'proyectos.eth-ar.tooltip':         'Mentoring · Workshop',
    'proyectos.fork.tooltip':           'Mentoring · Design · Website',
    'proyectos.defi.tooltip':           'Collaboration · Design',
    'proyectos.solow.tooltip':          'Mentoring · Design · Talks',
    'proyectos.palermo.tooltip':         'Talks',
    'proyectos.uade.tooltip':            'Thesis jury',

    // ✏️ SECCIÓN TESTIMONIOS / TESTIMONIALS SECTION
    'testimonios.title': 'Kind words',
    'testimonios.tag':   'review',

    // ✏️ SECCIÓN VALORES / VALUES SECTION
    'valores.label':   'How I work and what drives me',
    'valores.1.title': 'Clarity to decide',
    'valores.1.body':  'I help make better decisions with questions that seek to expand knowledge, organize ideas, detect opportunities and generate greater clarity when making decisions.',
    'valores.2.title': 'Vision into action',
    'valores.2.body':  'I work alongside founders, leaders and creative teams to transform vision into concrete action, strengthening projects, relationships and ways of communicating.',
    'valores.3.title': 'Strategic support',
    'valores.3.body':  'I seek to support professional and human growth processes from a strategic, practical and close perspective, integrating leadership, communication, idea validation and self-awareness.',
    'valores.4.title': 'Questions before answers',
    'valores.4.body':  'The right questions open more paths than any formula. I aim to ask the questions no one on the inside is asking.',
    'valores.5.title': 'Joy and commitment',
    'valores.5.body':  'I enjoy doing — the process is as or more important than the result. I work with honesty and genuine care.',
    'valores.6.title': 'Adaptability',
    'valores.6.body':  'Every project is different; I adapt to the needs of each one and each moment, with creativity and purpose.',

    // ✏️ SECCIÓN HOW WE WORK / PROCESS SECTION
    'proceso.label':   'How we work',
    'proceso.1.title': "Let's meet",
    'proceso.1.body': 'We start with a conversation to understand your context, goals and whether this is the right fit.',
    'proceso.2.title': 'Define the focus',
    'proceso.2.body': 'Together we shape the process around your needs and priorities.',
    'proceso.3.title': "Let's begin",
    'proceso.3.body': 'We meet, reflect, experiment and adjust the path as we move forward.',

    // ✏️ SECCIÓN FAQ
    'faq.label': 'Frequently asked questions',
    'faq.q1': 'What is the first meeting like?',
    'faq.a1': 'It is a free introductory conversation where we get to know each other and decide together how to move forward.',
    'faq.q2': 'Are the mentoring sessions individual or for teams?',
    'faq.a2': 'Both. I work with individuals, leadership teams and organizations.',
    'faq.q3': 'How long does the mentoring process last?',
    'faq.a3': 'There is no fixed duration. Each process is designed around the goals, context and pace of the people involved.',
    'faq.q4': "What if it's not what I expected?",
    'faq.a4': "We'll talk about it openly. If I believe another approach or professional would be a better fit, I'll tell you honestly.",

    // ✏️ SECCIÓN CONTACTO / CONTACT SECTION
    'contacto.title': 'Shall we talk?',
    'contacto.sub': "Let's have a conversation. No pressure.",
    'contacto.cta':      'Book a conversation ↗',
    'contacto.fallback': 'Prefer to write first? <a href="mailto:hablemos@gaufgang.com">hablemos@gaufgang.com</a>',

    // ✏️ MARQUEE DE HOBBIES (barra inferior animada)
    'hobby.basket':      'Basketball',
    'hobby.guitarra':    'Guitar',
    'hobby.cine':        'Cinema',
    'hobby.teatro':      'Theatre',
    'hobby.impro':       'Improv',
    'hobby.clown':       'Clown',
    'hobby.yoga':        'Yoga',
    'hobby.jardineria':  'Gardening',
    'hobby.compostaje':  'Composting',
    'hobby.cocina':      'Cooking',
    'hobby.bici':        'Cycling',
    'hobby.viajes':      'Travel',
    'hobby.lectura':     'Reading',
    'hobby.reciclaje':   'Recycling',
    'hobby.hongos':      'Fungi',
    'hobby.tantra':      'Tantra',
    'hobby.familia':     'Family',
  }
};

// ============================================================
//  LÓGICA DE DETECCIÓN E INICIALIZACIÓN
//  No es necesario editar nada debajo de esta línea
// ============================================================

/** Detecta el idioma a usar: URL param → navegador → fallback ES */
function detectLang() {
  // 1. Parámetro en URL: ?lang=en  o  ?lang=es
  const urlParam = new URLSearchParams(window.location.search).get('lang');
  if (urlParam === 'en' || urlParam === 'es') return urlParam;

  // 2. Idioma del navegador
  const browserLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
  if (browserLang.startsWith('en')) return 'en';

  // 3. Fallback
  return 'es';
}

/** Aplica las traducciones al DOM */
function applyTranslations(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;

  // Actualiza atributo lang del HTML
  document.documentElement.lang = lang;

  // Actualiza título de la pestaña
  if (t['page.title']) document.title = t['page.title'];

  // Elementos con texto plano: data-i18n="clave"
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Elementos con HTML interno: data-i18n-html="clave"
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Atributo aria-label: data-i18n-aria="clave"
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
  });

  // Marca el botón activo en ambos switchers (nav + mobile)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/** Cambia el idioma, actualiza la URL y re-renderiza los testimonios */
window.setLang = function(lang) {
  window.currentLang = lang;

  // Actualiza ?lang= en la URL sin recargar la página
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url.toString());

  applyTranslations(lang);

  // Re-renderiza testimonios si el módulo ya está cargado
  if (typeof window.renderTestimonios === 'function') {
    window.renderTestimonios(lang);
  }
};

// ------------------------------------------------------------
//  Inicialización
// ------------------------------------------------------------
window.currentLang = detectLang();

// Ejecuta cuando el DOM esté listo
(function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
})(function() {
  applyTranslations(window.currentLang);
});
