(async () => {
    // auth validation
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
        window.location.hash = "#login";
    }

    try {
        const validateResponse = await fetch("http://localhost:3000/validate", {
            method: "POST",
            body: JSON.stringify({ token: authToken })
        });

        if (!validateResponse.ok) {
            throw new Error("Invalid token");
        }
    } catch (e) {
        window.location.hash = "#login";
    }

    const contactList = document.getElementById("contact-list");
    const messageFeed = document.getElementById("message-feed");
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");

    // Simulazione di dati
    const contacts = [
        { name: "John Doe", lastMessage: "10:30 AM" },
        { name: "Jane Smith", lastMessage: "9:45 AM" },
        { name: "Mike Johnson", lastMessage: "Yesterday" }
    ];

    const messages = [
        { text: "Hello! How are you?", timestamp: "10:35 AM", type: "received" },
        { text: "I'm good, thanks! And you?", timestamp: "10:36 AM", type: "sent" }
    ];

    // contacts
    contacts.forEach(contact => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>${contact.name}</span><small class="text-muted">${contact.lastMessage}</small>`;
        contactList.appendChild(li);
    });

    // messages
    messages.forEach(message => {
        const div = document.createElement("div");
        div.className = `d-flex flex-column ${message.type === "sent" ? "align-self-end" : ""} mb-3`;
        div.innerHTML = `
      <div class="p-2 ${message.type === "sent" ? "bg-primary text-white" : "bg-light"} rounded" style="max-width: 75%;">
        <p class="mb-1">${message.text}</p>
    <small class="${message.type === "sent" ? "text-white" : "text-muted"}">${message.timestamp}</small>
      </div>
    `;
        messageFeed.appendChild(div);
    });
})();
