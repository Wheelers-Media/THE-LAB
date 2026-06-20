# Ceramic Coatings and PPF Original Page Instructions

These are the instructions and original code blocks for the Ceramic Coatings and Paint Protection Film (PPF) pages. When you are ready to launch these services, use this code to restore the pricing, packages, and estimator integrations.

## How to Restore

1. **Re-enable the Estimator:** Open `src/assets/js/estimator.js`. Find the `coatings` and `ppf` configs, and remove the `comingSoon: true` stubs. Restore their full original objects so they trigger the modal instead of redirecting.
2. **Restore Ceramic Page Content:** In `src/pages/boutique/coatings/index.html`, replace the `<main>` block with the Ceramic Original Main Content below.
3. **Restore PPF Page Content:** In `src/pages/boutique/ppf/index.html`, replace the `<main>` block with the PPF Original Main Content below.

---

## Ceramic Original Main Content

```html
    <main>

        <!-- HERO -->
        <section class="relative overflow-hidden pt-20 pb-28 px-6">
            <div class="absolute inset-0 bg-void grid-bg"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-void pointer-events-none"></div>
            <div class="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-labBlue opacity-[0.04] blur-[120px] pointer-events-none"></div>
            <div class="relative z-10 max-w-5xl mx-auto">
                <div class="text-center">
                    <p class="text-xs font-mono text-labBlue uppercase tracking-[0.3em] mb-5 flex items-center justify-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-labBlue"></span>
                        Nano-Ceramic Paint Protection
                    </p>
                    <h1 class="font-heading font-extrabold text-6xl md:text-8xl text-white uppercase leading-none mb-6 tracking-tight">ARMOUR FOR<br>YOUR PAINT.</h1>
                    <p class="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Professional-grade ceramic coating that bonds to your paint at a molecular level. Hydrophobic, UV-resistant, and show-quality gloss — for years, not months.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onclick="openEstimator('coatings')" class="bg-labBlue text-white font-extrabold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            Get an Estimated Price
                        </button>
                        <a href="#packages" class="border border-edge text-white font-bold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:border-white/30 transition-all flex items-center justify-center">View Packages ↓</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- WHAT IS CERAMIC COATING -->
        <section class="py-20 px-6 border-t border-edge">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-2 gap-14 items-center">
                    <div>
                        <p class="text-xs font-mono text-labBlue uppercase tracking-widest mb-4">What Is It?</p>
                        <h2 class="font-heading font-extrabold text-4xl text-white uppercase leading-tight mb-6">A PERMANENT SHIELD OVER YOUR CLEAR COAT.</h2>
                        <p class="text-zinc-400 leading-relaxed mb-5">Ceramic coating is a liquid polymer that chemically bonds with your vehicle's factory paint — creating a semi-permanent layer that regular waxes simply can't match. It cures hard, repels water, resists chemical contaminants, and makes your paint easier to maintain.</p>
                        <p class="text-zinc-400 leading-relaxed">Once applied by our certified technicians, you'll notice water beading and sheeting off the surface, bird droppings and tree sap wiping away without marring, and a depth of gloss that looks like wet paint all the time.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="border border-edge rounded-xl p-5" style="background:#0D0D12;">
                            <div class="w-9 h-9 rounded-lg bg-labBlue/10 flex items-center justify-center mb-3"><svg class="w-4 h-4 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>
                            <p class="text-white font-bold text-sm mb-1">Hydrophobic</p>
                            <p class="text-zinc-600 text-xs">Water, mud, and road grime bead off the surface — keeping your vehicle cleaner longer.</p>
                        </div>
                        <div class="border border-edge rounded-xl p-5" style="background:#0D0D12;">
                            <div class="w-9 h-9 rounded-lg bg-labBlue/10 flex items-center justify-center mb-3"><svg class="w-4 h-4 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3"/></svg></div>
                            <p class="text-white font-bold text-sm mb-1">UV Protection</p>
                            <p class="text-zinc-600 text-xs">Blocks UV radiation that causes oxidation, fading, and that dull chalky look over time.</p>
                        </div>
                        <div class="border border-edge rounded-xl p-5" style="background:#0D0D12;">
                            <div class="w-9 h-9 rounded-lg bg-labBlue/10 flex items-center justify-center mb-3"><svg class="w-4 h-4 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg></div>
                            <p class="text-white font-bold text-sm mb-1">Show-Quality Gloss</p>
                            <p class="text-zinc-600 text-xs">Deep, wet-look shine that turns heads. Makes your paint look better than the day you bought it.</p>
                        </div>
                        <div class="border border-edge rounded-xl p-5" style="background:#0D0D12;">
                            <div class="w-9 h-9 rounded-lg bg-labBlue/10 flex items-center justify-center mb-3"><svg class="w-4 h-4 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                            <p class="text-white font-bold text-sm mb-1">Chemical Resistance</p>
                            <p class="text-zinc-600 text-xs">Resists bird droppings, tree sap, tar, and environmental contaminants that etch unprotected paint.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- PACKAGES -->
        <section id="packages" class="py-20 px-6 border-t border-edge">
            <div class="max-w-7xl mx-auto">
                <div class="flex items-center gap-4 mb-12">
                    <span class="text-labBlue font-mono text-xs tracking-widest uppercase">Packages</span>
                    <div class="h-px bg-edge flex-grow"></div>
                    <span class="text-[10px] text-zinc-600 font-mono">Prices in CAD · all packages include decontamination wash</span>
                </div>
                <div class="grid md:grid-cols-3 gap-6">

                    <!-- Standard -->
                    <div class="border border-edge rounded-2xl overflow-hidden flex flex-col" style="background:#0D0D12;">
                        <div class="px-6 py-6 border-b border-edge">
                            <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">Entry Level</p>
                            <h3 class="font-heading font-extrabold text-xl text-white uppercase">Standard Coat</h3>
                            <p class="text-zinc-500 text-xs mt-1">Single-panel paint surfaces</p>
                        </div>
                        <div class="px-6 py-6 flex-grow">
                            <div class="mb-6">
                                <span class="text-3xl font-extrabold text-white" data-price-from-cad="800">From $800 CAD</span>
                            </div>
                            <ul class="space-y-3 text-sm">
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Full decontamination wash</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Single-stage polish prep</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>1-layer ceramic coating</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Hydrophobic protection</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>2-year durability</li>
                            </ul>
                        </div>
                        <div class="px-6 pb-6">
                            <button onclick="openEstimator('coatings')" class="block w-full text-center border border-edge text-white font-bold py-3 rounded-xl text-sm uppercase tracking-widest hover:border-labBlue hover:text-labBlue transition-all">Book Now</button>
                        </div>
                    </div>

                    <!-- Elite -->
                    <div class="border border-labBlue/50 rounded-2xl overflow-hidden flex flex-col relative" style="background:#0D0D12;">
                        <div class="absolute top-4 right-4 bg-labBlue text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                        <div class="px-6 py-6 border-b border-labBlue/30">
                            <p class="text-[9px] font-bold text-labBlue uppercase tracking-[0.2em] mb-2">Full Vehicle</p>
                            <h3 class="font-heading font-extrabold text-xl text-white uppercase">Elite Coat</h3>
                            <p class="text-zinc-500 text-xs mt-1">Paint + glass + trim</p>
                        </div>
                        <div class="px-6 py-6 flex-grow">
                            <div class="mb-6">
                                <span class="text-3xl font-extrabold text-white" data-price-from-cad="1400">From $1,400 CAD</span>
                            </div>
                            <ul class="space-y-3 text-sm">
                                <li class="flex items-start gap-2 text-zinc-300"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Full decontamination + clay bar</li>
                                <li class="flex items-start gap-2 text-zinc-300"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Multi-stage machine polish</li>
                                <li class="flex items-start gap-2 text-zinc-300"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>2-layer ceramic on all paint</li>
                                <li class="flex items-start gap-2 text-zinc-300"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Glass coating included</li>
                                <li class="flex items-start gap-2 text-zinc-300"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Trim &amp; wheel face coating</li>
                                <li class="flex items-start gap-2 text-zinc-300"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>5-year durability</li>
                            </ul>
                        </div>
                        <div class="px-6 pb-6">
                            <a href="/contact/" class="block w-full text-center bg-labBlue text-white font-extrabold py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-blue-500 transition-all">Book Service</a>
                        </div>
                    </div>

                    <!-- Graphene Elite -->
                    <div class="border border-edge rounded-2xl overflow-hidden flex flex-col" style="background:#0D0D12;">
                        <div class="px-6 py-6 border-b border-edge">
                            <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">Top Tier</p>
                            <h3 class="font-heading font-extrabold text-xl text-white uppercase">Graphene Elite</h3>
                            <p class="text-zinc-500 text-xs mt-1">Next-gen graphene formula</p>
                        </div>
                        <div class="px-6 py-6 flex-grow">
                            <div class="mb-6">
                                <span class="text-3xl font-extrabold text-white" data-price-from-cad="2200">From $2,200 CAD</span>
                            </div>
                            <ul class="space-y-3 text-sm">
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Everything in Elite, plus:</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Graphene-infused formula</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Anti-static — repels dust &amp; pollen</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Superior scratch resistance</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Lower water spot risk</li>
                                <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>7+ year durability</li>
                            </ul>
                        </div>
                        <div class="px-6 pb-6">
                            <button onclick="openEstimator('coatings')" class="block w-full text-center border border-edge text-white font-bold py-3 rounded-xl text-sm uppercase tracking-widest hover:border-labCyan hover:text-labCyan transition-all">Book Now</button>
                        </div>
                    </div>
                </div>
                <p class="text-zinc-600 text-xs text-center mt-6">Pricing varies by vehicle size, paint condition, and correction level required. Book online to secure your date.</p>
            </div>
        </section>

        <!-- THE PROCESS -->
        <section class="py-20 px-6 border-t border-edge">
            <div class="max-w-5xl mx-auto">
                <div class="flex items-center gap-4 mb-12">
                    <span class="text-labBlue font-mono text-xs tracking-widest uppercase">Our Process</span>
                    <div class="h-px bg-edge flex-grow"></div>
                </div>
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="w-12 h-12 rounded-full border border-labBlue/30 flex items-center justify-center text-labBlue font-extrabold text-lg mx-auto mb-4">01</div>
                        <h4 class="text-white font-bold text-sm mb-2">Decontamination Wash</h4>
                        <p class="text-zinc-600 text-xs leading-relaxed">Iron decon, clay bar, and a thorough wash to remove all surface contamination before any work begins.</p>
                    </div>
                    <div class="text-center">
                        <div class="w-12 h-12 rounded-full border border-labBlue/30 flex items-center justify-center text-labBlue font-extrabold text-lg mx-auto mb-4">02</div>
                        <h4 class="text-white font-bold text-sm mb-2">Paint Correction</h4>
                        <p class="text-zinc-600 text-xs leading-relaxed">Machine polish to remove swirl marks, light scratches, and oxidation. The coating locks in the result permanently.</p>
                    </div>
                    <div class="text-center">
                        <div class="w-12 h-12 rounded-full border border-labBlue/30 flex items-center justify-center text-labBlue font-extrabold text-lg mx-auto mb-4">03</div>
                        <h4 class="text-white font-bold text-sm mb-2">Coating Application</h4>
                        <p class="text-zinc-600 text-xs leading-relaxed">Panel-by-panel ceramic application in a controlled environment, leveled and inspected under speciality lighting.</p>
                    </div>
                    <div class="text-center">
                        <div class="w-12 h-12 rounded-full border border-labBlue/30 flex items-center justify-center text-labBlue font-extrabold text-lg mx-auto mb-4">04</div>
                        <h4 class="text-white font-bold text-sm mb-2">Cure &amp; Walkthrough</h4>
                        <p class="text-zinc-600 text-xs leading-relaxed">24-hour initial cure, then we walk you through maintenance tips so you get the most out of your investment.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="py-20 px-6 border-t border-edge">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="font-heading font-extrabold text-4xl md:text-5xl text-white uppercase leading-tight mb-6">READY TO COAT?</h2>
                <p class="text-zinc-500 mb-8">Book a consultation and we'll assess your paint condition, recommend the right package, and confirm your price.</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onclick="openEstimator('coatings')" class="bg-white text-black font-extrabold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        Get an Estimated Price
                    </button>
                    <a href="/boutique/" class="border border-edge text-zinc-400 font-bold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:border-white/30 hover:text-white transition-all flex items-center justify-center">← All Boutique Services</a>
                </div>
            </div>
        </section>

    </main>
```

