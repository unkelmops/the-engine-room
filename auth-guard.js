/* ==========================================================
   THE HQ — SUPABASE AUTH GUARD
   ==========================================================

   Put this file on every protected EA page.

   Flow:
   EA page
      ↓
   login.html?redirect=that-ea.html
      ↓
   Supabase login / signup
      ↓
   Email confirmation
      ↓
   Original EA page

   ========================================================== */

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://zjoyzwwqohwifdneygfh.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_ocHhAGireOn0snnVty7pMQ_deVfJeD6";

  const LOGIN_PAGE = "login.html";

  /* ----------------------------------------------------------
     Load Supabase
     ---------------------------------------------------------- */

  function loadSupabase() {
    return new Promise(function (resolve, reject) {
      if (window.supabase) {
        resolve(window.supabase);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

      script.onload = function () {
        if (window.supabase) {
          resolve(window.supabase);
        } else {
          reject(new Error("Supabase failed to load."));
        }
      };

      script.onerror = function () {
        reject(new Error("Unable to load Supabase."));
      };

      document.head.appendChild(script);
    });
  }

  /* ----------------------------------------------------------
     Work out which page the user originally requested
     ---------------------------------------------------------- */

  function getCurrentPage() {
    const pathname = window.location.pathname;

    const page =
      pathname.split("/").pop() ||
      "mopsentryea_1.html";

    /*
      Only allow your own HTML pages.
      This prevents external redirect URLs.
    */
    if (/^[a-zA-Z0-9_-]+\.html$/.test(page)) {
      return page;
    }

    return "mopsentryea_1.html";
  }

  /* ----------------------------------------------------------
     Build login URL
     ---------------------------------------------------------- */

  function getLoginUrl() {
    const page = getCurrentPage();

    return (
      LOGIN_PAGE +
      "?redirect=" +
      encodeURIComponent(page)
    );
  }

  /* ----------------------------------------------------------
     Logout
     ---------------------------------------------------------- */

  async function logout(supabaseClient) {
    await supabaseClient.auth.signOut();

    window.location.replace(LOGIN_PAGE);
  }

  /* ----------------------------------------------------------
     Create the top user bar
     ---------------------------------------------------------- */

  function createUserBar(user, supabaseClient) {
    if (document.getElementById("hq-user-bar")) {
      return;
    }

    const name =
      user.user_metadata?.full_name ||
      user.email ||
      "User";

    const bar = document.createElement("div");

    bar.id = "hq-user-bar";

    bar.innerHTML = `
      <style>
        #hq-user-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99999;

          background: rgba(5,5,7,0.96);
          backdrop-filter: blur(20px);

          border-bottom:
            1px solid rgba(184,255,0,0.15);

          padding:
            10px clamp(1rem,5vw,2rem);

          display: flex;
          align-items: center;
          justify-content: space-between;

          font-family:
            'JetBrains Mono',
            monospace;

          font-size: 11px;
          letter-spacing: 1px;

          color:
            rgba(168,176,200,0.7);
        }

        #hq-user-bar .bar-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        #hq-user-bar .bar-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b8ff00;
          box-shadow:
            0 0 10px rgba(184,255,0,0.7);
        }

        #hq-user-bar .bar-name {
          color: #b8ff00;
          font-weight: 600;
        }

        #hq-user-bar .bar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        #hq-user-bar a,
        #hq-user-bar button {
          color:
            rgba(168,176,200,0.5);

          text-decoration: none;

          background: none;
          border: none;

          cursor: pointer;

          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-size: 10px;

          transition: color 0.2s;
        }

        #hq-user-bar a:hover {
          color: #b8ff00;
        }

        #hq-user-bar button {
          color:
            rgba(255,51,102,0.6);
        }

        #hq-user-bar button:hover {
          color: #ff3366;
        }

        @media (max-width: 600px) {
          #hq-user-bar {
            font-size: 9px;
          }

          #hq-user-bar .bar-left {
            gap: 6px;
          }

          #hq-user-bar .bar-right {
            gap: 0.6rem;
          }
        }
      </style>

      <div class="bar-left">
        <span class="bar-dot"></span>
        <span>
          LOGGED IN AS
          <span class="bar-name"></span>
        </span>
      </div>

      <div class="bar-right">
        <a href="index.html">← THE HQ</a>
        <button type="button" id="hq-logout">
          Sign Out
        </button>
      </div>
    `;

    bar.querySelector(".bar-name").textContent = name;

    bar.querySelector("#hq-logout").addEventListener(
      "click",
      function () {
        logout(supabaseClient);
      }
    );

    document.body.prepend(bar);

    document.body.style.paddingTop = "44px";
  }

  /* ----------------------------------------------------------
     Main authentication check
     ---------------------------------------------------------- */

  async function protectPage() {
    try {
      const supabaseLibrary = await loadSupabase();

      const supabaseClient =
        supabaseLibrary.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );

      /*
        Important:

        getSession() allows Supabase to restore the
        session created after email confirmation.

        This is why we do NOT use the old
        localStorage "thehq_session" system.
      */

      const {
        data,
        error
      } = await supabaseClient.auth.getSession();

      if (error) {
        console.error(
          "Supabase session error:",
          error
        );

        window.location.replace(
          getLoginUrl()
        );

        return;
      }

      const session = data.session;

      /*
        No authenticated session.
        Send the user to login while remembering
        exactly which EA they wanted.
      */

      if (!session || !session.user) {
        window.location.replace(
          getLoginUrl()
        );

        return;
      }

      /*
        User is authenticated.
        Allow the EA page to continue.
      */

      createUserBar(
        session.user,
        supabaseClient
      );

      /*
        Keep the authentication state synchronized.
      */

      supabaseClient.auth.onAuthStateChange(
        function (event, newSession) {

          if (
            event === "SIGNED_OUT" ||
            !newSession
          ) {
            window.location.replace(
              getLoginUrl()
            );
          }
        }
      );

    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      window.location.replace(
        getLoginUrl()
      );
    }
  }

  /*
    Start only after the document exists.
  */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      protectPage
    );
  } else {
    protectPage();
  }

})();
