// js/generateLoadingScreen.js

// =========================================================
// PATREON ACCESS CHECK
// =========================================================

/**
 * Checks if the current user is a patron.
 * For paid books, this will redirect to the homepage if not authorized.
 * For free books, this check is skipped.
 * 
 * To mark a book as paid, add this before including the script:
 *   <script>window.IS_PAID_BOOK = true;</script>
 */
async function checkPatronAccess() {
    // Check if this is a paid book
    const isPaidBook = window.IS_PAID_BOOK === true;
    
    // If it's a free book, skip the check
    if (!isPaidBook) {
        console.log('📖 Free book - no Patreon check needed');
        return true;
    }
    
    console.log('🔒 Paid book - checking Patreon access...');
    
    try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        // Check if user is logged in and is a patron
        if (data.loggedIn && data.isPatron) {
            console.log('✅ Patron access granted for:', data.name);
            return true;
        }
        
        // Not authorized - show access denied and redirect
        console.log('❌ Patron access denied');
        
        // Replace the page with a nice access denied message
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:'Inter',sans-serif;text-align:center;padding:20px;background:#f8f5f0;margin:0;">
                <div style="max-width:500px;">
                    <h2 style="color:#FF424D;font-family:'EB_Garamond',serif;font-size:2.5rem;margin-bottom:12px;">🔒 Patreon Required</h2>
                    <p style="color:#555;margin:16px 0;font-size:1.1rem;">This book is only available to active patrons.</p>
                    ${data.loggedIn ? 
                        `<p style="color:#888;margin-bottom:20px;">You are logged in but not an active patron.</p>
                         <div>
                             <a href="https://www.patreon.com/akroomenois" target="_blank" style="display:inline-block;padding:12px 28px;background:#FF424D;color:white;text-decoration:none;border-radius:30px;margin-right:10px;">Become a Patron →</a>
                             <a href="/" style="display:inline-block;padding:12px 28px;background:#eee;color:#555;text-decoration:none;border-radius:30px;">Back to Library</a>
                         </div>` 
                        :
                        `<a href="/" style="display:inline-block;padding:12px 28px;background:#FF424D;color:white;text-decoration:none;border-radius:30px;">Back to Library</a>`
                    }
                </div>
            </div>
        `;
        
        // Redirect after 2 seconds (to give time to read the message)
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        
        return false;
        
    } catch (error) {
        console.error('❌ Access check failed:', error);
        // On error, redirect to homepage
        window.location.href = '/';
        return false;
    }
}

// =========================================================
// LOADING SCREEN
// =========================================================

const loadingHTML = `
  <div id="loadingScreen">
    <img src="images/akroomenois_logo_3_orange.svg" id="loadingLogo" alt="Logo">
    <div id="loadingStatus">
      <p id="loadingText">Loading…</p>
      <div id="loadingSpinner"></div>
    </div>
  </div>
`;

function injectLoadingScreen() {
  // Prevents duplicate injection if called twice
  if (!document.getElementById("loadingScreen") && document.body) {
    document.body.insertAdjacentHTML("afterbegin", loadingHTML);
  }
}

// =========================================================
// INITIALIZE
// =========================================================

// Run the access check first, then proceed with the loading screen
(async function init() {
    // Check patron access (this will redirect if unauthorized)
    const hasAccess = await checkPatronAccess();
    
    // If access denied, the page will be redirected, so we stop here
    if (!hasAccess) {
        return;
    }
    
    // If access granted, proceed with the loading screen
    console.log('🚀 Loading book...');
    
    // Inject immediately if body exists, otherwise wait for DOM ready
    if (document.body) {
        injectLoadingScreen();
    } else {
        document.addEventListener("DOMContentLoaded", injectLoadingScreen);
    }
})();
