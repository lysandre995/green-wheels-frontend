(async () => {
    localStorage.removeItem("authToken");
    window.location.hash = "#login";
    location.reload();
})();
