const catalog = [
    {
        id: "egr-ram-100",
        name: "Polar Diesel Complete EGR Delete Kit (2013-2018 Ram 6.7L Cummins)",
        makes: ["Ram"],
        category: "EGR",
        price: 349.99,
        image: "https://placehold.co/600x400/0D0D12/1E1E28?text=Polar+Diesel+EGR+Kit",
        description: "A complete, high-quality block-off kit designed specifically for the 6.7L Cummins. Eliminates carbon buildup in the intake manifold, lowers coolant temperatures, and restores efficiency.",
        features: ["Billet aluminum block-off plates", "Includes high-temp gaskets and hardware", "Reduces coolant temperatures", "Requires custom tuning"],
        isPopular: true
    },
    {
        id: "exh-ford-200",
        name: "5-Inch Turbo-Back Exhaust System (2017-2022 Ford 6.7L Powerstroke)",
        makes: ["Ford"],
        category: "Exhaust",
        price: 999.00,
        image: "https://placehold.co/600x400/0D0D12/1E1E28?text=Turbo-Back+Exhaust",
        description: "Mandrel-bent stainless steel exhaust system that provides maximum flow and an aggressive sound profile. Eliminates restrictive factory components for improved performance and lower EGTs.",
        features: ["5-inch 409 stainless steel tubing", "No muffler or straight-pipe design", "Bolt-on installation", "Requires custom tuning"],
        isPopular: true
    },
    {
        id: "tune-ez-300",
        name: "EZ LYNK AutoAgent 3 with Custom Tuning Package",
        makes: ["Ford", "Ram", "Chevy"],
        category: "Tuning",
        price: 1399.00,
        image: "/assets/EZ-Lynk-Logo.png",
        description: "The ultimate cloud-based tuning platform. Monitor live data, receive custom tune files instantly over Wi-Fi, and flash your ECU directly from your smartphone. Includes 4 custom power levels (Tow, Street, Performance, Max).",
        features: ["Live vehicle telemetry via iOS/Android", "Switch-on-the-fly (SOTF) capable", "Read and clear diagnostic codes", "Includes custom AMDP tuning support"],
        isPopular: true
    },
    {
        id: "egr-chevy-400",
        name: "L5P Duramax EGR Solution Kit (2017-2023 Chevy/GMC 6.6L)",
        makes: ["Chevy"],
        category: "EGR",
        price: 415.00,
        image: "https://placehold.co/600x400/0D0D12/1E1E28?text=L5P+EGR+Kit",
        description: "Prevent soot from clogging your intake grid heater and valves. This complete hardware kit removes the factory EGR cooler circuit safely and reliably.",
        features: ["CNC machined components", "Coolant reroute included", "Eliminates soot ingestion", "Requires ECM unlock and tuning"],
        isPopular: false
    },
    {
        id: "ccv-ram-500",
        name: "Open CCV Reroute Kit (2007.5-2024 Ram 6.7L Cummins)",
        makes: ["Ram"],
        category: "CCV",
        price: 189.99,
        image: "https://placehold.co/600x400/0D0D12/1E1E28?text=CCV+Reroute",
        description: "Bypasses the factory crankcase vent filter and routes blow-by gases to the atmosphere. Prevents oil residue from coating the turbo compressor wheel and intercooler piping.",
        features: ["Billet aluminum catch can", "Oil-resistant heavy-duty hose", "Maintenance-free design", "Extends turbo life"],
        isPopular: false
    },
    {
        id: "tune-hp-600",
        name: "HP Tuners MPVI3 - Master Tuning Interface",
        makes: ["Ford", "Chevy", "Ram"],
        category: "Tuning",
        price: 399.99,
        image: "/assets/HPTuners-Logo.png",
        description: "The fastest and most powerful OBDII scanning and logging interface on the market. Connect to your vehicle, log data, read codes, and write custom calibrations engineered by THE LAB.",
        features: ["Pro Feature Set compatible", "Standalone data logging", "Bluetooth 5.0 connectivity", "Requires universal credits (sold separately)"],
        isPopular: true
    }
];

// Attach to window so other scripts can access it easily without modules for now
window.storeCatalog = catalog;
