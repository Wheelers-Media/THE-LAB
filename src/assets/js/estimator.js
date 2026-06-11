const estimatorConfig = {
    detailing: {
        title: "Detailing Estimator",
        steps: [
            {
                id: 'vehicle_year',
                question: "What year is your vehicle?",
                type: 'text'
            },
            {
                id: 'vehicle_make',
                question: "What make is your vehicle? (e.g. Ford, Chevy, Ram)",
                type: 'text'
            },
            {
                id: 'vehicle_model',
                question: "What model is your vehicle? (e.g. F-350, Silverado 2500)",
                type: 'text'
            },
            {
                id: 'vehicle_size',
                question: "What size is your vehicle?",
                options: [
                    { label: "Car / Sedan", value: 1 },
                    { label: "Small SUV / Truck", value: 1.2 },
                    { label: "Large SUV / Minivan", value: 1.5 },
                    { label: "Semi Truck", value: 2.5 }
                ]
            },
            {
                id: 'package',
                question: "Which package are you interested in?",
                options: [
                    { label: "Standard (Entry Level)", basePrice: 149 },
                    { label: "De-Luxx (Signature)", basePrice: 279 },
                    { label: "Semi Interior (Heavy Duty)", basePrice: 500 }
                ]
            },
            {
                id: 'addons',
                question: "Any specific add-ons needed? (Select one)",
                options: [
                    { label: "None", addPrice: 0 },
                    { label: "Pet Hair Removal", addPrice: 50 },
                    { label: "Heavy Odour Elimination", addPrice: 100 }
                ]
            }
        ],
        calculate: (answers) => {
            let base = answers.package.basePrice * answers.vehicle_size.value;
            base += answers.addons.addPrice;
            return base;
        }
    },
    tinting: {
        title: "Window Tinting Estimator",
        steps: [
            {
                id: 'vehicle_year',
                question: "What year is your vehicle?",
                type: 'text'
            },
            {
                id: 'vehicle_make',
                question: "What make is your vehicle? (e.g. Ford, Chevy, Ram)",
                type: 'text'
            },
            {
                id: 'vehicle_model',
                question: "What model is your vehicle? (e.g. F-350, Silverado 2500)",
                type: 'text'
            },
            {
                id: 'coverage',
                question: "What coverage are you looking for?",
                options: [
                    { label: "Front 2 Windows", basePrice: 180 },
                    { label: "Full Vehicle", basePrice: 550 },
                    { label: "Windshield Brow Only", basePrice: 90 },
                    { label: "Full Windshield", basePrice: 180 }
                ]
            },
            {
                id: 'film_type',
                question: "Which film type do you prefer?",
                options: [
                    { label: "Standard Carbon", multiplier: 1 },
                    { label: "Premium Ceramic (Heat Rejection)", multiplier: 1.5 }
                ]
            }
        ],
        calculate: (answers) => {
            return answers.coverage.basePrice * answers.film_type.multiplier;
        }
    },
    coatings: {
        title: "Ceramic Coating Estimator",
        steps: [
            {
                id: 'vehicle_year',
                question: "What year is your vehicle?",
                type: 'text'
            },
            {
                id: 'vehicle_make',
                question: "What make is your vehicle? (e.g. Ford, Chevy, Ram)",
                type: 'text'
            },
            {
                id: 'vehicle_model',
                question: "What model is your vehicle? (e.g. F-350, Silverado 2500)",
                type: 'text'
            },
            {
                id: 'package',
                question: "Which coating package are you interested in?",
                options: [
                    { label: "1-Year Coating", basePrice: 800 },
                    { label: "5-Year Coating", basePrice: 1400 },
                    { label: "9-Year Coating", basePrice: 2200 }
                ]
            },
            {
                id: 'vehicle_size',
                question: "What size is your vehicle?",
                options: [
                    { label: "Car / Sedan", multiplier: 1 },
                    { label: "Small SUV / Truck", multiplier: 1.2 },
                    { label: "Large SUV / Rig", multiplier: 1.5 }
                ]
            },
            {
                id: 'paint_condition',
                question: "What condition is your paint currently in?",
                options: [
                    { label: "Brand New (Minor Prep)", addPrice: 0 },
                    { label: "Used (Needs 1-Step Correction)", addPrice: 300 },
                    { label: "Heavy Swirls (Needs 2-Step Correction)", addPrice: 600 }
                ]
            }
        ],
        calculate: (answers) => {
            return (answers.package.basePrice * answers.vehicle_size.multiplier) + answers.paint_condition.addPrice;
        }
    },
    ppf: {
        title: "Paint Protection Film Estimator",
        steps: [
            {
                id: 'vehicle_year',
                question: "What year is your vehicle?",
                type: 'text'
            },
            {
                id: 'vehicle_make',
                question: "What make is your vehicle? (e.g. Ford, Chevy, Ram)",
                type: 'text'
            },
            {
                id: 'vehicle_model',
                question: "What model is your vehicle? (e.g. F-350, Silverado 2500)",
                type: 'text'
            },
            {
                id: 'coverage',
                question: "What areas do you want protected?",
                options: [
                    { label: "Front Bumper Only", basePrice: 500 },
                    { label: "Partial Front Clip", basePrice: 900 },
                    { label: "Full Front Clip", basePrice: 1800 },
                    { label: "Full Body Protection", basePrice: 5000 }
                ]
            }
        ],
        calculate: (answers) => {
            return answers.coverage.basePrice;
        }
    },
    lighting: {
        title: "Custom Lighting Estimator",
        steps: [
            {
                id: 'vehicle_year',
                question: "What year is your vehicle?",
                type: 'text'
            },
            {
                id: 'vehicle_make',
                question: "What make is your vehicle? (e.g. Ford, Chevy, Ram)",
                type: 'text'
            },
            {
                id: 'vehicle_model',
                question: "What model is your vehicle? (e.g. F-350, Silverado 2500)",
                type: 'text'
            },
            {
                id: 'project_type',
                question: "What type of lighting project?",
                options: [
                    { label: "Custom Headlight Build", basePrice: 1200 },
                    { label: "Rock Lights (Underglow)", basePrice: 600 },
                    { label: "Wheel Rings", basePrice: 400 },
                    { label: "Cab Lights / Interior", basePrice: 300 }
                ]
            }
        ],
        calculate: (answers) => {
            return answers.project_type.basePrice;
        }
    }
};

