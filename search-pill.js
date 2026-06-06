/* ═══════════════════════════════════════════════════════
   SEARCH PILL — Interactive dropdowns
   ═══════════════════════════════════════════════════════ */
(function(){
  // ─── DATA ───
  var neighborhoods = [
    {name:'All neighborhoods', color:null, area:'Bucharest'},
    {name:'Floreasca', color:'#FF4136', area:'North'},
    {name:'Pipera', color:'#D4531A', area:'North-East'},
    {name:'City Centre', color:'#2E7D32', area:'Central'},
    {name:'Dorobanți', color:'#1565C0', area:'Central-North'},
    {name:'Herăstrău', color:'#6A1B9A', area:'North'},
    {name:'Băneasa', color:'#00695C', area:'North'},
  ];

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  // ─── STATE ───
  var state = {
    location: null,
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    infants: 0,
    calMonth: new Date().getMonth(),
    calYear: new Date().getFullYear(),
    selectingEnd: false,
  };

  // ─── PILL PAIRS (hero + sticky) ───
  var pills = [
    { id:'hero', pill: document.getElementById('heroPill'), loc: document.getElementById('hLocField'), date: document.getElementById('hDateField'), guest: document.getElementById('hGuestField'), locVal: document.getElementById('hLocVal'), dateVal: document.getElementById('hDateVal'), guestVal: document.getElementById('hGuestVal'), go: document.getElementById('hGoBtn') },
    { id:'sticky', pill: document.getElementById('stickyPill'), loc: document.getElementById('sLocField'), date: document.getElementById('sDateField'), guest: document.getElementById('sGuestField'), locVal: document.getElementById('sLocVal'), dateVal: document.getElementById('sDateVal'), guestVal: document.getElementById('sGuestVal'), go: document.getElementById('sGoBtn') },
  ];

  var activePanel = null; // 'location' | 'dates' | 'guests'
  var activePillIdx = null;
  var dropdown = null; // current dropdown element

  // ─── CREATE DROPDOWN PANELS ───
  function createLocPanel(){
    var el = document.createElement('div');
    el.className = 'sp-dropdown sp-loc';
    el.innerHTML = '<div class="sp-loc-group">AVEXA Neighborhoods</div>' +
      neighborhoods.map(function(n,i){
        var dot = n.color ? '<span class="sp-loc-dot" style="background:'+n.color+'"></span>' : '<span class="sp-loc-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg></span>';
        var sel = (state.location === i) ? ' selected' : '';
        return '<div class="sp-loc-item'+sel+'" data-idx="'+i+'">'+dot+'<span>'+n.name+(n.area && i>0 ? ' · '+n.area : '')+'</span></div>';
      }).join('');
    el.addEventListener('click', function(e){
      var item = e.target.closest('.sp-loc-item');
      if(!item) return;
      state.location = parseInt(item.dataset.idx);
      updateDisplays();
      closeDropdown();
      // Auto-advance to dates
      setTimeout(function(){ openPanel('dates', activePillIdx); }, 150);
    });
    return el;
  }

  function createDatePanel(){
    var el = document.createElement('div');
    el.className = 'sp-dropdown sp-dates';
    renderCalendar(el);
    return el;
  }

  function renderCalendar(el){
    var m1 = state.calMonth;
    var y1 = state.calYear;
    var m2 = m1 + 1;
    var y2 = y1;
    if(m2 > 11){ m2 = 0; y2++; }

    el.innerHTML =
      '<div class="sp-cal-wrap">' +
        '<div>' + calMonth(y1, m1, true) + '</div>' +
        '<div>' + calMonth(y2, m2, false) + '</div>' +
      '</div>' +
      '<div class="sp-cal-foot" id="calFoot">' + nightsText() + '</div>';

    // Nav
    el.querySelectorAll('.sp-cal-nav').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var dir = btn.dataset.dir;
        if(dir === 'prev'){
          state.calMonth--;
          if(state.calMonth < 0){ state.calMonth = 11; state.calYear--; }
        } else {
          state.calMonth++;
          if(state.calMonth > 11){ state.calMonth = 0; state.calYear++; }
        }
        renderCalendar(el);
      });
    });

    // Day clicks
    el.querySelectorAll('.sp-cal-day:not(.past):not(.empty)').forEach(function(dayEl){
      dayEl.addEventListener('click', function(e){
        e.stopPropagation();
        var d = new Date(parseInt(dayEl.dataset.year), parseInt(dayEl.dataset.month), parseInt(dayEl.dataset.day));
        if(!state.checkIn || state.selectingEnd === false){
          state.checkIn = d;
          state.checkOut = null;
          state.selectingEnd = true;
        } else {
          if(d <= state.checkIn){
            state.checkIn = d;
            state.checkOut = null;
          } else {
            state.checkOut = d;
            state.selectingEnd = false;
            updateDisplays();
            // Auto-advance to guests
            setTimeout(function(){ openPanel('guests', activePillIdx); }, 200);
          }
        }
        renderCalendar(el);
        updateDisplays();
      });
    });
  }

  function calMonth(year, month, showPrev){
    var today = new Date(); today.setHours(0,0,0,0);
    var first = new Date(year, month, 1);
    var startDay = (first.getDay() + 6) % 7; // Monday = 0
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var html = '<div class="sp-cal-head">';
    if(showPrev) html += '<button class="sp-cal-nav" data-dir="prev"><svg viewBox="0 0 20 20"><path d="M12.5 15L7.5 10L12.5 5"/></svg></button>';
    else html += '<span></span>';
    html += '<span class="sp-cal-title">' + MONTHS[month] + ' ' + year + '</span>';
    if(!showPrev) html += '<button class="sp-cal-nav" data-dir="next"><svg viewBox="0 0 20 20"><path d="M7.5 15L12.5 10L7.5 5"/></svg></button>';
    else html += '<span></span>';
    html += '</div><div class="sp-cal-grid">';

    DAYS.forEach(function(d){ html += '<span class="sp-cal-dow">'+d+'</span>'; });

    for(var i = 0; i < startDay; i++) html += '<span class="sp-cal-day empty"></span>';

    for(var d = 1; d <= daysInMonth; d++){
      var date = new Date(year, month, d);
      var cls = 'sp-cal-day';
      if(date < today) cls += ' past';
      if(state.checkIn && date.getTime() === state.checkIn.getTime()) cls += ' selected range-start';
      if(state.checkOut && date.getTime() === state.checkOut.getTime()) cls += ' selected range-end';
      if(state.checkIn && state.checkOut && date > state.checkIn && date < state.checkOut) cls += ' in-range';
      html += '<span class="'+cls+'" data-day="'+d+'" data-month="'+month+'" data-year="'+year+'">'+d+'</span>';
    }
    html += '</div>';
    return html;
  }

  function nightsText(){
    if(!state.checkIn || !state.checkOut) return '';
    var diff = Math.round((state.checkOut - state.checkIn) / (1000*60*60*24));
    return diff + ' night' + (diff !== 1 ? 's' : '');
  }

  function createGuestPanel(){
    var el = document.createElement('div');
    el.className = 'sp-dropdown sp-guests';
    renderGuests(el);
    return el;
  }

  function renderGuests(el){
    el.innerHTML = guestRow('Adults','Age 13 and above','adults', state.adults, 1, 10) +
                   guestRow('Children','Age 2–12','children', state.children, 0, 6) +
                   guestRow('Infants','Under 2 years old','infants', state.infants, 0, 4);

    el.querySelectorAll('.sp-guest-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var key = btn.dataset.key;
        var dir = btn.dataset.dir;
        if(dir === 'plus') state[key] = Math.min(state[key] + 1, parseInt(btn.dataset.max));
        else state[key] = Math.max(state[key] - 1, parseInt(btn.dataset.min));
        renderGuests(el);
        updateDisplays();
      });
    });
  }

  function guestRow(label, sub, key, val, min, max){
    return '<div class="sp-guest-row">' +
      '<div class="sp-guest-info"><div class="sp-guest-type">'+label+'</div><div class="sp-guest-age">'+sub+'</div></div>' +
      '<div class="sp-guest-ctrl">' +
        '<button class="sp-guest-btn minus'+(val<=min?' disabled':'')+'" data-key="'+key+'" data-dir="minus" data-min="'+min+'">−</button>' +
        '<span class="sp-guest-count">'+val+'</span>' +
        '<button class="sp-guest-btn plus'+(val>=max?' disabled':'')+'" data-key="'+key+'" data-dir="plus" data-max="'+max+'">+</button>' +
      '</div></div>';
  }

  // ─── DISPLAY UPDATE ───
  function updateDisplays(){
    var locText = state.location !== null ? neighborhoods[state.location].name : 'Search Bucharest Stays';
    if(state.location === 0) locText = 'Bucharest · All';

    var dateText = 'Add dates';
    if(state.checkIn && state.checkOut){
      dateText = fmt(state.checkIn) + ' – ' + fmt(state.checkOut);
    } else if(state.checkIn){
      dateText = fmt(state.checkIn) + ' – ...';
    }

    var total = state.adults + state.children;
    var guestText = total + ' guest' + (total !== 1 ? 's' : '');
    if(state.infants > 0) guestText += ', ' + state.infants + ' infant' + (state.infants !== 1 ? 's' : '');

    pills.forEach(function(p){
      if(p.locVal) p.locVal.textContent = locText;
      if(p.dateVal) p.dateVal.textContent = dateText;
      if(p.guestVal) p.guestVal.textContent = guestText;
    });
  }

  function fmt(d){
    return MONTHS[d.getMonth()].substring(0,3) + ' ' + String(d.getDate()).padStart(2,'0');
  }

  // ─── OPEN / CLOSE ───
  function openPanel(panel, pillIdx){
    // Remove old dropdown immediately (no animation delay)
    if(dropdown && dropdown.parentNode) dropdown.parentNode.removeChild(dropdown);
    dropdown = null;
    document.querySelectorAll('.search-pill .field.active').forEach(function(f){ f.classList.remove('active'); });

    activePanel = panel;
    activePillIdx = pillIdx;
    var p = pills[pillIdx];
    if(!p || !p.pill) return;

    // Mark active field
    var fieldEl = panel === 'location' ? p.loc : panel === 'dates' ? p.date : p.guest;
    if(fieldEl) fieldEl.classList.add('active');

    // Create panel
    if(panel === 'location') dropdown = createLocPanel();
    else if(panel === 'dates') dropdown = createDatePanel();
    else dropdown = createGuestPanel();

    // Position relative to pill
    p.pill.style.position = 'relative';
    p.pill.appendChild(dropdown);

    // Align dropdown under the correct field
    if(panel === 'location'){
      dropdown.style.left = '0';
      dropdown.style.right = 'auto';
    } else if(panel === 'dates'){
      dropdown.style.left = '0';
      dropdown.style.right = 'auto';
    } else {
      dropdown.style.left = 'auto';
      dropdown.style.right = '0';
    }

    // Scroll pill into view so dropdown is visible
    var pillRect = p.pill.getBoundingClientRect();
    var dropdownHeight = panel === 'dates' ? 420 : 360;
    var bottomNeeded = pillRect.bottom + dropdownHeight + 20;
    if (bottomNeeded > window.innerHeight) {
      var scrollBy = bottomNeeded - window.innerHeight + 40;
      window.scrollBy({ top: scrollBy, behavior: 'smooth' });
    }

    requestAnimationFrame(function(){ dropdown.classList.add('open'); });
  }

  function closeDropdown(){
    if(dropdown){
      dropdown.classList.remove('open');
      var old = dropdown;
      dropdown = null;
      setTimeout(function(){
        if(old && old.parentNode) old.parentNode.removeChild(old);
      }, 120);
    }
    document.querySelectorAll('.search-pill .field.active').forEach(function(f){ f.classList.remove('active'); });
    activePanel = null;
    activePillIdx = null;
  }

  // ─── EVENT BINDING ───
  pills.forEach(function(p, idx){
    if(!p.pill) return;
    [['location', p.loc], ['dates', p.date], ['guests', p.guest]].forEach(function(pair){
      if(!pair[1]) return;
      pair[1].addEventListener('click', function(e){
        e.stopPropagation();
        if(activePanel === pair[0] && activePillIdx === idx){
          closeDropdown();
        } else {
          openPanel(pair[0], idx);
        }
      });
    });
    if(p.go) p.go.addEventListener('click', function(e){
      e.stopPropagation();
      closeDropdown();
      window.location.href = 'locations.html';
    });
  });

  // Close on outside click
  document.addEventListener('click', function(e){
    if(dropdown && !dropdown.contains(e.target) && !e.target.closest('.search-pill')){
      closeDropdown();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeDropdown();
  });
})();
