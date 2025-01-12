(async () => {
    // auth validation
    const authToken = localStorage.getItem("authToken");
    if (authToken === undefined || authToken === null) {
        window.location.hash = "#login";
    }

    const getUserId = async () => {
        const userNameResponse = await fetch("http://localhost:3000/user-name", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (userNameResponse.ok) {
            const userName = (await userNameResponse.json()).userName;
            return userName;
        }
    };

    const manageResponse = async (response, responseType) => {
        let result;
        try {
            const text = await response.text();
            result = text !== undefined && text !== null && text !== "" ? JSON.parse(text) : null;
        } catch (e) {
            console.error(`Error operating ${responseType}`, e);
            alert("Operazione fallita");
        }
        return result;
    };

    const getMessages = async () => {
        const messagesResponse = await fetch("http://localhost:3000/chat", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (messagesResponse.ok) {
            return manageResponse(messagesResponse, "messages");
        }
    };

    const renderMessages = () => {
        messageFeed.innerHTML = "";
        const messages = conversations[currentContactId] || [];
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
    };

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

    const userId = await getUserId();
    let currentContactId = null;
    const chats = await getMessages();

    const contactList = document.getElementById("contact-list");
    const messageFeed = document.getElementById("message-feed");
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");

    const contacts = [
        ...new Map(
            chats
                .filter(msg => msg.from.id !== userId || msg.to.id !== userId)
                .map(msg => {
                    const contact = msg.from.id === userId ? msg.to : msg.from;
                    return [contact.id, { id: contact.id, name: contact.username, lastMessage: msg.dateTime }];
                })
        ).values()
    ];

    const conversations = {};
    chats.forEach(msg => {
        const contactId = msg.from.id === userId ? msg.to.id : msg.from.id;
        conversations[contactId] = conversations[contactId] || [];
        conversations[contactId].push({
            text: msg.message,
            timestamp: msg.dateTime,
            type: msg.from.id === userId ? "sent" : "received"
        });
    });

    // contacts
    contacts.forEach(contact => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>${contact.name}</span><small class="text-muted">${contact.lastMessage}</small>`;
        li.style.cursor = "pointer";
        li.addEventListener("click", () => {
            currentContactId = contact.id;
            document.getElementById("username-input").value = contact.userName;
            renderMessages();
        });
        contactList.appendChild(li);
    });

    if (contacts.length > 0) {
        currentContactId = contacts[0].id;
        document.getElementById("username-input").value = contacts[0].userName;
        renderMessages();
    }

    // message send
    chatForm.addEventListener("submit", e => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        messageInput.value = "";

        const newMessage = {
            text: messageText,
            timestamp: new Date().toISOString(),
            type: "sent"
        };
        conversations[currentContactId].push(newMessage);
        renderMessages();
    });
})();
