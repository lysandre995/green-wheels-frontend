const routes = {
    home: {
        html: "home/content.html",
        script: "home/script.js"
    },
    login: {
        html: "login/content.html",
        script: "login/script.js"
    },
    logout: {
        html: "logout/content.html",
        script: "logout/script.js"
    },
    registration: {
        html: "registration/content.html",
        script: "registration/script.js"
    },
    profile: {
        html: "profile/content.html",
        script: "profile/script.js"
    },
    "create-ride": {
        html: "create-ride/content.html",
        script: "create-ride/script.js"
    },
    chat: {
        html: "chat/content.html",
        script: "chat/script.js"
    }
};

const loadRoute = async route => {
    const routeInfo = routes[route] || routes.home;
    const mainContent = document.getElementById("main-content");

    if (routeInfo.html) {
        try {
            const response = await fetch(routeInfo.html);
            const content = await response.text();
            mainContent.innerHTML = content;
        } catch (error) {
            mainContent.innerHTML = "<p>Error loading page content.</p>";
        }
    } else {
        mainContent.innerHTML = "<p>Welcome to Green Wheels!</p>";
    }

    if (routeInfo.script) {
        const scriptElement = document.createElement("script");
        scriptElement.src = routeInfo.script;
        document.body.appendChild(scriptElement);
    }
};

window.addEventListener("hashchange", () => {
    const route = window.location.hash.slice(1);
    loadRoute(route);
});

const initialRoute = window.location.hash.slice(1) || "home";
loadRoute(initialRoute);

(async () => {
    const authToken = localStorage.getItem("authToken");
    const userNameResponse = await fetch("http://localhost:3000/user-name", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` }
    });
    if (userNameResponse.ok) {
        const userName = (await userNameResponse.json()).userName;
        document.getElementById("current-user").innerHTML = `<strong>Welcome, ${userName}</strong>`;
        return;
    }
    document.getElementById("current-user").innerHTML = "";
})();
