(function(){
  "use strict";

  // ----- ДАННЫЕ -----
  const deptData = {
    general: {
      name: 'Общей физики', icon: 'fa-flask',
      heraldry: '📜 Герб: атом на фоне книги',
      history: 'Кафедра основана в 1921 году. Выдающиеся учёные: академик Н.Н. Боголюбов.',
      partners: 'CERN, ОИЯИ, Институт физики НАН Беларуси',
      specialties: [
        { title: 'Физика конденсированного состояния', desc: 'Изучение твёрдых тел, наноматериалов, сверхпроводимость.' },
        { title: 'Лазерная физика и оптика', desc: 'Лазерные технологии, нелинейная оптика, фотоника.' }
      ]
    },
    comp: {
      name: 'Компьютерная физика', icon: 'fa-laptop-code',
      heraldry: '💻 Герб: интегральная схема и волна',
      history: 'Создана в 2000 году для подготовки специалистов по компьютерному моделированию.',
      partners: 'Intel, NVIDIA, Институт кибернетики, EPAM',
      specialties: [
        { title: 'Вычислительная физика', desc: 'Численные методы, параллельные вычисления, моделирование.' },
        { title: 'Искусственный интеллект в физике', desc: 'Нейросети, машинное обучение для анализа данных.' }
      ]
    },
    math: {
      name: 'Математическая физика', icon: 'fa-square-root-alt',
      heraldry: '📐 Герб: уравнение Шрёдингера и сфера',
      history: 'Основана в 1965 году. Развитие методов матфизики, квантовой теории поля.',
      partners: 'МИАН, Институт математики НАН, ОИЯИ',
      specialties: [
        { title: 'Теоретическая и математическая физика', desc: 'Квантовая теория поля, группы Ли, интегрируемые системы.' }
      ]
    },
    bio: {
      name: 'Биофизика', icon: 'fa-dna',
      heraldry: '🧬 Герб: спираль ДНК и клетка',
      history: 'Кафедра биофизики с 1978 года, лидер в медицинской физике и биоинформатике.',
      partners: 'Институт биофизики клетки, Медицинский университет, Helmholtz Zentrum',
      specialties: [
        { title: 'Молекулярная биофизика', desc: 'Структура и динамика биомолекул, мембран.' },
        { title: 'Медицинская физика', desc: 'Лучевая терапия, МРТ, ядерная медицина.' }
      ]
    }
  };
  const scheduleMock = {
    '-1': [{time:'9:00', name:'Физика твёрдого тела', place:'ауд. 312'}],
    '0': [{time:'9:00', name:'Квантовая механика', place:'ауд. 410'},{time:'12:00', name:'Лабораторная работа', place:'лаб. 108'},{time:'14:30', name:'Английский язык', place:'ауд. 221'}],
    '1': [{time:'10:15', name:'Электродинамика', place:'ауд. 322'},{time:'13:00', name:'Спецсеминар', place:'конф. зал'}]
  };
  const testBank = {
    quant: { title:'Квантовая механика', questions:[
      {q:'Чему равна приведённая постоянная Планка?', options:['ħ ≈ 1.05·10⁻³⁴ Дж·с','ħ ≈ 6.63·10⁻³⁴ Дж·с','ħ ≈ 9.1·10⁻³¹ кг'], correct:0},
      {q:'Уравнение Шрёдингера описывает:', options:['эволюцию волновой функции','движение планет','закон Кулона'], correct:0},
      {q:'Какая частица описывается принципом неопределённости?', options:['Любая квантовая','Только электрон','Только фотон'], correct:0}
    ]},
    electro: { title:'Электродинамика', questions:[
      {q:'Закон Гаусса для электрического поля:', options:['∮E·dS = Q/ε₀','∮B·dS = 0','∮E·dl = -dΦ/dt'], correct:0},
      {q:'Уравнения Максвелла описывают:', options:['Электромагнитное поле','Гравитацию','Сильное взаимодействие'], correct:0}
    ]},
    mathphys: { title:'Методы мат. физики', questions:[
      {q:'Оператор Лапласа в сферических координатах содержит:', options:['1/r² ∂/∂r (r² ∂/∂r)','∂²/∂x²','∂/∂t'], correct:0},
      {q:'Функция Грина используется для:', options:['Решения диф. уравнений','Интегрирования','Аппроксимации'], correct:0}
    ]}
  };

  // Состояние
  let currentDate = new Date();
  let gradesChartInstance = null;
  let currentTest = null, userAnswers = [];
  const themeLabel = document.getElementById('themeLabel');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileToggle = document.getElementById('mobileMenuToggle');

  // Утилиты
  function isMobile() { return window.innerWidth <= 650; }
  function formatDate(d) { return d.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'}).replace(/^./,c=>c.toUpperCase()); }

  // Расписание
  function renderSchedule(offset=0) {
    const key = offset.toString();
    const lessons = scheduleMock[key] || [{time:'—', name:'Нет занятий', place:''}];
    document.getElementById('scheduleList').innerHTML = lessons.map(l=>`<div class="lesson-item"><div class="lesson-time">${l.time}</div><div><div class="lesson-name">${l.name}</div><div class="lesson-place">${l.place}</div></div></div>`).join('');
    const newDate = new Date(currentDate); newDate.setDate(currentDate.getDate()+offset);
    document.getElementById('currentDateDisplay').textContent = formatDate(newDate);
  }
  function updateDate(delta) { currentDate.setDate(currentDate.getDate()+delta); renderSchedule(0); }

  // Модалки с анимацией
  window.closeModal = function(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(() => {
      if (!overlay.classList.contains('active')) overlay.style.display = 'none';
    }, 200);
  };
  function openModal(id) {
    const overlay = document.getElementById(id);
    overlay.style.display = 'flex';
    overlay.offsetHeight; // reflow
    overlay.classList.add('active');
  }

  // Кафедры
  function showDept(key) {
    const d = deptData[key]; if(!d) return;
    document.getElementById('deptModalTitle').textContent = `Кафедра ${d.name}`;
    document.getElementById('deptHeraldry').innerHTML = `<i class="fas ${d.icon}"></i><span style="font-size:18px;">${d.heraldry}</span>`;
    document.getElementById('deptHistory').innerHTML = `<strong style="font-size:16px;">📖 История:</strong><br>${d.history}`;
    document.getElementById('deptPartners').innerHTML = `<strong>🤝 Партнёры:</strong> ${d.partners}`;
    const cont = document.getElementById('specialtyContainer');
    cont.innerHTML = d.specialties.map((s,i)=>`<div class="specialty-btn" data-idx="${i}">🔬 ${s.title}</div>`).join('');
    document.querySelectorAll('.specialty-btn').forEach(b=>b.addEventListener('click',()=>{
      const spec = d.specialties[b.dataset.idx];
      document.getElementById('specialtyDetailPanel').innerHTML = `<strong style="font-size:18px;">${spec.title}</strong><p style="margin-top:12px;">${spec.desc}</p>`;
      document.getElementById('specialtyDetailPanel').style.display='block';
    }));
    openModal('deptModal');
  }

  // Деканат
  function buildDean() {
    const cont = document.getElementById('yearCardsContainer'); cont.innerHTML = '';
    const info = {1:'Общая физика, матанализ, линейная алгебра. Кураторский час — вторник.',2:'Теоретическая механика, электричество, диффуры.',3:'Квантовая механика, электродинамика, методы матфизики.',4:'Спецкурсы кафедр, научная работа, педагогическая практика.',5:'Дипломное проектирование, госэкзамены, предзащита.'};
    for(let i=1;i<=5;i++) {
      const card = document.createElement('div'); card.className='year-card';
      card.innerHTML = `<strong>${i} курс</strong><br><small>Нажмите для информации</small>`;
      card.onclick=()=>{ document.getElementById('deanInfoContent').innerHTML = `<strong style="font-size:20px;">${i} курс</strong><p style="margin-top:12px;">${info[i]}</p>`; };
      cont.appendChild(card);
    }
  }

  // Тесты
  window.resetTestMode = ()=>{
    document.getElementById('testListContainer').style.display='block';
    document.getElementById('quizContainer').style.display='none';
    document.getElementById('testModalTitle').innerHTML = '<i class="fas fa-pencil-alt"></i> Тесты и контрольные';
    currentTest=null;
  };
  function startTest(id) {
    const t = testBank[id]; if(!t) return;
    currentTest=t; userAnswers=Array(t.questions.length).fill(-1);
    document.getElementById('testListContainer').style.display='none';
    document.getElementById('testModalTitle').innerHTML = `<i class="fas fa-pencil-alt"></i> ${t.title}`;
    const quiz = document.getElementById('quizContainer'); quiz.style.display='block';
    quiz.innerHTML = t.questions.map((q,i)=>`
      <div style="margin-bottom:20px;"><strong>${i+1}. ${q.q}</strong>
      ${q.options.map((opt,oi)=>`<div class="quiz-option" data-q="${i}" data-opt="${oi}">${opt}</div>`).join('')}
      </div>
    `).join('') + '<button class="btn-primary" id="submitTestBtn">✅ Завершить тест</button>';
    document.querySelectorAll('.quiz-option').forEach(el=>el.addEventListener('click',e=>{
      userAnswers[el.dataset.q] = parseInt(el.dataset.opt);
      document.querySelectorAll(`.quiz-option[data-q="${el.dataset.q}"]`).forEach(o=>o.classList.remove('selected'));
      el.classList.add('selected');
    }));
    document.getElementById('submitTestBtn').onclick=()=>{
      let correct=0; t.questions.forEach((q,i)=> { if(userAnswers[i]===q.correct) correct++; });
      alert(`Результат: ${correct} из ${t.questions.length} правильных.`);
    };
  }

  // График
  function renderChart() {
    const canvas = document.getElementById('gradesChart'); if(!canvas) return;
    if(gradesChartInstance) gradesChartInstance.destroy();
    const isDark = document.body.classList.contains('dark');
    const mobile = isMobile();
    const labels = mobile ? ['Квант', 'Электр', 'Матфиз', 'Общ.физ', 'Числ.мет'] : ['Квант. мех.', 'Электродин.', 'Мат. физика', 'Общая физика', 'Числ. методы'];
    gradesChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Средний балл', data: [8.5, 7.8, 9.2, 8.0, 9.5], backgroundColor: '#003d7c', borderRadius: mobile ? 6 : 10, barPercentage: mobile ? 0.8 : 0.7 }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { labels: { color: isDark ? '#eef3fc' : '#0a1e3c', font: { size: mobile ? 12 : 14 } } } },
        scales: {
          y: { beginAtZero: true, max: 10, grid: { color: isDark ? '#2e425b' : '#d9e2ef' }, ticks: { color: isDark ? '#eef3fc' : '#0a1e3c', font: { size: mobile ? 10 : 12 } } },
          x: { ticks: { color: isDark ? '#eef3fc' : '#0a1e3c', font: { size: mobile ? 10 : 12 }, maxRotation: mobile ? 45 : 0, minRotation: mobile ? 45 : 0 } }
        }
      }
    });
  }

  // Тема
  const themeToggle = document.getElementById('themeToggle');
  function updateThemeLabel(isDark) { themeLabel.innerHTML = isDark ? '<i class="fas fa-sun"></i> Светлая тема' : '<i class="fas fa-moon"></i> Тёмная тема'; }
  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark?'dark':'light');
    updateThemeLabel(dark);
    if (gradesChartInstance) renderChart();
  }
  const saved = localStorage.getItem('theme');
  const isDark = saved === 'dark';
  themeToggle.checked = isDark;
  applyTheme(isDark);
  themeToggle.addEventListener('change', e => applyTheme(e.target.checked));
  window.addEventListener('resize', () => { if (gradesChartInstance) renderChart(); });

  // Вход
  function login() {
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('portalWrapper').classList.add('visible');
    renderSchedule(0);
    setTimeout(renderChart, 60);
  }

  // Мобильное меню с анимацией
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    setTimeout(() => { if (!mobileMenu.classList.contains('active')) mobileMenu.style.display = 'none'; }, 200);
  }
  mobileToggle.addEventListener('click', (e) => { 
    e.stopPropagation();
    if (mobileMenu.classList.contains('active')) closeMobileMenu();
    else { mobileMenu.style.display = 'flex'; mobileMenu.offsetHeight; mobileMenu.classList.add('active'); }
  });
  document.addEventListener('click', (e) => { if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target) && mobileMenu.classList.contains('active')) closeMobileMenu(); });

  // Обработчики мобильных кнопок
  document.querySelectorAll('.mobile-nav').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      closeMobileMenu();
      if (action === 'account') openModal('accountModal');
      else if (action === 'tests') { resetTestMode(); openModal('testsModal'); }
      else if (action === 'dean') { buildDean(); openModal('deanModal'); }
    });
  });

  // Десктопные кнопки
  document.getElementById('accountBtn').addEventListener('click', ()=> openModal('accountModal'));
  document.getElementById('testsBtn').addEventListener('click', ()=>{ resetTestMode(); openModal('testsModal'); });
  document.getElementById('deanInfoBtn').addEventListener('click', ()=>{ buildDean(); openModal('deanModal'); });

  // Остальное
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('googleLoginBtn').addEventListener('click', login);
  document.getElementById('prevDayBtn').addEventListener('click', ()=>updateDate(-1));
  document.getElementById('nextDayBtn').addEventListener('click', ()=>updateDate(1));
  document.querySelectorAll('.dep-item').forEach(el=>el.addEventListener('click', ()=>showDept(el.dataset.dept)));
  document.querySelectorAll('.test-list-item').forEach(el=>el.addEventListener('click', ()=>startTest(el.dataset.test)));
  document.getElementById('saveProfileBtn').addEventListener('click', ()=>alert('✅ Настройки профиля сохранены'));
  document.querySelectorAll('.modal-overlay').forEach(ov=>ov.addEventListener('click', e=>{ if(e.target===ov) closeModal(ov.id); }));
  renderSchedule(0);
})();