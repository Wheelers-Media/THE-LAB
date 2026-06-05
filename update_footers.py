import os
import glob
import re

target_block = """        <!-- Trust Signals (Partner Logos) -->
        <div class="mb-12 border-t border-edge pt-10">
            <div class="flex flex-wrap justify-center gap-x-8 gap-y-6 items-center">
                <!-- DIESELR -->
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="DIESELR" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <span class="text-white font-extrabold font-heading text-xl tracking-widest">DIESELR</span>
                </a>
                <!-- AMDP -->
                <a href="https://amdieselperformance.ca/" target="_blank" rel="noopener noreferrer" aria-label="AMDP" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/AMDP-Logo.png" alt="AMDP" class="h-9 w-auto object-contain">
                </a>
                <!-- EZ LYNK -->
                <a href="https://www.ezlynk.com/" target="_blank" rel="noopener noreferrer" aria-label="EZ LYNK" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/EZ-Lynk-Logo.png" alt="EZ LYNK" class="h-10 w-auto object-contain">
                </a>
                <!-- HP Tuners -->
                <a href="https://www.hptuners.com/" target="_blank" rel="noopener noreferrer" aria-label="HP Tuners" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/HPTuners-Logo.png" alt="HP Tuners" class="h-8 w-auto object-contain">
                </a>
                <!-- GDP -->
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GDP" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/GDP.png" alt="GDP" class="h-8 w-auto object-contain">
                </a>
                <!-- SD -->
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="SD" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/speed-demon.png" alt="Speed Demon" class="h-10 w-auto object-contain">
                </a>
                <!-- POLAR DIESEL -->
                <a href="https://polardiesel.ca/" target="_blank" rel="noopener noreferrer" aria-label="Polar Diesel" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/Polar-Diesel-Logo.webp" alt="Polar Diesel" class="h-12 w-auto object-contain">
                </a>
                <!-- GRIDIRON BUMPER -->
                <a href="https://gridironmfg.ca/" target="_blank" rel="noopener noreferrer" aria-label="Gridiron Bumper" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/GRIDIRON-logo.webp" alt="Gridiron Bumper" class="h-10 w-auto object-contain">
                </a>
                <!-- MORIMOTO -->
                <a href="https://www.morimotohid.com/" target="_blank" rel="noopener noreferrer" aria-label="Morimoto" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/MORIMOTO-Logo.png" alt="MORIMOTO" class="h-8 w-auto object-contain">
                </a>
                <!-- Diode Dynamics -->
                <a href="https://www.diodedynamics.com/" target="_blank" rel="noopener noreferrer" aria-label="Diode Dynamics" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/DIODE DYNAMICS.png" alt="Diode Dynamics" class="h-6 w-auto object-contain">
                </a>
                <!-- Baja Designs -->
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Baja Designs" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/baja-designs-inc-logo-vector (1).png" alt="Baja Designs" class="h-8 w-auto object-contain">
                </a>
                <!-- BMC LIGHTS -->
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="BMC LIGHTS" class="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/bmc-lights.png" alt="BMC Lights" class="h-8 w-auto object-contain">
                </a>
            </div>
        </div>"""

for path in glob.glob('src/**/*.html', recursive=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(
        r'<!-- Trust Signals \(Partner Logos\) -->\s*<div class="mb-12 border-t border-edge pt-10">\s*<div class="flex flex-wrap justify-center gap-x-8 gap-y-6 items-center">.*?</div>\s*</div>',
        target_block,
        content,
        flags=re.DOTALL
    )
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {path}')