let currentService = null;
let currentStepIndex = 0;
let userAnswers = {};

function initEstimatorModal() {
    if (document.getElementById('ai-estimator-modal')) return;

    const modalHTML = `
        <div id="ai-estimator-modal" class="fixed inset-0 z-[100] flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="closeEstimator()"></div>
            <div class="relative w-full max-w-lg mx-4 bg-[#0D0D12] border border-edge rounded-2xl shadow-[0_0_50px_rgba(0,102,255,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
                
                <!-- Header -->
                <div class="px-6 py-4 border-b border-edge flex items-center justify-between bg-black/50">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-labBlue/20 flex items-center justify-center border border-labBlue/50 relative">
                            <svg class="w-4 h-4 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#0D0D12]"></div>
                        </div>
                        <div>
                            <h3 id="estimator-title" class="font-bold text-white text-sm uppercase tracking-widest">LAB AI Estimator</h3>
                            <p class="text-[10px] text-labCyan font-mono">Online</p>
                        </div>
                    </div>
                    <button onclick="closeEstimator()" class="text-zinc-500 hover:text-white transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <!-- Chat Body -->
                <div id="estimator-body" class="p-6 overflow-y-auto flex-grow flex flex-col gap-6 custom-scrollbar relative">
                    <!-- Dynamic content goes here -->
                </div>

            </div>
        </div>
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E1E28; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0066FF; }
            
            .typing-indicator span {
                display: inline-block;
                width: 6px;
                height: 6px;
                background-color: #0066FF;
                border-radius: 50%;
                animation: typing 1.4s infinite both;
            }
            .typing-indicator span:nth-child(1) { animation-delay: 0s; }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
            .message-enter { animation: slideUpFade 0.4s ease-out forwards; }
            @keyframes slideUpFade {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openEstimator(serviceKey) {
    if (!estimatorConfig[serviceKey]) return;
    
    initEstimatorModal();
    
    currentService = estimatorConfig[serviceKey];
    currentStepIndex = 0;
    userAnswers = {};
    
    document.getElementById('estimator-title').innerText = currentService.title;
    
    const modal = document.getElementById('ai-estimator-modal');
    modal.classList.remove('hidden');
    // slight delay for transition
    setTimeout(() => {
        modal.classList.remove('opacity-0');
    }, 10);
    
    const body = document.getElementById('estimator-body');
    body.innerHTML = ''; // clear
    
    // Initial greeting
    addBotMessage(`Hi there! I'm the LAB's AI quoting assistant. Let's get you a quick estimate for ${currentService.title.replace(' Estimator', '')}.`);
    
    setTimeout(() => {
        renderStep();
    }, 1200);
}

