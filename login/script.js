(async () => {
    const loginForm = document.getElementById("login");

    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const data = {
                username: formData.get("username"),
                password: formData.get("password")
            };

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
                const responseJson = await response.json();
                if (responseJson.token) {
                    // Save token in localStorage
                    localStorage.setItem("authToken", responseJson.token);
                    window.location.hash = "#home";
                    location.reload();
                } else {
                    alert("Login failed: " + responseJson.message);
                }
            } catch (e) {
                console.error("Error logging in:", error);
            }
        });
    }
})();
