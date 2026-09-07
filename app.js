/* ---------- Storage helpers ---------- */
const store = {
  get(key, fallback){
    try{
      const v = localStorage.getItem('compass_' + key);
      return v ? JSON.parse(v) : fallback;
    }catch(e){ return fallback; }
  },
  set(key, value){
    localStorage.setItem('compass_' + key, JSON.stringify(value));
  }
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);

const todayKey = () => new Date().toISOString().slice(0,10);
const weekKey = () => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  return monday.toISOString().slice(0,10);
};

/* ---------- State ---------- */
let state = {
  todayPlans: store.get('today_plans', {}),      // { '2026-09-07': {mission, top3:[{id,title,done}], next:[{id,time,title}], watchout} }
  weekPlans:  store.get('week_plans', {}),        // { '2026-09-07': {objective, outcomes:[], events:[], bottleneck, avoid, recovery} }
  inbox:      store.get('inbox', []),             // [{id,text,type,classification}]
  priorities: store.get('priorities', []),        // [{id,title,category,importance,frequency,duration,notes,active}]
  timerLog:   store.get('timer_log', {}),         // { '2026-09-07': [minutes,...] }
  theme:      store.get('theme', 'system')
};

function saveToday(){ store.set('today_plans', state.todayPlans); }
function saveWeek(){ store.set('week_plans', state.weekPlans); }
function saveInbox(){ store.set('inbox', state.inbox); }
function savePriorities(){ store.set('priorities', state.priorities); }
function saveTimerLog(){ store.set('timer_log', state.timerLog); }

function currentToday(){
  const k = todayKey();
  if(!state.todayPlans[k]) state.todayPlans[k] = { mission:'', top3:[], next:[], watchout:'' };
  return state.todayPlans[k];
}
function currentWeek(){
  const k = weekKey();
  if(!state.weekPlans[k]) state.weekPlans[k] = { objective:'', outcomes:[], events:[], bottleneck:'', avoid:'', recovery:'' };
  return state.weekPlans[k];
}

/* ---------- Theme ---------- */
function applyTheme(){
  const root = document.documentElement;
  if(state.theme === 'system'){
    root.removeAttribute('data-theme');
    root.setAttribute('data-theme-mode','system');
  } else {
    root.setAttribute('data-theme', state.theme);
    root.removeAttribute('data-theme-mode');
  }
  document.querySelectorAll('.theme-opt').forEach(b=>{
    b.classList.toggle('active', b.dataset.theme === state.theme);
  });
}

/* ---------- Tabs ---------- */
function goto(screen){
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('hidden', s.dataset.screen !== screen));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === screen));
  window.scrollTo(0,0);
}
document.querySelectorAll('.tab-btn').forEach(b=>{
  b.addEventListener('click', ()=> goto(b.dataset.screen));
});
document.querySelectorAll('[data-goto]').forEach(b=>{
  b.addEventListener('click', ()=> goto(b.dataset.goto));
});

