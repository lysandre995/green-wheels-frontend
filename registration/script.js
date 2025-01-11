(async () => {
    // Populate community dropdown
    fetch("http://localhost:3000/communities")
        .then(response => response.json())
        .then(communities => {
            const communitySelect = document.getElementById("community");
            communitySelect.innerHTML = '<option value="">None</option>'; // Option for empty value
            communities.forEach(community => {
                const option = document.createElement("option");
                option.value = community.id; // Or community.name depending on the response structure
                option.textContent = community.name;
                communitySelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching communities:", error));

    // Function to validate email using a regex
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to validate password strength
    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }

    // Handle form submission
    document.getElementById("register-form").addEventListener("submit", event => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(event.target);
        const data = { user: Object.fromEntries(formData.entries()) };

        // Validate email and password
        if (!validateEmail(data.user.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!validatePassword(data.user.password)) {
            alert(
                "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
            );
            return;
        }

        // Submit form data if validations pass
        fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    // Handle successful registration
                    alert("Registration successful!");
                    window.location.hash = "#login"; // Redirect to login page
                } else {
                    // Handle registration error
                    alert("Registration failed!");
                }
            })
            .catch(error => {
                console.error("Error registering:", error);
                alert("Registration failed!");
            });
    });
})();
