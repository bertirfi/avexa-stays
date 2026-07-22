/* ═══════════════════════════════════════════════════════
   MY TRIPS — App logic (state management, modals)
   ═══════════════════════════════════════════════════════ */

(function(){
  var user = null;
  try { user = JSON.parse(localStorage.getItem('avexa_user')); } catch(e){}

  var stateOut = document.getElementById('stateLoggedOut');
  var stateEmpty = document.getElementById('stateEmpty');
  var stateTrips = document.getElementById('stateTrips');
  var navRight = document.getElementById('navRight');
  var nav = document.getElementById('nav');
  var emptyTitle = document.getElementById('emptyTitle');
  var tripsTitle = document.getElementById('tripsTitle');

  // Decide which view to show
  var hasTrips = user && localStorage.getItem('avexa_has_trips') === 'true';

  if (user && user.loggedIn) {
    stateOut.style.display = 'none';

    // Switch nav to logged-in mode
    nav.classList.add('nav-light');
    var initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    var fullName = user.name || 'User';
    navRight.innerHTML =
      '<div class="nav-user-wrap">' +
        '<button class="nav-avatar" id="avatarBtn" title="' + fullName + '">' + initial + '</button>' +
        '<div class="nav-dropdown" id="navDropdown">' +
          '<div class="nav-dd-name">' + fullName + '</div>' +
          '<a href="profile.html" class="nav-dd-item">My Profile</a>' +
          '<button class="nav-dd-item nav-dd-logout" id="logoutBtn">Logout</button>' +
        '</div>' +
      '</div>';

    var avatarBtn = document.getElementById('avatarBtn');
    var dropdown = document.getElementById('navDropdown');
    avatarBtn.addEventListener('click', function(e){
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', function(){
      dropdown.classList.remove('open');
    });

    document.getElementById('logoutBtn').addEventListener('click', function(){
      localStorage.removeItem('avexa_user');
      localStorage.removeItem('avexa_has_trips');
      window.location.reload();
    });

    if (hasTrips) {
      stateTrips.style.display = 'block';
      stateEmpty.style.display = 'none';
      if (tripsTitle && user.name) {
        tripsTitle.textContent = user.name + "'s stays";
      }
    } else {
      stateEmpty.style.display = 'block';
      stateTrips.style.display = 'none';
      if (emptyTitle && user.name) {
        emptyTitle.textContent = 'Hi ' + user.name + ', no trips yet — let\'s fix that.';
      }
    }
  } else {
    stateOut.style.display = '';
    stateEmpty.style.display = 'none';
    stateTrips.style.display = 'none';
  }

  // ─── Reservation modal ───
  var backdrop = document.getElementById('resBackdrop');
  var modal = document.getElementById('resModal');
  var resInput = document.getElementById('resInput');
  var openBtns = [
    document.getElementById('openResModal'),
    document.getElementById('openResModal2')
  ];

  function openModal(){
    if(backdrop) backdrop.classList.add('open');
    if(modal) modal.classList.add('open');
    if(resInput) setTimeout(function(){ resInput.focus(); }, 200);
  }
  function closeModal(){
    if(backdrop) backdrop.classList.remove('open');
    if(modal) modal.classList.remove('open');
    if(resInput) resInput.value = '';
  }

  openBtns.forEach(function(btn){
    if(btn) btn.addEventListener('click', openModal);
  });
  if(backdrop) backdrop.addEventListener('click', closeModal);
  var resClose = document.getElementById('resClose');
  if(resClose) resClose.addEventListener('click', closeModal);
  var resCancelBtn = document.getElementById('resCancelBtn');
  if(resCancelBtn) resCancelBtn.addEventListener('click', closeModal);

  var resContinueBtn = document.getElementById('resContinueBtn');
  if(resContinueBtn) resContinueBtn.addEventListener('click', function(){
    var code = resInput ? resInput.value.trim() : '';
    if(code) {
      // Simulate linking — show trips view
      localStorage.setItem('avexa_has_trips', 'true');
      closeModal();
      window.location.reload();
    } else {
      if(resInput) {
        resInput.style.borderColor = '#FF4136';
        resInput.setAttribute('placeholder', 'Please enter a code');
        setTimeout(function(){ resInput.style.borderColor = ''; }, 2000);
      }
    }
  });

  // ─── Demo: toggle between empty/trips with keyboard ───
  // Press "D" to toggle demo trips data
  document.addEventListener('keydown', function(e){
    if(e.key === 'd' || e.key === 'D'){
      if(!user || !user.loggedIn) return;
      if(localStorage.getItem('avexa_has_trips') === 'true'){
        localStorage.removeItem('avexa_has_trips');
      } else {
        localStorage.setItem('avexa_has_trips', 'true');
      }
      window.location.reload();
    }
  });
})();
