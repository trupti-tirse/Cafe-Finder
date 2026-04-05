document.getElementById("Find-Cafe").addEventListener('click', () => {

    const location = document.getElementById("search-input").value.trim();

    if (location) {
        fetchLocationCoordinates(location);
    } 
    else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showCafeByPosition, showError);
    } 
    else {
        alert('Geolocation is not supported by the browser!');
    }

});

const fetchLocationCoordinates = (location) => {

    const nominatimEndpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;

    fetch(nominatimEndpoint)
        .then(response => response.json())
        .then(data => {

            if (data.length > 0) {
                const { lat, lon } = data[0];
                fetchCafes(lat, lon);
            } 
            else {
                alert('Location not found!');
            }

        })
        .catch(error => {
            console.log("Error fetching location:", error);
        });

};

const showCafeByPosition = (position) => {

    const { latitude, longitude } = position.coords;
    fetchCafes(latitude, longitude);

};

const fetchCafes = (latitude, longitude) => {

    const overpassEndpoint = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=cafe](around:5000,${latitude},${longitude});out;`;

    fetch(overpassEndpoint)
        .then(response => response.json())
        .then(data => {

            const cafes = data.elements;
            const cafesContainer = document.getElementById("Cafes");

            cafesContainer.innerHTML = "";

            if (cafes.length === 0) {
                cafesContainer.innerHTML = '<p>No cafes found nearby.</p>';
                return;
            }

            cafes.forEach(cafe => {

                const card = document.createElement("div");
                card.className = "Cafe-cards";

                card.innerHTML = `
                    <a href="https://www.openstreetmap.org/?mlat=${cafe.lat}&mlon=${cafe.lon}" target="_blank">
                        <h2>${cafe.tags.name || 'Unnamed Cafe'}</h2>
                    </a>

                    <p>${cafe.tags['addr:street'] || "Address not available"}</p>
                    <p>Lat: ${cafe.lat}, Lon: ${cafe.lon}</p>
                `;

                cafesContainer.appendChild(card);

            });

        })
        .catch(error => {
            console.log("Error fetching cafes:", error);
        });

};

const showError = (error) => {

    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied location access.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location unavailable.");
            break;
        case error.TIMEOUT:
            alert("Location request timed out.");
            break;
        default:
            alert("An unknown error occurred.");
            break;
    }

};