function closeEstimator() {
    const modal = document.getElementById('ai-estimator-modal');
    if(modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            const body = document.getElementById('estimator-body');
            body.innerHTML = '';
        }, 300);
    }
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const html = `
        <div id="${id}" class="flex items-start gap-3 message-enter">
            <div class="w-8 h-8 rounded-full bg-labBlue/20 flex items-center justify-center border border-labBlue/50 flex-shrink-0 mt-1">
                <svg class="w-4 h-4 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div class="bg-edge text-zinc-300 p-3.5 rounded-2xl rounded-tl-sm text-sm border border-edge/50">
                <div class="typing-indicator flex gap-1 items-center h-4 px-1">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    const body = document.getElementById('estimator-body');
    body.insertAdjacentHTML('beforeend', html);
    body.scrollTop = body.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if(el) el.remove();
}

function addBotMessage(text) {
    const html = `
        <div class="flex items-start gap-3 message-enter">
            <div class="w-8 h-8 rounded-full bg-labBlue/20 flex items-center justify-center border border-labBlue/50 flex-shrink-0 mt-1">
                <svg class="w-4 h-4 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div class="bg-edge text-zinc-200 p-3.5 rounded-2xl rounded-tl-sm text-sm border border-white/5 leading-relaxed shadow-lg">
                ${text}
            </div>
        </div>
    `;
    const body = document.getElementById('estimator-body');
    body.insertAdjacentHTML('beforeend', html);
    body.scrollTop = body.scrollHeight;
}

function addUserMessage(text) {
    const html = `
        <div class="flex items-start gap-3 justify-end message-enter">
            <div class="bg-labBlue text-white p-3.5 rounded-2xl rounded-tr-sm text-sm shadow-[0_4px_20px_rgba(0,102,255,0.3)]">
                ${text}
            </div>
            <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 flex-shrink-0 mt-1">
                <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
        </div>
    `;
    const body = document.getElementById('estimator-body');
    body.insertAdjacentHTML('beforeend', html);
    body.scrollTop = body.scrollHeight;
}

function renderStep() {
    if (currentStepIndex >= currentService.steps.length) {
        finishEstimation();
        return;
    }
    
    const step = currentService.steps[currentStepIndex];
    
    const typingId = showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator(typingId);
        addBotMessage(step.question);
        
        if (step.type === 'text') {
            const optsContainerId = 'opts-' + Date.now();
            const html = `
                <div id="${optsContainerId}" class="flex flex-col gap-3 ml-11 message-enter">
                    <input type="text" id="text-input-${optsContainerId}" placeholder="e.g. 2024 Ford F-350" class="w-full bg-[#0D0D12] text-white text-sm px-4 py-3 rounded-xl border border-edge focus:border-labBlue focus:outline-none focus:ring-1 focus:ring-labBlue transition-all">
                    <button onclick="handleTextSubmit('${optsContainerId}')" class="w-full bg-labBlue text-white font-bold py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-blue-500 transition-all">
                        Submit
                    </button>
                </div>
            `;
            const body = document.getElementById('estimator-body');
            body.insertAdjacentHTML('beforeend', html);
            body.scrollTop = body.scrollHeight;
            
            step._optsContainerId = optsContainerId;
            
            // Add enter key support
            document.getElementById(`text-input-${optsContainerId}`).addEventListener('keypress', function (e) {
                if (e.key === 'Enter') handleTextSubmit(optsContainerId);
            });
            document.getElementById(`text-input-${optsContainerId}`).focus();

        } else {
            // render options
            const optionsHtml = step.options.map((opt, idx) => `
                <button onclick="handleOptionSelect(${idx})" class="w-full text-left p-4 rounded-xl border border-edge bg-black hover:border-labBlue hover:bg-labBlue/10 transition-all text-sm text-zinc-300 hover:text-white flex justify-between items-center group">
                    <span>${opt.label}</span>
                    <svg class="w-4 h-4 text-zinc-600 group-hover:text-labBlue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            `).join('');
            
            const optsContainerId = 'opts-' + Date.now();
            const html = `
                <div id="${optsContainerId}" class="flex flex-col gap-2 ml-11 message-enter">
                    ${optionsHtml}
                </div>
            `;
            
            const body = document.getElementById('estimator-body');
            body.insertAdjacentHTML('beforeend', html);
            body.scrollTop = body.scrollHeight;
            
            // save container id to remove it after selection
            step._optsContainerId = optsContainerId;
        }
        
    }, 1000);
}

