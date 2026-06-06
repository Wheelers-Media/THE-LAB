const catalog = [
    {
        id: "egr-ram-100",
        name: "Polar Diesel Complete EGR Delete Kit (2013-2018 Ram 6.7L Cummins)",
        makes: ["Ram"],
        category: "EGR",
        engine: "6.7L Cummins",
        years: [2013, 2018],
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
        engine: "6.7L Powerstroke",
        years: [2017, 2022],
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
        engine: "Universal",
        years: [2008, 2024],
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
        engine: "6.6L Duramax",
        years: [2017, 2023],
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
        engine: "6.7L Cummins",
        years: [2007, 2024],
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
        engine: "Universal",
        years: [2008, 2024],
        price: 399.99,
        image: "/assets/HPTuners-Logo.png",
        description: "The fastest and most powerful OBDII scanning and logging interface on the market. Connect to your vehicle, log data, read codes, and write custom calibrations engineered by THE LAB.",
        features: ["Pro Feature Set compatible", "Standalone data logging", "Bluetooth 5.0 connectivity", "Requires universal credits (sold separately)"],
        isPopular: true
    },
    {
        id: "pd-egr-101",
        name: "Polar Diesel 6.7L Cummins EGR Cooler Delete Kit",
        makes: ["Ram"],
        category: "EGR",
        engine: "6.7L Cummins",
        years: [2013, 2018],
        price: 349.99,
        image: "/assets/Polar-Diesel-Logo.webp",
        description: "Official Polar Diesel EGR Cooler Delete kit. High quality construction and direct fitment.",
        features: ["Billet Aluminum", "Includes all hardware", "Official Polar Diesel component"],
        isPopular: true
    },
    {
        id: "pd-exh-102",
        name: "Polar Diesel 5\" Exhaust System for Powerstroke",
        makes: ["Ford"],
        category: "Exhaust",
        engine: "6.7L Powerstroke",
        years: [2017, 2022],
        price: 899.99,
        image: "/assets/Polar-Diesel-Logo.webp",
        description: "Official Polar Diesel Exhaust System. Maximize flow and reduce EGTs.",
        features: ["409 Stainless Steel", "Mandrel bent", "Official Polar Diesel component"],
        isPopular: false
    },
    {
        id: "pd-ccv-103",
        name: "Polar Diesel L5P Duramax CCV Reroute",
        makes: ["Chevy"],
        category: "CCV",
        engine: "6.6L Duramax",
        years: [2017, 2023],
        price: 199.99,
        image: "/assets/Polar-Diesel-Logo.webp",
        description: "Official Polar Diesel CCV Reroute kit for L5P Duramax.",
        features: ["High quality hose", "Billet catch can", "Official Polar Diesel component"],
        isPopular: false
    },
    {
        id: "pd-tune-104",
        name: "Polar Diesel Custom Tuning Package",
        makes: ["Ford", "Ram", "Chevy"],
        category: "Tuning",
        engine: "Universal",
        years: [2008, 2024],
        price: 599.99,
        image: "/assets/Polar-Diesel-Logo.webp",
        description: "Official Polar Diesel calibration and tuning support.",
        features: ["Multiple power levels", "Optimized shifting", "Official Polar Diesel component"],
        isPopular: false
    },
    {
        id: "tune-l5p-hp",
        name: "L5P Duramax HP Tuners Hardware + Unlock + Credits + Tune",
        makes: ["Chevy"],
        category: "Tuning",
        engine: "6.6L Duramax",
        years: [2017, 2023],
        price: 3350.00,
        image: "/assets/HPTuners-Logo.png",
        description: "Complete tuning package for L5P Duramax. Includes HP Tuners MPVI3, ECM unlock, Universal Credits, and custom THE LAB calibration.",
        features: ["MPVI3 Interface", "ECM Unlock service", "Required Credits", "Custom AMDP tuning"],
        isPopular: true
    },
    {
        id: "tune-ps-17-19",
        name: "17-19 6.7L Powerstroke AutoAgent 3 package",
        makes: ["Ford"],
        category: "Tuning",
        engine: "6.7L Powerstroke",
        years: [2017, 2019],
        price: 2400.00,
        image: "/assets/EZ-Lynk-Logo.png",
        description: "EZ LYNK AutoAgent 3 complete package for 2017-2019 6.7L Powerstroke. Includes hardware, shift-on-the-fly switch, and lifetime support.",
        features: ["AutoAgent 3", "SOTF Switch", "Custom AMDP Tunes", "Live Diagnostics"],
        isPopular: true
    },
    {
        id: "tune-ps-20-22",
        name: "20-22 6.7L Powerstroke AutoAgent 3 package",
        makes: ["Ford"],
        category: "Tuning",
        engine: "6.7L Powerstroke",
        years: [2020, 2022],
        price: 3250.00,
        image: "/assets/EZ-Lynk-Logo.png",
        description: "EZ LYNK AutoAgent 3 complete package for 2020-2022 6.7L Powerstroke. ECM unlock included.",
        features: ["AutoAgent 3", "SOTF Switch", "ECM Unlock", "Custom AMDP Tunes"],
        isPopular: true
    },
    {
        id: "tune-l5p-20-22",
        name: "20-22 L5P 6.6L Duramax Tuning Package",
        makes: ["Chevy"],
        category: "Tuning",
        engine: "6.6L Duramax",
        years: [2020, 2022],
        price: 3350.00,
        image: "/assets/HPTuners-Logo.png",
        description: "Complete tuning solution for 2020-2022 L5P Duramax.",
        features: ["MPVI3 Interface", "T87A TCM Unlock", "Required Credits", "Custom AMDP tuning"],
        isPopular: true
    },
    {
        id: "acc-ford-701",
        name: "Gridiron Heavy-Duty Front Steel Bumper (2017-2022 Ford F-250/F-350)",
        makes: ["Ford"],
        category: "Accessories",
        engine: "6.7L Powerstroke",
        years: [2017, 2022],
        price: 2499.00,
        image: "/assets/GRIDIRON-logo.webp",
        description: "Designed and manufactured in Canada. This heavy-duty steel bumper offers unmatched front-end protection, featuring laser-cut precision fitment, integrated fog light mounts, and a durable black textured powder coat finish.",
        features: ["Severe duty 3/16\" steel construction", "Official Gridiron Dealer product", "Direct bolt-on fitment", "Includes heavy-duty shackle mounts"],
        isPopular: true
    },
    {
        id: "acc-ram-702",
        name: "Gridiron Extreme Grille Guard Front Bumper (2019-2024 Ram 2500/3500)",
        makes: ["Ram"],
        category: "Accessories",
        engine: "6.7L Cummins",
        years: [2019, 2024],
        price: 2699.00,
        image: "/assets/GRIDIRON-logo.webp",
        description: "Severe-duty front bumper with full wrap-around grille guard. Built for heavy-duty protection against wildlife and off-road obstacles. Canadian engineered for the toughest conditions.",
        features: ["Full grille & headlight protection", "1/4\" winch mount plate included", "Sensor-compatible design", "Durable powder coat finish"],
        isPopular: false
    },
    {
        id: "acc-chevy-703",
        name: "Gridiron Severe-Duty Rear Steel Bumper (2015-2019 Chevy/GMC 2500HD/3500HD)",
        makes: ["Chevy"],
        category: "Accessories",
        engine: "6.6L Duramax",
        years: [2015, 2019],
        price: 1899.00,
        image: "/assets/GRIDIRON-logo.webp",
        description: "Canadian-made heavy duty rear bumper. Offers reinforced tow hook mounts, integrated steps, and direct compatibility with factory backup sensors and trailer plugs.",
        features: ["Heavy-duty steps integrated into corners", "Sensor cutouts included", "Severe duty steel plate", "Made in Canada"],
        isPopular: false
    },
{
    "id": "acc-cfm-front",
    "name": "Gridiron 2015-2021 CF MOTO ZForce/UForce Front Bumper",
    "makes": [
        "CF Moto"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2015,
        2021
    ],
    "price": 1549.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Severe-duty front bumper designed specifically for CF Moto UTVs. Offers robust front-end protection, integrated light mounts, and a durable powder coat finish.",
    "features": [
        "Direct bolt-on installation",
        "Integrated accessory tabs",
        "Heavy-duty steel construction"
    ],
    "isPopular": true
},
{
    "id": "acc-cfm-rear",
    "name": "Gridiron 2015-2021 CF MOTO ZForce/UForce Rear Bumper",
    "makes": [
        "CF Moto"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2015,
        2021
    ],
    "price": 1049.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Heavy-duty rear steel bumper for CF Moto side-by-sides, designed to protect the cargo bed and frame during off-road operations.",
    "features": [
        "Protects rear bodywork and exhaust",
        "Rugged textured black powder coat",
        "Includes mount hardware"
    ],
    "isPopular": false
},
{
    "id": "acc-kw-base",
    "name": "GRIDIRON 2021-2026 Kenworth T680 - T880 Base Front Bumper",
    "makes": [
        "Kenworth"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2021,
        2026
    ],
    "price": 8999.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Severe-duty steel replacement bumper for Kenworth T680 and T880 semi-trucks. Offers maximum protection, integrated tow receiver, and impact resistance.",
    "features": [
        "High-tensile steel construction",
        "Integrated heavy tow hooks",
        "Laser-cut exact fitment"
    ],
    "isPopular": true
},
{
    "id": "acc-kw-bull",
    "name": "GRIDIRON 2021-2026 Kenworth T680 - T880 Bull-Bar Front Bumper",
    "makes": [
        "Kenworth"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2021,
        2026
    ],
    "price": 7499.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Severe-duty front bumper with a heavy-duty integrated bull bar for Kenworth highway and vocational commercial trucks.",
    "features": [
        "Full wrap protection",
        "Reinforced vertical uprights",
        "Brushed steel or black finish"
    ],
    "isPopular": false
},
{
    "id": "acc-exp-base",
    "name": "GRIDIRON 2018-2024 Ford Expedition Base Front Bumper",
    "makes": [
        "Ford"
    ],
    "category": "Accessories",
    "engine": "3.5L EcoBoost",
    "years": [
        2018,
        2024
    ],
    "price": 2549.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "High-clearance base steel bumper for Ford Expedition SUVs. Increases approach angle and provides severe duty protection.",
    "features": [
        "Aggressive high-clearance design",
        "3/16\" steel plate body",
        "Sensor-compatible mounting"
    ],
    "isPopular": false
},
{
    "id": "acc-exp-winch",
    "name": "GRIDIRON 2018-2024 Ford Expedition Base Winch Front Bumper",
    "makes": [
        "Ford"
    ],
    "category": "Accessories",
    "engine": "3.5L EcoBoost",
    "years": [
        2018,
        2024
    ],
    "price": 3099.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Severe-duty front steel winch bumper for 2018-2024 Ford Expedition. Supports winches up to 12,000 lbs.",
    "features": [
        "Integrated internal winch tray",
        "Reinforcing gussets",
        "Dual shackle tabs"
    ],
    "isPopular": true
},
{
    "id": "acc-exp-tube",
    "name": "GRIDIRON 2018-2024 Ford Expedition Full-Tube Front Bumper",
    "makes": [
        "Ford"
    ],
    "category": "Accessories",
    "engine": "3.5L EcoBoost",
    "years": [
        2018,
        2024
    ],
    "price": 3749.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Extreme wrap-around full-tube front bumper offering maximum protection for the grille and headlights on Ford Expedition.",
    "features": [
        "Heavy-wall DOM steel tubing",
        "Complete grille coverage",
        "Rugged off-road styling"
    ],
    "isPopular": false
},
{
    "id": "acc-exp-interceptor-full",
    "name": "GRIDIRON 2023-2026 Ford Expedition Interceptor Front Bumper (Grille Guard + Mounts + Center Tub + Wings + Headlight Guards)",
    "makes": [
        "Ford"
    ],
    "category": "Accessories",
    "engine": "3.5L EcoBoost",
    "years": [
        2023,
        2026
    ],
    "price": 3750.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Complete modular Interceptor bumper kit for 2023-2026 Ford Expedition. Fulfills law enforcement and severe-duty protection requirements.",
    "features": [
        "Full modular configuration",
        "Includes headlight guards and wings",
        "Center tub reinforced mounts",
        "Sensor compatible"
    ],
    "isPopular": true
},
{
    "id": "acc-exp-interceptor-mid",
    "name": "GRIDIRON 2023-2026 Ford Expedition Interceptor Front Bumper (Grille Guard + Mounts + Center Tub + Wings)",
    "makes": [
        "Ford"
    ],
    "category": "Accessories",
    "engine": "3.5L EcoBoost",
    "years": [
        2023,
        2026
    ],
    "price": 3550.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Modular Interceptor front bumper kit for Ford Expedition. Includes heavy duty grille guard, wings, and center mounts (headlight guards sold separately).",
    "features": [
        "Aggressive police-spec look",
        "Wings guard front fenders",
        "Textured black coat finish"
    ],
    "isPopular": false
},
{
    "id": "acc-exp-wings",
    "name": "Expedition Interceptor Bumper Wings",
    "makes": [
        "Ford"
    ],
    "category": "Accessories",
    "engine": "3.5L EcoBoost",
    "years": [
        2018,
        2026
    ],
    "price": 800.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Heavy-duty steel replacement wings for the modular Interceptor bumper line. Adds wrap-around fender guard protection.",
    "features": [
        "Left and right wings included",
        "Bolt-on expansion for center tub",
        "Matches bumper powder coat"
    ],
    "isPopular": false
},
{
    "id": "acc-exp-headlight",
    "name": "Expedition Interceptor Headlight Guards",
    "makes": [
        "Ford"
    ],
    "category": "Accessories",
    "engine": "3.5L EcoBoost",
    "years": [
        2018,
        2026
    ],
    "price": 500.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Headlight guard tubes that bolt on to the Interceptor bumper system, shielding the headlights from brush and debris.",
    "features": [
        "Bolt-on headlight tubes",
        "High strength steel fabrication",
        "Rust resistant e-coat"
    ],
    "isPopular": false
},
{
    "id": "acc-interceptor-tub",
    "name": "Interceptor Bumper Center Tub",
    "makes": [
        "Ford",
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2018,
        2026
    ],
    "price": 750.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "The structural center tub core for the Gridiron Interceptor modular bumper system. Serves as the primary winch and mount anchor.",
    "features": [
        "Heavy-duty winch tray standard",
        "Durable 1/4\" steel mounting frame",
        "Modular bolt holes"
    ],
    "isPopular": false
},
{
    "id": "acc-ram-94",
    "name": "GRIDIRON 1994.5-2002 Ram 2500/3500 Base Front Bumper",
    "makes": [
        "Ram"
    ],
    "category": "Accessories",
    "engine": "5.9L Cummins",
    "years": [
        1994,
        2002
    ],
    "price": 2549.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Replacement heavy-duty front steel bumper for 2nd Gen Ram diesel trucks. Solid plate design for severe duty utility.",
    "features": [
        "2nd Gen Ram specific fitment",
        "Includes lower valance skid",
        "Pre-drilled light mounts"
    ],
    "isPopular": false
},
{
    "id": "acc-ram-rear-94",
    "name": "GRIDIRON 1994.5-2002 Ram 2500/3500 Rear Bumper",
    "makes": [
        "Ram"
    ],
    "category": "Accessories",
    "engine": "5.9L Cummins",
    "years": [
        1994,
        2002
    ],
    "price": 2599.0,
    "image": "/assets/GRIDIRON-logo.webp",
    "description": "Match your front bumper with a heavy duty steel rear plate bumper for the 2nd Gen Ram Cummins.",
    "features": [
        "Reinforced receiver hitch access",
        "Shackle tabs included",
        "Matches front finish"
    ],
    "isPopular": false
},
{
    "id": "light-sd-20-ops",
    "name": "Speed Demon 20\" Dual Row Light Bar - DBC20 Black Ops",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 395.99,
    "image": "/assets/speed-demon.png",
    "description": "Speed Demon dual row 20-inch light bar with Black Ops dark reflector design. Delivers outstanding forward lighting with stealth aesthetics.",
    "features": [
        "Black Ops stealth plating",
        "Dual row high intensity LEDs",
        "IP67 waterproof rating",
        "Wiring harness included"
    ],
    "isPopular": true
},
{
    "id": "light-sd-30-hilux",
    "name": "Speed Demon 30\" Hi-Lux 2.0 Dual Row Light Bar",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 523.99,
    "image": "/assets/speed-demon.png",
    "description": "Next generation 30-inch Hi-Lux 2.0 dual row light bar. Features ultra-efficient optics for maximum distance throw.",
    "features": [
        "Hi-Lux 2.0 high efficiency reflectors",
        "Combines spot and flood beams",
        "Stainless steel hardware",
        "Thermal management technology"
    ],
    "isPopular": false
},
{
    "id": "light-sd-30-inf",
    "name": "Speed Demon 30\" Infinity Dual Row Light Bar",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 643.99,
    "image": "/assets/speed-demon.png",
    "description": "Premium Infinity series 30-inch dual row light bar, providing a seamless edge-to-edge light output and high-lumen density.",
    "features": [
        "Infinity edge-to-edge optics",
        "Vibration resistant mounts",
        "Breather valve prevents fogging"
    ],
    "isPopular": false
},
{
    "id": "light-sd-3-scene",
    "name": "Speed Demon 3\" Slim Scene Light Flush Mount",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 71.99,
    "image": "/assets/speed-demon.png",
    "description": "Perfect secondary or scene light. Flush mounts easily into bumpers, truck beds, or cargo boxes for wide-angle task lighting.",
    "features": [
        "Ultra slim flush-mount bezel",
        "120-degree flood beam pattern",
        "Rugged aluminum body"
    ],
    "isPopular": false
},
{
    "id": "light-sd-d20-pod",
    "name": "Speed Demon D20 LED Driving Light Pod DOT/SAE",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 108.99,
    "image": "/assets/speed-demon.png",
    "description": "SAE/DOT compliant driving pod. Legal for auxiliary high-beam use on public roads. Compact power.",
    "features": [
        "DOT/SAE certified for road use",
        "High-power projector optics",
        "Includes brackets"
    ],
    "isPopular": false
},
{
    "id": "light-sd-h1-harness",
    "name": "Speed Demon H1 Wiring Harness & Switch Kit",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 44.99,
    "image": "/assets/speed-demon.png",
    "description": "Plug-and-play wiring harness for a single light bar. Includes relay, inline fuse, and an illuminated dash switch.",
    "features": [
        "Deutsch DT connectors",
        "12V 40A heavy duty relay",
        "Pre-wired illuminated toggle switch"
    ],
    "isPopular": false
},
{
    "id": "light-sd-fog-adapter",
    "name": "Fog Light Adapter (Pair) Fits H11 10-30287",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 47.99,
    "image": "/assets/speed-demon.png",
    "description": "Converts H11 factory fog light plugs to Deutsch DT connectors. Allows easy connection of aftermarket LED pods without cutting factory wiring.",
    "features": [
        "Plug and play H11 to DT adapter",
        "Waterproof seals",
        "Sold as a pair"
    ],
    "isPopular": false
},
{
    "id": "light-sd-amber-cover",
    "name": "Amber Light Covers for 4PACK & Hi-Lux 2.0 Pod Lights 10-30027",
    "makes": [
        "Universal"
    ],
    "category": "Accessories",
    "engine": "Universal",
    "years": [
        2000,
        2030
    ],
    "price": 13.99,
    "image": "/assets/speed-demon.png",
    "description": "Protective polycarbonate amber lens cover for Speed Demon pods. Enhances visibility in dust, snow, or fog.",
    "features": [
        "Amber color filter",
        "Durable snap-on installation",
        "Protects main lens from rock chips"
    ],
    "isPopular": false
}
];

// Attach to window so other scripts can access it easily without modules for now
window.storeCatalog = catalog;
