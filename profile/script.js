document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const profileInfo = document.getElementById('profile-info');
    const createProfileBtn = document.getElementById('create-profile-btn');
    const profileForm = document.getElementById('profile-form');
    const deleteProfileBtn = document.getElementById('delete-profile-btn');
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
    }).catch(_ => {
            window.location.href = "../login";
      });

    // Load enum data from the server or from an exposed configuration file
    async function loadEnums() {
        const response = await fetch('/enums'); // Endpoint that serves enum data
        if (response.ok) {
            const enums = await response.json();
            populateSelectOptions('car-type', enums.carTypes);
            populateSelectOptions('fuel-type', enums.fuelTypes);
            populateSelectOptions('transmission-type', enums.transmissionTypes);
            populateSelectOptions('travel-time', enums.travelTimes);
            populateSelectOptions('music-preference', enums.musicPreferences);
        }
    }

    function populateSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            select.appendChild(opt);
        });
    }

    async function getProfile(userId) {
        const response = await fetch(`/profile/${userId}`);
        if (response.ok) {
            const profile = await response.json();
            return profile;
        }
        return null;
    }

    async function createProfile(profile) {
        await fetch('/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profile })
        });
    }

    async function updateProfile(profile) {
        await fetch('/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profile })
        });
    }

    async function deleteProfile(userId) {
        await fetch(`/profile/${userId}`, {
            method: 'DELETE'
        });
    }

    const profile = await getProfile(userId);

    if (!profile) {
        profileInfo.textContent = 'Profile not found. Create one:';
        createProfileBtn.classList.remove('d-none');
    } else {
        profileInfo.textContent = 'Profile exists. You can update it below:';
        profileForm.classList.remove('d-none');
    }

    createProfileBtn.addEventListener('click', () => {
        profileForm.classList.remove('d-none');
        createProfileBtn.classList.add('d-none');
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const profile = {
            car: {
                type: document.getElementById('car-type').value,
                fuel: document.getElementById('fuel-type').value,
                transmission: document.getElementById('transmission-type').value,
                luxury: false,
                lowEmission: false,
                disabilityAccessVehicle: false
            },
            availableSeats: document.getElementById('available-seats').value,
            prefrences: {
                musicPreference: document.getElementById('music-preference').value,
                // Add other preferences here
            },
            travelTime: document.getElementById('travel-time').value
        };

        if (createProfileBtn.classList.contains('d-none')) {
            await updateProfile(profile);
        } else {
            await createProfile(profile);
        }

        profileInfo.textContent = 'Profile updated successfully';
    });

    deleteProfileBtn.addEventListener('click', async () => {
        await deleteProfile(userId);
        profileInfo.textContent = 'Profile deleted';
        profileForm.classList.add('d-none');
        createProfileBtn.classList.remove('d-none');
    });

    // Load enums to populate the form
    await loadEnums();
});
