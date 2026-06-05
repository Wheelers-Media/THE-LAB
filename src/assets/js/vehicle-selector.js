document.addEventListener('DOMContentLoaded', () => {
    const triggerBtn = document.getElementById('vehicle-selector-trigger');
    const modal = document.getElementById('vehicle-selector-modal');
    const closeBtn = document.getElementById('close-vs-modal');
    const cancelBtn = document.getElementById('vs-cancel');
    const resetBtn = document.getElementById('vs-reset');
    const submitBtn = document.getElementById('vs-submit');
    
    const makeBtns = document.querySelectorAll('.vs-make-btn');
    const step2 = document.getElementById('vs-step-2');
    const engineSelect = document.getElementById('vs-engine-select');
    
    const greetingEl = document.getElementById('vs-greeting');
    const labelEl = document.getElementById('vs-label');
    
    let selectedMake = null;
    let selectedEngine = null;
    
    // Realistic Engine Data
    const engineData = {
        'Cummins': [
            '2019+ 6.7L Cummins (HO)',
            '2019+ 6.7L Cummins (SO)',
            '2013-2018 6.7L Cummins',
            '2010-2012 6.7L Cummins',
            '2007.5-2009 6.7L Cummins',
            '2003-2007 5.9L Cummins',
            '1998.5-2002 5.9L Cummins (24V)',
            '1989-1998 5.9L Cummins (12V)',
            '3.0L EcoDiesel'
        ],
        'Duramax': [
            '2017+ 6.6L L5P Duramax',
            '2011-2016 6.6L LML Duramax',
            '2007.5-2010 6.6L LMM Duramax',
            '2006-2007 6.6L LBZ Duramax',
            '2004.5-2005 6.6L LLY Duramax',
            '2001-2004 6.6L LB7 Duramax',
            '3.0L LM2/LZ0 Duramax'
        ],
        'Powerstroke': [
            '2020+ 6.7L Powerstroke',
            '2017-2019 6.7L Powerstroke',
            '2011-2016 6.7L Powerstroke',
            '2008-2010 6.4L Powerstroke',
            '2003-2007 6.0L Powerstroke',
            '1994-2003 7.3L Powerstroke',
            '3.0L Powerstroke'
        ],
        'Half-Ton': [
            '2014-2023 EcoDiesel 3.0L',
            '2016-2022 Duramax 2.8L LWN',
            '2019-2022 Duramax 3.0L LM2/LZ0',
            '2018-2021 Powerstroke 3.0L',
            '2016-2019 Nissan Titan 5.0L Cummins',
            '2018-2019 Equinox 1.6L',
            '2018-2019 Terrain 1.6L',
            '2014-2019 Chevrolet Cruze 1.6L'
        ]
    };
    
    // OEM Logo mapping for UI
    const logoMap = {
        'Cummins': '/assets/ram-logo.svg',
        'Duramax': '/assets/gm-logo.svg',
        'Powerstroke': '/assets/ford-logo.svg',
        'Half-Ton': '/assets/half-ton.png'
    };

    // 1. Initialize UI on Load
    function init() {
        const savedTruck = localStorage.getItem('lab_selected_truck');
        if (savedTruck) {
            try {
                const parsed = JSON.parse(savedTruck);
                updateHeaderUI(parsed.make, parsed.engine);
            } catch (e) {
                console.error("Could not parse saved truck", e);
            }
        }
    }
    
    function updateHeaderUI(make, engine) {
        // Change the text and icon
        greetingEl.textContent = 'Your selected truck:';
        greetingEl.className = 'text-[10px] text-zinc-400 font-bold uppercase tracking-wider';
        
        labelEl.innerHTML = `<span class="text-labBlue">${make}</span> &middot; ${engine}`;
        labelEl.className = 'text-xs text-white font-extrabold tracking-wide whitespace-nowrap';
        
        // Update the icon to the OEM logo if possible, or fallback to text/truck
        const iconSvg = triggerBtn.querySelector('svg');
        let imgEl = triggerBtn.querySelector('img.vs-header-icon');
        
        if (!imgEl) {
            imgEl = document.createElement('img');
            imgEl.className = 'vs-header-icon w-8 h-8 object-contain transition-transform group-hover:scale-105';
            triggerBtn.insertBefore(imgEl, triggerBtn.children[0]);
        }
        
        if (iconSvg) iconSvg.style.display = 'none';
        
        imgEl.src = logoMap[make] || '';
        imgEl.onerror = () => {
            imgEl.style.display = 'none';
            if (iconSvg) iconSvg.style.display = 'block';
        };
        imgEl.style.display = 'block';
    }

    // 2. Modal interactions
    function openModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Pre-fill if exists
        const savedTruck = localStorage.getItem('lab_selected_truck');
        if (savedTruck) {
            try {
                const parsed = JSON.parse(savedTruck);
                selectMake(parsed.make);
                engineSelect.value = parsed.engine;
                validateStep2();
            } catch (e) {}
        } else {
            resetModal();
        }
    }
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    function resetModal() {
        selectedMake = null;
        selectedEngine = null;
        
        makeBtns.forEach(btn => {
            btn.classList.remove('selected-make');
        });
        
        step2.classList.add('opacity-30', 'pointer-events-none');
        engineSelect.innerHTML = '<option value="">Select Engine</option>';
        validateStep2();
    }
    
    function selectMake(make) {
        selectedMake = make;
        
        // Update UI
        makeBtns.forEach(btn => {
            if (btn.dataset.make === make) {
                btn.classList.add('selected-make');
            } else {
                btn.classList.remove('selected-make');
            }
        });
        
        // Populate engines
        const engines = engineData[make] || [];
        engineSelect.innerHTML = '<option value="">Select Engine</option>';
        engines.forEach(eng => {
            const opt = document.createElement('option');
            opt.value = eng;
            opt.textContent = eng;
            engineSelect.appendChild(opt);
        });
        
        // Activate Step 2
        step2.classList.remove('opacity-30', 'pointer-events-none');
        validateStep2();
    }
    
    function validateStep2() {
        if (engineSelect.value) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('bg-zinc-700', 'text-zinc-400', 'cursor-not-allowed');
            submitBtn.classList.add('bg-labBlue', 'text-white', 'hover:bg-blue-500');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('bg-zinc-700', 'text-zinc-400', 'cursor-not-allowed');
            submitBtn.classList.remove('bg-labBlue', 'text-white', 'hover:bg-blue-500');
        }
    }
    
    function saveSelection() {
        if (!selectedMake || !engineSelect.value) return;
        
        const payload = {
            make: selectedMake,
            engine: engineSelect.value
        };
        
        localStorage.setItem('lab_selected_truck', JSON.stringify(payload));
        updateHeaderUI(payload.make, payload.engine);
        closeModal();
        
        // Optional: Trigger a custom event for the store to filter products
        window.dispatchEvent(new CustomEvent('truckSelected', { detail: payload }));
    }

    // Event Listeners
    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (resetBtn) resetBtn.addEventListener('click', resetModal);
    
    makeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectMake(btn.dataset.make);
        });
    });
    
    if (engineSelect) {
        engineSelect.addEventListener('change', validateStep2);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', saveSelection);
    }
    
    // Close on click outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Run Init
    init();
});
