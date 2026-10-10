// Floating "Text Us" button (replaces the old chat widget). On phones the sms: link opens Messages to the shop's number;
// the number is also shown for desktop visitors, where sms: links often do nothing.
(function () {
    const NUMBER = '+12502619502';
    const LABEL = '(250) 261-9502';
    const a = document.createElement('a');
    a.href = `sms:${NUMBER}?&body=${encodeURIComponent('Hi, I have a question about ')}`;
    a.setAttribute('aria-label', `Text us at ${LABEL}`);
    // bottom-4 on mobile; walkthrough pages lift it above their sticky Next bar (lab.css)
    a.className = 'te-fab fixed right-4 bottom-4 md:bottom-6 z-40 flex items-center gap-2 bg-labBlue hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-full px-5 min-h-[48px] shadow-[0_0_25px_rgba(0,102,255,0.5)] transition-all active:scale-95';
    a.innerHTML = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8M8 14h5m-9 6l2.5-3.5A8 8 0 1112 20H4z"/></svg><span class="te-label">Text Us</span><span class="te-num hidden md:inline font-medium normal-case tracking-normal">${LABEL}</span>`;
    // a labelled region so the floating button belongs to a landmark
    const wrap = document.createElement('div');
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Quick contact');
    wrap.appendChild(a);
    document.body.appendChild(wrap);
    // once past the first screen the pill folds to an icon so it stops covering copy (lab.css .te-fab)
    let ticking = false;
    const fold = () => { ticking = false; a.classList.toggle('is-compact', window.scrollY > window.innerHeight * 0.8); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(fold); } }, { passive: true });
    fold();
})();
