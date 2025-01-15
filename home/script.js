(async () => {
    // auth validation
    const authToken = localStorage.getItem("authToken");
    if (authToken === undefined || authToken === null) {
        window.location.hash = "#login";
    }

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

    const getOfferedRides = async () => {
        const offereRidesResponse = await fetch("http://localhost:3000/offered-rides", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (offereRidesResponse.ok) {
            return manageResponse(offereRidesResponse, "offered rides");
        }
    };

    const getReservations = async () => {
        const reservationsResponse = await fetch("http://localhost:3000/reservations", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (reservationsResponse.ok) {
            return manageResponse(reservationsResponse, "reservations");
        }
    };

    const getAvailableRides = async () => {
        const avalableRidesResponse = await fetch("http://localhost:3000/rides", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (avalableRidesResponse.ok) {
            return manageResponse(avalableRidesResponse, "available rides");
        }
    };

    const deleteRide = async rideId => {
        const deleteResponse = await fetch(`http://localhost:3000/ride/${rideId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (deleteResponse.ok) {
            return manageResponse(deleteResponse, `delete ride with id: ${rideId}`);
        }
    };

    const startRide = async rideId => {
        const startResponse = await fetch(`http://localhost:3000/ride-start`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ rideId })
        });
        if (startResponse.ok) {
            return manageResponse(startResponse, `start ride with id: ${rideId}`);
        }
    };

    const finishRide = async rideId => {
        const finishResponse = await fetch(`http://localhost:3000/ride-end`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ rideId })
        });
        if (finishResponse.ok) {
            return manageResponse(finishResponse, `finish ride with id: ${rideId}`);
        }
    };

    const bookRide = async rideId => {
        const bookResponse = await fetch("http://localhost:3000/reservation", {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ rideId })
        });
        if (bookResponse.ok) {
            return manageResponse(bookResponse, `book ride with id: ${rideId}`);
        }
    };

    const acceptReservation = async reservationId => {
        const acceptReservationResponse = await fetch("http://localhost:3000/reservation", {
            method: "PUT",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ reservationId })
        });
        if (acceptReservationResponse.ok) {
            return manageResponse(acceptReservationResponse, `accept reservation with id: ${reservationId}`);
        }
    };

    const refuseReservation = async reservationId => {
        const refuseReservationResponse = await fetch(`http://localhost:3000/reservation/${reservationId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (refuseReservationResponse.ok) {
            return manageResponse(refuseReservationResponse, `refuse reservation with id: ${reservationId}`);
        }
    };

    const getRideIsReserved = async rideId => {
        const isReservedResponse = await fetch(`http://localhost:3000/reservation/${rideId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (isReservedResponse.ok) {
            return manageResponse(isReservedResponse, `get if ride with id ${rideId} is reserved`);
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
            const deleteButton = `
                <button class="btn btn-sm btn-outline-danger" aria-label="Elimina corsa" data-id="${or.id}">
                    <i class="ph ph-trash" aria-hidden="true"></i> Elimina
                </button>`;
            const startButton = `
                <button class="btn btn-sm btn-outline-primary" aria-label="Inizia corsa" data-id="${or.id}">
                    <i class="ph ph-play" aria-hidden="true"></i> Start
                </button>
            `;
            const finishButton = `
                <button class="btn btn-sm btn-outline-danger" aria-label="Termina corsa" data-id="${or.id}">
                    <i class="ph ph-stop" aria-hidden="true"></i> Finish
                </button>
            `;
            let buttons = "";
            if (or.state === "Ready") {
                buttons = deleteButton + startButton;
            }
            if (or.state === "Started") {
                buttons = finishButton;
            }
            if (or.state === "Finished") {
                buttons = "";
            }
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
                    ${buttons}
                </div>`;
        }
        document.getElementById("offered-rides").innerHTML = offeredRidesHtml;

        // link delete functionality to the buttons
        const deleteButtons = document.querySelectorAll('button[aria-label="Elimina corsa"]');
        deleteButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const rideId = event.target.closest("button").getAttribute("data-id");
                await deleteRide(rideId);
                location.reload();
            });
        });
        const startButtons = document.querySelectorAll('button[aria-label="Inizia corsa"]');
        startButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const rideId = event.target.closest("button").getAttribute("data-id");
                await startRide(rideId);
                location.reload();
            });
        });
        const finishButtons = document.querySelectorAll('button[aria-label="Termina corsa"]');
        finishButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const rideId = event.target.closest("button").getAttribute("data-id");
                await finishRide(rideId);
                location.reload();
            });
        });

        // get available rides
        const avalableRides = await getAvailableRides();

        let avalableRidesHtml = "";

        for (const ar of avalableRides) {
            const date = new Date(ar.dateTime);
            const isReserved = (await getRideIsReserved(ar.id)).isReserved;
            let reservationButton =
                !isReserved ?
                    `<button class="btn btn-sm btn-outline-primary" aria-label="Prenota corsa" data-id="${ar.id}">
                    <i class="ph ph-calendar-plus"></i> Prenota
                </button>`
                :   `<button class="btn btn-sm btn-outline-secondary" aria-label="Prenota corsa" disabled data-id="${ar.id}">
                    <i class="ph ph-calendar-check"></i> Prenotato
                </button>`;
            if (ar.state !== "Ready") {
                reservationButton = "";
            }
            avalableRidesHtml += `
                <div class="ride-item">
                    <div><strong>Da:</strong> ${ar.start.municipality}</div>
                    <div><strong>A:</strong> ${ar.end.municipality}</div>
                    <div>
                        <strong>Data:</strong>
                        ${date.getDate().toString().padStart(2, "0")}/
                        ${(date.getMonth() + 1).toString().padStart(2, "0")}/
                        ${date.getFullYear()}
                        <strong>Ora:</strong>
                        ${date.getHours().toString().padStart(2, "0")}:
                        ${date.getMinutes().toString().padStart(2, "0")}
                    </div>
                    ${reservationButton}
                </div>`;
        }
        document.getElementById("available-rides").innerHTML = avalableRidesHtml;

        // link book functionality to the buttons
        const bookButtons = document.querySelectorAll('button[aria-label="Prenota corsa"]');
        bookButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const rideId = event.target.closest("button").getAttribute("data-id");
                await bookRide(rideId);
                location.reload();
            });
        });

        // get reservations
        const reservations = await getReservations();

        let reservationsHtml = "";

        for (const reservation of reservations) {
            const ride = offeredRides.find(or => {
                return or.id === reservation.rideId;
            });
            const date = new Date(ride.dateTime);
            const confirmationButton =
                !reservation.accepted ?
                    `<button class="btn btn-sm btn-outline-success" aria-label="Conferma prenotazione" data-id="${reservation.id}">
                    <i class="ph ph-check-circle"></i> Accetta
                </button>`
                :   "";
            reservationsHtml += `
                <div class="ride-item">
                    <div><strong>Da:</strong> ${ride.start.municipality}</div>
                    <div><strong>A:</strong> ${ride.end.municipality}</div>
                    <div>
                        <strong>Data:</strong>
                        ${date.getDate().toString().padStart(2, "0")}/
                        ${(date.getMonth() + 1).toString().padStart(2, "0")}/
                        ${date.getFullYear()}
                        <strong>Ora:</strong>
                        ${date.getHours().toString().padStart(2, "0")}:
                        ${date.getMinutes().toString().padStart(2, "0")}
                    </div>
                    <div>
                        ${confirmationButton}
                        <button class="btn btn-sm btn-outline-danger" aria-label="Rifuta prenotazione" data-id="${reservation.id}">
                            <i class="ph ph-x-circle"></i> Rifiuta
                        </button>
                    </div>
                </div>`;
        }
        document.getElementById("reservations").innerHTML = reservationsHtml;

        // link accept reservation functionality to the buttons
        const acceptReservationButtons = document.querySelectorAll('button[aria-label="Conferma prenotazione"]');
        acceptReservationButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const reservationId = event.target.closest("button").getAttribute("data-id");
                await acceptReservation(reservationId);
                location.reload();
            });
        });

        // link refuse reservation functionality to the buttons
        const refuseReservationButtons = document.querySelectorAll('button[aria-label="Rifuta prenotazione"]');
        refuseReservationButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const reservationId = event.target.closest("button").getAttribute("data-id");
                await refuseReservation(reservationId);
                location.reload();
            });
        });
    } catch (e) {
        console.error(e);
    }
})();