## PPF Original Main Content

```html
    <main>

        <!-- HERO -->
        <section class="relative overflow-hidden pt-20 pb-28 px-6">
            <div class="absolute inset-0 bg-void grid-bg"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-void pointer-events-none"></div>
            <div class="relative z-10 max-w-5xl mx-auto">
                <div class="text-center">
                    <p class="text-xs font-mono text-labBlue uppercase tracking-[0.3em] mb-5 flex items-center justify-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-labBlue"></span>
                        Self-Healing Paint Protection Film
                    </p>
                    <h1 class="font-heading font-extrabold text-6xl md:text-8xl text-white uppercase leading-none mb-6 tracking-tight">THE LAST<br>LINE OF<br>DEFENCE.</h1>
                    <p class="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Paint Protection Film is the thickest line of defence between your paint and the road. Rock chips, gravel, bug splatter, door dings — PPF takes the hit so your paint doesn't.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onclick="openEstimator('ppf')" class="bg-labBlue text-white font-extrabold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            Get an Estimated Price
                        </button>
                        <a href="#coverage" class="border border-edge text-white font-bold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:border-white/30 transition-all flex items-center justify-center">Coverage Options ↓</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- WHAT IS PPF -->
        <section class="py-20 px-6 border-t border-edge">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-2 gap-14 items-center">
                    <div>
                        <p class="text-xs font-mono text-labBlue uppercase tracking-widest mb-4">What Is PPF?</p>
                        <h2 class="font-heading font-extrabold text-4xl text-white uppercase leading-tight mb-6">PAINT THAT HEALS ITSELF.</h2>
                        <p class="text-zinc-400 leading-relaxed mb-5">Paint Protection Film is a thick, clear urethane film that wraps over your paint. Unlike ceramic coatings, PPF is a physical barrier — thick enough to absorb rock chips, resist minor abrasion, and actually heal light scratches when exposed to heat.</p>
                        <p class="text-zinc-400 leading-relaxed">Northern BC roads are hard on paint. Gravel, frost heave debris, and highway grit take a toll every season. PPF is the only product that will stop a rock chip from reaching your clear coat.</p>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-start gap-4 border border-edge rounded-xl p-5" style="background:#0D0D12;">
                            <div class="w-10 h-10 rounded-lg bg-labBlue/10 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                            <div><p class="text-white font-bold text-sm mb-1">Self-Healing Technology</p><p class="text-zinc-600 text-xs">Minor swirls and light scratches disappear with heat — sunlight or warm water activates the topcoat to reflow and repair itself.</p></div>
                        </div>
                        <div class="flex items-start gap-4 border border-edge rounded-xl p-5" style="background:#0D0D12;">
                            <div class="w-10 h-10 rounded-lg bg-labBlue/10 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                            <div><p class="text-white font-bold text-sm mb-1">Rock Chip Protection</p><p class="text-zinc-600 text-xs">The film absorbs the impact of gravel and road debris that would normally chip and crack your clear coat.</p></div>
                        </div>
                        <div class="flex items-start gap-4 border border-edge rounded-xl p-5" style="background:#0D0D12;">
                            <div class="w-10 h-10 rounded-lg bg-labBlue/10 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-labBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></div>
                            <div><p class="text-white font-bold text-sm mb-1">Optically Clear</p><p class="text-zinc-600 text-xs">High-clarity film is virtually invisible on the vehicle — you protect the paint without changing how it looks.</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- COVERAGE OPTIONS -->
        <section id="coverage" class="py-20 px-6 border-t border-edge">
            <div class="max-w-7xl mx-auto">
                <div class="flex items-center gap-4 mb-12">
                    <span class="text-labBlue font-mono text-xs tracking-widest uppercase">Coverage Options</span>
                    <div class="h-px bg-edge flex-grow"></div>
                    <span class="text-[10px] text-zinc-600 font-mono">Pricing varies by vehicle size</span>
                </div>
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="border border-edge rounded-2xl overflow-hidden flex flex-col" style="background:#0D0D12;">
                        <div class="px-6 py-5 border-b border-edge">
                            <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">Entry</p>
                            <h3 class="font-heading font-extrabold text-lg text-white uppercase">Partial Front</h3>
                        </div>
                        <div class="px-6 py-5 flex-grow">
                            <p class="text-zinc-500 text-xs mb-4 leading-relaxed">Covers the highest-impact zones — the areas most likely to take rock chip damage on daily drives.</p>
                            <ul class="space-y-2 text-sm text-zinc-400">
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Hood leading edge (24")</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Front bumper</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Front fenders</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Mirror caps</li>
                            </ul>
                        </div>
                        <div class="px-6 pb-5">
                            <button onclick="openEstimator('ppf')" class="block w-full text-center border border-edge text-white font-bold py-3 rounded-xl text-sm uppercase tracking-widest hover:border-labBlue hover:text-labBlue transition-all">Book Now</button>
                        </div>
                    </div>

                    <div class="border border-labBlue/50 rounded-2xl overflow-hidden flex flex-col relative" style="background:#0D0D12;">
                        <div class="absolute top-4 right-4 bg-labBlue text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                        <div class="px-6 py-5 border-b border-labBlue/30">
                            <p class="text-[9px] font-bold text-labBlue uppercase tracking-[0.2em] mb-1">Recommended</p>
                            <h3 class="font-heading font-extrabold text-lg text-white uppercase">Full Front</h3>
                        </div>
                        <div class="px-6 py-5 flex-grow">
                            <p class="text-zinc-500 text-xs mb-4 leading-relaxed">Full coverage on every panel that faces the road. The most complete protection for the front of your vehicle.</p>
                            <ul class="space-y-2 text-sm text-zinc-300">
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue flex-shrink-0"></span>Full hood</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue flex-shrink-0"></span>Full front bumper</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue flex-shrink-0"></span>Full front fenders</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue flex-shrink-0"></span>Mirror caps</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue flex-shrink-0"></span>A-pillars</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue flex-shrink-0"></span>Door cups</li>
                            </ul>
                        </div>
                        <div class="px-6 pb-5">
                            <button onclick="openEstimator('ppf')" class="block w-full text-center bg-labBlue text-white font-extrabold py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-blue-500 transition-all">Book Now</button>
                        </div>
                    </div>

                    <div class="border border-edge rounded-2xl overflow-hidden flex flex-col" style="background:#0D0D12;">
                        <div class="px-6 py-5 border-b border-edge">
                            <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">Maximum</p>
                            <h3 class="font-heading font-extrabold text-lg text-white uppercase">Full Vehicle</h3>
                        </div>
                        <div class="px-6 py-5 flex-grow">
                            <p class="text-zinc-500 text-xs mb-4 leading-relaxed">Every painted panel wrapped. The ultimate paint protection for show vehicles, new purchases, or long-term preservation.</p>
                            <ul class="space-y-2 text-sm text-zinc-400">
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Everything in Full Front</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Doors &amp; door edges</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Rocker panels</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Rear bumper &amp; quarters</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Trunk lid / tailgate</li>
                                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-labBlue/60 flex-shrink-0"></span>Roof &amp; pillars</li>
                            </ul>
                        </div>
                        <div class="px-6 pb-5">
                            <button onclick="openEstimator('ppf')" class="block w-full text-center border border-edge text-white font-bold py-3 rounded-xl text-sm uppercase tracking-widest hover:border-labCyan hover:text-labCyan transition-all">Book Now</button>
                        </div>
                    </div>
                </div>

                <!-- Custom coverage note -->
                <div class="mt-6 border border-edge rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style="background:#0D0D12;">
                    <div class="flex-grow">
                        <p class="text-white font-bold text-sm">Need a custom area covered?</p>
                        <p class="text-zinc-600 text-xs mt-1">Rocker panels only, door edges, hood + fenders combo, tailgate — we cut PPF to any zone. Just ask.</p>
                    </div>
                    <a href="/contact/" class="flex-shrink-0 text-xs font-bold text-labBlue hover:text-white transition-colors uppercase tracking-wider whitespace-nowrap">Contact Us →</a>
                </div>
            </div>
        </section>

        <!-- PPF vs CERAMIC -->
        <section class="py-20 px-6 border-t border-edge">
            <div class="max-w-4xl mx-auto">
                <div class="flex items-center gap-4 mb-12">
                    <span class="text-labBlue font-mono text-xs tracking-widest uppercase">PPF vs Ceramic</span>
                    <div class="h-px bg-edge flex-grow"></div>
                </div>
                <div class="grid sm:grid-cols-2 gap-6">
                    <div class="border border-edge rounded-xl p-6" style="background:#0D0D12;">
                        <h3 class="text-white font-bold text-sm mb-4 uppercase tracking-wider">Use PPF When You Want:</h3>
                        <ul class="space-y-2.5 text-sm">
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Physical impact protection (rock chips)</li>
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Self-healing scratch resistance</li>
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>New vehicle protection (day one)</li>
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labBlue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Highest resale value preservation</li>
                        </ul>
                    </div>
                    <div class="border border-edge rounded-xl p-6" style="background:#0D0D12;">
                        <h3 class="text-white font-bold text-sm mb-4 uppercase tracking-wider">Combine PPF + Ceramic For:</h3>
                        <ul class="space-y-2.5 text-sm">
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>The ultimate dual-layer protection</li>
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>PPF impact protection + ceramic hydrophobics</li>
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Easiest maintenance possible</li>
                            <li class="flex items-start gap-2 text-zinc-400"><svg class="w-4 h-4 text-labCyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Maximum gloss + maximum longevity</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="py-20 px-6 border-t border-edge">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="font-heading font-extrabold text-4xl md:text-5xl text-white uppercase leading-tight mb-6">PROTECT YOUR<br>INVESTMENT.</h2>
                <p class="text-zinc-500 mb-8">PPF pricing varies based on vehicle size, panel selection, and current paint condition. Book a consultation and we'll walk you through the options in person.</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onclick="openEstimator('ppf')" class="bg-white text-black font-extrabold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        Get an Estimated Price
                    </button>
                    <a href="/boutique/" class="border border-edge text-zinc-400 font-bold py-3 px-8 rounded-xl text-sm uppercase tracking-widest hover:border-white/30 hover:text-white transition-all flex items-center justify-center">← All Boutique Services</a>
                </div>
            </div>
        </section>

    </main>
```
