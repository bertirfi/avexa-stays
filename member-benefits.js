/* ═══════════════════════════════════════════════════════
   MEMBER BENEFITS — JS (nav, reveals, parallax)
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

// ─── NAV: pin + hide/show ───
(function(){
  var nav = document.getElementById('nav');
  var lastY = 0, ticking = false;

  function onScroll(){
    var y = window.scrollY;
    var delta = y - lastY;
    var pinPoint = window.innerHeight * 0.5;

    if(y > pinPoint){ nav.classList.add('pinned'); }
    else { nav.classList.remove('pinned'); nav.classList.remove('hide'); }

    if(nav.classList.contains('pinned')){
      if(delta > 4) nav.classList.add('hide');
      else if(delta < -4) nav.classList.remove('hide');
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, {passive:true});
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
