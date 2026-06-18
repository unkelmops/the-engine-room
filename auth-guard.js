/* ==========================================================
   THE HQ — Auth Guard
   Include this script on any protected page.
   If no session exists, redirect to login.html.
   ========================================================== */
(function(){
  const SESSION_KEY = 'thehq_session';
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

  if (!session) {
    const redirect = encodeURIComponent(location.pathname.split('/').pop() || 'mopsentryea_1.html');
    location.replace('login.html?redirect=' + redirect);
    return;
  }

  /* Inject welcome bar at top of page */
  document.addEventListener('DOMContentLoaded', function() {
    const bar = document.createElement('div');
    bar.id = 'hq-user-bar';
    bar.innerHTML = `
      <style>
        #hq-user-bar {
          position:fixed; top:0; left:0; right:0; z-index:9999;
          background:rgba(5,5,7,0.95); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(184,255,0,0.15);
          padding:10px clamp(1rem,5vw,2rem);
          display:flex; align-items:center; justify-content:space-between;
          font-family:'JetBrains Mono',monospace; font-size:11px;
          letter-spacing:1px; color:rgba(168,176,200,0.7);
        }
        #hq-user-bar .bar-left { display:flex; align-items:center; gap:10px; }
        #hq-user-bar .bar-dot { width:6px; height:6px; border-radius:50%; background:#b8ff00; animation:bdot 1.4s ease-in-out infinite; }
        @keyframes bdot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        #hq-user-bar .bar-name { color:#b8ff00; font-weight:600; }
        #hq-user-bar .bar-right { display:flex; align-items:center; gap:1rem; }
        #hq-user-bar a { color:rgba(168,176,200,0.5); text-decoration:none; text-transform:uppercase; letter-spacing:1.5px; font-size:10px; transition:color 0.2s; }
        #hq-user-bar a:hover { color:#b8ff00; }
        #hq-user-bar .bar-logout { background:none; border:none; cursor:pointer; color:rgba(255,51,102,0.5); font-family:inherit; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; transition:color 0.2s; }
        #hq-user-bar .bar-logout:hover { color:#ff3366; }
      </style>
      <div class="bar-left">
        <span class="bar-dot"></span>
        LOGGED IN AS <span class="bar-name">${session.name || session.email}</span>
      </div>
      <div class="bar-right">
        <a href="index.html">← THE HQ</a>
        <button class="bar-logout" onclick="(function(){localStorage.removeItem('thehq_session');location.replace('login.html');})()">Sign Out</button>
      </div>
    `;
    document.body.prepend(bar);
    /* Push page content down */
    document.body.style.paddingTop = '44px';
  });
})();
