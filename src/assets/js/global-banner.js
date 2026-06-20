document.addEventListener('DOMContentLoaded', () => {
    let activeVehicle = null;
    try {
        const stored = sessionStorage.getItem('lab_active_vehicle');
        if (stored) {
            activeVehicle = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Could not parse vehicle from session", e);
    }

    const hero = document.getElementById("vehicle-selector-hero");
    
    if (activeVehicle) {
        if (hero) hero.classList.add("hidden");
    } else {
        if (hero) hero.classList.remove("hidden");
    }
});
