// Floating "Text Eric" button (replaces the old chat widget). On phones the sms: link opens Messages to Eric;
// the number is also shown for desktop visitors, where sms: links often do nothing.
(function () {
    const NUMBER = '+12505003191';
    const LABEL = '(250) 500-3191';
    const a = document.createElement('a');
    a.href = `sms:${NUMBER}?&body=${encodeURIComponent('Hi, I have a question about ')}`;
    a.setAttribute('aria-label', `Text Eric at ${LABEL}`);
    // bottom-[88px] on mobile clears the sticky bottom nav
    a.className = 'fixed right-4 bottom-[88px] md:bottom-6 z-40 flex items-center gap-2 bg-labBlue hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-full px-5 min-h-[48px] shadow-[0_0_25px_rgba(0,102,255,0.5)] transition-all active:scale-95';
    a.innerHTML = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8M8 14h5m-9 6l2.5-3.5A8 8 0 1112 20H4z"/></svg><span>Text Eric</span><span class="hidden md:inline font-medium normal-case tracking-normal opacity-90">${LABEL}</span>`;
    document.body.appendChild(a);
})();
