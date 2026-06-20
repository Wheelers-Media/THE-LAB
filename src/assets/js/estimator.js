const estimatorConfig = {
    detailing: {
        title: "Detailing Estimator",
        steps: [
            {
                id: 'vehicle_info',
                question: "What is the year, make, and model of your vehicle?",
                placeholder: "e.g., 2022 Ford F-150",
                type: 'text'
            },
            {
                id: 'focus',
                question: "What's your focus for this visit?",
                options: [
                    { id: 'interior', label: "Interior Focus — Deep clean inside" },
                    { id: 'exterior', label: "Exterior Focus — Paint, wheels, protection" },
                    { id: 'complete', label: "Complete Transformation — Full In & Out" }
                ]
            },
            {
                id: 'tier',
                question: "Which tier are you looking at?",
                options: [
                    { id: 'standard', label: "Standard — Essential clean" },
                    { id: 'deluxx',   label: "De-Luxx / Signature — Full restoration" }
                ]
            },
            {
                id: 'vehicle_size',
                question: "What is the size of your vehicle?",
                options: [
                    { label: "Small — 5 or 6 Seat SUV / Truck", value: "small" },
                    { label: "Large — 7 or 8 Seat SUV / Van",   value: "large" }
                ]
            },
            {
                id: 'addons',
                question: "Any specific add-ons needed?",
                options: [
                    { label: "None",                      addPrice: 0   },
                    { label: "Vehicle Deodorizer",        addPrice: 70  },
                    { label: "Heavy Odour Elimination",   addPrice: 100 }
                ]
            }
        ],
        calculate: (answers) => {
            const focus = answers.focus.id;
            const tier  = answers.tier.id;
            const size  = answers.vehicle_size.value;
            const pricing = {
                interior: { standard: { small: 249, large: 279 }, deluxx: { small: 379, large: 429 } },
                exterior: { standard: { small: 149, large: 179 }, deluxx: { small: 249, large: 299 } },
                complete: { standard: { small: 329, large: 379 }, deluxx: { small: 499, large: 579 } }
            };
            const base = (pricing[focus] && pricing[focus][tier] && pricing[focus][tier][size]) ? pricing[focus][tier][size] : 0;
            return base + (answers.addons.addPrice || 0);
        }
    },
    tinting: {
        title: "Window Tinting Estimator",
        steps: [
            {
                id: 'vehicle_info',
                question: "What is the year, make, and model of your vehicle?",
                placeholder: "e.g., 2019 Ford F-350",
                type: 'text'
            },
            {
                id: 'vehicle_style',
                question: "What style of vehicle do you have?",
                options: [
                    { label: "Sedan / Coupe", value: "sedan" },
                    { label: "Crew Cab Truck", value: "truck" },
                    { label: "SUV / Crossover", value: "suv" }
                ]
            },
            {
                id: 'coverage',
                question: "What coverage are you looking for?",
                options: [
                    { label: "Front 2 Windows", value: "front2" },
                    { label: "Full Vehicle (All Side & Rear Windows)", value: "full_vehicle" },
                    { label: "Windshield Brow Only", value: "brow" },
                    { label: "Full Windshield", value: "windshield" },
                    { label: "Standard Sunroof", value: "sunroof" }
                ]
            },
            {
                id: 'film_type',
                question: "Which film type do you prefer?",
                options: [
                    { label: "Standard Carbon", value: "carbon" },
                    { label: "Premium Ceramic (IR Heat Rejection)", value: "ceramic" }
                ]
            }
        ],
        calculate: (answers) => {
            const style = answers.vehicle_style.value;
            const coverage = answers.coverage.value;
            const film = answers.film_type.value;
            
            if (film === 'carbon') {
                if (coverage === 'front2') return 180;
                if (coverage === 'brow') return 90;
                if (coverage === 'windshield') return 280;
                if (coverage === 'sunroof') return 100;
                if (coverage === 'full_vehicle') {
                    if (style === 'sedan') return 500;
                    if (style === 'truck') return 625;
                    if (style === 'suv') return 700;
                }
            } else if (film === 'ceramic') {
                if (coverage === 'front2') return 260;
                if (coverage === 'brow') return 130;
                if (coverage === 'windshield') return 300;
                if (coverage === 'sunroof') return 150;
                if (coverage === 'full_vehicle') {
                    if (style === 'sedan') return 700;
                    if (style === 'truck') return 850;
                    if (style === 'suv') return 900;
                }
            }
            return 0;
        }
    },
    coatings: {
        title: "Ceramic Coating Estimator",
        steps: [
            {
                id: 'vehicle_info',
                question: "What is the year, make, and model of your vehicle?",
                placeholder: "e.g., 2019 Ford F-350",
                type: 'text'
            },
            {
                id: 'package',
                question: "Which coating package are you interested in?",
                options: [
                    { label: "Standard Coat (2-Year Durability)", basePrice: 800 },
                    { label: "Elite Coat (5-Year Durability)", basePrice: 1400 },
                    { label: "Graphene Elite (7+ Year Durability)", basePrice: 2200 }
                ]
            },
            {
                id: 'vehicle_size',
                question: "What size is your vehicle?",
                options: [
                    { label: "Car / Sedan" },
                    { label: "Small SUV / Truck" },
                    { label: "Large SUV / Rig" }
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
            return answers.package.basePrice + answers.paint_condition.addPrice;
        }
    },
    ppf: {
        title: "Paint Protection Film Estimator",
        steps: [
            {
                id: 'vehicle_info',
                question: "What is the year, make, and model of your vehicle?",
                placeholder: "e.g., 2019 Ford F-350",
                type: 'text'
            },
            {
                id: 'vehicle_size',
                question: "What size is your vehicle?",
                options: [
                    { label: "Car / Sedan" },
                    { label: "Small SUV / Truck" },
                    { label: "Large SUV / Rig" }
                ]
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
                id: 'vehicle_info',
                question: "What is the year, make, and model of your vehicle?",
                placeholder: "e.g., 2019 Ford F-350",
                type: 'text'
            },
            {
                id: 'project_type',
                question: "What type of lighting project?",
                options: [
                    { label: "Morimoto XB LED Headlights", basePrice: 1800 },
                    { label: "Fog Light Upgrade (Morimoto 4Banger)", basePrice: 550 },
                    { label: "Off-Road Light Bar / Pods & Switch Panel", basePrice: 1200 },
                    { label: "Ditch Lights & Pods", basePrice: 450 },
                    { label: "LED Accent / Bulb Upgrades", basePrice: 150 },
                    { label: "Custom Retrofit (Demon Eyes & Halos)", basePrice: 1400 },
                    { label: "Starlight Headliner (Standard - 500 Stars)", basePrice: 1800 },
                    { label: "Starlight Headliner (Premium - 1000 Stars + Twinkle)", basePrice: 2800 }
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
            const placeholder = step.placeholder || 'Type your answer...';

            const html = `
                <div id="${optsContainerId}" class="flex flex-col gap-3 ml-11 message-enter">
                    <input type="text" id="text-input-${optsContainerId}" placeholder="${placeholder}" class="w-full bg-[#0D0D12] text-white text-sm px-4 py-3 rounded-xl border border-edge focus:border-labBlue focus:outline-none focus:ring-1 focus:ring-labBlue transition-all min-h-[48px]">
                    <button onclick="handleTextSubmit('${optsContainerId}')" class="w-full bg-labBlue text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest hover:bg-blue-500 transition-all min-h-[48px]">
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
                <button onclick="handleOptionSelect(${idx})" class="w-full text-left py-4 px-5 rounded-xl border border-edge bg-black hover:border-labBlue hover:bg-labBlue/10 transition-all text-sm text-zinc-300 hover:text-white flex justify-between items-center group min-h-[48px]">
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
                <button onclick="loadBookingIframe()" class="w-full bg-white text-black font-extrabold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] min-h-[48px]">
                    Book This Service
                </button>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', ctaHtml);
        body.scrollTop = body.scrollHeight;
        
    }, 1500);
}

function loadBookingIframe() {
    // Build summary of user's estimator selections
    const vehicle = userAnswers['vehicle_info']?.label || '';
    const vehicleSize = userAnswers['vehicle_size']?.label || userAnswers['vehicle_style']?.label || '';
    
    const serviceNameMap = {
        "Detailing Estimator": "Premium Detailing",
        "Window Tinting Estimator": "Window Tinting",
        "Ceramic Coating Estimator": "Ceramic Coating",
        "Paint Protection Film Estimator": "Paint Protection Film (PPF)",
        "Custom Lighting Estimator": "Custom Lighting"
    };
    const serviceName = serviceNameMap[currentService.title] || currentService.title.replace(' Estimator', '');
    
    // Build detail items for the summary
    let detailItems = '';
    
    if (currentService.title === "Detailing Estimator") {
        if (userAnswers['focus'])  detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Focus</span><span class="text-white">${userAnswers['focus'].label.split(' —')[0]}</span></div>`;
        if (userAnswers['tier'])   detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Tier</span><span class="text-white">${userAnswers['tier'].label.split(' —')[0]}</span></div>`;
        if (userAnswers['addons'] && userAnswers['addons'].label !== "None") detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Add-on</span><span class="text-white">${userAnswers['addons'].label}</span></div>`;
    }
    if (currentService.title === "Window Tinting Estimator") {
        if (userAnswers['coverage']) detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Coverage</span><span class="text-white">${userAnswers['coverage'].label}</span></div>`;
        if (userAnswers['film_type']) detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Film</span><span class="text-white">${userAnswers['film_type'].label}</span></div>`;
    }
    if (currentService.title === "Ceramic Coating Estimator") {
        if (userAnswers['package']) detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Package</span><span class="text-white">${userAnswers['package'].label}</span></div>`;
        if (userAnswers['paint_condition']) detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Paint Condition</span><span class="text-white">${userAnswers['paint_condition'].label}</span></div>`;
    }
    if (currentService.title === "Paint Protection Film Estimator") {
        if (userAnswers['coverage']) detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Coverage</span><span class="text-white">${userAnswers['coverage'].label}</span></div>`;
    }
    if (currentService.title === "Custom Lighting Estimator") {
        if (userAnswers['project_type']) detailItems += `<div class="flex justify-between"><span class="text-zinc-500">Project</span><span class="text-white">${userAnswers['project_type'].label}</span></div>`;
    }
    
    const price = currentService.calculate(userAnswers);
    
    // Replace the chat window with summary + booking widget
    const body = document.getElementById('estimator-body');
    body.innerHTML = `
        <div class="flex flex-col gap-4 message-enter p-1">
            <!-- Service Summary Card -->
            <div class="rounded-xl border border-labBlue/30 bg-gradient-to-b from-labBlue/10 to-transparent p-4 flex-shrink-0">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-2 h-2 rounded-full bg-labBlue animate-pulse"></div>
                    <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-labBlue">Your Selections</span>
                </div>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                        <span class="text-zinc-500">Vehicle</span>
                        <span class="text-white font-semibold">${vehicle}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-zinc-500">Size / Style</span>
                        <span class="text-white">${vehicleSize}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-zinc-500">Service</span>
                        <span class="text-labBlue font-semibold">${serviceName}</span>
                    </div>
                    ${detailItems}
                    <div class="border-t border-zinc-800 pt-2 mt-2 flex justify-between">
                        <span class="text-zinc-400 font-semibold">Estimate</span>
                        <span class="text-white font-extrabold text-base">$${price.toFixed(2)}</span>
                    </div>
                </div>
                <p class="text-[10px] text-zinc-600 mt-3 leading-relaxed">Please reference this info when filling out the booking form below. Select the matching service & options.</p>
            </div>
            
            <!-- Booking Form -->
            <div class="rounded-xl overflow-hidden border border-edge bg-[#0D0D12] relative">
                <div class="flex flex-col items-center justify-center gap-3 text-zinc-600 py-8" id="ghl-loading-spinner">
                    <svg class="w-8 h-8 animate-spin text-labBlue" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-xs font-mono uppercase tracking-widest">Loading Booking...</span>
                </div>
                <iframe src="https://api.leadconnectorhq.com/widget/booking/uCWyqHn7e5TTX1838aZi" 
                    style="width: 100%; height: 1200px; border: none;" 
                    scrolling="no" 
                    id="ghl-booking-iframe"
                    onload="document.getElementById('ghl-loading-spinner').style.display='none';">
                </iframe>
            </div>
        </div>
    `;
    
    // Load form_embed.js for proper iframe resizing
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);
}

// Global exposure
window.openEstimator = openEstimator;
