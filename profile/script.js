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

    async function getProfile(userId) {
        const response = await fetch(`http://localhost:3000/profile/${userId}`, {
            headers: {"Authorization": `Bearer ${authToken}`}
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
    }

    async function createProfile(profile) {
        await fetch('http://localhost:3000/profile', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profile })
        });

        window.location.replace('login/index.html');
    }

    async function updateProfile(profile) {
        await fetch('http://localhost:3000/profile', {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profile })
        });

        window.location.replace('login/index.html');
    }

    async function deleteProfile(userId) {
        await fetch(`http://localhost:3000/profile/${userId}`, {
            method: 'DELETE',
            headers: {"Authorization": `Bearer ${authToken}`}
        });

        window.location.replace('login/index.html');
    }

    const profile = await getProfile(userId);
    const isEditing = !!profile;

    if (!profile) {
        profileInfo.textContent = 'Profile not found. Create one:';
        createProfileBtn.classList.remove('d-none');
    } else {
        profileInfo.textContent = 'Profile exists. You can update it below:';
        profileForm.classList.remove('d-none');

        document.getElementById('car-type').value = profile.car.type || '';
        document.getElementById('fuel-type').value = profile.car.fuel || '';
        document.getElementById('transmission-type').value = profile.car.transmission || '';
        document.getElementById('luxury').value = profile.car.luxury || '';
        document.getElementById('low-emission').value = profile.car.lowEmission || '';
        document.getElementById('accessibility').value = profile.car.disabilityAccessVehicle || '';
        document.getElementById('available-seats').value = profile.availableSeats || '';
        
        document.getElementById('smoke-on-board').value = profile.preferences.smokeOnBoard || '';
        document.getElementById('conversation').value = profile.preferences.conversation || '';
        document.getElementById('music').value = profile.preferences.music || '';
        document.getElementById('music-preference').value = profile.preferences.musicPreference || '';
        document.getElementById('pets').value = profile.preferences.pets || '';
        document.getElementById('temperature').value = profile.preferences.temperature || '';
        document.getElementById('breaks').value = profile.preferences.breaks || '';
        document.getElementById('speed').value = profile.preferences.speed || '';
        document.getElementById('luggage').value = profile.preferences.luggage || '';
        
        document.getElementById('travel-time').value = profile.travelTime || '';
    }

    createProfileBtn.addEventListener('click', () => {
        profileForm.classList.remove('d-none');
        createProfileBtn.classList.add('d-none');
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const profile = {
            id: Number(userId),
            car: {
                type: document.getElementById('car-type').value,
                fuel: document.getElementById('fuel-type').value,
                transmission: document.getElementById('transmission-type').value,
                luxury: document.getElementById('luxury').value,
                lowEmission: document.getElementById('low-emission').value,
                disabilityAccessVehicle: document.getElementById('accessibility')
            },
            availableSeats: document.getElementById('available-seats').value,
            preferences: {
                smokeOnBoard: document.getElementById('smoke-on-board').value,
                conversation: document.getElementById('conversation').value,
                music: document.getElementById('music').value,
                musicPreference: document.getElementById('music-preference').value,
                pets: document.getElementById('pets').value,
                temperature: document.getElementById('temperature').value,
                breaks: document.getElementById('breaks').value,
                speed: document.getElementById('speed').value,
                luggage: document.getElementById('luggage').value
            },
            travelTime: document.getElementById('travel-time').value
        };

        if (isEditing) {
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
});
