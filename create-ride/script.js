(async () => {
    const baseUrl = localStorage.getItem("baseUrl");

    // auth validation
    const authToken = localStorage.getItem("authToken");
    if (authToken === undefined || authToken === null) {
        window.location.hash = "#login";
    }

    try {
        const validateResponse = await fetch(`${baseUrl}/validate`, {
            method: "POST",
            body: JSON.stringify({ token: authToken })
        });

        if (!validateResponse.ok) {
            throw new Error("Invalid token");
        }
    } catch (e) {
        window.location.hash = "#login";
    }

    // Configure map
    const createMap = (containerId, label) => {
        // Create map
        const map = L.map(containerId).setView([41.9028, 12.4964], 13); // Centered on Rome

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        // Associated marker
        let marker = null;

        // Update marker
        function updateMarker(latlng) {
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker(latlng)
                .addTo(map)
                .bindPopup(`${label}: <br>Lat: ${latlng.lat}, Lng: ${latlng.lng}`)
                .openPopup();
        }

        // default click handling
        map.on("click", function (e) {
            updateMarker(e.latlng);
        });

        // Add search control
        L.Control.geocoder({
            defaultMarkGeocode: false
        })
            .on("markgeocode", function (e) {
                const latlng = e.geocode.center;
                map.setView(latlng, 16); // Center the map on the chosen location
                updateMarker(latlng);
            })
            .addTo(map);

        return { map, updateMarker };
    };

    const resolveLocationData = async (lat, lng) => {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            const municipality =
                data.address.city || data.address.town || data.address.village || "Municipality not available";
            const nation = data.address.country || "Nation not available";

            return { municipality, nation };
        } catch (error) {
            console.error("Error in reverse geocoding:", error);
        }
    };

    const submitRide = async (startCoords, endCoords, departureDT) => {
        const startLocationData = await resolveLocationData(startCoords.lat, startCoords.lng);
        const endLocationData = await resolveLocationData(endCoords.lat, endCoords.lng);
        const dateTime = departureDT;
        const ride = {
            start: {
                lat: startCoords.lat,
                lng: startCoords.lng,
                nation: startLocationData.nation,
                municipality: startLocationData.municipality
            },
            end: {
                lat: endCoords.lat,
                lon: endCoords.lng,
                nation: endLocationData.nation,
                municipality: endLocationData.municipality
            },
            dateTime
        };

        const response = await fetch(`${baseUrl}/ride`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ ride })
        });

        if (response.ok) {
            alert("Ride created");
            window.location.hash = "#home";
            return;
        }

        alert("Ride creation failed, retry later");
    };

    const checkSaveRideButton = (startCoordinates, endCoordinates, departureDateTime) => {
        const now = new Date().toISOString().slice(0, 16);
        if (startCoordinates && endCoordinates && departureDateTime && departureDateTime > now) {
            document.getElementById("save-ride").disabled = false;
        } else {
            document.getElementById("save-ride").disabled = true;
        }
    };

    const input = document.getElementById("departure-datetime");
    const now = new Date().toISOString().slice(0, 16);
    input.min = now;

    // Create start map
    const startMap = createMap("start-map", "Pick Up");
    // Create destination map
    const endMap = createMap("end-map", "Drop Off");

    let startCoordinates = null;
    let endCoordinates = null;
    let departureDateTime = null;

    startMap.map.on("click", e => {
        startMap.updateMarker(e.latlng);
        startCoordinates = e.latlng;
        checkSaveRideButton(startCoordinates, endCoordinates, departureDateTime);
    });

    endMap.map.on("click", e => {
        endMap.updateMarker(e.latlng);
        endCoordinates = e.latlng;
        checkSaveRideButton(startCoordinates, endCoordinates, departureDateTime);
    });

    document.getElementById("departure-datetime").addEventListener("change", event => {
        departureDateTime = event.target.value;
        checkSaveRideButton(startCoordinates, endCoordinates, departureDateTime);
    });

    document.getElementById("save-ride").addEventListener("click", async () => {
        await submitRide(startCoordinates, endCoordinates, departureDateTime);
    });
})();
