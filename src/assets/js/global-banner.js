document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById("active-garage-banner");
    const nameStr = document.getElementById("active-vehicle-name");
    const btnClear = document.getElementById("vs-clear");

    let activeVehicle = null;
    try {
        const stored = sessionStorage.getItem('lab_active_vehicle');
        if (stored) {
            activeVehicle = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Could not parse vehicle from session", e);
    }

    if (activeVehicle && banner && nameStr) {
        banner.classList.remove("hidden");
        nameStr.textContent = `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.engine}`;
        const hero = document.getElementById("vehicle-selector-hero");
        if (hero) hero.classList.add("hidden");
    } else if (banner) {
        banner.classList.add("hidden");
        const hero = document.getElementById("vehicle-selector-hero");
        if (hero) hero.classList.remove("hidden");
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            sessionStorage.removeItem('lab_active_vehicle');
            activeVehicle = null;
            if (banner) banner.classList.add("hidden");
            
            // If we are on the catalog page, redirect to store landing page
            if (window.location.pathname.includes('/store/catalog')) {
                window.location.href = '/store/';
            } else {
                // For all other pages, reload to clear vehicle specific context if any
                window.location.reload();
            }
        });
    }
});
