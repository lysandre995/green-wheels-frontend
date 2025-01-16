(async () => {
    const baseUrl = localStorage.getItem("baseUrl");

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
        const offereRidesResponse = await fetch(`${baseUrl}/offered-rides`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (offereRidesResponse.ok) {
            return manageResponse(offereRidesResponse, "offered rides");
        }
    };

    const getReservations = async () => {
        const reservationsResponse = await fetch(`${baseUrl}/reservations`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (reservationsResponse.ok) {
            return manageResponse(reservationsResponse, "reservations");
        }
    };

    const getAvailableRides = async () => {
        const avalableRidesResponse = await fetch(`${baseUrl}/rides`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (avalableRidesResponse.ok) {
            return manageResponse(avalableRidesResponse, "available rides");
        }
    };

    const deleteRide = async rideId => {
        const deleteResponse = await fetch(`${baseUrl}/ride/${rideId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (deleteResponse.ok) {
            return manageResponse(deleteResponse, `delete ride with id: ${rideId}`);
        }
    };

    const startRide = async rideId => {
        const startResponse = await fetch(`${baseUrl}/ride-start`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ rideId })
        });
        if (startResponse.ok) {
            return manageResponse(startResponse, `start ride with id: ${rideId}`);
        }
    };

    const finishRide = async rideId => {
        const finishResponse = await fetch(`${baseUrl}/ride-end`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ rideId })
        });
        if (finishResponse.ok) {
            return manageResponse(finishResponse, `finish ride with id: ${rideId}`);
        }
    };

    const bookRide = async rideId => {
        const bookResponse = await fetch(`${baseUrl}/reservation`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ rideId })
        });
        if (bookResponse.ok) {
            return manageResponse(bookResponse, `book ride with id: ${rideId}`);
        }
    };

    const acceptReservation = async reservationId => {
        const acceptReservationResponse = await fetch(`${baseUrl}/reservation`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ reservationId })
        });
        if (acceptReservationResponse.ok) {
            return manageResponse(acceptReservationResponse, `accept reservation with id: ${reservationId}`);
        }
    };

    const refuseReservation = async reservationId => {
        const refuseReservationResponse = await fetch(`${baseUrl}/reservation/${reservationId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (refuseReservationResponse.ok) {
            return manageResponse(refuseReservationResponse, `refuse reservation with id: ${reservationId}`);
        }
    };

    const getRideIsReserved = async rideId => {
        const isReservedResponse = await fetch(`${baseUrl}/reservation/${rideId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (isReservedResponse.ok) {
            return manageResponse(isReservedResponse, `get if ride with id ${rideId} is reserved`);
        }
    };

    const getUserProfileInfo = async (userId, rideId) => {
        const userProfileResponse = await fetch(`${baseUrl}/user-info/${userId}/${rideId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (userProfileResponse.ok) {
            return manageResponse(userProfileResponse, `get profile info of user with id ${userId}`);
        }
    };

    const openDialog = userInfo => {
        const modalContent = document.querySelector("#user-info .modal-content");
        modalContent.innerHTML = `
          <h5>User Info</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Username:</strong> ${userInfo.username}</li>
            <li class="list-group-item"><strong>Average Rate:</strong> ${userInfo.averageRate}</li>
            <li class="list-group-item"><strong>Number of Evaluations:</strong> ${userInfo.numberOfEvaluations}</li>
            <li class="list-group-item"><strong>Car Type:</strong> ${userInfo.car.type}</li>
            <li class="list-group-item"><strong>Fuel Type:</strong> ${userInfo.car.fuel}</li>
            <li class="list-group-item"><strong>Transmission Type:</strong> ${userInfo.car.transmission}</li>
            ${userInfo.car.luxury ? '<li class="list-group-item"><strong>Luxury:</strong> Yes</li>' : ""}
            ${userInfo.car.lowEmission ? '<li class="list-group-item"><strong>Low Emission:</strong> Yes</li>' : ""}
            ${userInfo.car.disabilityAccessVehicle ? '<li class="list-group-item"><strong>Disability Access Vehicle:</strong> Yes</li>' : ""}
            <li class="list-group-item"><strong>Available Seats:</strong> ${userInfo.availableSeats}</li>
            ${userInfo.preferences.smokeOnBoard ? '<li class="list-group-item"><strong>Smoke On Board:</strong> Yes</li>' : ""}
            ${userInfo.preferences.conversation ? '<li class="list-group-item"><strong>Conversation:</strong> Yes</li>' : ""}
            ${userInfo.preferences.music ? '<li class="list-group-item"><strong>Music:</strong> Yes</li>' : ""}
            <li class="list-group-item"><strong>Music Preference:</strong> ${userInfo.preferences.musicPreference}</li>
            ${userInfo.preferences.pets ? '<li class="list-group-item"><strong>Pets Allowed:</strong> Yes</li>' : ""}
            <li class="list-group-item"><strong>Temperature Preference:</strong> ${userInfo.preferences.temperature}</li>
            <li class="list-group-item"><strong>Break Frequency:</strong> ${userInfo.preferences.breaks}</li>
            <li class="list-group-item"><strong>Speed:</strong> ${userInfo.preferences.speed}</li>
            <li class="list-group-item"><strong>Luggage:</strong> ${userInfo.preferences.luggage}</li>
            <li class="list-group-item"><strong>Preferred Travel Time:</strong> ${userInfo.travelTime}</li>
          </ul>
          <button class="close-button" id="closeModal">Close</button>`;

        const modal = document.getElementById("user-info");
        modal.style.display = "flex";
        const closeButton = document.getElementById("closeModal");

        closeButton.addEventListener("click", () => {
            modal.style.display = "none";
        });
    };

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

    try {
        // get offered rides
        const offeredRides = await getOfferedRides();

        let offeredRidesHtml = "";

        for (const or of offeredRides) {
            const date = new Date(or.dateTime);
            const deleteButton = `
                <button class="btn btn-sm btn-outline-danger" aria-label="Delete ride" data-id="${or.id}">
                    <i class="ph ph-trash" aria-hidden="true"></i> Delete
                </button>`;
            const startButton = `
                <button class="btn btn-sm btn-outline-primary" aria-label="Start ride" data-id="${or.id}">
                    <i class="ph ph-play" aria-hidden="true"></i> Start
                </button>
            `;
            const finishButton = `
                <button class="btn btn-sm btn-outline-danger" aria-label="End ride" data-id="${or.id}">
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
                <div class="ride-item mb-3 p-3 border rounded">
                    <div><strong>From:</strong> ${or.start.municipality}</div>
                    <div><strong>To:</strong> ${or.end.municipality}</div>
                    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start mt-2">
                        <strong>Date:</strong>
                        ${date.getDate().toString().padStart(2, "0")}/
                        ${(date.getMonth() + 1).toString().padStart(2, "0")}/
                        ${date.getFullYear()}
                        <strong>Time:</strong>
                        ${date.getHours().toString().padStart(2, "0")}:
                        ${date.getMinutes().toString().padStart(2, "0")}
                    </div>
                    ${buttons}
                </div>`;
        }
        document.getElementById("offered-rides").innerHTML = offeredRidesHtml;

        // link delete functionality to the buttons
        const deleteButtons = document.querySelectorAll('button[aria-label="Delete ride"]');
        deleteButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const rideId = event.target.closest("button").getAttribute("data-id");
                await deleteRide(rideId);
                location.reload();
            });
        });
        const startButtons = document.querySelectorAll('button[aria-label="Start ride"]');
        startButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const rideId = event.target.closest("button").getAttribute("data-id");
                await startRide(rideId);
                location.reload();
            });
        });
        const finishButtons = document.querySelectorAll('button[aria-label="End ride"]');
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
            const availableSeats = Number((await getUserProfileInfo(ar.driverId, ar.id)).availableSeats) ?? 0;
            let reservationButton =
                !isReserved && availableSeats > 0 ?
                    `<button class="btn btn-sm btn-outline-primary" aria-label="Book ride" data-id="${ar.id}">
                    <i class="ph ph-calendar-plus"></i> Book
                </button>`
                :   `<button class="btn btn-sm btn-outline-secondary" aria-label="Book ride" disabled data-id="${ar.id}">
                    <i class="ph ph-${availableSeats > 0 ? "calendar-check" : "users-three"}"></i> ${availableSeats > 0 ? "Booked" : "At capacity"}
                </button>`;
            if (ar.state !== "Ready") {
                reservationButton = "";
            }
            avalableRidesHtml += `
                <div class="ride-item mb-3 p-3 border rounded">
                    <div><strong>From:</strong> ${ar.start.municipality}</div>
                    <div><strong>To:</strong> ${ar.end.municipality}</div>
                    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start mt-2">
                        <strong>Date:</strong>
                        ${date.getDate().toString().padStart(2, "0")}/
                        ${(date.getMonth() + 1).toString().padStart(2, "0")}/
                        ${date.getFullYear()}
                        <strong>Time:</strong>
                        ${date.getHours().toString().padStart(2, "0")}:
                        ${date.getMinutes().toString().padStart(2, "0")}
                    </div>
                    ${reservationButton}
                    <button class="btn btn-sm btn-outline-secondary" aria-label="Show profile" data-id="${ar.driverId}" ride-id="${ar.id}">
                        <i class="ph ph-user"></i> Profile
                    </button>
                </div>`;
        }
        document.getElementById("available-rides").innerHTML = avalableRidesHtml;

        // link book functionality to the buttons
        const bookButtons = document.querySelectorAll('button[aria-label="Book ride"]');
        bookButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const rideId = event.target.closest("button").getAttribute("data-id");
                await bookRide(rideId);
                location.reload();
            });
        });
        const profileButtons = document.querySelectorAll('button[aria-label="Show profile"]');
        profileButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const userId = event.target.closest("button").getAttribute("data-id");
                const rideId = event.target.closest("button").getAttribute("ride-id");
                const userProfileInfo = await getUserProfileInfo(userId, rideId);
                openDialog(userProfileInfo);
            });
        });

        // get reservations
        const reservations = await getReservations();

        let reservationsHtml = "";

        for (const reservation of reservations) {
            const ride = offeredRides.find(or => {
                return or.id === reservation.rideId;
            });
            if (ride.state === "Concluded") {
                continue;
            }
            const date = new Date(ride.dateTime);
            const confirmationButton =
                !reservation.accepted ?
                    `<button class="btn btn-sm btn-outline-success" aria-label="Accept reservation" data-id="${reservation.id}">
                    <i class="ph ph-check-circle"></i> Accept
                </button>`
                :   "";
            reservationsHtml += `
                <div class="ride-item mb-3 p-3 border rounded">
                    <div><strong>From:</strong> ${ride.start.municipality}</div>
                    <div><strong>To:</strong> ${ride.end.municipality}</div>
                    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start mt-2">
                        <strong>Date:</strong>
                        ${date.getDate().toString().padStart(2, "0")}/
                        ${(date.getMonth() + 1).toString().padStart(2, "0")}/
                        ${date.getFullYear()}
                        <strong>Time:</strong>
                        ${date.getHours().toString().padStart(2, "0")}:
                        ${date.getMinutes().toString().padStart(2, "0")}
                    </div>
                    <div>
                        ${confirmationButton}
                        <button class="btn btn-sm btn-outline-danger" aria-label="Decline reservation" data-id="${reservation.id}">
                            <i class="ph ph-x-circle"></i> Decline
                        </button>
                    </div>
                </div>`;
        }
        document.getElementById("reservations").innerHTML = reservationsHtml;

        // link accept reservation functionality to the buttons
        const acceptReservationButtons = document.querySelectorAll('button[aria-label="Accept reservation"]');
        acceptReservationButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const reservationId = Number(event.target.closest("button").getAttribute("data-id"));
                await acceptReservation(reservationId);
                location.reload();
            });
        });

        // link refuse reservation functionality to the buttons
        const refuseReservationButtons = document.querySelectorAll('button[aria-label="Decline reservation"]');
        refuseReservationButtons.forEach(button => {
            button.addEventListener("click", async event => {
                const reservationId = Number(event.target.closest("button").getAttribute("data-id"));
                await refuseReservation(reservationId);
                location.reload();
            });
        });
    } catch (e) {
        console.error(e);
    }
})();