/* ---------- Date header ---------- */
function renderDateHeader(){
  const days = ['SONNTAG','MONTAG','DIENSTAG','MITTWOCH','DONNERSTAG','FREITAG','SAMSTAG'];
  const months = ['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
  const d = new Date();
  document.getElementById('dateLine').textContent = `${days[d.getDay()]} · ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}`;
  const hour = d.getHours();
  const greetWord = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  document.getElementById('greeting').textContent = `${greetWord}, David.`;
  document.getElementById('weekLine').textContent = `WOCHE VOM ${weekKey().split('-').reverse().slice(0,2).join('.')}`;
}

/* ---------- Render: Today ---------- */
function renderToday(){
  const t = currentToday();
  document.getElementById('missionText').textContent = t.mission || 'Tippe auf „Mission bearbeiten", um deinen Fokus für heute festzulegen.';

  const top3El = document.getElementById('top3List');
  top3El.innerHTML = '';
  t.top3.forEach((item, i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span class="top3-num">${i+1}</span><span class="top3-title ${item.done?'done':''}" data-id="${item.id}">${item.title}</span><button class="top3-del" data-id="${item.id}">✕</button>`;
    li.querySelector('.top3-title').addEventListener('click', ()=>{
      item.done = !item.done; saveToday(); renderToday();
    });
    li.querySelector('.top3-del').addEventListener('click', ()=>{
      t.top3 = t.top3.filter(x=>x.id!==item.id); saveToday(); renderToday();
    });
    top3El.appendChild(li);
  });

  const nextEl = document.getElementById('nextList');
  nextEl.innerHTML = '';
  t.next.sort((a,b)=> (a.time||'').localeCompare(b.time||''));
  t.next.forEach(item=>{
    const li = document.createElement('li');
    li.innerHTML = `<span class="next-time">${item.time||'--:--'}</span><span class="next-title">${item.title}</span><button class="next-del" data-id="${item.id}">✕</button>`;
    li.querySelector('.next-del').addEventListener('click', ()=>{
      t.next = t.next.filter(x=>x.id!==item.id); saveToday(); renderToday();
    });
    nextEl.appendChild(li);
  });

  document.getElementById('watchoutText').textContent = t.watchout || 'Kein Risiko notiert — trag ein, wo du heute vom Fokus abkommen könntest.';
}

/* ---------- Render: Week ---------- */
function renderWeek(){
  const w = currentWeek();
  document.getElementById('weekObjective').value = w.objective;
  document.getElementById('weekBottleneck').value = w.bottleneck;
  document.getElementById('weekAvoid').value = w.avoid;
  document.getElementById('weekRecovery').value = w.recovery;

  const outcomesEl = document.getElementById('weekOutcomes');
  outcomesEl.innerHTML = '';
  w.outcomes.forEach(o=>{
    const div = document.createElement('div');
    div.className = 'row-item';
    div.innerHTML = `<span style="flex:1">${o.text}</span><button class="row-del" data-id="${o.id}">✕</button>`;
    div.querySelector('.row-del').addEventListener('click', ()=>{
      w.outcomes = w.outcomes.filter(x=>x.id!==o.id); saveWeek(); renderWeek();
    });
    outcomesEl.appendChild(div);
  });

  const eventsEl = document.getElementById('weekEvents');
  eventsEl.innerHTML = '';
  w.events.forEach(e=>{
    const div = document.createElement('div');
    div.className = 'row-item';
    div.innerHTML = `<span style="flex:1"><strong>${e.day}</strong> — ${e.text}</span><button class="row-del" data-id="${e.id}">✕</button>`;
    div.querySelector('.row-del').addEventListener('click', ()=>{
      w.events = w.events.filter(x=>x.id!==e.id); saveWeek(); renderWeek();
    });
    eventsEl.appendChild(div);
  });

  // Priority check: flag active priorities not mentioned anywhere in the week's text fields
  const haystack = [w.objective, w.bottleneck, w.avoid, w.recovery, ...w.outcomes.map(o=>o.text), ...w.events.map(e=>e.text)]
    .join(' ').toLowerCase();
  const missing = state.priorities.filter(p => p.active && !haystack.includes(p.title.toLowerCase()));
  const checkEl = document.getElementById('priorityCheck');
  checkEl.innerHTML = missing.length
    ? 'Nicht in dieser Woche erwähnt: ' + missing.map(p=>p.title).join(', ')
    : '';

  [document.getElementById('weekObjective'),document.getElementById('weekBottleneck'),
   document.getElementById('weekAvoid'),document.getElementById('weekRecovery')].forEach(el=>{
    el.oninput = ()=>{ w.objective = document.getElementById('weekObjective').value;
      w.bottleneck = document.getElementById('weekBottleneck').value;
      w.avoid = document.getElementById('weekAvoid').value;
      w.recovery = document.getElementById('weekRecovery').value;
      saveWeek(); };
  });
}

document.getElementById('addOutcomeBtn').addEventListener('click', ()=>{
  openSheet('Ergebnis hinzufügen', `<input id="sInput" placeholder="z.B. Partnerschaft unterschrieben">`, ()=>{
    const val = document.getElementById('sInput').value.trim();
    if(!val) return;
    currentWeek().outcomes.push({id:uid(), text:val});
    saveWeek(); renderWeek();
  });
});
document.getElementById('addWeekEventBtn').addEventListener('click', ()=>{
  openSheet('Termin hinzufügen', `
    <input id="sDay" placeholder="Tag, z.B. Di">
    <input id="sText" placeholder="Was steht an?">`, ()=>{
    const day = document.getElementById('sDay').value.trim();
    const text = document.getElementById('sText').value.trim();
    if(!text) return;
    currentWeek().events.push({id:uid(), day: day||'—', text});
    saveWeek(); renderWeek();
  });
});

/* ---------- Today: add buttons ---------- */
document.getElementById('addTop3Btn').addEventListener('click', ()=>{
  const t = currentToday();
  if(t.top3.length >= 3){ alert('Maximal 3 Prioritäten — das ist der Sinn von Top 3.'); return; }
  openSheet('Priorität hinzufügen', `<input id="sInput" placeholder="Was ist heute wichtig?">`, ()=>{
    const val = document.getElementById('sInput').value.trim();
    if(!val) return;
    t.top3.push({id:uid(), title:val, done:false});
    saveToday(); renderToday();
  });
});
document.getElementById('addNextBtn').addEventListener('click', ()=>{
  openSheet('Termin hinzufügen', `
    <input id="sTime" placeholder="Uhrzeit, z.B. 14:00">
    <input id="sTitle" placeholder="Was steht an?">`, ()=>{
    const time = document.getElementById('sTime').value.trim();
    const title = document.getElementById('sTitle').value.trim();
    if(!title) return;
    currentToday().next.push({id:uid(), time, title});
    saveToday(); renderToday();
  });
});
document.querySelectorAll('[data-edit]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const kind = btn.dataset.edit;
    const t = currentToday();
    if(kind === 'mission'){
      openSheet('Mission bearbeiten', `<textarea id="sInput" placeholder="Worum geht es heute?">${t.mission||''}</textarea>`, ()=>{
        t.mission = document.getElementById('sInput').value.trim(); saveToday(); renderToday();
      });
    } else if(kind === 'watchout'){
      openSheet('Watch Out bearbeiten', `<textarea id="sInput" placeholder="Wo verlierst du heute leicht den Fokus?">${t.watchout||''}</textarea>`, ()=>{
        t.watchout = document.getElementById('sInput').value.trim(); saveToday(); renderToday();
      });
    }
  });
});

/* ---------- Bottom sheet ---------- */
const sheet = document.getElementById('sheet');
const backdrop = document.getElementById('sheetBackdrop');
let sheetSaveHandler = null;

function openSheet(title, bodyHtml, onSave){
  document.getElementById('sheetTitle').textContent = title;
  document.getElementById('sheetBody').innerHTML = bodyHtml;
  sheetSaveHandler = onSave;
  sheet.classList.add('show');
  backdrop.classList.add('show');
  const firstInput = document.getElementById('sheetBody').querySelector('input,textarea');
  if(firstInput) setTimeout(()=>firstInput.focus(), 200);
}
function closeSheet(){
  sheet.classList.remove('show');
  backdrop.classList.remove('show');
  sheetSaveHandler = null;
}
document.getElementById('sheetCancel').addEventListener('click', closeSheet);
backdrop.addEventListener('click', closeSheet);
document.getElementById('sheetSave').addEventListener('click', ()=>{
  if(sheetSaveHandler) sheetSaveHandler();
  closeSheet();
});

/* ---------- Capture / Inbox ---------- */
function renderInbox(){
  const list = document.getElementById('inboxList');
  const empty = document.getElementById('inboxEmpty');
  list.innerHTML = '';
  empty.classList.toggle('hidden', state.inbox.length > 0);

  const classes = ['DO','SCHEDULE','DELEGATE','AUTOMATE','DELETE','SOMEDAY'];
  state.inbox.forEach(item=>{
    const li = document.createElement('li');
    li.className = 'inbox-item';
    li.innerHTML = `
      <div class="txt">${item.text}</div>
      <div class="tags">${item.type.toUpperCase()}</div>
      <div class="class-row">
        ${classes.map(c=>`<button class="class-chip ${item.classification===c?'active':''}" data-c="${c}">${c}</button>`).join('')}
        <button class="class-chip" data-c="__del">✕ entfernen</button>
      </div>`;
    li.querySelectorAll('.class-chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const c = chip.dataset.c;
        if(c === '__del'){
          state.inbox = state.inbox.filter(x=>x.id!==item.id);
        } else {
          item.classification = c;
          if(c === 'DELETE') state.inbox = state.inbox.filter(x=>x.id!==item.id);
        }
        saveInbox(); renderInbox();
      });
    });
    list.appendChild(li);
  });
}

document.querySelectorAll('.capture-type').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const type = btn.dataset.type;
    if(type === 'voice'){
      startVoiceCapture();
    } else {
      openSheet(type === 'task' ? 'Task erfassen' : type === 'idea' ? 'Idee erfassen' : 'Notiz erfassen',
        `<textarea id="sInput" placeholder="Kurz und roh — Feinschliff kommt später."></textarea>`, ()=>{
        const val = document.getElementById('sInput').value.trim();
        if(!val) return;
        state.inbox.unshift({id:uid(), text:val, type, classification:null});
        saveInbox(); renderInbox();
      });
    }
  });
});

function startVoiceCapture(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    openSheet('Voice erfassen', `<p class="hint-text">Spracherkennung wird auf diesem Gerät/Browser nicht unterstützt. Nutze stattdessen die iPhone-Diktierfunktion direkt im Textfeld.</p><textarea id="sInput" placeholder="Diktiere hier über die iOS-Tastatur (Mikrofon-Taste)."></textarea>`, ()=>{
      const val = document.getElementById('sInput').value.trim();
      if(!val) return;
      state.inbox.unshift({id:uid(), text:val, type:'voice', classification:null});
      saveInbox(); renderInbox();
    });
    return;
  }
  openSheet('🎙 Aufnahme läuft…', `<p class="hint-text" id="voiceStatus">Sprich jetzt. Tippe „Speichern", wenn du fertig bist.</p><textarea id="sInput" placeholder="Transkript erscheint hier…"></textarea>`, ()=>{
    recognition.stop();
    const val = document.getElementById('sInput').value.trim();
    if(!val) return;
    state.inbox.unshift({id:uid(), text:val, type:'voice', classification:null});
    saveInbox(); renderInbox();
  });
  const recognition = new SR();
  recognition.lang = 'de-CH';
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.onresult = (e)=>{
    let text = '';
    for(let i=0;i<e.results.length;i++) text += e.results[i][0].transcript;
    const el = document.getElementById('sInput');
    if(el) el.value = text;
  };
  recognition.onerror = ()=>{
    const st = document.getElementById('voiceStatus');
    if(st) st.textContent = 'Mikrofon-Zugriff nicht möglich. Prüfe die Browser-Berechtigung.';
  };
  recognition.start();
}

/* ---------- Priorities ---------- */
function renderPriorities(){
  const el = document.getElementById('priorityList');
  el.innerHTML = '';
  state.priorities.forEach(p=>{
    const li = document.createElement('li');
    li.className = 'priority-item' + (p.active ? '' : ' inactive');
    li.innerHTML = `
      <div class="p-title">${p.title}</div>
      <div class="p-meta">${p.category} · ${p.frequency} · ${p.duration}</div>
      <div class="p-actions">
        <button data-a="toggle">${p.active ? 'pausieren' : 'aktivieren'}</button>
        <button data-a="del">löschen</button>
      </div>`;
    li.querySelector('[data-a="toggle"]').addEventListener('click', ()=>{
      p.active = !p.active; savePriorities(); renderPriorities(); renderWeek();
    });
    li.querySelector('[data-a="del"]').addEventListener('click', ()=>{
      state.priorities = state.priorities.filter(x=>x.id!==p.id); savePriorities(); renderPriorities(); renderWeek();
    });
    el.appendChild(li);
  });
}
document.getElementById('addPriorityBtn').addEventListener('click', ()=>{
  openSheet('Priorität hinzufügen', `
    <input id="sTitle" placeholder="Titel, z.B. Krafttraining">
    <select id="sCat">
      <option>Sport</option><option>Health</option><option>Business</option>
      <option>Financial</option><option>Education</option><option>Relationships</option>
      <option>Personal</option><option>Learning</option><option>Recovery</option>
    </select>
    <input id="sFreq" placeholder="Frequenz, z.B. 3x wöchentlich">
    <input id="sDur" placeholder="Dauer, z.B. 75 min">`, ()=>{
    const title = document.getElementById('sTitle').value.trim();
    if(!title) return;
    state.priorities.push({
      id:uid(), title,
      category: document.getElementById('sCat').value,
      frequency: document.getElementById('sFreq').value.trim() || '—',
      duration: document.getElementById('sDur').value.trim() || '—',
      active: true
    });
    savePriorities(); renderPriorities(); renderWeek();
  });
});

/* ---------- Theme switch ---------- */
document.querySelectorAll('.theme-opt').forEach(b=>{
  b.addEventListener('click', ()=>{
    state.theme = b.dataset.theme;
    store.set('theme', state.theme);
    applyTheme();
  });
});

/* ---------- Reset ---------- */
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(confirm('Wirklich alle lokalen Daten löschen? Das kann nicht rückgängig gemacht werden.')){
    localStorage.clear();
    location.reload();
  }
});

