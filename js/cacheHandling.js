document.addEventListener('DOMContentLoaded', () => {
    const fullName = localStorage.getItem('fullName');
    const availability = localStorage.getItem('availability');
    const role = localStorage.getItem('role');

    if (fullName && availability && role) {
        updateUI(fullName, availability, role);
    }
});

export function updateUI(fullName, availability, role) {
    // Sjekk om vi er på 'min-side.html'
    if (window.location.pathname.includes('min_side.html')) {
        const fullNameElementTitle = document.getElementById("full_name_title");
        const availabilityElement = document.getElementById("availability_title");

        fullNameElementTitle.textContent = fullName;
        availabilityElement.textContent = availability;
        availabilityElement.style.color = getColorForAvailability(availabilityElement.textContent);
    }

    const fullNameElement = document.getElementById("full_name");
    const myProfile = document.getElementById("my-profile-logo");
    const myProfileContainer = document.getElementById("my-profile-container");

    myProfile.style.color = getColorForAvailability(availability);
    fullNameElement.textContent = fullName;
    myProfileContainer.style.display = "grid";

    // Vis admin-knappen hvis brukeren er admin
    if (role === 'admin') {
        showAdminElements();
    } else {
        hideAdminElements();
    }
}

function getColorForAvailability(availability) {
    switch (availability) {
        case "Tilgjengelig": 
            return "green";
        case "Delvis tilgjengelig": 
            return "orange";
        case "Jobber":
            return "orange";
        default: 
            return "red";
    }
}

function showAdminElements() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.style.display = 'grid';
    });
}

function hideAdminElements() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.style.display = 'none';
    });
}