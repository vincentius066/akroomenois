// js/generateLoadingScreen.js


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