/* ---------- Timer ---------- */
let timerSeconds = 25*60;
let timerTotal = 25*60;
let timerRunning = false;
let timerInterval = null;
let timerMode = 'focus';

function renderTimer(){
  const m = Math.floor(timerSeconds/60).toString().padStart(2,'0');
  const s = (timerSeconds%60).toString().padStart(2,'0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
  document.getElementById('timerSub').textContent = timerRunning ? (timerMode==='focus' ? 'Fokus läuft' : 'Pause läuft') : 'Bereit';

  const log = state.timerLog[todayKey()] || [];
  const logEl = document.getElementById('timerLog');
  logEl.textContent = log.length ? `${log.length} Session(s) · ${log.reduce((a,b)=>a+b,0)} min gesamt` : 'Noch keine Sessions.';
}

document.querySelectorAll('.timer-presets .chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    const min = parseInt(chip.dataset.min,10);
    timerMode = min === 5 ? 'break' : 'focus';
    timerSeconds = min*60; timerTotal = min*60; timerRunning = false;
    clearInterval(timerInterval);
    document.getElementById('timerToggle').textContent = 'Start';
    renderTimer();
  });
});
document.getElementById('timerReset').addEventListener('click', ()=>{
  timerRunning = false; clearInterval(timerInterval);
  timerSeconds = timerTotal;
  document.getElementById('timerToggle').textContent = 'Start';
  renderTimer();
});
document.getElementById('timerSkip').addEventListener('click', ()=>{
  timerRunning = false; clearInterval(timerInterval);
  timerMode = timerMode === 'focus' ? 'break' : 'focus';
  timerSeconds = timerMode === 'focus' ? 25*60 : 5*60;
  timerTotal = timerSeconds;
  document.getElementById('timerToggle').textContent = 'Start';
  renderTimer();
});
document.getElementById('timerToggle').addEventListener('click', ()=>{
  timerRunning = !timerRunning;
  document.getElementById('timerToggle').textContent = timerRunning ? 'Pause' : 'Start';
  if(timerRunning){
    timerInterval = setInterval(()=>{
      timerSeconds--;
      if(timerSeconds <= 0){
        clearInterval(timerInterval);
        timerRunning = false;
        if(timerMode === 'focus'){
          const k = todayKey();
          if(!state.timerLog[k]) state.timerLog[k] = [];
          state.timerLog[k].push(Math.round(timerTotal/60));
          saveTimerLog();
        }
        try{ new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play(); }catch(e){}
        document.getElementById('timerToggle').textContent = 'Start';
        timerSeconds = timerTotal;
      }
      renderTimer();
    }, 1000);
  } else {
    clearInterval(timerInterval);
  }
});

/* ---------- Reflect (evening voice journal, quick version) ---------- */
document.getElementById('reflectBtn').addEventListener('click', ()=>{
  openSheet('🎙 Reflektieren', `
    <p class="hint-text" style="margin-bottom:10px">Was lief gut? Was hat Energie gekostet? Was solltest du morgen wissen?</p>
    <textarea id="sInput" placeholder="Kurz reinschreiben oder über die iOS-Diktierfunktion sprechen." rows="5"></textarea>`, ()=>{
    const val = document.getElementById('sInput').value.trim();
    if(!val) return;
    const journal = store.get('journal', []);
    journal.unshift({id:uid(), date: todayKey(), text: val});
    store.set('journal', journal);
  });
});

/* ---------- Init ---------- */
function renderAll(){
  renderDateHeader();
  renderToday();
  renderWeek();
  renderInbox();
  renderPriorities();
  renderTimer();
  applyTheme();
}
renderAll();

/* ---------- Service worker ---------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
