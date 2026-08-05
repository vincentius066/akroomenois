(function () {
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

  // Inject immediately if body exists, otherwise wait for DOM ready
  if (document.body) {
    injectLoadingScreen();
  } else {
    document.addEventListener("DOMContentLoaded", injectLoadingScreen);
  }
})();
