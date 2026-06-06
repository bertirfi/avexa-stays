/* ═══════════════════════════════════════════════════════
   V2 APP — Nav, scroll reveals, carousel drag, parallax
   ═══════════════════════════════════════════════════════ */

// ─── Hamburger menu ───
(function(){
  var burger = document.getElementById('navBurger');
  var mob = document.getElementById('mobileNav');
  var close = document.getElementById('mobClose');
  if(!burger || !mob) return;
  function toggle(open){
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    mob.classList.toggle('open', open);
    mob.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function(){ toggle(!mob.classList.contains('open')); });
  if(close) close.addEventListener('click', function(){ toggle(false); });
  mob.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ toggle(false); }); });
})();

// ─── NAV: pin + hide/show + sticky search ───
(function(){
  var nav = document.getElementById('nav');
  var search = document.getElementById('stickySearch');
  var lastY = 0, ticking = false;

  function onScroll(){
    var y = window.scrollY;
    var delta = y - lastY;
    var pinPoint = window.innerHeight * 0.6;

    if(y > pinPoint){ nav.classList.add('pinned'); }
    else { nav.classList.remove('pinned'); nav.classList.remove('hide'); }

    if(nav.classList.contains('pinned')){
      if(delta > 4) nav.classList.add('hide');
      else if(delta < -4) nav.classList.remove('hide');
    }

    // Sticky search after hero — position based on nav state
    if(search){
      var hero = document.getElementById('top');
      var heroBottom = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      if(y > heroBottom){
        search.style.opacity = '1';
        search.style.pointerEvents = 'auto';
        // Pill higher when nav is hidden (scrolling down), lower when nav is visible
        search.style.top = nav.classList.contains('hide') ? '16px' : '76px';
      } else {
        search.style.opacity = '0';
        search.style.pointerEvents = 'none';
      }
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, {passive:true});
})();

// ─── Hero word stagger ───
(function(){
  document.querySelectorAll('#heroTitle .w').forEach(function(w, i){
    w.style.animationDelay = (0.35 + i * 0.08) + 's';
  });
})();

// ─── Scroll reveal (IntersectionObserver) ───
(function(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.1, rootMargin: '0px 0px -6% 0px'});

  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
})();

// ─── Locations carousel: drag-to-scroll + arrows ───
(function(){
  var carousel = document.getElementById('locCarousel');
  if(!carousel) return;

  var arrowL = document.getElementById('locArrowL');
  var arrowR = document.getElementById('locArrowR');

  // Drag to scroll
  var isDown = false, startX, scrollLeft;

  carousel.addEventListener('mousedown', function(e){
    isDown = true;
    carousel.style.cursor = 'grabbing';
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    e.preventDefault();
  });

  carousel.addEventListener('mouseleave', function(){
    isDown = false;
    carousel.style.cursor = 'grab';
  });

  carousel.addEventListener('mouseup', function(){
    isDown = false;
    carousel.style.cursor = 'grab';
  });

  carousel.addEventListener('mousemove', function(e){
    if(!isDown) return;
    e.preventDefault();
    var x = e.pageX - carousel.offsetLeft;
    var walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  });

  // Arrow navigation
  function getCardWidth(){
    var card = carousel.querySelector('.loc-card');
    if(!card) return 440;
    return card.offsetWidth + 20; // card width + gap
  }

  function updateArrows(){
    if(!arrowL || !arrowR) return;
    var sl = carousel.scrollLeft;
    var maxScroll = carousel.scrollWidth - carousel.clientWidth;
    arrowL.classList.toggle('hidden', sl < 4);
    arrowR.classList.toggle('hidden', sl >= maxScroll - 4);
  }

  if(arrowL){
    arrowL.addEventListener('click', function(){
      carousel.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    });
  }
  if(arrowR){
    arrowR.addEventListener('click', function(){
      carousel.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    });
  }

  carousel.addEventListener('scroll', updateArrows, {passive:true});
  updateArrows();
  // Re-check after fonts / layout settle
  window.addEventListener('load', updateArrows);
})();

// ─── Footer giant text parallax ───
(function(){
  var el = document.getElementById('footGiant');
  if(!el) return;
  function update(){
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight;
    if(rect.top < vh && rect.bottom > 0){
      var p = (vh - rect.top) * 0.08;
      el.style.transform = 'translateY(' + (-p) + 'px)';
    }
  }
  window.addEventListener('scroll', update, {passive:true});
  update();
})();

// ─── How It Works: expanding panels ───
(function(){
  var panels = document.querySelectorAll('#howPanels .how-panel');
  if(!panels.length) return;
  panels.forEach(function(panel){
    panel.addEventListener('mouseenter', function(){
      panels.forEach(function(p){ p.classList.remove('active'); });
      panel.classList.add('active');
    });
    panel.addEventListener('click', function(){
      panels.forEach(function(p){ p.classList.remove('active'); });
      panel.classList.add('active');
    });
  });
})();

// ─── Editorial scroll-driven image & text transitions ───
(function(){
  var editorial = document.getElementById('editorial');
  if(!editorial) return;
  var tunnel = document.getElementById('editTunnel');

  var imgL = document.getElementById('editImgL');
  var imgR = document.getElementById('editImgR');
  var track = document.getElementById('editTextTrack');
  var dotsWrap = document.getElementById('editDots');
  if(!imgL || !imgR || !track || !dotsWrap) return;

  var imgsL = imgL.querySelectorAll('.edit-img');
  var imgsR = imgR.querySelectorAll('.edit-img');
  var steps = track.querySelectorAll('.edit-step');
  var dots = dotsWrap.querySelectorAll('.edit-dot');
  var totalSteps = steps.length;
  var current = 0;

  function goTo(idx){
    if(idx < 0 || idx >= totalSteps || idx === current) return;
    // Images
    imgsL.forEach(function(el){ el.classList.toggle('active', +el.dataset.step === idx); });
    imgsR.forEach(function(el){ el.classList.toggle('active', +el.dataset.step === idx); });
    // Text
    steps.forEach(function(el){ el.classList.toggle('active', +el.dataset.step === idx); });
    // Dots
    dots.forEach(function(el){ el.classList.toggle('active', +el.dataset.step === idx); });
    current = idx;
  }

  // Click dots — scroll to that slide's zone within the pinned tunnel
  dots.forEach(function(dot){
    dot.addEventListener('click', function(){
      var i = +dot.dataset.step;
      if(tunnel){
        var scrollable = tunnel.offsetHeight - window.innerHeight;
        var top = window.scrollY + tunnel.getBoundingClientRect().top;
        window.scrollTo({ top: top + scrollable * ((i + 0.5) / totalSteps), behavior:'smooth' });
      } else {
        goTo(i);
      }
    });
  });

  // Scroll-driven: steps advance ONLY while the section is pinned (fully visible).
  // Progress is measured across the tunnel's stuck range, so nothing changes
  // while the section is merely entering at the bottom or leaving at the top.
  function onScroll(){
    if(!tunnel) return;
    var vh = window.innerHeight;
    var scrollable = tunnel.offsetHeight - vh;
    if(scrollable <= 0){ goTo(0); return; }
    var scrolled = -tunnel.getBoundingClientRect().top;
    var progress = Math.max(0, Math.min(1, scrolled / scrollable));
    var idx = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));
    goTo(idx);
  }

  window.addEventListener('scroll', function(){ requestAnimationFrame(onScroll); }, {passive:true});
  onScroll();
})();