function handleTextSubmit(containerId) {
    const input = document.getElementById(`text-input-${containerId}`);
    if (!input || !input.value.trim()) return;
    
    const step = currentService.steps[currentStepIndex];
    const val = input.value.trim();
    
    const container = document.getElementById(containerId);
    if(container) container.remove();
    
    addUserMessage(val);
    userAnswers[step.id] = { label: val };
    
    currentStepIndex++;
    
    const typingId = showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator(typingId);
        renderStep();
    }, 600);
}

function handleOptionSelect(optionIndex) {
    const step = currentService.steps[currentStepIndex];
    const selectedOption = step.options[optionIndex];
    
    // remove buttons
    const container = document.getElementById(step._optsContainerId);
    if(container) container.remove();
    
    addUserMessage(selectedOption.label);
    
    // save answer
    userAnswers[step.id] = selectedOption;
    
    currentStepIndex++;
    
    const typingId = showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator(typingId);
        renderStep();
    }, 600);
}

function finishEstimation() {
    const price = currentService.calculate(userAnswers);
    
    const typingId = showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator(typingId);
        
        addBotMessage(`Thanks! Based on your selections, your estimated cost is:<br><br><span class="text-3xl font-extrabold text-white font-heading">$${price.toFixed(2)}</span><br><br><span class="text-xs text-zinc-400">Note: This is an AI-generated estimate. Exact pricing is confirmed upon vehicle inspection.</span>`);
        
        const body = document.getElementById('estimator-body');
        const ctaHtml = `
            <div class="ml-11 mt-2 message-enter">
                <button onclick="loadBookingIframe()" class="w-full bg-white text-black font-extrabold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Book This Service
                </button>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', ctaHtml);
        body.scrollTop = body.scrollHeight;
        
    }, 1500);
}

function loadBookingIframe() {
    let queryParams = [];

    // Map Vehicle Info
    if (userAnswers['vehicle_year']) queryParams.push(`contact.contact_vehicle_year=${encodeURIComponent(userAnswers['vehicle_year'].label)}`);
    if (userAnswers['vehicle_make']) queryParams.push(`contact.contact_vehicle_make=${encodeURIComponent(userAnswers['vehicle_make'].label)}`);
    if (userAnswers['vehicle_model']) queryParams.push(`contact.contact_vehicle_model=${encodeURIComponent(userAnswers['vehicle_model'].label)}`);
    
    // Map Vehicle Size
    if (userAnswers['vehicle_size']) {
        const sizeMap = {
            "Car / Sedan": "Car",
            "Small SUV / Truck": "SUV",
            "Large SUV / Minivan": "Large SUV",
            "Large SUV / Rig": "Large SUV",
            "Semi Truck": "Off-Road"
        };
        const size = sizeMap[userAnswers['vehicle_size'].label];
        if (size) queryParams.push(`contact.vehicle_type=${encodeURIComponent(size)}`);
    }

    // Map Primary Service
    const serviceNameMap = {
        "Detailing Estimator": "Premium Detailing",
        "Window Tinting Estimator": "Window Tinting",
        "Ceramic Coating Estimator": "Ceramic Coating",
        "Paint Protection Film Estimator": "Paint Protection Film (PPF)",
        "Custom Lighting Estimator": "Custom Lighting"
    };
    const primaryService = serviceNameMap[currentService.title] || currentService.title.replace(' Estimator', '');
    queryParams.push(`contact.contact_primary_service_requested=${encodeURIComponent(primaryService)}`);

    // Map Service-Specific Packages and Options
    if (currentService.title === "Detailing Estimator") {
        const pkgMap = {
            "Standard (Entry Level)": "Standard Detail",
            "De-Luxx (Signature)": "De-Luxx Detail",
            "Semi Interior (Heavy Duty)": "Semi Interior (Sleeper/Day Cab)"
        };
        if (userAnswers['package'] && pkgMap[userAnswers['package'].label]) {
            queryParams.push(`contact.contact_detailing_package=${encodeURIComponent(pkgMap[userAnswers['package'].label])}`);
        }
        
        const addonMap = {
            "Pet Hair Removal": "Pet Hair Removal",
            "Heavy Odour Elimination": "Odour Elimination"
        };
        if (userAnswers['addons'] && addonMap[userAnswers['addons'].label]) {
            queryParams.push(`contact.contact_additional_protection=${encodeURIComponent(addonMap[userAnswers['addons'].label])}`);
        }
    }
    
    if (currentService.title === "Window Tinting Estimator") {
        const cov = userAnswers['coverage'] ? userAnswers['coverage'].label : '';
        const film = userAnswers['film_type'] ? userAnswers['film_type'].label : '';
        let tintPref = '';
        
        if (cov === "Front 2 Windows" && film === "Standard Carbon") tintPref = "Standard Carbon Tint (Front Roll-Ups) - $180";
        if (cov === "Front 2 Windows" && film === "Premium Ceramic (Heat Rejection)") tintPref = "Premium Ceramic Tint (Front Roll-Ups) - $260";
        if (cov === "Full Vehicle" && film === "Standard Carbon") tintPref = "Full Vehicle (Carbon) - $550 to $700";
        if (cov === "Full Vehicle" && film === "Premium Ceramic (Heat Rejection)") tintPref = "Full Vehicle (Ceramic) - $850 to $1,300";
        
        if (tintPref) queryParams.push(`contact.contact_window_tint_preference=${encodeURIComponent(tintPref)}`);
        
        if (cov === "Windshield Brow Only") queryParams.push(`contact.contact_tint_coverage_add_ons=${encodeURIComponent("Add Ceramic Windshield Brow ($90-$180)")}`);
        if (cov === "Full Windshield") queryParams.push(`contact.contact_tint_coverage_add_ons=${encodeURIComponent("Full Windshield")}`);
    }
    
    if (currentService.title === "Ceramic Coating Estimator") {
        const cPkgMap = {
            "1-Year Coating": "Standard Coat (1-Layer)",
            "5-Year Coating": "Elite Coat (2-Layer)",
            "9-Year Coating": "Graphene Elite (Multi-Layer / 7-Year)"
        };
        if (userAnswers['package'] && cPkgMap[userAnswers['package'].label]) {
            queryParams.push(`contact.contact_ceramic_package=${encodeURIComponent(cPkgMap[userAnswers['package'].label])}`);
        }
    }
    
    if (currentService.title === "Paint Protection Film Estimator") {
        const pPkgMap = {
            "Front Bumper Only": "Partial Front",
            "Partial Front Clip": "Partial Front",
            "Full Front Clip": "Full Front (Recommended)",
            "Full Body Protection": "Full Vehicle"
        };
        if (userAnswers['coverage'] && pPkgMap[userAnswers['coverage'].label]) {
            queryParams.push(`contact.contact_ppf_package=${encodeURIComponent(pPkgMap[userAnswers['coverage'].label])}`);
        }
    }
    
    if (currentService.title === "Custom Lighting Estimator") {
        const lMap = {
            "Custom Headlight Build": "Morimoto Headlight/Taillight Assemblies",
            "Rock Lights (Underglow)": "Off-Road & Auxiliary (Baja Designs / BMC)",
            "Wheel Rings": "Off-Road & Auxiliary (Baja Designs / BMC)",
            "Cab Lights / Interior": "Accent & Replacement Bulbs (Diode Dynamics)"
        };
        if (userAnswers['project_type'] && lMap[userAnswers['project_type'].label]) {
            queryParams.push(`contact.contact_lighting_upgrades=${encodeURIComponent(lMap[userAnswers['project_type'].label])}`);
        }
    }

    const queryString = queryParams.join('&');
    
    // Build a params object for postMessage relay
    const paramsObj = {};
    queryParams.forEach(p => {
        const [key, val] = p.split('=');
        paramsObj[key] = decodeURIComponent(val);
    });
    
    // Update parent URL so form_embed.js can read them
    const newUrl = window.location.pathname + '?' + queryString;
    window.history.replaceState({}, '', newUrl);
    
    // Replace the chat window with the booking widget
    const body = document.getElementById('estimator-body');
    body.innerHTML = `
        <div class="flex-grow w-full h-full flex flex-col message-enter">
            <div class="mb-4 text-center">
                <h3 class="font-bold text-white uppercase tracking-widest text-sm">Secure Booking</h3>
                <p class="text-xs text-zinc-500">Complete your details below</p>
            </div>
            <div class="w-full flex-grow rounded-xl overflow-hidden border border-edge bg-[#0D0D12] relative custom-scrollbar" id="ghl-iframe-container" style="min-height: 500px; overflow-y: auto;">
                <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600" id="ghl-loading-spinner">
                    <svg class="w-8 h-8 animate-spin text-labBlue" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-xs font-mono uppercase tracking-widest">Loading Form...</span>
                </div>
            </div>
        </div>
    `;

    const container = document.getElementById('ghl-iframe-container');
    const iframeSrc = 'https://api.leadconnectorhq.com/widget/booking/uCWyqHn7e5TTX1838aZi?' + queryString;
    
    // Set up postMessage listener BEFORE creating the iframe
    // This ensures we catch the GHL widget's "fetch-query-params" request
    const messageHandler = function(event) {
        if (!event.data || !Array.isArray(event.data)) return;
        const action = event.data[0];
        
        if (action === 'fetch-query-params') {
            // Respond with the query params, mimicking form_embed.js behavior
            const iframe = document.getElementById('ghl-booking-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                    ['query-params', paramsObj, window.location.href, document.referrer, 'uCWyqHn7e5TTX1838aZi'],
                    '*'
                );
            }
        }
        
        if (action === 'iframeLoaded') {
            // Hide the loading spinner
            const spinner = document.getElementById('ghl-loading-spinner');
            if (spinner) spinner.style.display = 'none';
        }
    };
    window.addEventListener('message', messageHandler);
    
    // Create the iframe element properly
    const iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.id = 'ghl-booking-iframe';
    iframe.style.cssText = 'width: 100%; height: 100%; min-height: 800px; border: none; position: relative; z-index: 10;';
    iframe.scrolling = 'yes';
    iframe.onload = function() {
        const spinner = document.getElementById('ghl-loading-spinner');
        if (spinner) spinner.style.display = 'none';
    };
    container.appendChild(iframe);
    
    // Also load form_embed.js as backup (it will handle iframeResizer etc.)
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);
}

// Global exposure
window.openEstimator = openEstimator;
