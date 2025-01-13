(async () => {
    // auth validation
    const authToken = localStorage.getItem("authToken");
    if (authToken === undefined || authToken === null) {
        window.location.hash = "#login";
    }

    const getUserName = async () => {
        const userNameResponse = await fetch("http://localhost:3000/user-name", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (userNameResponse.ok) {
            const userName = (await userNameResponse.json()).userName;
            return userName;
        }
    };

    const getUserIdFromUsername = async username => {
        const userIdResponse = await fetch(`http://localhost:3000/user-id/${username}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (userIdResponse.ok) {
            const userId = (await userIdResponse.json()).userId;
            return userId;
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

    const sendMessage = async message => {
        const sendMessageResponse = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ message })
        });
        if (sendMessageResponse.ok) {
            await manageResponse(sendMessageResponse, "send messages");
        }
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

    const userId = await getUserIdFromUsername("");
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
            document.getElementById("username-input").value = contact.name;
            renderMessages();
        });
        contactList.appendChild(li);
    });

    if (contacts.length > 0) {
        currentContactId = contacts[0].id;
        document.getElementById("username-input").value = contacts[0].name;
        renderMessages();
    }

    // message send
    chatForm.addEventListener("submit", async e => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        messageInput.value = "";

        let toId = contacts[currentContactId].id;
        const usernameInput = document.getElementById("username-input").value;
        if (usernameInput !== undefined && usernameInput !== null && usernameInput !== "") {
            toId = await getUserIdFromUsername(usernameInput);
        }

        if (toId === undefined || toId === null) {
            alert("Error: specified username doesn't exist");
            return;
        }

        const newMessage = {
            to: toId,
            message: messageText,
            dateTime: new Date().toISOString()
        };
        await sendMessage(newMessage);
        location.reload();
        // renderMessages();
    });
})();
