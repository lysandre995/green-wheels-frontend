(async () => {
    // auth validation
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
        window.location.hash = "#login";
    }

    const manageResponse = async (response, responseType) => {
        let result;
        try {
            result = await response.json();
        } catch (e) {
            console.error(`Error getting ${responseType}`, e);
        }
        return result;
    };

    const getOfferedRides = async () => {
        const offereRidesResponse = await fetch("http://localhost:3000/offered-rides", {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (offereRidesResponse.ok) {
            return manageResponse(offereRidesResponse, "offered rides");
        }
    };

    const getReservations = async () => {
        const reservationsResponse = await fetch("http://localhost:3000/reservations", {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (reservationsResponse.ok) {
            return manageResponse(reservationsResponse, "reservations");
        }
    };

    const getAvailableRides = async () => {
        const avalableRidesResponse = await fetch("http://localhost:3000/rides", {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (avalableRidesResponse.ok) {
            return manageResponse(avalableRidesResponse, "available rides");
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

    try {
        // get offered rides
        const offeredRides = await getOfferedRides();

        let offeredRidesHtml = "";

        for (const or of offeredRides) {
            const date = new Date(or.dateTime);
            offeredRidesHtml += `
                <div class="ride-item">
                    <div><strong>Da:</strong> ${or.start.municipality}</div>
                    <div><strong>A:</strong> ${or.end.municipality}</div>
                    <div>
                        <strong>Data:</strong>
                        ${date.getDate().toString().padStart(2, "0")}/
                        ${(date.getMonth() + 1).toString().padStart(2, "0")}/
                        ${date.getFullYear()}
                        <strong>Ora:</strong>
                        ${date.getHours().toString().padStart(2, "0")}:
                        ${date.getMinutes().toString().padStart(2, "0")}
                    </div>
                    <button class="btn btn-sm btn-outline-danger" aria-label="Elimina corsa" style="align-self: center;">
                        <i class="ph ph-trash" aria-hidden="true"></i> Elimina
                    </button>
                </div>
`;
        }
        document.getElementById("offered-rides").innerHTML = offeredRidesHtml;

        // get available rides
        const avalableRides = await getAvailableRides();

        let avalableRidesHtml = "";

        for (const or of avalableRides) {
            const date = new Date(or.dateTime);
            avalableRidesHtml += `
                <div class="ride-item">
                    <span>Partenza da ${or.start.municipality}</span>
                    <span>Arrivo a ${or.end.municipality}</span>
                    <span>Data ${date.getDate().toString().padStart(2, "0")}/${date.getMonth().toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}</span>
                    <button class="btn btn-sm btn-outline-primary"><i class="ph ph-calendar-check"></i> Prenota</button>
                </div>`;
        }
        document.getElementById("available-rides").innerHTML = avalableRidesHtml;

        // get reservations
        const reservations = await getReservations();

        let reservationsHtml = "";

        for (const or of reservations) {
            const date = new Date(or.dateTime);
            reservationsHtml += `
                <div class="ride-item">
                    <span>Partenza da ${or.start.municipality}</span>
                    <span>Arrivo a ${or.end.municipality}</span>
                    <span>Data ${date.getDate().toString().padStart(2, "0")}/${date.getMonth().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().padStart(2, "0")}:${date.getMinutes().padStart(2, "0")}</span>
                    <div>
                        <button class="btn btn-sm btn-outline-success"><i class="ph ph-check-circle"></i> Accetta</button>
                        <button class="btn btn-sm btn-outline-danger"><i class="ph ph-x-circle"></i> Rifiuta</button>
                    </div>
                </div>`;
        }
        document.getElementById("reservations").innerHTML = reservationsHtml;
    } catch (e) {
        console.error(e);
    }
})();
