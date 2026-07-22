/* MY TRIPS — JS */

// Hamburger
(function(){
  var burger=document.getElementById('navBurger'),mob=document.getElementById('mobileNav'),close=document.getElementById('mobClose');
  if(!burger||!mob)return;
  function toggle(o){burger.classList.toggle('open',o);burger.setAttribute('aria-expanded',String(o));mob.classList.toggle('open',o);mob.setAttribute('aria-hidden',String(!o));document.body.style.overflow=o?'hidden':'';}
  burger.addEventListener('click',function(){toggle(!mob.classList.contains('open'));});
  if(close)close.addEventListener('click',function(){toggle(false);});
  mob.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){toggle(false);});});
})();

// Nav pin+hide
(function(){
  var nav=document.getElementById('nav'),lastY=0,ticking=false;
  function onScroll(){var y=window.scrollY,delta=y-lastY,pin=window.innerHeight*0.5;if(y>pin)nav.classList.add('pinned');else{nav.classList.remove('pinned');nav.classList.remove('hide');}if(nav.classList.contains('pinned')){if(delta>4)nav.classList.add('hide');else if(delta<-4)nav.classList.remove('hide');}lastY=y;ticking=false;}
  window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(onScroll);ticking=true;}},{passive:true});
})();

// Scroll reveal
(function(){
  var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
})();

// Footer parallax
(function(){
  var el=document.getElementById('footGiant');if(!el)return;
  function update(){var r=el.getBoundingClientRect(),vh=window.innerHeight;if(r.top<vh&&r.bottom>0){el.style.transform='translateY('+(-((vh-r.top)*0.08))+'px)';}}
  window.addEventListener('scroll',update,{passive:true});update();
})();
