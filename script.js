document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        // Redirect to login page if no token is found
        window.location.replace('login/index.html');
    }

    fetch("http://localhost:3000/validate", {
        method: "POST",
        body: JSON.stringify({ token: authToken })
    }).then(response => {
        if (!response.ok) {
            throw new Error("Invalid token");
        }
        return response.json();
    }).then(data => {
            localStorage.userId = data.id
      }).catch(_ => {
            window.location.href = "/login";
      });
});