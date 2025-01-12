(async () => {
    // auth validation
    const authToken = localStorage.getItem("authToken");
    if (authToken === undefined || authToken === null) {
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

    const profileInfo = document.getElementById("profile-info");
    const createProfileBtn = document.getElementById("create-profile-btn");
    const profileForm = document.getElementById("profile-form");
    const deleteProfileBtn = document.getElementById("delete-profile-btn");

    const getProfile = async () => {
        const response = await fetch(`http://localhost:3000/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (response.ok) {
            let profile;
            try {
                profile = await response.json();
            } catch {
                console.error("No profile found");
            }
            return profile;
        }
        return null;
    };

    const createProfile = async profile => {
        await fetch("http://localhost:3000/profile", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ profile })
        });

        window.location.href = "#home";
    };

    const updateProfile = async profile => {
        await fetch("http://localhost:3000/profile", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ profile })
        });

        window.location.href = "#home";
    };

    const deleteProfile = async () => {
        await fetch(`http://localhost:3000/profile`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` }
        });

        window.location.href = "#home";
    };

    const profile = await getProfile();
    const isEditing = !!profile;

    if (!profile) {
        profileInfo.textContent = "Profile not found. Create one:";
        createProfileBtn.classList.remove("d-none");
    } else {
        profileInfo.textContent = "Profile exists. You can update it below:";
        profileForm.classList.remove("d-none");

        document.getElementById("car-type").value = profile.car.type || "";
        document.getElementById("fuel-type").value = profile.car.fuel || "";
        document.getElementById("transmission-type").value = profile.car.transmission || "";
        document.getElementById("luxury").checked = profile.car.luxury || "";
        document.getElementById("low-emission").checked = profile.car.lowEmission || "";
        document.getElementById("accessibility").checked = profile.car.disabilityAccessVehicle || "";
        document.getElementById("available-seats").value = profile.availableSeats || "";

        document.getElementById("smoke-on-board").checked = profile.preferences.smokeOnBoard || "";
        document.getElementById("conversation").checked = profile.preferences.conversation || "";
        document.getElementById("music").checked = profile.preferences.music || "";
        document.getElementById("music-preference").value = profile.preferences.musicPreference || "";
        document.getElementById("pets").checked = profile.preferences.pets || "";
        document.getElementById("temperature").value = profile.preferences.temperature || "";
        document.getElementById("breaks").value = profile.preferences.breaks || "";
        document.getElementById("speed").value = profile.preferences.speed || "";
        document.getElementById("luggage").value = profile.preferences.luggage || "";

        document.getElementById("travel-time").value = profile.travelTime || "";
    }

    createProfileBtn.addEventListener("click", () => {
        profileForm.classList.remove("d-none");
        createProfileBtn.classList.add("d-none");
    });

    profileForm.addEventListener("submit", async e => {
        e.preventDefault();
        const profile = {
            car: {
                type: document.getElementById("car-type").value,
                fuel: document.getElementById("fuel-type").value,
                transmission: document.getElementById("transmission-type").value,
                luxury: document.getElementById("luxury").checked,
                lowEmission: document.getElementById("low-emission").checked,
                disabilityAccessVehicle: document.getElementById("accessibility").checked
            },
            availableSeats: document.getElementById("available-seats").value,
            preferences: {
                smokeOnBoard: document.getElementById("smoke-on-board").checked,
                conversation: document.getElementById("conversation").checked,
                music: document.getElementById("music").checked,
                musicPreference: document.getElementById("music-preference").value,
                pets: document.getElementById("pets").checked,
                temperature: document.getElementById("temperature").value,
                breaks: document.getElementById("breaks").value,
                speed: document.getElementById("speed").value,
                luggage: document.getElementById("luggage").value
            },
            travelTime: document.getElementById("travel-time").value
        };

        if (isEditing) {
            await updateProfile(profile);
        } else {
            await createProfile(profile);
        }

        profileInfo.textContent = "Profile updated successfully";
    });

    deleteProfileBtn.addEventListener("click", async () => {
        await deleteProfile();
        profileInfo.textContent = "Profile deleted";
        profileForm.classList.add("d-none");
        createProfileBtn.classList.remove("d-none");
    });
})();
